import fs from "fs-extra";
import express from "express";
import webSocket from "websocket";
import temp from "temp";
import open from "open";
import * as serveMedia from "./mediaHandler";

const app = express();
const SERVED_FILES_FOLDER = "./utils";

export const CSS_FILE = "/github-markdown.css";
export const AUTO_REFRESH_MODULE = "/autorefresh.mjs";
export let wsConnection = null;
export const tmpFile = temp.path({ suffix: ".html" });

// Automatically track and cleanup files at exit
temp.track();

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

app.get(AUTO_REFRESH_MODULE, (req, res) => {
  fs
    .readFile(SERVED_FILES_FOLDER + AUTO_REFRESH_MODULE)
    .then(result =>
      res.set("Content-Type", "application/javascript").send(result)
    )
    .catch(err => (console.error(err), res.status(404).end("Not Found")));
});
app.get(CSS_FILE, (req, res) => {
  fs
    .readFile(SERVED_FILES_FOLDER + CSS_FILE)
    .then(result => res.set("Content-Type", "text/css").send(result))
    .catch(err => (console.error(err), res.status(404).end("Not Found")));
});

export const MEDIA_GET_URL = "/media/";
app.get(MEDIA_GET_URL + ":media", (req, res) => {
  serveMedia.localFile(req.params.media, res);
});
export const PLANTUML_GET_URL = "/pu/";
app.get(PLANTUML_GET_URL + ":media", (req, res) => {
  serveMedia.plantuml(req.params.media, res);
});

let server = app.listen(3000, function() {
  console.log("Listening on port 3000!");
  open("http://127.0.0.1:3000");
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
