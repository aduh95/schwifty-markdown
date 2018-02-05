/**
 * Use fetch API to handle local links to avoid losing the
 * current socket connection
 */

const getLocalLinks = () => document.querySelectorAll("a[href^='/md/']");

const init = () => {
  for (let link of getLocalLinks()) {
    link.addEventListener("click", async ev => {
      ev.preventDefault();

      try {
        let response = await fetch(ev.target.href);

        if (response.status === 202) {
          const currentFilePath = document.documentElement.dataset.path;
          const stateObjFirst = { index: currentFilePath };
          const stateObjSecond = {};
          history.replaceState(
            stateObjFirst,
            document.head.querySelector("title").textContent,
            currentFilePath
          );

          stateObjSecond[currentFilePath] = "index";
          history.pushState(
            stateObjSecond,
            document.head.querySelector("title").textContent + " schwifty",
            "/"
          );
          ev.target.style.cursor = "wait";
        } else {
          ev.target.style.cursor = "not-allowed";
          ev.target.style.color = "red";
          ev.target.title = await response.text();
        }
      } catch (err) {
        console.error(err);
        alert("Unable to communicate with Schwifty Markdown");
      }
    });
  }
};

if (window.document.readyState === "loading") {
  window.document.addEventListener("DOMContentLoaded", init);
} else {
  init.apply(window.document);
}
