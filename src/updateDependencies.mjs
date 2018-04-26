import http from "https";
import path from "path";
import fs from "./fs-promises";

const HOST = "netcologne.dl.sourceforge.net";

let nodeVendorDir = path.join(path.resolve("."), "node_modules");
if (!fs.existsSync(nodeVendorDir)) {
  nodeVendorDir = path.resolve("..");
}

const resolveModuleDir = moduleName => {
  let nodeModuleDir = nodeVendorDir;
  let distDir;
  do {
    if (nodeModuleDir === path.resolve("/")) {
      throw new Error(`Module '${moduleName}' not found`);
    }
    distDir = path.join(nodeModuleDir, moduleName);
    nodeModuleDir = path.resolve(nodeModuleDir + path.sep + "..");
  } while (!fs.existsSync(distDir));

  return distDir;
};

const copyPapaDistFiles = async () => {
  const fileName = "papaparse.min.js";
  const localVendorDir = path.join(path.resolve("."), "utils", "js_scripts");
  const distDir = resolveModuleDir("papaparse");

  if (!fs.existsSync(localVendorDir)) {
    await fs.mkdir(localVendorDir);
  }

  return await fs.copyFile(
    path.join(distDir, fileName),
    path.join(localVendorDir, fileName)
  );
};

const getPlantumlLastVersion = (jar, etagFile, etag) => {
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
      let writeStream = fs.createWriteStream(jar);
      res.pipe(writeStream);
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
  let vendorDir = path.join(resolveModuleDir("node-plantuml"), "vendor");

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
      (err, etag) =>
        err ? console.error(err) : getPlantumlLastVersion(jar, etagFile, etag)
    );
  } else {
    getPlantumlLastVersion(jar, etagFile);
  }
};

copyPapaDistFiles()
  .then(checkPlantumlVersion)
  .catch(err =>
    console.log(
      `{"success":false, "statusCode":500, "message":"${err.message}"}`
    )
  );
