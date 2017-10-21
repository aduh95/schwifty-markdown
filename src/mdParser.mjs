import fs from "fs-extra";
import path from "path";

import marked from "marked";

export default buffer =>
  new Promise((resolve, reject) => {
    marked(buffer.toString("utf8"), (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
