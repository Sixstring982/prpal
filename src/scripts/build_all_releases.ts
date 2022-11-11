/** @fileoverview Builds production releases for all architectures. */

import { exists } from "https://deno.land/std/fs/mod.ts";
import { METADATA } from "../../project.ts";

const OUTPUT_DIRECTORY = `release/v${METADATA.version}`;

type Architecture = typeof ARCHITECTURES[number];
const ARCHITECTURES = [
  "aarch64-apple-darwin",
  "x86_64-apple-darwin",
  "x86_64-pc-windows-msvc",
  "x86_64-unknown-linux-gnu",
];

const mkdirIfNotExists = (path: string): Promise<void> => {
  if (exists(path)) {
    return Promise.resolve();
  }

  return Deno.mkdir(path);
};

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

        console.log(r.value);
      });
    });

await main();
