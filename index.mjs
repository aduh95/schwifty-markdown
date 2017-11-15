import path from "path";
import watch from "./src/mdWatcher";
import { watchCounter } from "./src/mdWatcher";
import md2html from "./src/md2html";

if (process.argc < 2) {
  console.error("You must provied a path to listen to");
  process.exit(1);
}

const target = path.resolve(process.argv[2]);

watch(target).then(promiseResolver => {
  console.log(
    watchCounter +
      " markdown file" +
      (watchCounter > 1 ? "s are" : " is") +
      " being watched."
  );

  if (promiseResolver === 1) {
    md2html(target);
  }
});
