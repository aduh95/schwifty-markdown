import path from "path";
import DOM from "jsdom";
import fs from "fs-extra";

import parseMarkdown from "./mdParser";
import {
  JS_MODULES,
  JS_SCRIPTS,
  CSS_FILES,
  MEDIA_GET_URL,
  MARKDOWN_GET_URL,
  PLANTUML_GET_URL,
  YUML_GET_URL,
  refreshBrowser,
  tmpFile,
} from "./server";
import {
  CHARSET,
  YUML_EXTENSION,
  PLANTUML_EXTENSION,
  MARKDOWN_EXTENSION,
} from "./definitions.mjs";

const pathServerication = (file, relativePath, prefix) =>
  prefix +
  encodeURIComponent(path.resolve(path.join(path.dirname(file), relativePath)));

const isRelativePath = path => !/^((?:(?:[a-z]+:)?\/\/)|data:)/i.test(path);

const MASK_IMG =
  "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";

const setCharset = document => {
  let charset = document.createElement("meta");
  charset.setAttribute("charset", CHARSET);
  document.head.appendChild(charset);
};

const setTitle = (document, file) => {
  const title = document.createElement("title");
  title.appendChild(document.createTextNode(path.basename(file)));
  document.head.appendChild(title);
};

const headerAndFooterHandler = document => {
  const headers = document.querySelectorAll("header");
  for (let header of headers) {
    if (!header.id) {
      header.id = "pageHeader";
    }
    document.body.insertBefore(header, document.body.firstChild);
  }
  const footers = document.querySelectorAll("footer");
  for (let footer of footers) {
    if (!footer.id) {
      footer.id = "pageFooter";
    }
    document.body.appendChild(footer);
  }
};

const addDependencies = document => {
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

  for (let jsFile of JS_SCRIPTS) {
    let script = document.createElement("link");
    script.rel = "preload";
    script.setAttribute("as", "script");
    script.href = jsFile;
    document.head.appendChild(script);
  }
};

const fixSharedID = document => {
  // Force IDs to be different in the titles
  let titles = document.querySelectorAll("h1,h2,h3,h4,h5,h6");
  let title_nb = 0;
  for (let title of titles) {
    title.id += "-" + title_nb++;
  }
};

const imagesHandler = (document, file) => {
  // Handle images and plantuml diagram
  const images = document.querySelectorAll("img");

  for (const img of images) {
    let parent = img.parentNode;
    let picture = document.createElement("picture");
    let source = document.createElement("source");
    source.setAttribute("class", "MASK_IMG");
    source.setAttribute("srcset", MASK_IMG);
    source.setAttribute("media", "screen");

    if (isRelativePath(img.src)) {
      let url;

      if (img.src.endsWith(PLANTUML_EXTENSION)) {
        url = PLANTUML_GET_URL;
      } else if (img.src.endsWith(YUML_EXTENSION)) {
        url = YUML_GET_URL;
      } else {
        url = MEDIA_GET_URL;
      }

      img.src = pathServerication(file, img.src, url);
    }

    picture.appendChild(source);
    parent.insertBefore(picture, img).appendChild(img);

    if (
      parent.nodeName.toLowerCase() === "p" &&
      !picture.previousSibling &&
      !picture.nextSibling
    ) {
      let figure = document.createElement("figure");
      let figcaption = document.createElement("figcaption");
      figcaption.appendChild(document.createTextNode(img.alt));

      figure.appendChild(picture);
      figure.appendChild(figcaption);
      parent.parentNode.replaceChild(figure, parent);
    }
  }
};

const linksHandler = (document, file) => {
  // Handle links to redirect local link to be rendered
  let links = document.querySelectorAll("a");
  for (let link of links) {
    if (isRelativePath(link.href)) {
      link.href = pathServerication(
        file,
        link.href,
        link.href.endsWith(MARKDOWN_EXTENSION)
          ? MARKDOWN_GET_URL
          : MEDIA_GET_URL
      );
    }
  }
};

const codeBlockHandler = document => {
  let codeBlocks = document.querySelectorAll("code");
  for (let code of codeBlocks) {
    if (
      /^lang-/.test(code.className) &&
      code.parentNode.nodeName.toLowerCase() === "pre"
    ) {
      code.parentElement.classList.add("sourceCode");
    }
  }
};

const normalizeHTML = (file, dom) => {
  [
    setCharset,
    setTitle,
    addDependencies,
    headerAndFooterHandler,
    fixSharedID,
    imagesHandler,
    linksHandler,
    codeBlockHandler,
  ].map(fct => fct.call(this, dom.window.document, file));

  return Promise.resolve("<!DOCTYPE html>\n" + dom.serialize());
};

const parseHTML = html =>
  Promise.resolve(new DOM.JSDOM(`<main class='markdown-body'>${html}</main>`));

const generate = file =>
  fs
    .readFile(file)
    .then(parseMarkdown)
    .then(parseHTML)
    .then(dom => normalizeHTML(file, dom))
    .then(html => fs.writeFile(tmpFile, html))
    .then(refreshBrowser)
    .catch(err => console.error(err));

export default generate;
