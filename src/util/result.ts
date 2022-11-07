export interface Ok<A> {
  readonly kind: "Ok";
  readonly value: A;

  map<B>(f: (_: A) => B): Ok<B>;
  flatMap<E, B>(f: (_: A) => Result<E, B>): Result<E, B>;
  match<T>(m: { readonly ok: (_: A) => T; readonly err: (_: never) => T }): T;
}
export const ok = <A>(a: A): Ok<A> => ({
  kind: "Ok",
  value: a,
  map: (f) => ok(f(a)),
  flatMap: (f) => f(a),
  match: ({ ok }) => ok(a),
});

export interface Err<A> {
  readonly kind: "Err";
  readonly error: A;

  map<B>(f: (_: never) => B): Err<A>;
  flatMap<E, B>(f: (_: never) => Result<E, B>): Result<A, B>;
  match<T>(m: { readonly ok: (_: never) => T; readonly err: (_: A) => T }): T;
}
export const err = <A>(a: A): Err<A> => ({
  kind: "Err",
  error: a,
  map: () => err(a),
  flatMap: () => err(a),
  match: ({ err }) => err(a),
});

export type Result<E, T> = Ok<T> | Err<E>;
