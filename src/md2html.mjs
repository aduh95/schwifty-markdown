import path from "path";
import DOM from "jsdom";
import fs from "fs-extra";

import parseMarkdown from "./mdParser";
import {
  JS_MODULES,
  CSS_FILES,
  MEDIA_GET_URL,
  MARKDOWN_GET_URL,
  PLANTUML_GET_URL,
  refreshBrowser,
  tmpFile,
} from "./server";
import {
  CHARSET,
  PLANTUML_EXTENSION,
  MARKDOWN_EXTENSION,
} from "./definitions.mjs";

const pathServerication = (file, relativePath, prefix) =>
  prefix +
  encodeURIComponent(path.resolve(path.join(path.dirname(file), relativePath)));

const isRelativePath = path => !/^(?:[a-z]+:)?\/\//i.test(path);

const setCharset = document => {
  let charset = document.createElement("meta");
  charset.setAttribute("charset", CHARSET);
  document.head.appendChild(charset);

  return Promise.resolve();
};

const setTitle = (document, file) => {
  const title = document.createElement("title");
  title.appendChild(document.createTextNode(path.basename(file)));
  document.head.appendChild(title);

  return Promise.resolve();
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

  return Promise.resolve();
};

const fixSharedID = document => {
  // Force IDs to be different in the titles
  let titles = document.querySelectorAll("h1,h2,h3,h4,h5,h6");
  let title_nb = 0;
  for (let title of titles) {
    title.id += "-" + title_nb++;
  }

  return Promise.resolve();
};

const imagesHandler = (document, file) => {
  // Handle images and plantuml diagram
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
        img.src.endsWith(PLANTUML_EXTENSION) ? PLANTUML_GET_URL : MEDIA_GET_URL
      );
    }

    if (img.nextElementSibling || img.previousElementSibling) {
      parent.insertBefore(figure, img).appendChild(img);
    } else {
      figure.appendChild(img);
      parent.parentNode.replaceChild(figure, parent);
    }

    figure.appendChild(figcaption);
  }

  return Promise.resolve();
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

  return Promise.resolve();
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

  return Promise.resolve();
};

const normalizeHTML = (file, dom) =>
  Promise.all(
    [
      setCharset,
      setTitle,
      addDependencies,
      fixSharedID,
      imagesHandler,
      linksHandler,
      codeBlockHandler,
    ].map(fct => fct.call(this, dom.window.document, file))
  ).then(() => Promise.resolve("<!DOCTYPE html>\n" + dom.serialize()));

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
