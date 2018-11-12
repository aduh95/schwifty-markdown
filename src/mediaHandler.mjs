import fs from "./fs-promises";
import path from "path";
import hashFile from "./hashFile";
import plantumlCompile from "node-plantuml";
import yumlCompile from "yuml2svg";
import renderMarkdown from "./md-file-to-html";
import { AUTO_REFRESH_MODULE } from "./server";
import { CONFIG } from "./definitions";

const generateIfNotCached = (req, res, media, generate) =>
  hashFile(media)
    .then(hash => {
      if (req.get("If-None-Match") === hash) {
        res.sendStatus(304);
      } else {
        res.set("ETag", hash);
        return generate();
      }
    })
    .catch(err => {
      console.error(err);
      res
        .status(500)
        .end(
          "<svg xmlns='http://www.w3.org/2000/svg' width='400' height='30'>" +
            "<text fill='red' text-anchor='middle' x='200' y='22'>" +
            "Rendering failed, see console for more info!" +
            "</text>" +
            "</svg>"
        );
    });

export const yuml = () => (req, res) => {
  const { media } = req.params;
  res.set("Content-Type", "image/svg+xml");

  generateIfNotCached(req, res, media, () => {
    console.log("Generating yUML graph");
    return fs
      .access(media, fs.constants.R_OK)
      .then(
        () => yumlCompile(fs.createReadStream(media)),
        () => yumlCompile(media) // If a yUML string is requested
      )
      .then(svg => res.send(svg));
  });
};

export const plantuml = () => (req, res) => {
  const { media } = req.params;
  res.set("Content-Type", "image/svg+xml");

  generateIfNotCached(req, res, media, () => {
    if (CONFIG.getItem("JAVA_ENABLED")) {
      console.log("Generating plantuml SVG");

      plantumlCompile
        .generate(media, {
          format: "svg",
          include: path.dirname(media),
          config: CONFIG.getItem("PLANTUML_CONFIG"),
        })
        .out.pipe(res);
    } else {
      throw new Error("Warning: Java has been disabled by flags!");
    }
  });
};

export const markdown = () => (req, res) => {
  const { media } = req.params;

  fs.access(media, fs.constants.R_OK)
    .then(() => {
      // Rendering Markdown asynchronously
      renderMarkdown(media);

      // Sending a temporary response to the browser
      res
        .status(202)
        .send(
          "<script type=module src='" +
            AUTO_REFRESH_MODULE +
            "'></script><p>Redirection…</p>"
        );
    })
    .catch(err => {
      console.warn(err);
      res
        .status(404)
        .send(
          "<script type=module src='" +
            AUTO_REFRESH_MODULE +
            "'></script><p>Not Found</p>"
        );
    });
};

export const localFile = () => (req, res) => {
  res.sendFile(req.params.media);
};

export const serverFile = (file, mime) => (req, res) => {
  res.sendFile(file, { headers: { "Content-Type": mime } });
};
