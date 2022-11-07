import { z } from "https://deno.land/x/zod@v3.19.1/mod.ts";

import { METADATA } from "../../../project.ts";
import {
  Command,
  CompletionsCommand,
  EnumType,
} from "https://deno.land/x/cliffy@v0.25.4/command/mod.ts";
import { graphCommand, OUTPUT_FORMATS } from "../../graph/graph_command.ts";
import { PULL_REQUEST_STATES } from "../../pulls/pull_request.ts";

/** Runs a command-line interface for the commands in this project. */
export const cliDriverMain = () =>
  new Command()
    .name("prpal")
    .description("GitHub pull request tools")
    .version(METADATA.version)
    .meta("deno", Deno.version.deno)
    .meta("v8", Deno.version.v8)
    .meta("typescript", Deno.version.typescript)
    .action(() => {
      console.log(`prpal is meant to be invoked with a sub-command.
For a list of subcommands, supply the "--help" argument.`);
    })
    .command("completions", new CompletionsCommand())
    //
    // Graph sub-command
    //
    .command("graph")
    .description([
      "Render a graph of pull requests for a repository.",
      "",
      "This graph shows pull request dependencies, and is most useful when",
      "stacking pull requests. Dependencies are determined by base branch -",
      "for example if PR #1 is on branch 'feature-1' and PR #2 has the base",
      "branch of 'feature-1', #2 will render on top of #1 in the graph output.",
      "",
      "This command also looks for the first line in each PR description which",
      "looks like this:",
      "'* Diffbase: #123, #456'",
      "The PRs referenced on this line are treated as dependencies of this PR,",
      "similarly to the base-branch PRs above.",
      "",
      "If a PR has more than one base branch, it's a common pattern to upload",
      "a 'merge-base' branch, which merges all diffbases of the PR. This",
      "branch should match /merge[-_]base/, and this command will ignore such",
      "branches.",
    ].join("\n"))
    .option("--repo=[repo]", "The repository to render a graph for.", {
      required: true,
    })
    .type("prState", new EnumType(PULL_REQUEST_STATES))
    .option("--prState=[prState]", "The state of PRs to fetch.", {
      default: "open",
    })
    .type("outputFormat", new EnumType(OUTPUT_FORMATS))
    .option("--outputFormat=[outputFormat]", "The format of graph output.", {
      default: "mermaid",
    })
    .option("--authToken=[authToken]", "GitHub auth token credentials.")
    .action((options) => {
      z.object({
        repo: z.string(),
        authToken: z.string().nullish().transform((x) => x ?? undefined),
        prState: z.enum(PULL_REQUEST_STATES),
        outputFormat: z.enum(OUTPUT_FORMATS),
      }).safeParseAsync(options)
        .then((result) => {
          if (result.success) {
            const { repo, authToken, prState, outputFormat } = result.data;
            return graphCommand(repo, prState, outputFormat, authToken);
          }
          console.error(result);
        });
    })
    //
    // Evaluate the above commands...
    //
    .parse(Deno.args);
