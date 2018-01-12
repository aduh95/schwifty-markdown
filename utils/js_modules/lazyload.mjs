let promiseResolver;
const promise = new Promise(resolve => (promiseResolver = resolve));

const promises = [];

addEventListener("load", function() {
  const pictures = document.querySelectorAll("picture");

  for (let picture of pictures) {
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
    picture.querySelector(".MASK_IMG").remove();
  }

  promiseResolver(promises);
});

export default promise;
