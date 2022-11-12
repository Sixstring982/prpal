/** @fileoverview Builds production releases for all architectures. */

import { METADATA } from "../../project.ts";

const OUTPUT_DIRECTORY = `release/v${METADATA.version}`;

type Architecture = typeof ARCHITECTURES[number];
const ARCHITECTURES = [
  "aarch64-apple-darwin",
  "x86_64-apple-darwin",
  "x86_64-pc-windows-msvc",
  "x86_64-unknown-linux-gnu",
];

const mkdirIfNotExists = (path: string): Promise<void> =>
  Deno.mkdir(path)
    .catch((e: unknown) => {
      // Ignore this error if the directory already exists.
      if (e instanceof Deno.errors.AlreadyExists) {
        return;
      }

      throw e;
    });

const buildRelease = ({
  architecture,
}: {
  readonly architecture: Architecture;
}): Deno.Process =>
  Deno.run({
    cmd: [
      "deno",
      "compile",
      "--allow-net",
      `--target=${architecture}`,
      `--output=${OUTPUT_DIRECTORY}/prpal-${architecture}`,
      "./src/main.ts",
    ],
  });

const main = () =>
  mkdirIfNotExists("release")
    .then(() => mkdirIfNotExists(OUTPUT_DIRECTORY))
    .then(() => {
      const results = ARCHITECTURES.map((architecture) =>
        buildRelease({ architecture })
      );

      return Promise.allSettled(results.map((x) => x.status()));
    }).then((result) => {
      result.forEach((r) => {
        if (r.status === "rejected") {
          console.error("Promise rejected", r);
          return;
        }

        if (r.value.code !== 0) {
          console.error("Non-zero exit!");
          return;
        }
      });
    });

await main();
