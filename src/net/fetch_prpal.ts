import { z } from "https://deno.land/x/zod@v3.19.1/mod.ts";
import {
  CaughtFailure,
  caughtFailure,
  FetchFailure,
  fetchFailure,
  ParseFailure,
  parseFailure,
} from "../util/failure.ts";

import { FutureResult } from "../util/future_result.ts";
import { Err, err, ok, Result } from "../util/result.ts";

/** Generic fetch overload for this application. */
export const fetchPrpal = <T>(
  url: string,
  parseAsync: (_: unknown) => Promise<z.SafeParseReturnType<unknown, T>>,
  modHeaders: (_: Headers) => Headers = (h) => h,
): FutureResult<T> =>
  fetch(new Request(url, { headers: modHeaders(getHeaders()) }))
    .then<Result<FetchFailure | ParseFailure, T>>(
      (response) => {
        if (response.status !== 200) {
          return err(fetchFailure(response));
        }

        return response.json()
          .then((responseJson: unknown) =>
            parseAsync(responseJson)
              .then((parseResult) => {
                if (parseResult.success) {
                  return ok(parseResult.data);
                }
                return err(parseFailure(responseJson, parseResult.error));
              })
          );
      },
    )
    .catch<Err<CaughtFailure>>((e) => err(caughtFailure(e)));

const getHeaders = (): Headers => {
  const headers = new Headers();

  headers.append("User-agent", "prpal - pull request tools");

  return headers;
};
