import fs from "fs-extra";
import path from "path";
import parse from "./mdParser";
import DOM from "jsdom";
import {
  JS_MODULES,
  CSS_FILES,
  MEDIA_GET_URL,
  MARKDOWN_GET_URL,
  PLANTUML_GET_URL,
  refreshBrowser,
  tmpFile,
} from "./server";

let pathServerication = (file, relativePath, prefix) =>
  prefix +
  encodeURIComponent(path.resolve(path.join(path.dirname(file), relativePath)));

let isRelativePath = path => !/^(?:[a-z]+:)?\/\//i.test(path);

let stylification = (file, html) => {
  let dom = new DOM.JSDOM(`<main class='markdown-body'>${html}</main>`);
  let document = dom.window.document;

  let charset = document.createElement("meta");
  charset.setAttribute("charset", "utf-8");
  document.head.appendChild(charset);

  const title = document.createElement("title");
  title.appendChild(document.createTextNode(path.basename(file)));
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
    let parent = img.parentNode;
    let figure = document.createElement("figure");
    let figcaption = document.createElement("figcaption");
    figcaption.appendChild(document.createTextNode(img.alt));

    if (isRelativePath(img.src)) {
      img.src = pathServerication(
        file,
        img.src,
        img.src.endsWith(".pu") ? PLANTUML_GET_URL : MEDIA_GET_URL
      );
    }

    figure.appendChild(img);
    figure.appendChild(figcaption);

    parent.parentNode.replaceChild(figure, parent);
  }
  let tables = document.querySelectorAll("table");
  for (let table of tables) {
    let colgroup = table.querySelector("colgroup");
    if (colgroup !== null) {
      colgroup.remove();
    }
    table.style.removeProperty("width");
  }
  let links = document.querySelectorAll("a");
  for (let link of links) {
    if (isRelativePath(link.href)) {
      link.href = pathServerication(
        file,
        link.href,
        link.href.endsWith(".md") ? MARKDOWN_GET_URL : MEDIA_GET_URL
      );
    }
  }
  let codeBlocks = document.querySelectorAll("code");
  for (let code of codeBlocks) {
    if (
      /^lang-/.test(code.className) &&
      code.parentNode.nodeName.toLowerCase() === "pre"
    ) {
      code.parentElement.classList.add("sourceCode");
    }
  }

  return Promise.resolve("<!DOCTYPE html>\n" + dom.serialize());
};

const generate = file =>
  fs
    .readFile(file)
    .then(parse)
    .then(html => stylification(file, html))
    .then(html => fs.writeFile(tmpFile, html))
    .then(refreshBrowser)
    .catch(err => console.error(err));

export default generate;
