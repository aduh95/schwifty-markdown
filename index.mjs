import addWatcher, { watchCounter } from "./src/mdWatcher.mjs";
import renderFile, { serveMarkdown } from "./src/md-file-to-html.mjs";
import _md2html from "./src/md2html.mjs";

/**
 * Entry point of the package.
 * @param {string} target The file or directory to watch and render
 * @returns {Promise<number | boolean>} 0 if no files are being watched, false if there are several files being watched and true if a file had been rendered
 */
const schwifty = async target => {
  let watcher = await addWatcher(target);

  console.log(
    "Schwifty: " +
      watchCounter +
      " markdown file" +
      (watchCounter === 1 ? " is" : "s are") +
      " being watched."
  );

  return watchCounter && watcher === watchCounter && (await renderFile(target));
};

export { serveMarkdown };

export const md2html = _md2html;

export default schwifty;
