export default buffer =>
  import("marked")
    .then(module => module.default)
    .then(
      marked =>
        new Promise((resolve, reject) => {
          let headers = Promise.resolve({});

          marked(
            buffer
              .toString("utf8")
              .replace(/^---\r?\n((.*\r?\n)+?)---/, function(m, data) {
                headers = import("js-yaml")
                  .then(module => module.default.safeLoad(data))
                  .catch(err => {
                    console.warn("Warning, YAML metadata parsing failed", err);
                    return {};
                  });
                return "";
              }),
            (err, html) => {
              if (err) {
                reject(err);
              } else {
                headers.then(headers => resolve({ headers, html }));
              }
            }
          );
        })
    );
