import { z } from "https://deno.land/x/zod@v3.19.1/mod.ts";
import { fetchGithub } from "../net/fetch_github.ts";

import {
  PULL_REQUEST_STATES,
  PullRequest,
  PullRequestState,
} from "../pulls/pull_request.ts";
import { FutureResult } from "../util/future_result.ts";

export interface listPullRequestsRequest {
  readonly repo: string;
  readonly author?: string;
  readonly authToken?: string;
  readonly pullRequestState?: PullRequestState;
}

export interface ListPullRequestsResponse {
  readonly pullRequests: readonly PullRequest[];
}

const RESPONSE_PARSER = z
  .array(
    z.object({
      url: z.string().url(),
      html_url: z.string().url(),
      state: z.enum(PULL_REQUEST_STATES),
      number: z.number().positive(),
      title: z.string(),
      body: z
        .string()
        .nullish()
        .transform((x) => x ?? ""),
      user: z.object({
        login: z.string(),
      }),
      base: z.object({
        label: z.string(),
      }),
      head: z.object({
        label: z.string(),
      }),
    })
  )
  .transform((raws) => ({
    pullRequests: raws.map<PullRequest>((raw) => {
      const diffbase = (() => {
        const diffbaseLine = raw.body
          .split("\n")
          .find((x) => x.toLowerCase().startsWith("* diffbase: "));

        if (diffbaseLine === undefined) {
          return [];
        }

        return diffbaseLine
          .substring("* Diffbase: ".length)
          .split(",")
          .map((s) => parseInt(s.trim().replace("#", ""), 10));
      })();

      return {
        ...raw,
        kind: "PullRequest",
        author: raw.user.login,
        apiUrl: new URL(raw.url),
        htmlUrl: new URL(raw.html_url),
        branch: raw.head.label,
        baseBranch: raw.base.label,
        diffbase,
      };
    }),
  }));

/**
 * Returns a list of pull requests, using the given request.
 *
 * Calls `https://api.github.com/repos/REPO/pulls, adapting the response.
 */
export const listPullRequests = (
  request: listPullRequestsRequest
): FutureResult<ListPullRequestsResponse> =>
  fetchGithub(
    `https://api.github.com/repos/${request.repo}/pulls?state=${
      request.pullRequestState ?? "open"
    }`,
    request.authToken,
    RESPONSE_PARSER.safeParseAsync
  ).then((result) =>
    result.map((response) => ({
      ...response,
      pullRequests: (() => {
        if (request.author === undefined) {
          return response.pullRequests;
        }

        return response.pullRequests.filter((x) => x.author === request.author);
      })(),
    }))
  );
