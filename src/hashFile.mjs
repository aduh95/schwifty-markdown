import fs from "./fs-promises";
import crypto from "crypto";

export default fileOrString =>
  new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha1");

    fs.access(fileOrString, fs.constants.R_OK)
      .then(() => {
        const input = fs.createReadStream(fileOrString);

        input.on("error", err => reject(err));
        input.on("data", data => hash.update(data));
        input.on("end", () => {
          resolve(hash.digest("hex"));
        });
      })
      .catch(() => {
        // Plain string handling
        hash.update(fileOrString);
        resolve(hash.digest("hex"));
      });
  });
