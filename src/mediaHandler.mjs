import fs from "fs-extra";
import crypto from "crypto";
import mime from "mime";
import path from "path";
import plantumlCompile from "node-plantuml";

const SERVED_FILES_FOLDER = "./utils";

let sha1file = file =>
  new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha1");

    let input = fs.createReadStream(file);
    input.on("readable", () => {
      const data = input.read();
      if (data) hash.update(data);
      else {
        resolve(hash.digest("hex"));
      }
    });
  });

export const plantuml = () => (req, res) => {
  let media = req.params.media;
  res.set("Content-Type", "image/svg+xml");

  sha1file(media).then(sha1 => {
    if (req.get("If-None-Match") === sha1) {
      res.status(304).end();
    } else {
      res.set("ETag", sha1);
      console.log("Generating plantuml SVG", media);
      plantumlCompile
        .generate(media, {
          format: "svg",
          include: path.dirname(media),
        })
        .out.pipe(res);
    }
  });
};

export const localFile = () => (req, res) => {
  let media = req.params.media;

  fs
    .readFile(media)
    .then(result => res.set("Content-Type", mime.getType(media)).send(result))
    .catch(err => (console.error(err), res.status(404).end("Not Found")));
};

export const serverFile = (file, mime) => (req, res) => {
  fs
    .readFile(SERVED_FILES_FOLDER + file)
    .then(result => res.set("Content-Type", mime).send(result))
    .catch(err => (console.error(err), res.status(404).end("Not Found")));
};
