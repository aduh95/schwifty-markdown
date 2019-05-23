module.exports = require("yargs")
  .parserConfiguration({
    configuration: {
      "boolean-negation": false,
    },
  })
  .number("p")
  .alias("p", "port")
  .default("p", 3000)
  .string("o")
  .alias("o", "output")
  .describe(
    "o",
    "Schwifty will try to generate a PDF file instead of launching a preview"
  )
  .boolean("n")
  .alias("n", "no-browser")
  .describe(
    "n",
    "Schwifty will not try to start a browser even if does not detect any open"
  )
  .boolean("j")
  .alias("j", "no-java")
  .default("j", false)
  .describe("j", "Disable all java-dependent features (PlantUML rendering)")
  .string("c")
  .alias("c", "plantuml-config")
  .describe("c", "A config file for plantuml rendering")
  .string("b")
  .alias("b", "browser")
  .describe(
    "b",
    "The browser that will automatically open if none is detected (defaults to your default browser)"
  )
  .help("h")
  .alias("h", "help");
