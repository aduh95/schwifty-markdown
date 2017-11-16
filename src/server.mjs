import temp from "temp";
import open from "open";
import fs from "fs-extra";
import express from "express";
import webSocket from "websocket";
import * as serveMedia from "./mediaHandler";
import { CONFIG } from "./definitions";

// Automatically track and cleanup files at exit
temp.track();

const AUTO_REFRESH_MODULE = "/autorefresh.mjs";
export const CSS_FILES = [
  "/github-markdown.css",
  "/figureCaption.css",
  "/print.css",
];
export const JS_MODULES = [
  AUTO_REFRESH_MODULE,
  "/generate-toc.mjs",
  "/local-links.mjs",
  "/highlight.mjs",
];
export const JS_SCRIPT = ["/worker.js"];
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

for (let jsFile of JS_SCRIPT.concat(JS_MODULES)) {
  app.get(jsFile, serveMedia.serverFile(jsFile, "application/javascript"));
}
for (let cssFile of CSS_FILES) {
  app.get(cssFile, serveMedia.serverFile(cssFile, "text/css"));
}

export const MEDIA_GET_URL = "/media/";
app.get(MEDIA_GET_URL + ":media", serveMedia.localFile());
export const PLANTUML_GET_URL = "/pu/";
app.get(PLANTUML_GET_URL + ":media", serveMedia.plantuml());
export const MARKDOWN_GET_URL = "/md/";
app.get(MARKDOWN_GET_URL + ":media", serveMedia.markdown());

let wsConnection = null;

setImmediate(() => {
  // Waiting for the CONFIG to be loaded before starting the server

  let server = app.listen(CONFIG.PORT_NUMBER, "localhost", function() {
    console.log(`Listening on port ${CONFIG.PORT_NUMBER}!`);
  });
  let wsServer = new webSocket.server({
    httpServer: server,
    autoAcceptConnections: true,
  });
  wsServer.on("connect", connection => {
    wsConnection && wsConnection.close();
    wsConnection = connection;

    connection.ping(1);
  });
});

export const refreshBrowser = () => {
  if (wsConnection && wsConnection.connected) {
    console.log("Sending socket to refresh browser");
    wsConnection.send("refresh");
  } else if (CONFIG.AUTO_OPEN_BROWSER) {
    console.log("Opening browser");
    open("http://localhost:" + CONFIG.PORT_NUMBER, CONFIG.BROWSER_NAME);
  } else {
    console.log("Document ready");
  }
};
