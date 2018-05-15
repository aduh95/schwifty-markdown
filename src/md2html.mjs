import path from "path";

import parseMarkdown from "./mdParser";
import {
  JS_MODULES,
  JS_NO_MODULES_FALLBACK,
  CSS_FILES,
  MEDIA_GET_URL,
  MARKDOWN_GET_URL,
  PLANTUML_GET_URL,
  YUML_GET_URL,
} from "./server";
import {
  CHARSET,
  YUML_EXTENSION,
  PLANTUML_EXTENSION,
  MARKDOWN_EXTENSION,
} from "./definitions.mjs";

const TEXT_NODE = 3; // @see https://developer.mozilla.org/fr/docs/Web/API/Node/nodeType
const NON_BREAKING_SPACE = "\u00A0"; // @see https://en.wikipedia.org/wiki/Non-breaking_space

/**
 * Extracts the hash part of the URL
 * @param {string} relativePath
 */
const extractHash = url => {
  if (url.includes("#")) {
    const hashOffset = url.lastIndexOf("#");
    return {
      url: url.substring(0, hashOffset),
      hash: url.substring(hashOffset),
    };
  } else {
    return { url, hash: "" };
  }
};
const pathServerication = (file, relativePath, prefix) => (
  (relativePath = extractHash(relativePath)),
  prefix +
    encodeURIComponent(getLocalAbsolutePath(file, relativePath.url)) +
    relativePath.hash
);

const isRelativePath = path =>
  !/^((?:(?:[a-z]+:)?\/\/)|data:|about:)/i.test(path);
const getLocalAbsolutePath = (file, relativePath) =>
  path.resolve(path.join(path.dirname(file), relativePath));

const mediaServerication = (file, path) =>
  isRelativePath(path) ? pathServerication(file, path, MEDIA_GET_URL) : path;

/**
 * @param {Document} document
 */
const setCharset = document => {
  const charset = document.createElement("meta");
  charset.setAttribute("charset", CHARSET);
  document.head.appendChild(charset);
};

/**
 * @param {Document} document
 * @param {string} title
 */
const setTitle = (document, title) => {
  if (!document.head.querySelector("title")) {
    const titleElement = document.createElement("title");
    titleElement.appendChild(document.createTextNode(title));
    document.head.appendChild(titleElement);
  }
};

/**
 * @param {Document} document
 */
const headerAndFooterHandler = document => {
  const headers = document.querySelectorAll("header");
  for (const header of headers) {
    if (!header.id) {
      header.id = "pageHeader";
    }
    document.body.insertBefore(header, document.body.firstChild);
  }
  const footers = document.querySelectorAll("footer");
  for (const footer of footers) {
    if (!footer.id) {
      footer.id = "pageFooter";
    }
    document.body.appendChild(footer);
  }
};

/**
 * @param {Document} document
 */
const addDependencies = document => {
  for (const cssFile of CSS_FILES) {
    const style = document.createElement("link");
    style.href = cssFile;
    style.rel = "stylesheet";
    document.head.appendChild(style);
  }

  for (const jsFile of JS_MODULES) {
    const script = document.createElement("script");
    script.type = "module";
    script.src = jsFile;
    script.setAttribute("async", "async");
    document.head.appendChild(script);
  }

  for (const jsFile of JS_NO_MODULES_FALLBACK) {
    const script = document.createElement("script");
    script.setAttribute("nomodule", "nomodule");
    script.src = jsFile;
    document.head.appendChild(script);
  }
};

/**
 * @param {Document} document
 */
const fixSharedID = document => {
  // Force IDs to be different in the titles
  const titles = document.querySelectorAll("h1,h2,h3,h4,h5,h6");
  const known_titles = [];
  let title_nb = 0;
  for (const title of titles) {
    if (known_titles.includes(title.id)) {
      title.id += "-" + title_nb++;
    } else {
      known_titles.push(title.id);
    }
  }
};

/**
 * Handles images and yUML / plantUML diagram
 * @param {Document} document
 * @param {string} file
 */
const imagesHandler = (document, file) => {
  const images = document.querySelectorAll("img");

  for (const img of images) {
    const parent = img.parentNode;
    const picture = document.createElement("noscript");
    picture.setAttribute("class", "img");
    if ("about:blank#inline" === img.src) {
      const codeElement = parent.nextElementSibling.firstElementChild;
      const language = codeElement.className.substr(9); // Removes "language-"
      switch (language) {
        case "json":
          img.src =
            "data:application/json," +
            encodeURIComponent(codeElement.textContent);
          break;
        case "csv":
          img.src =
            "data:text/csv," +
            encodeURIComponent(codeElement.textContent.trim());
          break;

        case "mermaid":
          img.src =
            "data:text/mermaid," + encodeURIComponent(codeElement.textContent);
          break;

        case "plantuml":
          // lazyload plantuml module
          import("node-plantuml");
          img.src =
            PLANTUML_GET_URL + encodeURIComponent(codeElement.textContent);
          break;
        case "yuml":
          // lazyload yuml module
          import("yuml2svg");
          img.src = YUML_GET_URL + encodeURIComponent(codeElement.textContent);
          break;
      }
      codeElement.parentNode.remove();
    } else if (isRelativePath(img.src)) {
      let url;

      if (img.src.endsWith(PLANTUML_EXTENSION)) {
        // lazyload plantuml module
        import("node-plantuml");
        url = PLANTUML_GET_URL;
      } else if (img.src.endsWith(YUML_EXTENSION)) {
        // lazyload yuml module
        import("yuml2svg");
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
      const figure = document.createElement("figure");
      const figcaption = document.createElement("figcaption");
      figcaption.appendChild(document.createTextNode(img.alt));

      figure.appendChild(picture);
      figure.appendChild(figcaption);
      parent.parentNode.replaceChild(figure, parent);
    }
  }
};

/**
 * Replaces spaces by non-breaking spaces when it is relevant
 * @param {Document} document The current document
 * @param {string} file The path of the current markdown file
 */
const nonBreakingSpaces = (document, file) => {
  const regexSpaceBefore = / [\?!:;»%€]/g;
  const regexSpaceAfter = /« /g;

  const textNodes = [
    ...document.querySelectorAll(
      "p,h1,h2,h3,h4,h5,h6,a,strong,em,li,figcaption"
    ),
  ]
    .reduce(
      (array, textContainer) => (
        array.push(...textContainer.childNodes), array
      ),
      []
    )
    .filter(child => child.nodeType === TEXT_NODE);

  textNodes
    .filter(textNode => regexSpaceBefore.test(textNode.wholeText))
    .forEach(
      textNode =>
        (textNode.nodeValue = textNode.wholeText.replace(
          regexSpaceBefore,
          m => NON_BREAKING_SPACE + m.slice(1)
        ))
    );

  textNodes
    .filter(textNode => regexSpaceAfter.test(textNode.wholeText))
    .forEach(
      textNode =>
        (textNode.nodeValue = textNode.wholeText.replace(
          regexSpaceAfter,
          m => m.slice(0, -1) + NON_BREAKING_SPACE
        ))
    );
};

/**
 * Handles links to redirect local link to be rendered
 * @param {Document} document The current document
 * @param {string} file The path of the current markdown file
 */
const linksHandler = (document, file) => {
  const links = document.querySelectorAll("a");
  for (const link of links) {
    if (isRelativePath(link.href)) {
      link.setAttribute(
        "data-original-href",
        getLocalAbsolutePath(file, link.href)
      );

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

/**
 * @param {Document} document The current document
 */
const codeBlockHandler = document => {
  const codeBlocks = document.querySelectorAll("code");
  for (const code of codeBlocks) {
    if (
      code.className.startsWith("language-") &&
      code.parentNode.nodeName.toLowerCase() === "pre"
    ) {
      code.parentElement.classList.add("sourceCode");
    }
  }
};

/**
 * @param {Document} document The current document
 */
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

/**
 * @param {string} file
 * @param {Document} document
 * @param {string} path
 */
const createUserScriptTag = (file, document, path) => {
  const script = document.createElement("script");

  // ES Module handling
  path.endsWith("mjs") && script.setAttribute("type", "module");

  script.setAttribute("src", mediaServerication(file, path));
  return script;
};

/**
 *
 * @param {string} file
 * @param {{window: Window}} dom
 * @param {Object.<string,string>} headers
 */
const addHTMLHeaders = (file, dom, headers) => {
  const { document } = dom.window;
  setCharset(document);

  document.documentElement.setAttribute(
    "data-path",
    pathServerication(file, path.basename(file), MARKDOWN_GET_URL)
  );

  Object.keys(headers).forEach(key => {
    let tag = null;
    switch (key) {
      case "title":
        setTitle(document, headers[key]);
        break;

      case "lang":
        document.documentElement.setAttribute("lang", headers[key]);
        break;

      case "js":
      case "script":
      case "scripts":
        if (Array.isArray(headers[key])) {
          tag = document.createDocumentFragment();
          headers[key].forEach(script =>
            tag.appendChild(createUserScriptTag(file, document, script))
          );
        } else {
          tag = createUserScriptTag(file, document, headers[key]);
        }
        break;

      case "css":
      case "style":
      case "styles":
        if (Array.isArray(headers[key])) {
          tag = document.createDocumentFragment();
          headers[key].forEach(style => {
            const styleTag = document.createElement("link");
            styleTag.rel = "stylesheet";
            styleTag.setAttribute("href", mediaServerication(file, style));
            tag.appendChild(styleTag);
          });
        } else {
          tag = document.createElement("link");
          tag.setAttribute("href", mediaServerication(file, headers[key]));
        }
        break;

      default:
        tag = document.createElement("meta");
        tag.setAttribute("name", key);
        tag.setAttribute("value", headers[key]);
    }
    tag && document.head.appendChild(tag);
  });

  const firstHeading = document.querySelector(
    ".markdown-body>h1:first-of-type"
  );

  setTitle(
    document,
    firstHeading ? firstHeading.textContent : path.basename(file)
  );

  return Promise.resolve(dom);
};

/**
 * Executes transformation to the HTML to add Schwifty specific features
 * @param {string} file
 * @param {DOM} dom
 * @returns {Promise<string>}
 */
const normalizeHTML = (file, dom) => {
  [
    addDependencies,
    headerAndFooterHandler,
    fixSharedID,
    imagesHandler,
    linksHandler,
    codeBlockHandler,
    nonBreakingSpaces,
    noJSFallback,
  ].forEach(fct => fct.call(this, dom.window.document, file));

  return Promise.resolve("<!DOCTYPE html>\n" + dom.serialize());
};

const parseHTML = ({ headers, html }) =>
  import("jsdom").then(module => ({
    headers,
    dom: new module.default.JSDOM(`<main class='markdown-body'>${html}</main>`),
  }));

/**
 * @param {string} mdContent A string representation of the markdown
 * @param {string} filePath The path of the file to resolve image paths
 * @returns {Promise<string>}
 */
export const md2html = (mdContent, filePath = "/") =>
  parseMarkdown(mdContent)
    .then(parseHTML)
    .then(({ headers, dom }) => addHTMLHeaders(filePath, dom, headers))
    .then(dom => normalizeHTML(file, dom));

export default md2html;
