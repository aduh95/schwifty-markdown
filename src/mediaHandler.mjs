import fs from "fs-extra";
import mime from "mime";
import plantumlCompile from "node-plantuml";

const SERVED_FILES_FOLDER = "./utils";

export const plantuml = (media, res) => {
  const HEADER = "@startuml\n!include ";
  const FOOTER = "\n@enduml";

  res.set("Content-Type", "image/svg+xml");

  let gen = plantumlCompile.generate(HEADER + media + FOOTER, {
    format: "svg",
  });
  gen.out.pipe(res);
};

export const localFile = (media, res) => {
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
