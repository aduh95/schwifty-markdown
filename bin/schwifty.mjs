import path from "path";

import schwifty from "../index";
import { CONFIG } from "../src/definitions";
import { startServer } from "../src/server";
import opt from "../src/cli-args";

const argv = opt.demandCommand(1, "You must provide a path to listen to!").argv;

CONFIG.setItem("PORT_NUMBER", argv.p);
!argv.n && !argv.o && CONFIG.setItem("AUTO_OPEN_BROWSER", true);
argv.o && CONFIG.setItem("PRINT_TO_PDF", path.resolve(argv.o));
argv.b && CONFIG.setItem("BROWSER_NAME", argv.b);
argv.j || CONFIG.setItem("JAVA_ENABLED", true);
CONFIG.setItem(
  "PLANTUML_CONFIG",
  argv.c || path.resolve("./utils/plantuml-ressources/no-shadow.pu")
);

startServer();
schwifty(path.resolve(argv._.pop()))
  .then(result => {
    if (result === false) {
      console.info("Hint: Edit a markdown file to render it in your browser.");
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
