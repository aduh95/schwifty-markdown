import fs from "fs-extra";
import path from "path";
import md2html from "./md2html";

if (process.argc < 2) {
  console.error("You must provied a path to listen to");
  process.exit(1);
}

let watchDir = path.resolve(process.argv[2]);

const fileWatcher = file => (previous, current) => {
  if (previous.mtime !== current.mtime) {
    md2html(file);
  }
};
const dirWatcher = (eventType, filename) => {
  if (eventType === "rename") {
    fs.watchFile(filename, fileWatcher);
  }
};

const watchDirRecursive = dir => {
  fs.readdir(dir).then(files => {
    for (let file of files) {
      if (file.startsWith(".")) continue;

      file = path.join(dir, file);
      fs
        .stat(file)
        .then(
          stat =>
            stat.isDirectory()
              ? watchDirRecursive(file)
              : file.endsWith(".md")
                ? fs.watchFile(file, fileWatcher(file))
                : null
        )
        .catch(err => console.warn(err));
    }
  });
  fs.watch(dir, { persistant: true, recursive: false }, dirWatcher);
};

watchDirRecursive(watchDir);
