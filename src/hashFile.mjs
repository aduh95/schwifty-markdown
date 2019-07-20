import fs from "./fs-promises.js";

const HASH_ALGORITHM = "sha1";
const HASH_OUTPUT = "hex";

const hashExistingFile = (hash, path) =>
  new Promise((resolve, reject) => {
    const input = fs.createReadStream(path);

    input.on("error", err => reject(err));
    input.on("data", data => hash.update(data));
    input.on("end", () => {
      resolve(hash.digest(HASH_OUTPUT));
    });
  });

export default fileOrString =>
  import("crypto")
    .then(module => module.default)
    .then(({ createHash }) => createHash(HASH_ALGORITHM))
    .then(hash =>
      fs
        .access(fileOrString, fs.constants.R_OK)
        .then(hashExistingFile(hash, fileOrString))
        .catch(() => {
          // Plain string handling
          hash.update(fileOrString);
          return hash.digest(HASH_OUTPUT);
        })
    );
