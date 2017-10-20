import fs from "fs-extra";
import path from "path";
import md2html from "./md2html";

const fileWatcher = file => (previous, current) => {
  if (previous.mtime !== current.mtime) {
    md2html(file);
  }
};
const dirWatcher = (eventType, filename) => {
  if (eventType === "rename") {
    fs.watchFile(filename, fileWatcher);
    console.log("Now watching " + filename);
  }
};

export let watchCounter = 0;

const watchFile = file =>
  fs
    .stat(file)
    .then(stat => {
      if (stat.isDirectory()) {
        return watchDirRecursive(file);
      } else if (file.endsWith(".md")) {
        watchCounter++;
        fs.watchFile(file, fileWatcher(file));
        return Promise.resolve();
      }
    })
    .catch(err => console.warn(err));
const watchDirRecursive = dir => {
  fs.watch(dir, { persistant: true, recursive: false }, dirWatcher);

  return fs.readdir(dir).then(files => {
    let promises = [];
    for (let file of files) {
      if (file.startsWith(".")) continue;
      promises.push(watchFile(path.join(dir, file)));
    }
    return Promise.all(promises);
  });
};

export default watchFile;
