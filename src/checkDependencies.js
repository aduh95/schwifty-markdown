var process = require("process");
var exec = require("child_process").exec;

var version = process.version;
var isWin = process.platform === "win32";

var missingDep = "MISSING DEPENDENCY: ";
var checkProgramInPath = function(bin) {
  return isWin
    ? 'powershell -NoProfile -InputFormat None -ExecutionPolicy Bypass -Command "Get-Command ' +
        bin +
        '.exe"'
    : "command -v " + bin + " >/dev/null 2>&1 || { exit 1; }";
};

if (
  version.charAt(1) < 8 ||
  (version.charAt(1) == 8 && version.charAt(3) < 5)
) {
  console.error(missingDep, "Node v8.5.0 or later version is required!");
  process.exit(1);
}

exec(checkProgramInPath("pandoc"), function(err, stdout, stderr) {
  if (err !== null) {
    console.error(missingDep, "Pandoc is required");
    process.exit(1);
  }
});
exec(checkProgramInPath("java"), function(err, stdout, stderr) {
  if (err !== null) {
    console.warn(
      missingDep,
      "Warning, Java is required for plantuml diagram rendering"
    );
  }
});
