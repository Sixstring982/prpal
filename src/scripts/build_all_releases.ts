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
}): Promise<void> => {
  const cmd = [
    "deno",
    "compile",
    "--allow-net",
    `--target=${architecture}`,
    `--output=${OUTPUT_DIRECTORY}/prpal-${architecture}`,
    "./src/main.ts",
  ];

  return Deno.run({
    cmd,
  }).status().then((status) => {
    if (status.code !== 0) {
      const error = { cmd: cmd.join(' ') };
      throw new Error(`Non-zero exit! ${JSON.stringify(error)}`);
    }
  });
};

const main = () =>
  mkdirIfNotExists("release")
    .then(() => mkdirIfNotExists(OUTPUT_DIRECTORY))
    .then(async () => {
      // Build each architecture one-by-one.
      for (const architecture of ARCHITECTURES) {
        await buildRelease({ architecture });
      }
    });

await main();
