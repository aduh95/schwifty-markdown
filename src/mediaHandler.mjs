import fs from "./fs-promises.js";
import hashFile from "./hashFile.mjs";
import renderMarkdown from "./md-file-to-html.mjs";
import { AUTO_REFRESH_MODULE } from "./server.mjs";
import { CONFIG } from "./definitions.mjs";

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
          "<svg xmlns='http://www.w3.org/2000/svg' width='400' height='40'>" +
            "<text fill='red' dominant-baseline='middle' text-anchor='middle' font-size='16' x='200' y='20'>" +
            "Rendering failed, see console for more info!" +
            "</text>" +
            "</svg>"
        );
    });

export const yuml = () => (req, res) => {
  const { media } = req.params;
  res.set("Content-Type", "image/svg+xml");

  generateIfNotCached(req, res, media, () => {
    console.log("Schwifty: Generating yUML graph.");
    return import("yuml2svg")
      .then(module => module.default)
      .then(yumlCompile =>
        fs.access(media, fs.constants.R_OK).then(
          () => yumlCompile(fs.createReadStream(media)),
          () => yumlCompile(media) // If a yUML string is requested
        )
      )
      .then(svg => res.send(svg));
  });
};

export const plantuml = () => (req, res) => {
  const { media } = req.params;
  res.set("Content-Type", "image/svg+xml");

  generateIfNotCached(req, res, media, () => {
    if (CONFIG.getItem("JAVA_ENABLED")) {
      console.log("Schwifty: Generating plantuml SVG.");

      import("./plantuml.mjs").then(module =>
        module
          .default(media, error => {
            console.warn(error);
            res.sendStatus(500);
          })
          .pipe(res)
      );
    } else {
      throw new Error("Warning: Java has been disabled by flags!");
    }
  });
};

export const markdown = () => (req, res) => {
  const { media } = req.params;

  const temporaryResponse = text =>
    `<script type='module' src='${AUTO_REFRESH_MODULE}'></script><p>${text}</p>`;

  fs.access(media, fs.constants.R_OK)
    .then(() => {
      // Rendering Markdown asynchronously
      renderMarkdown(media);

      // Sending a temporary response to the browser
      res.status(202).send(temporaryResponse("Redirection…"));
    })
    .catch(err => {
      console.warn(err);
      res.status(404).send(temporaryResponse("Not Found"));
    });
};

export const localFile = () => (req, res) => {
  res.sendFile(req.params.media);
};

export const serverFile = (file, mime) => (req, res) => {
  res.sendFile(file, { headers: { "Content-Type": mime } });
};
