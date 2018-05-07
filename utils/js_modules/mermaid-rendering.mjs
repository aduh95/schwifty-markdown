import { registerImageHandler } from "./lazyload.mjs";

const CDN_ENTRY_POINT =
  "https://unpkg.com/mermaid@8.0.0-rc.8/dist/mermaid.min.js";
const MERMAID_CODE_CLASS = "lang-mermaid";

let generatedID = 0;
let importPromise;

const renderDiagram = diagram => {
  if (!importPromise) {
    importPromise = import(CDN_ENTRY_POINT).then(() => window.mermaid);
  }
  return importPromise.then(
    mermaidAPI =>
      new Promise((resolve, reject) => {
        mermaidAPI.render(
          "mermaid-generation-" + generatedID++,
          diagram,
          svgText => resolve(svgText)
        );
      })
  );
};

const init = () => {
  const codes = document.querySelectorAll(
    ".sourceCode>code." + MERMAID_CODE_CLASS
  );

  if (codes.length) {
    for (const code of codes) {
      renderDiagram(code.textContent).then(svgText => {
        const details = document.createElement("details");
        const summary = document.createElement("summary");

        summary.innerHTML = svgText;

        code.parentNode.parentNode.insertBefore(details, code.parentNode);
        details.appendChild(summary);
        details.appendChild(code.parentNode);
      });
    }
  }
};

registerImageHandler(
  src => src.startsWith("data:text/mermaid"),
  img =>
    fetch(img.src)
      .then(response => response.text())
      .then(renderDiagram)
      .then(svgText => {
        img.parentNode.innerHTML = svgText;
      })
);

if (window.document.readyState === "loading") {
  window.document.addEventListener("DOMContentLoaded", init);
} else {
  init.apply(window.document);
}
