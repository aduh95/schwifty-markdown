#!/usr/bin/env node

const { exec, execFile, spawn } = require("child_process");
const path = require("path");

let exitCode = 0;
let waitToRunCypress = true;
const runCypress = () => {
  console.log("Starting Cypress");
  const cypress = spawn(
    "npx",
    process.argv.length > 2
      ? ["cypress", "open", "--env", "testDir=" + __dirname]
      : [
          "cypress",
          "run",
          "--browser",
          "chromium",
          "--env",
          "testDir=" + __dirname,
        ],
    {
      cwd: path.resolve(__dirname + path.sep + ".."),
    }
  );

  cypress.on("error", err => console.error(err));

  cypress.stderr.on("data", message => {
    console.error(message.toString().trim());
  });

  cypress.stdout.on("data", data => {
    console.log(data.toString().trim());
  });

  cypress.on("close", exitTests);
};

console.log("Starting Schwifty (watching tests dir)");

const server = execFile(path.join(__dirname, "..", "bin", "schwifty.js"), [
  "-n",
  path.resolve(__dirname),
]);

server.stderr.on("data", message => {
  console.error(message.toString().trim());
});

server.stdout.on("data", data => {
  const message = data.toString().trim();
  console.log(message);

  if (waitToRunCypress && message.endsWith("being watched.")) {
    waitToRunCypress = false;
    runCypress();
  }
});

server.on("error", err => console.error(err));

server.on("exit", () => console.log("exiting..."));
server.on("close", () => {
  console.log("closing...");

  exec("netstat -tulpn | grep :3000", (err, stdout) => {
    err
      ? console.error(err)
      : exec("kill " + stdout.match(/(\d+)\/node/)[1], err => {
          err ? console.error(err) : process.exit(exitCode);
        });
  });
});

const exitTests = code => {
  if (code != 0) {
    console.log("Tests terminated not successfully");
  }
  exitCode = code;
  server.kill("SIGINT");
};
