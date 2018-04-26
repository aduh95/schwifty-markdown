#!/usr/bin/env node

const fs = require("../src/fs-promises");
const path = require("path");
const { exec } = require("child_process");

const shellescape = cmd =>
  Number.isInteger(cmd)
    ? cmd
    : cmd === true
      ? ""
      : `"${cmd.replace(/(["\s'$`\\])/g, "\\$1")}"`;

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

const NODE = "node";
const FLAGS = "--experimental-modules";

const WORKING_DIR = path.resolve(path.join(__dirname, ".."));
const PACKAGE_FILE = path.join(WORKING_DIR, "package.json");

const watchable = path.resolve(argv._.pop() || ".");

if (argv.u) {
  console.log("Updating plantUML");
  fs.readFile(PACKAGE_FILE).then(json => {
    let data = JSON.parse(json);

    exec(
      data.scripts.updateDependencies,
      {
        cwd: WORKING_DIR,
      },
      (err, stdout) => {
        if (err) {
          console.error(err);
        } else {
          try {
            let result = JSON.parse(stdout);
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
          } catch (err) {
            console.error(err);
          }
        }
      }
    );
  });
} else {
  const [FgRed, FgYellow, FgReset] = ["\x1b[31m", "\x1b[33m", "\x1b[0m"];

  fs
    .access(watchable, fs.constants.R_OK)
    .then(() => require("is-port-available")(argv.p))
    .then(() => fs.readFile(PACKAGE_FILE))
    .then(JSON.parse)
    .then(data => {
      const options = [];
      for (let option in argv) {
        if (
          option === "_" ||
          option.length > 1 ||
          argv[option] === false ||
          argv[option] === undefined
        )
          continue;
        try {
          options.push(`-${option} ${shellescape(argv[option])}`);
        } catch (e) {
          console.error(e);
          console.log(option, argv[option]);
        }
      }
      options.push(shellescape(watchable));

      if (argv.j) {
        const isWin = require("is-windows")();

        data.scripts.start =
          (isWin ? "SET " : "") +
          "SCHWIFTY_DISABLE_JAVA=true " +
          data.scripts.start;
      }

      const subprocess = exec(data.scripts.start + " " + options.join(" "), {
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
    .catch(err => console.error(FgRed + err + FgReset));
}
