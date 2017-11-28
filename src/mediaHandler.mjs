import fs from "fs-extra";
import crypto from "crypto";
import path from "path";
import plantumlCompile from "node-plantuml";
import yumlCompile from "yuml2svg";
import renderMarkdown from "./md2html";
import { CONFIG } from "./definitions";

const sha1file = file =>
  new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha1");
    let input = fs.createReadStream(file);
    input.on("error", err => reject(err));
    input.on("readable", () => {
      const data = input.read();
      if (data) hash.update(data);
      else {
        resolve(hash.digest("hex"));
      }
    });
  });

const generateIfNotChached = (req, res, media, generate) =>
  sha1file(media)
    .then(sha1 => {
      if (req.get("If-None-Match") === sha1) {
        res.sendStatus(304);
      } else {
        res.set("ETag", sha1);
        generate();
      }
    })
    .catch(err => {
      console.error(err);
      res
        .status(500)
        .end(
          "<svg xmlns='http://www.w3.org/2000/svg' width='350' height='30'>" +
            "<text fill='red' x='33' y='22'>" +
            "Rendering failed, see console for more info!" +
            "</text>" +
            "</svg>"
        );
    });

export const yuml = () => (req, res) => {
  let media = req.params.media;
  res.set("Content-Type", "image/svg+xml");

  generateIfNotChached(req, res, media, () => {
    console.log("Generating yUML graph");
    fs.readFile(media).then(yuml => res.send(yumlCompile(yuml.toString())));
  });
};

export const plantuml = () => (req, res) => {
  let media = req.params.media;
  res.set("Content-Type", "image/svg+xml");

  generateIfNotChached(req, res, media, () => {
    if (CONFIG.JAVA_ENABLED) {
      console.log("Generating plantuml SVG", media);

      plantumlCompile
        .generate(media, {
          format: "svg",
          include: path.dirname(media),
        })
        .out.pipe(res);
    } else {
      throw new Error("Warning: Java has been disabled by flags!");
    }
  });
};

export const markdown = () => (req, res) => {
  let media = req.params.media;

  if (fs.existsSync(media)) {
    renderMarkdown(media);
    res.sendStatus(202);
  } else {
    res.sendStatus(404);
  }
};

export const localFile = () => (req, res) => {
  res.sendFile(req.params.media);
};

export const serverFile = (file, mime) => (req, res) => {
  fs
    .readFile(file)
    .then(result => res.set("Content-Type", mime).send(result))
    .catch(err => (console.error(err), res.sendStatus(404)));
};
