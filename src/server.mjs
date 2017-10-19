import temp from "temp";
import open from "open";
import fs from "fs-extra";
import express from "express";
import webSocket from "websocket";
import * as serveMedia from "./mediaHandler";

// Automatically track and cleanup files at exit
temp.track();

const AUTO_REFRESH_MODULE = "/autorefresh.mjs";
export const CSS_FILES = ["/github-markdown.css", "/figureCaption.css"];
export const JS_MODULES = [AUTO_REFRESH_MODULE, "/generate-toc.mjs"];
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

for (let jsFile of JS_MODULES) {
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

let server = app.listen(3000, "localhost", function() {
  console.log("Listening on port 3000!");
});

let wsConnection = null;
let wsServer = new webSocket.server({
  httpServer: server,
  autoAcceptConnections: true,
});
wsServer.on("connect", connection => {
  wsConnection && wsConnection.close();
  wsConnection = connection;

  connection.ping(1);
});

export const refreshBrowser = () => {
  console.log(
    wsConnection ? "Sending socket to refresh browser" : "Opening browser"
  );
  wsConnection ? wsConnection.send("refresh") : open("http://localhost:3000");
};
