/**
 * This file checks the presence of dependencies. It is written using only ES5
 * to make sure it can run on older Node / io.js version.
 */

var exec = require("child_process").exec;

var version = process.version;
var isWin =
  process &&
  (process.platform === "win32" || /^(msys|cygwin)$/.test(process.env.OSTYPE));

var missingDep = "MissingDependencyWarning";

function checkProgramInPath(bin, callback) {
  var command = isWin
    ? "powershell" +
      "-NoProfile -InputFormat None -ExecutionPolicy Bypass" +
      '-Command "Get-Command ' +
      bin +
      '.exe"'
    : "command -v " + bin + " >/dev/null 2>&1 || { exit 1; }";

  exec(command, function(err) {
    callback(err === null);
  });
}

if (module.parent) {
  module.exports = checkProgramInPath;
} else {
  if (version < "v10.0.0" && version < "v8.5.0" && version < "v8.10.0") {
    process.emitWarning(
      "Node v8.5.0 or later version is required! You are using Node '" +
        version +
        "', you should not except Schwifty to work as intended.",
      missingDep
    );
  }

  if (!process.env.SCHWIFTY_DISABLE_JAVA) {
    checkProgramInPath("java", function(result) {
      if (!result) {
        process.emitWarning(
          "Java is required for plantuml diagram rendering" +
            "(Set environment variable `SCHWIFTY_DISABLE_JAVA`" +
            "at true to disable this warning)",
          missingDep
        );
      }
    });
  }
}
