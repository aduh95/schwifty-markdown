import path from "path";
import DOM from "jsdom";
import fs from "fs-extra";

import parseMarkdown from "./mdParser";
import {
  JS_MODULES,
  JS_NO_MODULES_FALLBACK,
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

const setCharset = document => {
  let charset = document.createElement("meta");
  charset.setAttribute("charset", CHARSET);
  document.head.appendChild(charset);
};

const setTitle = (document, file) => {
  if (!document.head.querySelector("title")) {
    const title = document.createElement("title");
    title.appendChild(document.createTextNode(path.basename(file)));
    document.head.appendChild(title);
  }
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

  for (let jsFile of JS_NO_MODULES_FALLBACK) {
    let script = document.createElement("script");
    script.setAttribute("nomodule", "nomodule");
    script.src = jsFile;
    document.head.appendChild(script);
  }
};

const fixSharedID = document => {
  // Force IDs to be different in the titles
  const titles = document.querySelectorAll("h1,h2,h3,h4,h5,h6");
  const known_titles = [];
  let title_nb = 0;
  for (let title of titles) {
    if (known_titles.includes(title.id)) {
      title.id += "-" + title_nb++;
    } else {
      known_titles.push(title.id);
    }
  }
};

const imagesHandler = (document, file) => {
  // Handle images and plantuml diagram
  const images = document.querySelectorAll("img");

  for (const img of images) {
    let parent = img.parentNode;
    let picture = document.createElement("noscript");
    picture.setAttribute("class", "img");
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

    parent.insertBefore(picture, img).appendChild(img);

    if (
      // If the image is only child of a p, we turn it into figure
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

const noJSFallback = document => {
  const wrapper = document.createElement("div");
  const INPUT_ID = "fallback-message-ctrl";
  const dialog = document.createElement("dialog");
  const input = document.createElement("input");

  input.setAttribute("id", INPUT_ID);
  input.setAttribute("type", "checkbox");

  dialog.setAttribute("open", "open");
  dialog.setAttribute("id", "fallback-message");
  dialog.innerHTML =
    "<label for='" +
    INPUT_ID +
    "'><strong>Warning!</strong> Your browser does not support all the " +
    "features Schwifty needs. You experience may be less enjoyable as " +
    "it should. Please consider activate the corresponding flags in " +
    "your browser's settings or use a different one. <em>[Close]</em></label>";

  wrapper.appendChild(input);
  wrapper.appendChild(dialog);
  document.body.appendChild(wrapper);
};

const addHTMLHeaders = (file, dom, headers) => {
  const document = dom.window.document;
  let titleSet = false;
  setCharset(document);

  Object.keys(headers).forEach(key => {
    let tag = null;
    switch (key) {
      case "title":
        setTitle(document, headers[key]);
        titleSet = true;
        break;

      case "lang":
        document.documentElement.setAttribute("lang", headers[key]);

        break;
      case "js":
      case "script":
      case "scripts":
        if (Array.isArray(headers[key])) {
          tag = document.createDocumentFragment();
          headers[key].forEach(script => {
            const scriptTag = document.createElement("script");
            scriptTag.setAttribute(
              "src",
              pathServerication(file, script, MEDIA_GET_URL)
            );
            tag.appendChild(scriptTag);
          });
        } else {
          tag = document.createElement("script");
          tag.setAttribute(
            "src",
            pathServerication(file, headers[key], MEDIA_GET_URL)
          );
        }
        break;
      case "css":
      case "style":
      case "styles":
        if (Array.isArray(headers[key])) {
          tag = document.createDocumentFragment();
          headers[key].forEach(style => {
            const styleTag = document.createElement("style");
            styleTag.rel = "stylesheet";
            styleTag.setAttribute(
              "href",
              pathServerication(file, style, MEDIA_GET_URL)
            );
            tag.appendChild(styleTag);
          });
        } else {
          tag = document.createElement("link");
          tag.setAttribute(
            "src",
            pathServerication(file, headers[key], MEDIA_GET_URL)
          );
        }
        break;

      default:
        tag = document.createElement("meta");
        tag.setAttribute("name", key);
        tag.setAttribute("value", headers[key]);
    }
    tag && document.head.appendChild(tag);
  });

  if (!titleSet) {
    setTitle(document, file);
  }
  return Promise.resolve(dom);
};

const normalizeHTML = (file, dom) => {
  [
    addDependencies,
    headerAndFooterHandler,
    fixSharedID,
    imagesHandler,
    linksHandler,
    codeBlockHandler,
    noJSFallback,
  ].map(fct => fct.call(this, dom.window.document, file));

  return Promise.resolve("<!DOCTYPE html>\n" + dom.serialize());
};

const parseHTML = ({ headers, html }) =>
  Promise.resolve({
    headers,
    dom: new DOM.JSDOM(`<main class='markdown-body'>${html}</main>`),
  });

const generate = file =>
  fs
    .readFile(file)
    .then(parseMarkdown)
    .then(parseHTML)
    .then(({ headers, dom }) => addHTMLHeaders(file, dom, headers))
    .then(dom => normalizeHTML(file, dom))
    .then(html => fs.writeFile(tmpFile, html))
    .then(refreshBrowser)
    .catch(err => console.error(err));

export default generate;
