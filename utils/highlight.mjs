const worker = new Worker("/worker.js");

addEventListener("load", function() {
  const codes = document.querySelectorAll(".sourceCode>code");
  const style = document.createElement("link");
  style.rel = "stylesheet";
  style.href =
    "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.12.0/styles/atom-one-light.min.css";

  awaitHighlight(codes, 0);
  document.head.appendChild(style);
});

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
