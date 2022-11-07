import { Failure } from "./failure.ts";
import { Result } from "./result.ts";

export type FutureResult<T> = Promise<Result<Failure, T>>;
