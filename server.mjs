import fs from "fs-extra";
import express from "express";
import webSocket from "websocket";
import mime from "mime";
import temp from "temp";

// Automatically track and cleanup files at exit
temp.track();

const app = express();
export const CSS_FILE = "/github-markdown.css";
export const AUTO_REFRESH_MODULE = "/autorefresh.mjs";
export let wsConnection = null;
export const tmpFile = temp.path({ suffix: ".html" });

app.get("/", function(req, res) {
  res.set("Content-Type", "text/html");
  fs
    .readFile(tmpFile)
    .then(result => res.send(result))
    .catch(
      err => (console.error(err), res.status(500).send("No markdown modified"))
    );
});
app.get(AUTO_REFRESH_MODULE, (req, res) => {
  fs
    .readFile("." + AUTO_REFRESH_MODULE)
    .then(result =>
      res.set("Content-Type", "application/javascript").send(result)
    )
    .catch(err => (console.error(err), res.status(404).end("Not Found")));
});
app.get(CSS_FILE, (req, res) => {
  fs
    .readFile("." + CSS_FILE)
    .then(result => res.set("Content-Type", "text/css").send(result))
    .catch(err => (console.error(err), res.status(404).end("Not Found")));
});
app.get("/media/:media", (req, res) => {
  fs
    .readFile(req.params.media)
    .then(result =>
      res.set("Content-Type", mime.getType(req.params.media)).send(result)
    )
    .catch(err => (console.error(err), res.status(404).end("Not Found")));
});

let server = app.listen(3000, function() {
  console.log("Listening on port 3000!");
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
