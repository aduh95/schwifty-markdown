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
              .replace(/^---\r?\n((.*\r?\n)+?)---/, (_, data) => {
                headers = import("js-yaml")
                  .then(module => module.load(data))
                  .catch(err => {
                    console.warn(
                      "Schwifty: Warning, YAML metadata parsing failed.",
                      err
                    );
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
