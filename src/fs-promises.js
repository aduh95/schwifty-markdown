// Some function of the core fs module are needed
const { constants, watch, createReadStream } = require("fs");

try {
  if (!("finally" in Promise.prototype)) {
    // Node-Chakracore embeds fs/promises but crashes depending of Promise.finally support
    throw new Error();
  }
  module.exports = require("fs/promises");
} catch (e) {
  // Polyfill for Node.js not supporting fs/promises
  const fs = require("fs");
  const { promisify } = require("util");

  // Methods available in fs/promises as of Node 10
  const promisedMethods = [
    "access",
    "copyFile",
    "open",
    "read",
    "write",
    "rename",
    "truncate",
    "ftruncate",
    "rmdir",
    "fdatasync",
    "fsync",
    "mkdir",
    "readdir",
    "readlink",
    "symlink",
    "fstat",
    "lstat",
    "stat",
    "link",
    "unlink",
    "fchmod",
    "chmod",
    // "lchmod", // Not promisifiable
    // "lchown", // Not promisifiable
    "fchown",
    "chown",
    "utimes",
    "futimes",
    "realpath",
    "mkdtemp",
    "writeFile",
    "appendFile",
    "readFile",
  ];

  console.error(
    "Warning",
    "The fs/promises API is not supported by this version of Node"
  );

  module.exports = promisedMethods.reduce((fsPromises, methodName) => {
    fsPromises[methodName] = promisify(fs[methodName]);
    return fsPromises;
  }, {});
}

module.exports.constants = constants;
module.exports.watch = watch;
module.exports.createReadStream = createReadStream;
