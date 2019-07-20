const HASH_ALGORITHM = "sha1";
const HASH_OUTPUT = "hex";

const hashReadStream = (hash, input) =>
  new Promise((resolve, reject) => {
    input.on("error", err => reject(err));
    input.on("data", data => hash.update(data));
    input.on("end", () => {
      resolve(hash.digest(HASH_OUTPUT));
    });
  });

export default fileOrString =>
  Promise.all([import("./fs-promises.js"), import("crypto")])
    .then(_ => _.map(module => module.default))
    .then(([fs, { createHash }]) => [fs, createHash(HASH_ALGORITHM)])
    .then(([fs, hash]) =>
      fs
        .access(fileOrString, fs.constants.R_OK)
        .then(() => hashReadStream(hash, fs.createReadStream(fileOrString)))
        .catch(() => {
          // Plain string handling
          hash.update(fileOrString);
          return hash.digest(HASH_OUTPUT);
        })
    );
