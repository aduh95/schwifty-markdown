try {
  if (!("finally" in Promise.prototype)) throw new Error();
  module.exports = require("fs/promises");
} catch (e) {
  // Polyfill for Node.js not supporting fs/promises
  const fs = require("fs");
  const { promisify } = require("util");

  console.error(
    "Warning",
    "The fs/promises API is not supported by this version of Node"
  );

  module.exports = Object.keys(fs).reduce((fsPromises, methodName) => {
    if (!methodName.endsWith("Sync")) {
      try {
        fsPromises[methodName] = promisify(fs[methodName]);
      } catch (_) {
        // The method cannot be promisified
      }
    }
    return fsPromises;
  }, {});
}

module.exports.constants = require("fs").constants;
