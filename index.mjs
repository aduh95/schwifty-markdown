import fs from "fs-extra";
import path from "path";
import pandoc from "./md2html.mjs";
import DOM from "jsdom";
import { AUTO_REFRESH_MODULE, CSS_FILE, wsConnection, tmpFile } from "./server";

let watchDir = path.resolve(process.argv[2] || "./test.md");

let stylification = file => buffer => {
  let dom = new DOM.JSDOM(
    "<main class='markdown-body'>" + buffer.toString("utf8") + "</main>"
  );
  let style = dom.window.document.createElement("link");
  style.href = CSS_FILE;
  style.rel = "stylesheet";
  dom.window.document.head.appendChild(style);

  let script = dom.window.document.createElement("script");
  script.type = "module";
  script.src = AUTO_REFRESH_MODULE;
  dom.window.document.head.appendChild(script);

  let images = dom.window.document.querySelectorAll("img");
  for (let img of images) {
    img.src =
      "/media/" +
      encodeURIComponent(path.resolve(path.join(path.dirname(file), img.src)));
  }
  let tables = dom.window.document.querySelectorAll("table");
  for (let table of tables) {
    table.style.removeProperty("width");
  }

  return dom.serialize();
};

let fileWatcher = file => (previous, current) => {
  if (previous.mtime !== current.mtime) {
    pandoc(file, tmpFile).then(() => {
      fs
        .readFile(tmpFile)
        .then(stylification(file))
        .then(html => fs.writeFile(tmpFile, html))
        .then(() => {
          wsConnection && wsConnection.send("refresh");
          console.log("refresh browser");
        });
    });
  }
};
let dirWatcher = (eventType, filename) => {
  if (eventType === "rename") {
    fs.watchFile(filename, fileWatcher);
  }
};

let watchDirRecursive = dir => {
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
        );
    }
  });
  fs.watch(dir, { persistant: true, recursive: false }, dirWatcher);
};

watchDirRecursive(watchDir);
