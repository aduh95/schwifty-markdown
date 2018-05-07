const diagramTypes = [
  {
    name: "yUML",
    code: "lang-yuml",
    url: "/yuml/",
  },
  {
    name: "PlantUML",
    code: "lang-plantuml",
    url: "/pu/",
  },
];
const init = () => {
  for (const diagramType of diagramTypes) {
    const codes = document.querySelectorAll(
      ".sourceCode>code." + diagramType.code
    );
    for (const code of codes) {
      const details = document.createElement("details");
      const summary = document.createElement("summary");
      const img = document.createElement("img");
      img.src = diagramType.url + encodeURIComponent(code.textContent);
      img.alt = diagramType.name + " diagram";

      summary.appendChild(img);

      code.parentNode.parentNode.insertBefore(details, code.parentNode);
      details.appendChild(summary);
      details.appendChild(code.parentNode);
    }
  }
};

if (window.document.readyState === "loading") {
  window.document.addEventListener("DOMContentLoaded", init);
} else {
  init.apply(window.document);
}
