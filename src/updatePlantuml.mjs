import http from "https";
import path from "path";
import fs from "fs";

const HOST = "netcologne.dl.sourceforge.net";

let vendorDir = path.join(
  path.resolve("."),
  "node_modules",
  "node-plantuml",
  "vendor"
);
let jar = path.join(vendorDir, "plantuml.jar");
let etagFile = path.join(vendorDir, "etag.txt");

const getLastVersion = etag => {
  let distantJar = {
    hostname: HOST,
    path: "/project/plantuml/plantuml.jar",
  };

  if (etag) {
    distantJar.headers = {
      "If-None-Match": etag,
    };
  }

  http.get(distantJar, res => {
    console.log("SourceForge statusCode:", res.statusCode);

    if (200 === res.statusCode) {
      let writestream = fs.createWriteStream(jar);
      res.pipe(writestream);
      fs.writeFile(
        etagFile,
        res.headers.etag,
        err =>
          err
            ? console.error(err)
            : console.log("Plantuml has been updated to the last version!")
      );
    }
  });
};

if (fs.existsSync(etagFile)) {
  fs.readFile(
    etagFile,
    (err, etag) => (err ? console.error(err) : getLastVersion(etag))
  );
} else {
  getLastVersion();
}
