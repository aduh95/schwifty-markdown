const worker = new Worker("/worker.js");

const preloadCSS = href => {
  let style = document.createElement("link");

  style.rel = "preload";
  style.setAttribute("as", "style");
  style.setAttribute("type", "text/css");
  style.href = href;
  style.onload = function() {
    this.rel = "stylesheet";
  };

  document.head.appendChild(style);
};
const initHighlight = function() {
  const codes = document.querySelectorAll(".sourceCode>code");
  if (codes.length) {
    awaitHighlight(codes, 0);
    preloadCSS(
      "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.12.0/styles/atom-one-light.min.css"
    );
  }
};
const init = initHighlight;

const awaitHighlight = (codes, index) => {
  let code = codes.item(index);

  if (code) {
    worker.onmessage = function(event) {
      code.innerHTML = event.data;
      awaitHighlight(codes, index + 1);
    };
    worker.postMessage([code.className.substr(5), code.textContent]);
  } else {
    worker.postMessage("Terminate worker");
    worker.terminate();
  }
};

if (window.document.readyState === "loading") {
  window.document.addEventListener("DOMContentLoaded", init);
} else {
  init.apply(window.document);
}
