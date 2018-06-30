import path from "path";
import fs from "./fs-promises";

import md2html from "./md2html";
import { MARKDOWN_EXTENSION } from "./definitions.mjs";

/**
 * Generates a watcher callback for a given file.
 *
 * When a markdown file is modified / accessed, it must
 * be parsed to be rendered.
 *
 * @param {string} file The path of the file watched
 */
const fileWatcher = file => evType => {
  fs.access(file, fs.constants.R_OK).then(() => md2html(file));
};

/**
 * Generates a watcher callback for a given directory.
 *
 * When a new file is created in a watched directory,
 * this new file must be watched as well.
 *
 * @param {string} dir The path of the dir
 */
const dirWatcher = dir => (eventType, filename = "") => {
  // @see https://nodejs.org/docs/latest/api/fs.html#fs_fs_watch_filename_options_listener
  // Note that on most platforms, 'rename' is emitted whenever a filename appears or disappears in the directory.
  if (
    eventType === "rename" &&
    filename.toLowerCase().endsWith(MARKDOWN_EXTENSION)
  ) {
    const file = path.join(dir, filename);
    fs.access(file, fs.constants.R_OK).then(() =>
      fs.watch(file, fileWatcher(file))
    );
  }
};

/** @var {number} watchCounter The total number of files being watched */
export let watchCounter = 0;

/**
 * Sets a watcher on a given file or directory.
 * @param {string} file The path of the file / folder to watch
 * @returns {Promise<number> | Promise<any>}
 */
const watchFile = file =>
  fs
    .stat(file)
    .then(stat => {
      if (stat.isDirectory()) {
        return watchDirRecursive(file);
      } else if (file.toLowerCase().endsWith(MARKDOWN_EXTENSION)) {
        fs.watch(file, fileWatcher(file));
        return Promise.resolve(++watchCounter);
      }
    })
    .catch(err => console.warn(err));

/**
 * Watch a md files and all sub-directories in a given directory.
 * @param {string} dir The path of the directory to watch
 * @returns {Promise<any[]>}
 */
const watchDirRecursive = dir => {
  fs.watch(dir, { persistent: true, recursive: false }, dirWatcher(dir));

  return fs
    .readdir(dir)
    .then(files =>
      Promise.all(
        files
          .filter(file => !file.startsWith("."))
          .map(file => watchFile(path.join(dir, file)))
      )
    );
};

export default watchFile;
