/**
 * Use fetch API to handle local links to avoid losing the
 * current socket connection
 */

const getLocalLinks = () => document.querySelectorAll("a[href^='/md/']");

const loadOtherDocument = async path => {
  try {
    let response = await fetch(path);

    if (response.status === 202) {
      document.body.style.cursor = "wait";
      return true;
    } else {
      return await response.text();
    }
  } catch (err) {
    console.error(err);
    alert("Unable to communicate with Schwifty Markdown");
  }
};

const init = () => {
  for (let link of getLocalLinks()) {
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
