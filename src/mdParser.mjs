import yaml from "js-yaml";
import marked from "marked";

export default buffer =>
  new Promise((resolve, reject) => {
    const headers = {};

    marked(
      buffer
        .toString("utf8")
        .replace(/^---\r?\n((.*\r?\n)+?)---/, function(m, data) {
          try {
            Object.assign(headers, yaml.safeLoad(data));
          } catch (err) {
            console.warn("Warning, YAML metadata parsing failed!", err);
          }
          return "";
        }),
      (err, html) => {
        if (err) {
          reject(err);
        } else {
          resolve({ headers, html });
        }
      }
    );
  });
