import fs from "fs-extra";
import path from "path";
import pandoc from "./pandoc.mjs";
import DOM from "jsdom";
import {
  JS_MODULES,
  CSS_FILES,
  MEDIA_GET_URL,
  MARKDOWN_GET_URL,
  PLANTUML_GET_URL,
  wsConnection,
  tmpFile,
} from "./server";

const SCHWIFTY_MARKDOWN = "Schwifty Markdown";

let watchDir = path.resolve(process.argv[2] || "./test.md");

let pathServerication = (file, relativePath, prefix) =>
  prefix +
  encodeURIComponent(path.resolve(path.join(path.dirname(file), relativePath)));

let stylification = file => buffer => {
  let dom = new DOM.JSDOM(
    "<main class='markdown-body'>" + buffer.toString("utf8") + "</main>"
  );
  let document = dom.window.document;

  let charset = document.createElement("meta");
  charset.setAttribute("charset", "utf-8");
  document.head.appendChild(charset);

  const title = document.createElement("title");
  title.appendChild(document.createTextNode(SCHWIFTY_MARKDOWN));
  document.head.appendChild(title);

  for (let cssFile of CSS_FILES) {
    let style = document.createElement("link");
    style.href = cssFile;
    style.rel = "stylesheet";
    document.head.appendChild(style);
  }

  for (let jsFile of JS_MODULES) {
    let script = document.createElement("script");
    script.type = "module";
    script.src = jsFile;
    script.setAttribute("async", "async");
    document.head.appendChild(script);
  }

  let images = document.querySelectorAll("img");
  for (let img of images) {
    img.src = pathServerication(file, img.src, MEDIA_GET_URL);
  }
  let tables = document.querySelectorAll("table");
  for (let table of tables) {
    let colgroup = table.querySelector("colgroup");
    if (colgroup !== null) {
      colgroup.remove();
    }
    table.style.removeProperty("width");
  }
  let embed = document.querySelectorAll("embed");
  for (let node of embed) {
    let image = document.createElement("img");
    image.src = pathServerication(file, node.src, PLANTUML_GET_URL);
    image.alt = node.nextElementSibling.textContent;
    node.parentNode.replaceChild(image, node);
  }
  let links = document.querySelectorAll("a");
  for (let link of links) {
    link.href = pathServerication(
      file,
      link.href,
      link.href.endsWith(".md") ? MARKDOWN_GET_URL : MEDIA_GET_URL
    );
  }

  return "<!DOCTYPE html>\n" + dom.serialize();
};

const sendRefreshSignal = () => {
  wsConnection && wsConnection.send("refresh");
  console.log("Sending socket to refresh browser");
};

const generate = file =>
  pandoc(file, tmpFile).then(() => {
    fs
      .readFile(tmpFile)
      .then(stylification(file))
      .then(html => fs.writeFile(tmpFile, html))
      .then(sendRefreshSignal);
  });

let fileWatcher = file => (previous, current) => {
  if (previous.mtime !== current.mtime) {
    generate(file);
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

export default generate;
