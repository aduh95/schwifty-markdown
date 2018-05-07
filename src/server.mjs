import temp from "temp";
import open from "open";
import path from "path";
import fs from "./fs-promises";
import express from "express";
import webSocket from "websocket";
import * as serveMedia from "./mediaHandler";
import { CONFIG } from "./definitions";
import child_process from "child_process";

// Automatically track and cleanup files at exit
temp.track();

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
  "/remove-fallback-warning.mjs",
  "/chart.mjs",
  "/chartist.mjs",
  "/diagram-rendering.mjs",
  "/generate-toc.mjs",
  "/local-links.mjs",
  "/highlight.mjs",
  "/lazyload.mjs",
  "/xivmap.mjs",
];
export const JS_SCRIPTS = ["/highlight-worker.js", "/papaparse.min.js"];
export const tmpFile = temp.path({ suffix: ".html" });

const app = express();

app.get("/", function(req, res) {
  res.set("Content-Type", "text/html");
  fs
    .readFile(tmpFile)
    .then(result => res.send(result))
    .catch(
      err => (
        console.error(err),
        res
          .status(503)
          .send(
            "<script type=module src='" +
              AUTO_REFRESH_MODULE +
              "'></script><p>No markdown modified</p>"
          )
      )
    );
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
  for (let file of serverFile.files) {
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
  const server = app.listen(CONFIG.PORT_NUMBER, "localhost", function() {
    console.log(`Server started on http://localhost:${CONFIG.PORT_NUMBER}`);
  });
  new webSocket.server({
    httpServer: server,
    autoAcceptConnections: true,
  }).on("connect", connection => {
    wsConnection && wsConnection.close();
    wsConnection = connection;

    connection.ping(1);
  });
};

export const refreshBrowser = () => {
  if (wsConnection && wsConnection.connected) {
    console.log("Sending socket to refresh browser");
    wsConnection.send("refresh");
  } else if (CONFIG.AUTO_OPEN_BROWSER && !waitForBrowserToOpen) {
    console.log("Opening browser");
    open("http://localhost:" + CONFIG.PORT_NUMBER, CONFIG.BROWSER_NAME);
    waitForBrowserToOpen = setTimeout(() => {
      waitForBrowserToOpen = null;
    }, WAIT_FOR_BROWSER_TO_OPEN);
  } else if (CONFIG.PRINT_TO_PDF) {
    console.log("Generating PDF " + CONFIG.PRINT_TO_PDF);
    try {
      child_process
        .spawn(CONFIG.BROWSER_NAME, [
          "--headless",
          "--print-to-pdf=" + CONFIG.PRINT_TO_PDF,
          "http://localhost:" + CONFIG.PORT_NUMBER,
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
