#!/usr/bin/env node

const fs = require("fs-extra");
const path = require("path");
const { exec } = require("child_process");

const shellescape = cmd => `"${cmd.replace(/(["\s'$`\\])/g, "\\$1")}"`;

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
  .boolean("q")
  .alias("q", ["quiet", "no-output"])
  .boolean("u")
  .alias("u", "update-plantuml")
  .describe("u", "Update the plantuml JAR if a new version is available")
  .help("h")
  .alias("h", "help").argv;

const NODE = "node";
const FLAGS = "--experimental-modules";
const SRC_DIR = "src";

const WORKING_DIR = path.resolve(path.join(__dirname, ".."));
const PACKAGE_FILE = path.join(WORKING_DIR, "package.json");

const watchable = path.resolve(argv._.pop() || ".");

if (argv.u) {
  console.log("Updating plantuml");
  fs.readFile(PACKAGE_FILE).then(json => {
    let data = JSON.parse(json);

    exec(
      data.scripts.postinstall,
      {
        cwd: WORKING_DIR,
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
  const FgReset = "\x1b[0m";
  fs
    .readFile(PACKAGE_FILE)
    .then(json => {
      let data = JSON.parse(json);

      let subprocess = exec(data.scripts.start + " " + shellescape(watchable), {
        cwd: WORKING_DIR,
      });

      subprocess.on("error", err => console.error(err));

      if (!argv.q) {
        subprocess.stderr.on("data", data =>
          console.error(
            (/warning/i.test(data) ? FgYellow : FgRed) + data.trim() + FgReset
          )
        );
        subprocess.stdout.on("data", data => console.log(data.trim()));
      }
    })
    .catch(err => console.error(err));
} else {
  console.error("No such file or directory");
  process.exit(1);
}
