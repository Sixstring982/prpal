export type PullRequestState = typeof PULL_REQUEST_STATES[number];
export const PULL_REQUEST_STATES = ["open", "closed", "all"] as const;
export const PULL_REQUEST_STATES_SET: ReadonlySet<PullRequestState> = new Set(
  PULL_REQUEST_STATES,
);
export const isPullRequestState = (x: unknown): x is PullRequestState =>
  PULL_REQUEST_STATES_SET.has(x as PullRequestState);

export interface PullRequest {
  readonly kind: "PullRequest";
  readonly htmlUrl: URL;
  readonly apiUrl: URL;
  readonly state: PullRequestState;
  readonly number: number;
  readonly title: string;
  readonly body: string;
  readonly branch: string;
  readonly baseBranch: string;
  readonly diffbase: readonly number[];
}
