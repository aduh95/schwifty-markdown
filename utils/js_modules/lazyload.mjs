const imageHandlers = [];

/**
 * @param {(string)=>boolean} filter  The function used to filter image when giving a source in argument
 * @param {(HTMLImageElement)=>Promise<>} callback The handler
 */
export const registerImageHandler = (filter, callback) => {
  imageHandlers.push({ filter, callback });
};

const init = promiseResolver =>
  function() {
    const promises = [];
    const pictures = document.querySelectorAll("noscript.img");

    for (const noscript of pictures) {
      const picture = document.createElement("picture");

      picture.innerHTML = noscript.textContent;
      noscript.parentNode.replaceChild(picture, noscript);

      const img = picture.querySelector("img");

      const handlers = imageHandlers.filter(({ filter }) => filter(img.src));

      if (handlers.length) {
        promises.push(...handlers.map(({ callback }) => callback(img)));
      } else {
        // Load classic image
        promises.push(
          new Promise(resolve => {
            img.onload = function() {
              resolve(this);
            };
            img.onerror = function(e) {
              console.warn(e);
              resolve(this);
            };
          })
        );
      }
    }

    promiseResolver(promises);
  };

export default new Promise(resolve => {
  if (window.document.readyState === "loading") {
    window.document.addEventListener("DOMContentLoaded", init(resolve));
  } else {
    // Wait for image handler registration
    window.requestAnimationFrame(() =>
      window.requestAnimationFrame(init(resolve))
    );
  }
});
