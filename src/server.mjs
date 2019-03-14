import path from "path";

import express from "express";
import webSocket from "ws";
import * as serveMedia from "./mediaHandler.mjs";
import { getRenderedHTML } from "./md-file-to-html.mjs";
import { CONFIG } from "./definitions.mjs";
import child_process from "child_process";

const WAIT_FOR_BROWSER_TO_OPEN = 2500;
let waitForBrowserToOpen = null;

const SERVED_FILES_FOLDER = path.resolve("./utils");
export const AUTO_REFRESH_MODULE = "/autorefresh.mjs";
export const CSS_FILES = [
  "/fallback-message.css",
  "/chartist.css",
  "/github-markdown.css",
  "/markdown-effects.css",
  "/figureCaption.css",
  "/print.css",
  "/toc.css",
  "/xivmap.css",
];
export const JS_NO_MODULES_FALLBACK = ["/nomodule.js"];
export const JS_MODULES = [
  AUTO_REFRESH_MODULE,
  "/chart.mjs",
  "/chartist.mjs",
  "/diagram-rendering.mjs",
  "/generate-toc.mjs",
  "/highlight.mjs",
  "/lazyload.mjs",
  "/local-links.mjs",
  "/mermaid-rendering.mjs",
  "/remove-fallback-warning.mjs",
  "/xivmap.mjs",
];
export const JS_SCRIPTS = ["/highlight-worker.js", "/papaparse.min.js"];

const app = express();

app.get("/", function(req, res) {
  const html = getRenderedHTML();
  if (html) {
    res.header("Content-Type", "text/html").send(html);
  } else {
    res
      .status(503)
      .send(
        "<script type=module src='" +
          AUTO_REFRESH_MODULE +
          "'></script><p>No markdown modified</p>"
      );
  }
});

for (const serverFile of [
  {
    type: "text/css",
    files: CSS_FILES,
    folder: "css",
  },
  {
    type: "application/javascript",
    files: JS_MODULES,
    folder: "js_modules",
  },
  {
    type: "application/javascript",
    files: JS_SCRIPTS.concat(JS_NO_MODULES_FALLBACK),
    folder: "js_scripts",
  },
]) {
  for (const file of serverFile.files) {
    app.get(
      file,
      serveMedia.serverFile(
        path.join(SERVED_FILES_FOLDER, serverFile.folder + file),
        serverFile.type
      )
    );
  }
}

export const MEDIA_GET_URL = "/media/";
app.get(MEDIA_GET_URL + ":media", serveMedia.localFile());
export const YUML_GET_URL = "/yuml/";
app.get(YUML_GET_URL + ":media", serveMedia.yuml());
export const PLANTUML_GET_URL = "/pu/";
app.get(PLANTUML_GET_URL + ":media", serveMedia.plantuml());
export const MARKDOWN_GET_URL = "/md/";
app.get(MARKDOWN_GET_URL + ":media", serveMedia.markdown());

let wsConnection = null;

export const startServer = () => {
  const server = app.listen(
    CONFIG.getItem("PORT_NUMBER"),
    "localhost",
    function() {
      console.log(
        `Server started on http://localhost:${CONFIG.getItem("PORT_NUMBER")}`
      );
    }
  );
  new webSocket.Server({ server }).on("connection", connection => {
    wsConnection && wsConnection.close();
    wsConnection = connection;

    connection.ping(1);
  });
};

export const refreshBrowser = () => {
  const OPEN = 1;
  if (wsConnection && wsConnection.readyState === OPEN) {
    console.log("Sending socket to refresh browser");
    wsConnection.send("refresh");
  } else if (CONFIG.getItem("AUTO_OPEN_BROWSER") && !waitForBrowserToOpen) {
    console.log("Opening browser");
    import("open")
      .then(module => module.default)
      .then(open => {
        open(
          "http://localhost:" + CONFIG.getItem("PORT_NUMBER"),
          CONFIG.getItem("BROWSER_NAME")
        );
        waitForBrowserToOpen = setTimeout(() => {
          waitForBrowserToOpen = null;
        }, WAIT_FOR_BROWSER_TO_OPEN);
      });
  } else if (CONFIG.getItem("PRINT_TO_PDF")) {
    console.log("Generating PDF " + CONFIG.getItem("PRINT_TO_PDF"));
    try {
      child_process
        .spawn(CONFIG.getItem("BROWSER_NAME"), [
          "--headless",
          "--print-to-pdf=" + CONFIG.getItem("PRINT_TO_PDF"),
          "http://localhost:" + CONFIG.getItem("PORT_NUMBER"),
        ])
        .on("close", function(errCode) {
          console.log("Browser has closed, closing Schwifty...");
          process.exit(errCode);
        });
    } catch (err) {
      console.error("Have you forgot to specify the browser to use?", err);
      process.exit(1);
    }
  } else {
    console.log("Document ready");
  }
  return true;
};
