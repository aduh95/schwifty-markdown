const init = () =>
  document.createElement("link").relList.supports("preload") &&
  document.getElementById("fallback-message").remove();

if (window.document.readyState === "loading") {
  window.document.addEventListener("DOMContentLoaded", init);
} else {
  init.apply(window.document);
}
