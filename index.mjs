import { watchCounter } from "./src/mdWatcher";
import addWatcher from "./src/mdWatcher";
import renderFile from "./src/md-file-to-html";
import _md2html from "./src/md2html";

/**
 * Entry point of the package.
 * @param {string} target The file or directory to watch and render
 * @returns {Promise<number | boolean>} 0 if no files are being watched, false if there are several files being watched and true if a file had been rendered
 */
const schwifty = async target => {
  let watcher = await addWatcher(target);

  console.log(
    watchCounter +
      " markdown file" +
      (watchCounter === 1 ? " is" : "s are") +
      " being watched."
  );

  return watchCounter && watcher === watchCounter && (await renderFile(target));
};

export const md2html = _md2html;

export default schwifty;
