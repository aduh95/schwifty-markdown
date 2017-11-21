let promiseResolver;
const promise = new Promise(resolve => (promiseResolver = resolve));

const promises = [];

addEventListener("load", function() {
  const pictures = document.querySelectorAll("figure>noscript");

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
  }

  promiseResolver(promises);
});

export default promise;
