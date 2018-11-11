/**
 * Polyfill for sessionStorage object
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Storage
 */

let exportedStorage;

if (typeof window !== "undefined" && "sessionStorage" in window) {
  exportedStorage = window["sessionStorage"];
} else {
  exportedStorage = new class Storage {
    constructor() {
      this.__data = new Map();
    }

    get length() {
      return this.__data.size;
    }
    clear() {
      this.__data.clear();
    }
    getItem(key) {
      return this.__data.get(key) || null;
    }
    key(i) {
      // not perfect, but works
      var ctr = 0;
      for (const k of this.__data.keys()) {
        if (ctr === i) return k;
        else ctr++;
      }
      return null;
    }
    removeItem(key) {
      this.__data.delete(key);
    }
    setItem(key, value) {
      this.__data.set(key, value + ""); // forces the value to a string
    }
  }();
}

export default exportedStorage;
