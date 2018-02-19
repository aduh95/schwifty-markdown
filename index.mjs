import path from "path";
import { CONFIG } from "./src/definitions";
import { watchCounter } from "./src/mdWatcher";
import { startServer } from "./src/server";
import addWatcher from "./src/mdWatcher";
import md2html from "./src/md2html";
import opt from "./src/cli-args";

/**
 * Entry point of the package.
 * @param {string} target The file or directory to watch and render
 */
const schwifty = async target => {
  let watcher = await addWatcher(target);

  console.log(
    watchCounter +
      " markdown file" +
      (watchCounter === 1 ? " is" : "s are") +
      " being watched."
  );

  return watcher === watchCounter && (await md2html(target));
};

if (opt) {
  const argv = opt.demandCommand(1, "You must provide a path to listen to!")
    .argv;

  CONFIG.PORT_NUMBER = argv.p;
  CONFIG.AUTO_OPEN_BROWSER = !argv.n && !argv.o;
  CONFIG.PRINT_TO_PDF = argv.o ? path.resolve(argv.o) : false;
  CONFIG.BROWSER_NAME = argv.b || undefined;
  CONFIG.JAVA_ENABLED = !argv.j;
  CONFIG.PLANTUML_CONFIG =
    argv.c || path.resolve("./utils/plantuml-ressources/no-shadow.pu");

  startServer();
  schwifty(path.resolve(argv._.pop()));
}

export default schwifty;
