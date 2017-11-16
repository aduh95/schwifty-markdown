module.exports = require("yargs")
  .number("p")
  .alias("p", "port")
  .default("p", 3000)
  .boolean("n")
  .alias("n", "no-browser")
  .describe(
    "n",
    "Schwifty will not try to start a browser even if does not detect any open"
  )
  .string("b")
  .alias("b", "browser")
  .describe(
    "b",
    "The browser that will automatically open if none is detected (defaults to your default browser)"
  )
  .help("h")
  .alias("h", "help");
