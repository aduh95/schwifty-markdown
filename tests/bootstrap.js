#!/usr/bin/env node

import { execFile } from "child_process";
import path from "path";

import { fileURLToPath } from "url";
import { createRequire } from "module";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const require = createRequire(import.meta.url);

// Current working directory for schwifty
const cwd = path.join(__dirname, "..");

let waitToRunCypress = true;

const runCypress = () => {
  console.log("Starting Cypress");

  const { bin } = require("cypress/package.json");
  const cypress = execFile(
    require.resolve("cypress/" + bin.cypress),
    [process.argv.length > 2 ? "open" : "run", "--env", "testDir=" + __dirname],
    { cwd }
  );

  cypress.stderr.pipe(process.stderr);
  cypress.stdout.pipe(process.stdout);

  cypress.on("error", console.error);
  cypress.on("close", exitTests);

  return cypress;
};

const startSchwifty = () => {
  console.log("Starting Schwifty (watching tests dir)");

  const { bin } = require("../package.json");
  const options = ["-n", __dirname, "--port=3000"];

  // disabling Java as it makes tests failing unexpectedly
  options.push("-j");

  const server = execFile(path.join(cwd, bin.schwifty), options);

  server.stderr.pipe(process.stderr);

  server.stdout.on("data", (data) => {
    const message = data.toString().trim();
    console.log("Schwifty info:", message);

    if (waitToRunCypress && message.endsWith("being watched.")) {
      waitToRunCypress = false;
      runCypress();
    }
  });

  server.on("error", console.error);
  server.on("exit", () => console.log("exiting..."));

  return server;
};

const server = startSchwifty();

const exitTests = (code) => {
  if (code !== 0) {
    console.log("Tests terminated not successfully");
  }
  process.exitCode = code;
  server.kill("SIGINT");
};

// If Cypress test was never launched
process.on("exit", () => {
  if (waitToRunCypress) process.exitCode = -1;
});
