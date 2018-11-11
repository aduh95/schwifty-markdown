import fs from "./fs-promises";
import sessionStorage from "./session-storage";
import md2html from "md2html";

import { refreshBrowser } from "./server";

const HTML_RENDERED_STORAGE_KEY = "md2html:html";
export const getRenderedHTML = html =>
  sessionStorage.getItem(HTML_RENDERED_STORAGE_KEY, html);

/**
 * @param {string} file File path
 * @returns {Promise<>} Fulfills when the HTML document is written to FS and a
 *                      refresh message has been sent
 */
export default file =>
  fs
    .readFile(file)
    .then(md => md2html(md, file))
    .then(html => sessionStorage.setItem(HTML_RENDERED_STORAGE_KEY, html))
    .then(refreshBrowser)
    .catch(err => console.error(err));
