#!/usr/bin/env node

const fs = require("fs-extra");
const path = require("path");
const { exec } = require("child_process");
const shellescape = require("shell-escape");

const argv = require("yargs")
  .usage("Usage: $0 path/to/directory/to/listen")
  .example(
    "$0 .",
    "Starts Schwifty server and listen on all changes on markdown files of the current directory and its subdirectories"
  )
  .example(
    "$0 /dir",
    "Starts Schwifty server and listen to all changes on markdown files in `/dir` and its subdirectories"
  )
  .example(
    "$0 file.md",
    "Starts Schwifty server and listen to all changes on `file.md`"
  )
  .boolean("u")
  .alias("u", "update-plantuml")
  .describe("u", "Update the plantuml JAR if a new version is available")
  .help("h")
  .alias("h", "help").argv;

const NODE = "node";
const FLAGS = "--experimental-modules";
const SRC_DIR = "src";

const workingDir = path.resolve(path.join(__dirname, ".."));
const watchable = path.resolve(argv._.pop());

if (argv.u) {
  console.log("Updating plantuml");
  fs.readFile("package.json").then(json => {
    let data = JSON.parse(json);

    exec(
      data.scripts.postinstall,
      {
        cwd: workingDir,
      },
      (err, stdout) => {
        if (err) {
          console.error(err);
        } else {
          try {
            let result = JSON.parse(stdout);
            console.log(
              result.statusCode === 304 ? "Already up-to-date!" : "Done!",
              result
            );
          } catch (err) {
            console.error(err);
          }
        }
      }
    );
  });
} else if (fs.existsSync(watchable)) {
  const FgRed = "\x1b[31m";
  const FgYellow = "\x1b[33m";
  fs.readFile("package.json").then(json => {
    let data = JSON.parse(json);

    let process = exec(data.scripts.start + " " + shellescape([watchable]), {
      cwd: workingDir,
    });

    process.on("error", err => console.error(err));

    process.stderr.on("data", data =>
      console.error((/warning/i.test(data) ? FgYellow : FgRed) + data.trim())
    );
    process.stdout.on("data", data => console.log(data.trim()));
  });
} else {
  console.log("No such file or directory");
  process.exit(1);
}
