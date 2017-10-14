import fs from "fs-extra";
import path from "path";

import nodePandoc from "node-pandoc";

let pandoc = (src, args) =>
  new Promise((resolve, reject) => {
    nodePandoc(src, args, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });

export default (src, output) =>
  pandoc(src, "-f markdown -o " + output)
    .then(res => console.log(output + " written."))
    .catch(err => console.error(err));
