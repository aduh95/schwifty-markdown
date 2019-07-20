import fs from "./fs-promises.js";

const HASH_ALGORITHM = "sha1";
const HASH_OUTPUT = "hex";

export default fileOrString =>
  import("crypto")
    .then(module => module.default)
    .then(({ createHash }) => createHash(HASH_ALGORITHM))
    .then(hash =>
      fs
        .access(fileOrString, fs.constants.R_OK)
        .then(() => {
          const input = fs.createReadStream(fileOrString);

          input.on("error", err => reject(err));
          input.on("data", data => hash.update(data));
          input.on("end", () => {
            resolve(hash.digest(HASH_OUTPUT));
          });
        })
        .catch(() => {
          // Plain string handling
          hash.update(fileOrString);
          resolve(hash.digest(HASH_OUTPUT));
        })
    );
