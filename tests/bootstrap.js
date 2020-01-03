#!/usr/bin/env node

const { execFile } = require("child_process");
const path = require("path");
const checkProgramOnPath = require("../bin/checkDependencies.js");

// Current working directory for schwifty
const cwd = path.resolve(__dirname + path.sep + "..");

let exitCode = 0;
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

  cypress.on("error", err => console.error(err));
  cypress.on("close", exitTests);

  return cypress;
};

const startSchwifty = async () => {
  console.log("Starting Schwifty (watching tests dir)");

  const { bin } = require("../package.json");
  const options = ["-n", __dirname, "--port=3000"];
  if (!(await new Promise(done => checkProgramOnPath("java", done)))) {
    console.warn("Java not detected on path, disabling Java related tests.");
    options.push("-j");
  }
  const server = execFile(path.join(cwd, bin.schwifty), options);

  server.stderr.pipe(process.stderr);

  server.stdout.on("data", data => {
    const message = data.toString().trim();
    console.log("Schwifty info:", message);

    if (waitToRunCypress && message.endsWith("being watched.")) {
      waitToRunCypress = false;
      runCypress();
    }
  });

  server.on("error", err => console.error(err));

  server.on("exit", () => console.log("exiting..."));

  return server;
};

const server = startSchwifty();

const exitTests = code => {
  if (code !== 0) {
    console.log("Tests terminated not successfully");
  }
  exitCode = code;
  server.then(s => s.kill("SIGINT"));
};

// If Cypress test was never launched
process.on("exit", () => waitToRunCypress && process.exit((exitCode = -1)));
