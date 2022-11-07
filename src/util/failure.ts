import { z } from "https://deno.land/x/zod@v3.19.1/mod.ts";

export interface CaughtFailure {
  readonly kind: "CaughtFailure";
  readonly errorCaught: unknown;
}
export const caughtFailure = (errorCaught: unknown): CaughtFailure => ({
  kind: "CaughtFailure",
  errorCaught,
});

export interface FetchFailure {
  readonly kind: "FetchFailure";
  readonly response: Response;
}
export const fetchFailure = (response: Response): FetchFailure => ({
  kind: "FetchFailure",
  response,
});

export interface ParseFailure {
  readonly kind: "ParseFailure";
  readonly parseInput: unknown;
  readonly zodError: z.ZodError<unknown>;
}
export const parseFailure = (
  parseInput: unknown,
  zodError: z.ZodError<unknown>,
): ParseFailure => ({
  kind: "ParseFailure",
  parseInput,
  zodError,
});

export type Failure =
  | CaughtFailure
  | FetchFailure
  | ParseFailure;
