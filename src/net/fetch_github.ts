import { z } from "https://deno.land/x/zod@v3.19.1/mod.ts";
import { FutureResult } from "../util/future_result.ts";
import { fetchPrpal } from "./fetch_prpal.ts";

export const fetchGithub = <T>(
  url: string,
  authToken: string | undefined,
  parseAsync: (_: unknown) => Promise<z.SafeParseReturnType<unknown, T>>,
): FutureResult<T> =>
  fetchPrpal(url, parseAsync, (h) => {
    h.append("Accept", "application/vnd.github+json");

    if (authToken !== undefined) {
      h.append("Authorization", `Bearer ${authToken}`);
    }

    return h;
  });
