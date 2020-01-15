#!/usr/bin/env node
import path from "path";

import schwifty from "../index.mjs";
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
schwifty(path.resolve(argv._.pop()))
  .then(result => {
    if (result === false) {
      console.info("Hint: Edit a markdown file to render it in your browser.");
      // Cache jsdom to be ready for the next parsing
      import("jsdom");
    } else if (result === 0) {
      console.error(
        "No Markdown file found. Please make sure you are using a supported extension."
      );
      process.exit(0);
    }
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
