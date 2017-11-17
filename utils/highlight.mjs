const worker = new Worker("/worker.js");

const init = function() {
  const codes = document.querySelectorAll(".sourceCode>code");
  const style = document.createElement("link");
  style.rel = "preload";
  style.setAttribute("as", "style");
  style.setAttribute("type", "text/css");
  style.href =
    "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.12.0/styles/atom-one-light.min.css";
  style.onload = function() {
    this.rel = "stylesheet";
  };

  awaitHighlight(codes, 0);
  document.head.appendChild(style);
};

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
