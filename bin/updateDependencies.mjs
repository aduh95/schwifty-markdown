import http from "https";
import path from "path";
import fsSync from "fs";

const HOST = "netcologne.dl.sourceforge.net";

let nodeVendorDir = path.join(path.resolve("."), "node_modules");
if (!fsSync.existsSync(nodeVendorDir)) {
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
  } while (!fsSync.existsSync(distDir));

  return distDir;
};

const copyPapaDistFiles = () =>
  new Promise((resolve, reject) => {
    const fileName = "papaparse.min.js";
    const localVendorDir = path.join(path.resolve("."), "utils", "js_scripts");
    const distDir = resolveModuleDir("papaparse");

    if (!fsSync.existsSync(localVendorDir)) {
      fsSync.mkdirSync(localVendorDir);
    }

    return fsSync.copyFile(
      path.join(distDir, fileName),
      path.join(localVendorDir, fileName),
      err => (err ? reject() : resolve())
    );
  });

const getPlantumlLastVersion = (jar, etagFile, etag) => {
  const distantJar = {
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
      const writeStream = fsSync.createWriteStream(jar);
      res.pipe(writeStream);
      fsSync.writeFile(
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
  const vendorDir = path.join(resolveModuleDir("node-plantuml"), "vendor");

  const jar = path.join(vendorDir, "plantuml.jar");
  const etagFile = path.join(vendorDir, "etag.txt");

  if (!fsSync.existsSync(jar)) {
    console.warn(
      JSON.stringify({ success: false, error: "Unable to find the JAR" })
    );
    process.exit(0);
  }

  if (fsSync.existsSync(etagFile)) {
    fsSync.readFile(
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
