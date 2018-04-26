/**
 * Use fetch API to handle local links to avoid losing the
 * current socket connection
 */

const getLocalLinks = () => document.querySelectorAll("a[href^='/md/']");
const getTransformedLinks = () =>
  document.querySelectorAll("a[data-original-href]");

const loadOtherDocument = async path => {
  try {
    const response = await fetch(path);

    if (response.ok) {
      document.body.style.cursor = "wait";
      document.body.hidden = true;
      return true;
    } else {
      return await response.text();
    }
  } catch (err) {
    console.error(err);
    alert("Unable to communicate with Schwifty Markdown");
  }
};

/**
 * Hides relative links to avoid non working links in PDF.
 */
const transformLinksForPDF = () => {
  for (const link of getTransformedLinks()) {
    const span = document.createElement("span");
    [...link.childNodes].forEach(node => span.appendChild(node));
    link.hidden = true;
    link.parentNode.insertBefore(span, link);
  }
};

/**
 * Recreates links after printing.
 */
const transformLinksBack = () => {
  for (const link of getTransformedLinks()) {
    [...link.previousElementSibling.childNodes].forEach(node =>
      link.appendChild(node)
    );
    link.previousElementSibling.remove();
    link.hidden = false;
  }
};

const init = () => {
  window.matchMedia("print").addListener(query => {
    query.matches ? transformLinksForPDF() : transformLinksBack();
  });

  for (const link of getLocalLinks()) {
    link.addEventListener("click", async ev => {
      ev.preventDefault();
      const loadResult = await loadOtherDocument(ev.currentTarget.href);

      if (loadResult === true) {
        const currentFilePath = document.documentElement.dataset.path;
        const savedState = { index: currentFilePath };
        const currentState = {};

        history.replaceState(
          savedState,
          document.head.querySelector("title").textContent,
          currentFilePath
        );

        currentState[currentFilePath] = "index";
        history.pushState(
          currentState,
          document.head.querySelector("title").textContent + " schwifty",
          "/"
        );
      } else {
        ev.target.style.cursor = "not-allowed";
        ev.target.style.color = "red";
        ev.target.title = loadResult;
      }
    });
  }
};

window.addEventListener("popstate", ev => loadOtherDocument(ev.state.index));

if (window.document.readyState === "loading") {
  window.document.addEventListener("DOMContentLoaded", init);
} else {
  init.apply(window.document);
}
