#!/usr/bin/env node
import path from "path";

import schwifty, { serveMarkdown } from "../index.mjs";
import { CONFIG } from "../src/definitions.mjs";
import { startServer } from "../src/server.mjs";
import opt from "../src/cli-args.js";

import UTIL_FOLDER_PATH from "../utils/path.mjs";

const { argv } = opt
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
  .example(
    "curl -L https://github.com/aduh95/schwifty-markdown/raw/master/README.md | $0 -",
    "Reads Markdown from stdin. Links and images may be broken."
  )
  .example(
    "$0 /path/to/file1 < /path/to/file2",
    "Reads Markdown from file2 and use file1 as reference for relative links."
  )
  .help("h")
  .alias("h", "help");

CONFIG.setItem("PORT_NUMBER", argv.p);
!argv.n && !argv.o && CONFIG.setItem("AUTO_OPEN_BROWSER", true);
argv.o && CONFIG.setItem("PRINT_TO_PDF", path.resolve(argv.o));
argv.b && CONFIG.setItem("BROWSER_NAME", argv.b);
argv.j || CONFIG.setItem("JAVA_ENABLED", true);
CONFIG.setItem(
  "PLANTUML_CONFIG",
  argv.c || path.join(UTIL_FOLDER_PATH, "plantuml-ressources", "no-shadow.pu")
);

startServer();

const target = argv._.pop();
if (!target) {
  throw new Error(
    "You must provide a path to a folder or file to watch, or use `-` to " +
      "read from stdin. Use `--help` for more info."
  );
}
const launcher =
  target !== "-"
    ? schwifty(path.resolve(target))
    : new Promise(async (resolve, reject) => {
        console.warn("Schwifty: Reading from stdin...");
        const md = [];
        try {
          for await (const chunk of process.stdin) {
            md.push(chunk);
          }
        } catch (e) {
          reject(e);
        }
        serveMarkdown(md.join(""), argv._[0]).then(resolve, reject);
      });

launcher
  .then(result => {
    if (result === false) {
      console.info(
        "Schwifty: Edit a markdown file to render it in your browser."
      );
      // Cache jsdom to be ready for the next parsing
      import("jsdom");
    } else if (result === 0) {
      console.error("Schwifty: No Markdown file found.");
      console.error(
        "Schwifty: Please make sure you are using a supported extension."
      );
      process.exit(0);
    }
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
