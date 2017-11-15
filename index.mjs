import path from "path";
import watch from "./src/mdWatcher";
import { watchCounter } from "./src/mdWatcher";
import md2html from "./src/md2html";
import opt from "./src/cli-args";
import { CONFIG } from "./src/definitions";

const argv = opt.demandCommand(1, "You must provied a path to listen to!").argv;

CONFIG.PORT_NUMBER = argv.p;
CONFIG.AUTO_OPEN_BROWSER = !argv.n;
CONFIG.BROWSER_NAME = argv.b || undefined;

const target = path.resolve(argv._.pop());

export default watch(target).then(promiseResolver => {
  console.log(
    watchCounter +
      " markdown file" +
      (watchCounter > 1 ? "s are" : " is") +
      " being watched."
  );

  return promiseResolver === 1 ? md2html(target) : Promise.resolve(false);
});
