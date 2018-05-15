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

/**
 * @type {Set<HTMLElement>}
 */
const createdDetailsElement = new Set();

const addPreviews = () => {
  for (const diagramType of diagramTypes) {
    const codes = document.querySelectorAll(
      ".sourceCode>code." + diagramType.code
    );
    for (const code of codes) {
      const details = document.createElement("details");
      const summary = document.createElement("summary");

      details.addEventListener(
        "toggle",
        () => {
          const img = document.createElement("img");
          const loadingText = document.createTextNode("Loading preview...");

          details.appendChild(loadingText);
          img.alt = diagramType.name + " diagram";
          img.src = diagramType.url + encodeURIComponent(code.textContent);
          img.onload = () => {
            details.replaceChild(img, loadingText);
          };
        },
        { once: true }
      );

      summary.innerHTML = "<small><i>(click to preview)</i></small>";

      details.appendChild(summary);

      code.parentNode.parentNode.insertBefore(details, code.parentNode);
      createdDetailsElement.add(details);

      summary.appendChild(code.parentNode);
    }
  }
};
const removePreviews = () => {
  for (const details of createdDetailsElement) {
    details.parentNode.replaceChild(details.firstChild.lastChild, details);
    createdDetailsElement.delete(details);
  }
};

const togglePreviews = mediaQueryList =>
  mediaQueryList.matches ? removePreviews() : addPreviews();

const init = () => {
  const mql = window.matchMedia("print");

  if ("HTMLDetailsElement" in window) {
    mql.addListener(togglePreviews);
    togglePreviews(mql);
  }
};

if (window.document.readyState === "loading") {
  window.document.addEventListener("DOMContentLoaded", init);
} else {
  init.apply(window.document);
}
