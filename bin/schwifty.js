#!/usr/bin/env node

require("./checkDependencies.js");
const fs = require("../src/fs-promises.js");
const path = require("path");
const { spawn } = require("child_process");

const argv = require("../src/cli-args")
  .usage("Usage: $0 [--port=3000] [--browser=firefox] [--no-browser] <path>")
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
  .example(
    "$0 --no-browser file.md",
    "Ask Schwifty not to open the default browser"
  )
  .example(
    "$0 --browser=firefox file.md",
    "Ask Schwifty to open Firefox rather than the default browser"
  )
  .boolean("q")
  .alias("q", ["quiet", "no-output"])
  .boolean("u")
  .alias("u", "update-dependencies")
  .describe(
    "u",
    "Update dependency files (the plantUML JAR, CSV parser) if a new version is available"
  )
  .help("h")
  .alias("h", "help").argv;

const FLAGS = "--experimental-modules";

const WORKING_DIR = path.resolve(path.join(__dirname, ".."));

const EXEC_FILE = path.join(WORKING_DIR, "bin", "schwifty.mjs");
const UPDATE_FILE = path.join(WORKING_DIR, "bin", "updateDependencies.mjs");

const watchable = path.resolve(argv._.pop() || ".");

if (argv.u) {
  console.log("Updating plantUML");

  const options = [FLAGS, UPDATE_FILE];
  const subprocess = spawn(process.argv0, options, {
    cwd: WORKING_DIR,
    windowsHide: true,
  });

  const stdout = [];

  subprocess.on("error", err => console.error(err));
  subprocess.on("close", exitCode => {
    if (exitCode) {
      console.log("An error occurred!", exitCode);
      stdout.forEach(data => process.stdout.write(data));
    } else {
      const result = JSON.parse(Buffer.concat(stdout));
      switch (result.statusCode) {
        case 200:
          console.log("Done!");
          break;

        case 304:
          console.log("Already up-to-date");
          break;

        default:
          console.error("Something went wrong", result);
      }
    }
  });

  subprocess.stdout.on("data", data => stdout.push(data));
  subprocess.stderr.pipe(process.stderr);
} else {
  const [FgRed, FgYellow, FgReset] = ["\x1b[31m", "\x1b[33m", "\x1b[0m"];

  fs.access(watchable, fs.constants.R_OK)
    .then(() => require("is-port-available")(argv.p))
    .then(() => {
      const options = [FLAGS, EXEC_FILE];
      Object.keys(argv)
        .filter(
          option =>
            option !== "_" &&
            option.length <= 1 &&
            argv[option] !== false &&
            argv[option] !== undefined
        )
        .forEach(option => {
          try {
            options.push(`-${option}`);
            options.push(argv[option]);
          } catch (e) {
            console.error(e);
            console.log(option, argv[option]);
          }
        });

      options.push(watchable);
      if (process.env.SCHWIFTY_DISABLE_JAVA) {
        options.push("-j");
      }

      const subprocess = spawn(process.argv0, options, {
        cwd: WORKING_DIR,
        windowsHide: true,
      });

      subprocess.on("error", err => console.error(err));

      if (!argv.q) {
        subprocess.stderr.on("data", data =>
          console.error(
            (/warning/i.test(data) ? FgYellow : FgRed) +
              data.toString().trim() +
              FgReset
          )
        );
        subprocess.stdout.pipe(process.stdout);
      }
    })
    .catch(err => console.error(FgRed + err + FgReset));
}
