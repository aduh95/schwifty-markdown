// Fallback script for browsers that don't support ES modules
document.addEventListener("DOMContentLoaded", function() {
  try {
    var masks = this.querySelectorAll("noscript.img");
    var picture;
    var mask;
    var i = masks.length;
    while (i) {
      picture = this.createElement("picture");
      mask = masks.item(--i);

      picture.innerHTML = mask.textContent;
      mask.parentNode.insertBefore(picture, mask);
      mask.remove();
    }
  } catch (e) {
    // This error will be thrown only by browser that don't
    // support picture element, it can be silently ignored
  }
});
