import path from "path";
import { CONFIG } from "./src/definitions";
import { watchCounter } from "./src/mdWatcher";
import addWatcher from "./src/mdWatcher";
import md2html from "./src/md2html";
import opt from "./src/cli-args";

const schwifty = async target => {
  let watcher = await addWatcher(target);

  console.log(
    watchCounter +
      " markdown file" +
      (watchCounter > 1 ? "s are" : " is") +
      " being watched."
  );

  return watcher === watchCounter && (await md2html(target));
};

if (opt) {
  const argv = opt.demandCommand(1, "You must provied a path to listen to!")
    .argv;

  CONFIG.PORT_NUMBER = argv.p;
  CONFIG.AUTO_OPEN_BROWSER = !argv.n;
  CONFIG.BROWSER_NAME = argv.b || undefined;
  CONFIG.JAVA_ENABLED = !argv.j;

  schwifty(path.resolve(argv._.pop()));
}

export default schwifty;
