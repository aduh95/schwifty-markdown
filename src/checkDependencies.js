/**
 * This file checks the presence of dependencies. It is written using only ES5
 * to make sure it can run on older Node / io.js version.
 */

var exec = require("child_process").exec;

var version = process.version;
var isWin = require("is-windows")();

var missingDep = "MissingDependencyWarning";
var checkProgramInPath = function(bin) {
  return isWin
    ? "powershell" +
        "-NoProfile -InputFormat None -ExecutionPolicy Bypass" +
        '-Command "Get-Command ' +
        bin +
        '.exe"'
    : "command -v " + bin + " >/dev/null 2>&1 || { exit 1; }";
};

if (version < "v10.0.0" && version < "v8.5.0" && version < "v8.10.0") {
  process.emitWarning(
    "Node v8.5.0 or later version is required! You are using Node '" +
      version +
      "', you should not except Schwifty to work as intended.",
    missingDep
  );
}

if (!process.env.SCHWIFTY_DISABLE_JAVA) {
  exec(checkProgramInPath("java"), function(err, stdout, stderr) {
    if (err !== null) {
      process.emitWarning(
        "Java is required for plantuml diagram rendering" +
          "(Set environment variable `SCHWIFTY_DISABLE_JAVA`" +
          "at true to disable this warning)",
        missingDep
      );
    }
  });
}
