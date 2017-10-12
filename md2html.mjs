import fs from "fs-extra";
import path from "path";

import nodePandoc from "node-pandoc";

const HTML_HEADER =
  '<html><head><title>Markdown Output</title><link rel="stylesheet" href="https://sindresorhus.com/github-markdown-css/github-markdown.css"></head><body><main class="markdown-body">';
const HTML_FOOTER = "</main></body></html>";

let pandoc = (src, args) =>
  new Promise((resolve, reject) => {
    nodePandoc(src, args, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });

export default (src, output) =>
  pandoc(src, "-f markdown -o " + output)
    // .then(() => fs.readFile(output))
    // .then(buffer =>
    //   fs.writeFile(output, HTML_HEADER + buffer.toString("utf8") + HTML_FOOTER)
    // )
    .then(res => console.log(output + " written."))
    .catch(err => console.error(err));
