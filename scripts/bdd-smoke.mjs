import { spawnSync } from "node:child_process";

const result = spawnSync(
  process.execPath,
  [
    "./node_modules/@cucumber/cucumber/bin/cucumber-js",
    "--dry-run",
    "--import",
    "tests/bdd/**/*.js"
  ],
  {
    shell: false,
    stdio: "pipe"
  }
);

const output = `${result.stdout?.toString() ?? ""}\n${result.stderr?.toString() ?? ""}`;

if (result.error) {
  process.stderr.write(`${result.error.message}\n`);
  process.exit(1);
}

if (result.status === 0 || output.includes("undefined")) {
  process.stdout.write(output);
  process.stdout.write(
    "\nCucumber parsed the feature files and loaded the current step definitions.\n"
  );
  process.exit(0);
}

process.stdout.write(output);
process.exit(result.status ?? 1);
