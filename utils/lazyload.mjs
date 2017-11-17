addEventListener("load", function() {
  const pictures = document.querySelectorAll("figure>noscript");

  for (let noscript of pictures) {
    let picture = document.createElement("picture");

    picture.innerHTML = noscript.textContent;
    noscript.parentNode.insertBefore(picture, noscript);
  }
});
