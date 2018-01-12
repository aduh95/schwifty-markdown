// Fallback script for browsers that don't support ES modules
document.addEventListener("DOMContentLoaded", function() {
  try {
    var masks = this.querySelectorAll("picture>.MASK_IMG");
    var i = masks.length;
    while (i) masks.item(--i).remove();
  } catch (e) {
    // This error will be thrown only by browser that don't
    // support picture element, it can be silently ignored
  }
});
