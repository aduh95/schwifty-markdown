import http from "https";
import path from "path";
import fs from "fs-extra";

const HOST = "netcologne.dl.sourceforge.net";

let nodeVendorDir = path.join(path.resolve("."), "node_modules");
if (!fs.existsSync(nodeVendorDir)) {
  nodeVendorDir = path.resolve("..");
}

const copyPapaDistFiles = async () => {
  const fileName = "papaparse.min.js";
  const localVendorDir = path.join(path.resolve("."), "utils");
  let distDir = path.join(nodeVendorDir, "papaparse");

  if (!fs.existsSync(localVendorDir)) {
    await fs.mkdir(localVendorDir);
  }

  return await fs.copyFile(
    path.join(distDir, fileName),
    path.join(localVendorDir, fileName)
  );
};

const getPlantumlLastVersion = etag => {
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

const checkPlantumlVersion = () => {
  let vendorDir = path.join(nodeVendorDir, "node-plantuml", "vendor");

  let jar = path.join(vendorDir, "plantuml.jar");
  let etagFile = path.join(vendorDir, "etag.txt");

  if (!fs.existsSync(jar)) {
    console.warn(
      JSON.stringify({ success: false, error: "Unable to find the JAR" })
    );
    process.exit(0);
  }

  if (fs.existsSync(etagFile)) {
    fs.readFile(
      etagFile,
      (err, etag) => (err ? console.error(err) : getPlantumlLastVersion(etag))
    );
  } else {
    getPlantumlLastVersion();
  }
};

copyPapaDistFiles().then(checkPlantumlVersion);
