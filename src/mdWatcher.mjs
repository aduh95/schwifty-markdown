import path from "path";
import fs from "fs-extra";

import md2html from "./md2html";
import { MARKDOWN_EXTENSION } from "./definitions.mjs";

const fileWatcher = file => evType => {
  if (fs.existsSync(file)) {
    md2html(file);
  }
};
const dirWatcher = dir => (eventType, filename) => {
  if (eventType === "rename" && filename.endsWith(MARKDOWN_EXTENSION)) {
    let file = path.join(dir, filename);
    if (fs.existsSync(file)) {
      fs.watch(file, fileWatcher(file));
      console.log("Now watching " + file);
    } else {
      // fs.unwatchFile(file);
      // console.log("Stop watching " + file);
    }
  }
};

export let watchCounter = 0;

const watchFile = file =>
  fs
    .stat(file)
    .then(stat => {
      if (stat.isDirectory()) {
        return watchDirRecursive(file);
      } else if (file.endsWith(MARKDOWN_EXTENSION)) {
        fs.watch(file, fileWatcher(file));
        return Promise.resolve(++watchCounter);
      }
    })
    .catch(err => console.warn(err));
const watchDirRecursive = dir => {
  fs.watch(dir, { persistant: true, recursive: false }, dirWatcher(dir));

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
