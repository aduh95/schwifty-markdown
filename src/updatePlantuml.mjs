import http from "https";
import path from "path";
import fs from "fs";

const HOST = "netcologne.dl.sourceforge.net";

let vendorDir = path.join(path.resolve("."), "node_modules");
if (!fs.existsSync(vendorDir)) {
  vendorDir = path.resolve("..");
}
vendorDir = path.join(vendorDir, "node-plantuml", "vendor");

let jar = path.join(vendorDir, "plantuml.jar");
let etagFile = path.join(vendorDir, "etag.txt");

if (!fs.existsSync(jar)) {
  console.warn(
    JSON.stringify({ success: false, error: "Unable to find the JAR" })
  );
  process.exit(0);
}

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
    if (200 === res.statusCode) {
      let writestream = fs.createWriteStream(jar);
      res.pipe(writestream);
      fs.writeFile(
        etagFile,
        res.headers.etag,
        err =>
          err
            ? console.error(err)
            : console.log(
                JSON.stringify({
                  success: true,
                  statusCode: res.statusCode,
                })
              )
      );
    } else {
      console.log(
        JSON.stringify({
          success: false,
          statusCode: res.statusCode,
        })
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
