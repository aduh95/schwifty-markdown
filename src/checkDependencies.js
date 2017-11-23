var process = require("process");
var exec = require("child_process").exec;

var version = process.version;
var isWin = process.platform === "win32";

var missingDep = "MISSING DEPENDENCY:";
var checkProgramInPath = function(bin) {
  return isWin
    ? 'powershell -NoProfile -InputFormat None -ExecutionPolicy Bypass -Command "Get-Command ' +
        bin +
        '.exe"'
    : "command -v " + bin + " >/dev/null 2>&1 || { exit 1; }";
};

if (version < "v8.5.0") {
  console.error(missingDep, "Node v8.5.0 or later version is required!");
  process.exit(1);
}

if (process.env.JAVA_ENABLED) {
  exec(checkProgramInPath("java"), function(err, stdout, stderr) {
    if (err !== null) {
      console.warn(
        missingDep,
        "Warning, Java is required for plantuml diagram rendering (use --no-java to disable this warning)"
      );
    }
  });
}
