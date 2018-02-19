let promiseResolver;
const promise = new Promise(resolve => (promiseResolver = resolve));

const promises = [];

const init = function() {
  const pictures = document.querySelectorAll("noscript.img");

  for (let noscript of pictures) {
    let picture = document.createElement("picture");

    picture.innerHTML = noscript.textContent;
    noscript.parentNode.insertBefore(picture, noscript);
    promises.push(
      new Promise(resolve => {
        let img = picture.querySelector("img");
        if (img) {
          img.onload = function() {
            resolve(this);
          };
          img.onerror = function(e) {
            console.warn(e);
            resolve(this);
          };
        }
      })
    );
    noscript.remove();
  }

  promiseResolver(promises);
};

if (window.document.readyState === "loading") {
  window.document.addEventListener("DOMContentLoaded", init);
} else {
  init.apply(window.document);
}

export default promise;
