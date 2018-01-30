import fs from "fs-extra";
import path from "path";

import yaml from "js-yaml";
import marked from "marked";

export default buffer =>
  new Promise((resolve, reject) => {
    let headers = {};

    marked(
      buffer.toString("utf8").replace(/^---\n((.+\n)+)---/, function(m, data) {
        try {
          headers = yaml.safeLoad(data);
        } catch (e) {
          console.warn(e.toString());
        }
        return "";
      }),
      (err, result) => {
        if (err) reject(err);
        else {
          resolve({ headers, html: result });
        }
      }
    );
  });
