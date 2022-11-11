import { PullRequest, PullRequestState } from "../pulls/pull_request.ts";
import { listPullRequests } from "../pulls/list_pull_requests.ts";

export type OutputFormat = typeof OUTPUT_FORMATS[number];
export const OUTPUT_FORMATS = ["mermaid", "markdown"] as const;
export const OUTPUT_FORMAT_SET: ReadonlySet<OutputFormat> = new Set(
  OUTPUT_FORMATS,
);
export const isOutputFormat = (x: unknown): x is OutputFormat =>
  OUTPUT_FORMAT_SET.has(x as OutputFormat);

export const graphCommand = (
  repo: string,
  pullRequestState: PullRequestState,
  outputFormat: OutputFormat,
  author?: string,
  authToken?: string,
): Promise<void> =>
  listPullRequests({
    repo,
    pullRequestState,
    author,
    authToken,
  })
    .then((result) =>
      result.match({
        err: (e) => {
          return Promise.resolve(console.error(e));
        },
        ok: (response) => {
          return ((): Promise<string> => {
            switch (outputFormat) {
              case "mermaid":
                return Promise.resolve(renderMermaid(response.pullRequests));
              case "markdown":
                return Promise.resolve(
                  renderMarkdown(renderMermaid(response.pullRequests)),
                );
            }
          })().then((output) => {
            console.log(output);
          });
        },
      })
    );

const renderMermaid = (prs: readonly PullRequest[]): string => {
  const lines = [];

  const prNumbersByBranch: Record<string, number | undefined> = Object
    .fromEntries(prs.map((pr) => [pr.branch, pr.number]));

  const getBaseBranchLink = (pr: PullRequest): [] | [string] => {
    const baseNumber = prNumbersByBranch[pr.baseBranch];

    if (baseNumber !== undefined) {
      return [`  ${pr.number} --> ${baseNumber}`];
    }

    if (!pr.baseBranch.match(/merge[-_]base/)) {
      return [`  ${pr.number} --> ${pr.baseBranch}[(${pr.baseBranch})]`];
    }

    return [];
  };

  const linksForPr = (pr: PullRequest): readonly string[] => {
    const diffbaseLinks = pr.diffbase.map((diffbase) =>
      `  ${pr.number} --> ${diffbase}`
    );
    return [...new Set([...diffbaseLinks, ...getBaseBranchLink(pr)])];
  };

  const safePrTitle = (title: string): string =>
    title
      .replace("[", "")
      .replace("]", "")
      .replace("(", "")
      .replace(")", "")
      .replace("{", "")
      .replace("}", "")
      .replace('"', "")
      .replace("'", "")
      .replace("@", "");

  lines.push("graph TD");

  const prLines = prs.map((pr) =>
    [
      `  ${pr.number}[#${pr.number} ${safePrTitle(pr.title)}]`,
      `  click ${pr.number} "${pr.htmlUrl.toString()}"`,
      ...linksForPr(pr),
    ].join("\n")
  );

  lines.push(prLines.join("\n\n"));

  return lines.join("\n");
};

const renderMarkdown = (mermaidSource: string): string => {
  const lines = [];

  lines.push("```mermaid");
  lines.push(mermaidSource);
  lines.push("```");

  return lines.join("\n");
};
