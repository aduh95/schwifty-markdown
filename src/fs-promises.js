// Some function of the core fs module are needed
const fs = require("fs");
const { constants, watch, createReadStream } = fs;

if ("finally" in Promise.prototype && "promises" in fs) {
  // Node-Chakracore embeds fs.promises but crashes depending of Promise.finally support

  module.exports = fs.promises;
} else {
  // Polyfill for Node.js not supporting fs.promises
  const { promisify } = require("util");

  // Methods available in fs.promises as of Node 10
  const promisedMethods = [
    "access",
    "copyFile",
    "open",
    "rename",
    "truncate",
    "rmdir",
    "mkdir",
    "readdir",
    "readlink",
    "symlink",
    "lstat",
    "stat",
    "link",
    "unlink",
    "chmod",
    // "lchmod", // Deprecated => Not polyfilled
    // "lchown", // Deprecated => Not polyfilled
    "chown",
    "utimes",
    "realpath",
    "mkdtemp",
    "writeFile",
    "appendFile",
    "readFile",
  ];

  process.emitWarning(
    "The fs.promises API is not supported by this version of Node"
  );

  module.exports = promisedMethods.reduce((fsPromises, methodName) => {
    fsPromises[methodName] = promisify(fs[methodName]);
    return fsPromises;
  }, {});
}

module.exports.constants = constants;
module.exports.watch = watch;
module.exports.createReadStream = createReadStream;
