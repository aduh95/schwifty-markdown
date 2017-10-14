import fs from "fs-extra";
import path from "path";
import pandoc from "./pandoc.mjs";
import DOM from "jsdom";
import {
  JS_MODULES,
  CSS_FILES,
  MEDIA_GET_URL,
  PLANTUML_GET_URL,
  wsConnection,
  tmpFile,
} from "./server";

let watchDir = path.resolve(process.argv[2] || "./test.md");

let pathServerication = (file, relativePath, prefix) =>
  prefix +
  encodeURIComponent(path.resolve(path.join(path.dirname(file), relativePath)));

let stylification = file => buffer => {
  let dom = new DOM.JSDOM(
    "<main class='markdown-body'>" + buffer.toString("utf8") + "</main>"
  );

  for (let cssFile of CSS_FILES) {
    let style = dom.window.document.createElement("link");
    style.href = cssFile;
    style.rel = "stylesheet";
    dom.window.document.head.appendChild(style);
  }

  for (let jsFile of JS_MODULES) {
    let script = dom.window.document.createElement("script");
    script.type = "module";
    script.async = true;
    script.src = jsFile;
    dom.window.document.head.appendChild(script);
  }

  let images = dom.window.document.querySelectorAll("img");
  for (let img of images) {
    img.src = pathServerication(file, img.src, MEDIA_GET_URL);
  }
  let tables = dom.window.document.querySelectorAll("table");
  for (let table of tables) {
    let colgroup = table.querySelector("colgroup");
    if (colgroup !== null) {
      colgroup.remove();
    }
    table.style.removeProperty("width");
  }
  let embed = dom.window.document.querySelectorAll("embed");
  for (let node of embed) {
    let image = dom.window.document.createElement("img");
    image.src = pathServerication(file, node.src, PLANTUML_GET_URL);
    node.parentNode.replaceChild(image, node);
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
          console.log("Sending socket to refresh browser");
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
