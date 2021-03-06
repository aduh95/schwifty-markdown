import waitForLazyLoad from "./lazyload.mjs";

// The viewport height, updated at each resize
let viewPortHeight = window.innerHeight;

const RATIO_CSS_VAR = "--ratio";
const XIVMAP_MASK_CLASS = "xivmap-viewport";

// Animation frame called when scrolling
let updateViewportAnimationFrame = 0;

// Options object
const o = {};

// Prevent the render function from being called too often,
// such as during window resize operations.
let debouncedRender;

// Need a variable to keep track of timeouts when using autohide
let autohideScrollTimer = null;

// =======================================================
// Core functions
// =======================================================

const render = function() {
  viewPortHeight = window.innerHeight;

  updateDom();
  resizeViewport();
  updateViewport();
};

const refresh = function() {
  disableTransitions();
  requestAnimationFrame(render);

  // Using a timeout because otherwise the browser can condense these
  // statements into one operation (so adding and removing a class would
  // be the same as if it was never added in the first place).
  requestAnimationFrame(enableTransitions);
};

const attachListeners = function() {
  window.addEventListener("scroll", updateViewport, { passive: true });
  window.addEventListener("resize", debouncedRender);
  window.addEventListener("xivmap.render", debouncedRender);
  o.minimap.addEventListener("mousedown", beginDragTracking);

  if (o.autohide) {
    window.addEventListener("scroll", showMomentarily, { passive: true });
    o.minimap.addEventListener("mousemove", showMomentarily);
  }
};

const detachListeners = function() {
  window.removeEventListener("scroll", updateViewport);
  window.removeEventListener("resize", debouncedRender);
  o.minimap.removeEventListener("mousedown", beginDragTracking);
};

/**
 * Puts together the representation of each element
 * into the minimap element.
 */
const updateDom = function() {
  o.bodyWidth = document.querySelector("body>main").offsetWidth;
  const elements = o.context.querySelectorAll(o.selectors);
  const ratio = o.minimap.offsetWidth / o.bodyWidth;

  o.minimap.style.setProperty(RATIO_CSS_VAR, ratio);
  o.minimap.style.setProperty("--body-width", o.bodyWidth + "px");
  o.minimap.style.height = document.body.offsetHeight * ratio + "px";
  const viewport =
    '<div class="' + XIVMAP_MASK_CLASS + '" style="top:0"><div></div></div>';
  let html = "";
  for (const el of elements) {
    // Exclude fixed elements and invisible elements from the minimap
    if (
      !isElementFixed(el) &&
      isElementVisible(el, { opacity: o.renderNoOpacity })
    ) {
      if (o.accurateText && o.accurateTextTags.includes(el.tagName)) {
        html += makeAccurateRectangle(el, ratio);
      } else if (el.tagName.toUpperCase() === "IMG") {
        html += makeImageRectangle(el, ratio);
      } else if (el.tagName.toUpperCase() === "SVG") {
        html += makeSVGRectangle(el, ratio);
      } else {
        html += makeRectangle(el, ratio);
      }
    }
  }
  o.minimap.innerHTML = html + viewport;
};

/**
 * If the window's load event hasn't happened yet, then
 * refresh the minimap once it does.
 */
const refreshOnPageLoad = function() {
  waitForLazyLoad.then(promises => Promise.all(promises)).then(refresh);
};

/**
 * When autohide is enabled, do not hide the minimap right away.
 * Give it a chance to play entry animations first.
 */
const autoHideOnLoad = function() {
  setTimeout(function() {
    if (!autohideScrollTimer) o.minimap.classList.add("xivmap-hidden");
  }, o.autohideDelay);
};

/**
 * Recalculates the size of the viewport indicator.
 * Should probably be used when resizing the window.
 */
const resizeViewport = function() {
  const ratio = parseFloat(o.minimap.style.getPropertyValue(RATIO_CSS_VAR));
  const viewport = o.minimap.querySelector("." + XIVMAP_MASK_CLASS);
  viewport.style.height = window.innerHeight * ratio + "px";
};

/**
 * Updates the position of the viewport indicator.
 * Should probably be used when scrolling.
 */
const updateViewport = function() {
  if (updateViewportAnimationFrame === 0) {
    const topDistance = window.scrollY;
    const ratio = parseFloat(o.minimap.style.getPropertyValue(RATIO_CSS_VAR));

    updateViewportAnimationFrame = requestAnimationFrame(() => {
      const viewportMask = o.minimap.querySelector("." + XIVMAP_MASK_CLASS);
      viewportMask.style.transform = `translateY(${topDistance * ratio}px)`;
      const translation =
        viewPortHeight - viewportMask.offsetHeight * 2 - topDistance * ratio;

      if (translation < 0) {
        o.minimap.style.transform = `translateY(${translation}px)`;
      }
      updateViewportAnimationFrame = 0;
    });
  }
};

/**
 * Show the minimap for a few moments, according to autohideDelay, and
 * then hide it. Used by various methods when autohide is enabled.
 */
const showMomentarily = function() {
  o.minimap.classList.remove("xivmap-hidden");
  if (autohideScrollTimer) clearTimeout(autohideScrollTimer);
  autohideScrollTimer = setTimeout(function() {
    o.minimap.classList.add("xivmap-hidden");
  }, o.autohideDelay);
};

/**
 * Takes care of updating the window scroll position as the
 * user drags along the minimap.
 *
 * @param {MouseEvent} e
 */
const beginDragTracking = function(e) {
  updateScrollPosition(e);
  o.minimap.addEventListener("mousemove", updateScrollPosition);
  window.addEventListener(
    "mouseup",
    function() {
      o.minimap.removeEventListener("mousemove", updateScrollPosition);
    },
    { once: true, passive: true }
  );
};

/**
 * Scrolls the page or element according to the current
 * cursor location in the minimap.
 *
 * @param {MouseEvent} e
 */
const updateScrollPosition = function(e) {
  const ratio = parseFloat(o.minimap.style.getPropertyValue(RATIO_CSS_VAR));
  const distance = mouseDistanceFromTopOfTarget(e);
  const viewport = o.minimap.querySelector("." + XIVMAP_MASK_CLASS);
  const centeredDistance = distance - viewport.offsetHeight / 2;
  window.scrollTo(0, centeredDistance / ratio);
};

const disableTransitions = function() {
  o.minimap.classList.add("xivmap-no-transition");
};

const enableTransitions = function() {
  o.minimap.classList.remove("xivmap-no-transition");
};

/**
 * Clean up after itself
 */
const destroy = function() {
  detachListeners();
  o.minimap.innerHTML = "";
};

// =======================================================
// Helper functions
// =======================================================

/**
 * Returns an absolutely positioned representation of an element,
 * ready to be used by xivmap.
 *
 * @param {HTMLElement | ClientRect} element
 * @param {number} ratio Decimal ratio of viewport size to minimap size
 * @param {HTMLElement} [originalElement] In cases where a ClientRect is passed as first argument
 * @returns {string} The representation of the element, as an HTML string
 */
const makeRectangle = function(element, ratio, originalElement) {
  const rectangle =
    element instanceof HTMLElement ? position(element) : element;
  const r = nb => o.roundingFn(nb);
  if (rectangle.width && rectangle.height) {
    let style = "";
    style += `top:${r(rectangle.top * ratio)}px;`;
    style += `left:${r(rectangle.left * ratio)}px;`;
    style += `width:${r(rectangle.width * ratio)}px;`;
    style += `height:${r(rectangle.height * ratio)}px;`;

    return `<div style=${style} data-tag="${element.tagName ||
      originalElement.tagName}"></div>`;
  } else return "";
};

/**
 * Wrapper for makeRectangle, but inserting image element
 *
 * @param {HTMLElement} element
 * @param {number} ratio
 * @returns {string}
 */
const makeImageRectangle = function(element, ratio) {
  const rectangle = position(element);
  let style = `height:${o.roundingFn(element.offsetHeight * ratio)}px;`; // "transform:scale(" + ratio + ");";
  style += `top:${o.roundingFn(rectangle.top * ratio)}px;`;
  style += `left:${o.roundingFn(rectangle.left * ratio)}px;`;
  style += `background-image:url(${element.src});`;
  return `<div data-tag="IMG" style="${style}"></div>`;
};

/**
 * Wrapper for makeRectangle, but inserting SVG element
 *
 * @param {HTMLElement} element
 * @param {number} ratio
 * @returns {string}
 */
const makeSVGRectangle = function(element, ratio) {
  const rectangle = position(element);
  let style = "";
  style += `top:${o.roundingFn(rectangle.top * ratio)}px;`;
  style += `left:${o.roundingFn(rectangle.left * ratio)}px;`;
  return `<div data-tag="SVG" style="${style}">${element.outerHTML}</div>`;
};

/**
 * Wrapper for makeRectangle, but potentially using text nodes
 *
 * @param {HTMLElement} element
 * @param {number} ratio
 * @returns {string}
 */
const makeAccurateRectangle = function(element, ratio) {
  const range = document.createRange();
  range.selectNodeContents(element);

  const rects = range.getClientRects();
  const { length } = rects;
  if (length) {
    let html = "";
    for (let i = 0; i < length; i++) {
      html += makeRectangle(
        clientRectAbsolutePosition(rects.item(i)),
        ratio,
        element
      );
    }
    return html;
  } else {
    return makeRectangle(element, ratio);
  }
};

/**
 * Converts a client rectangle to one with positions
 * calculated from the top of the document
 *
 * @param {DOMRect} clientRect
 * @returns {{top: number, left: number, width: number, height: number}}
 */
const clientRectAbsolutePosition = function({ top, left, width, height }) {
  return {
    top: top + window.pageYOffset,
    left: left + window.pageXOffset,
    width,
    height,
  };
};

/**
 * Convert selector to element, if necessary
 *
 * @param {string | HTMLElement | string[] | HTMLElement[] | jQuery | NodeList} selector
 * @returns {HTMLElement | HTMLElement[]}
 */
const toEl = function(selector) {
  const singleToElement = sel =>
    typeof sel === "string" ? document.querySelector(sel) : sel;

  if (!selector || !selector.length) return singleToElement(selector);
  else return Array.prototype.map.call(selector, singleToElement);
};

/**
 * Given a MouseEvent, returns the distance from the top of the clicked element
 *
 * @param {MouseEvent} e
 * @returns {number}
 */
const mouseDistanceFromTopOfTarget = function(e) {
  return e.pageY - position(e.currentTarget).top;
};

/**
 * Returns true if an element or any of its ancestors has its CSS
 * position set to fixed.
 *
 * @param {HTMLElement} element
 * @returns {boolean}
 */
const isElementFixed = function(element) {
  while (element) {
    const styles = getComputedStyle(element);
    if (styles.getPropertyValue("position") === "fixed") return true;
    element = element.parentElement;
  }
  return false;
};

/**
 * Calculates if an element is visible or would be visible to humans
 * if they scrolled to it.
 *
 * @param {HTMLElement} el
 * @returns {boolean}
 */
const isElementVisible = function(el) {
  return (
    el.offsetParent !== null || window.getComputedStyle(el).display !== "none"
  );
};

/**
 * Get position relative to the root element
 * position(el)
 *
 * Get position relative to ancestor
 * position(el, ancestor)
 *
 * @param {HTMLElement} element
 * @param {HTMLElement} [ancestor]
 * @returns {{left: number, top: number, width: number, height: number}}
 */
const position = function(element, ancestor) {
  if (ancestor) {
    const { top, left, width, height } = position(element);
    const ancestorPos = position(ancestor);

    return {
      top: top - ancestorPos.top,
      left: left - ancestorPos.left,
      width,
      height,
    };
  } else {
    const { top, left, width, height } = element.getBoundingClientRect();

    return { top: top + window.pageYOffset, left, width, height };
  }
};

/**
 * Debounce function taken from Underscore:
 * http://underscorejs.org/docs/underscore.html
 *
 * Modified _.now to Date.now
 */
const debounce = function(func, wait, immediate) {
  let timeout, args, context, timestamp, result;
  const later = function() {
    const last = Date.now() - timestamp;
    if (last < wait && last >= 0) timeout = setTimeout(later, wait - last);
    else {
      timeout = null;
      if (!immediate) {
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      }
    }
  };
  return function() {
    context = this;
    args = arguments;
    timestamp = Date.now();
    const callNow = immediate && !timeout;
    if (!timeout) timeout = setTimeout(later, wait);
    if (callNow) {
      result = func.apply(context, args);
      context = args = null;
    }
    return result;
  };
};

/**
 * Creates a minimap by populating the `config.minimap` element with generated HTML.
 * Attaches event listeners to track viewport location and window resizing.
 * You can ask an update by trigerring a `xivmap.render` event.
 *
 * @param {object} [config]
 * @param {string | HTMLElement} [config.minimap] Element that will hold the minimap DOM, '.xivmap' by default.
 * @param {string | string[]} [config.selectors] Selectors for elements that will appear in the minimap.
 * @param {string | HTMLElement} [config.context] Where to look for the selectors, defaults to document body.
 * @param {HTMLElement[] | NodeList} [config.elements] Elements that will appear in the minimap, in addition to selectors.
 * @param {boolean} [config.accurateText = true] Use text nodes instead of elements, makes text more detailed on the minimap.
 * @param {boolean} [config.accurateTextTags] Use text nodes for these types of tags, defaults to P and H1-H6.
 * @param {boolean} [config.renderNoOpacity = false] Whether to show elements with opacity: 0
 * @param {boolean} [config.autohide = false] Only shows the minimap when hovering or scrolling.
 * @param {boolean} [config.autohideDelay = 1500] Hide the minimap after this many milliseconds, when autohide is enabled.
 * @param {boolean} [config.roundingFn = Math.round] The rounding function used to calculate pixel positions.
 * @param {boolean} [config.refreshOnLoad = true] By default, xivmap will refresh itself upon hearing the window's load event, change to disable.
 * @returns {{refresh: function, destroy: function}} Methods to force a re-render and to clean up listeners.
 */
const xivmap = function(config = {}) {
  // =======================================================
  // Variables
  // =======================================================

  debouncedRender = debounce(render, 350);

  // The main config object
  Object.assign(o, {
    minimap: toEl(config.minimap) || document.getElementById("xivmap"),
    selectors: config.selectors || xivmap.selectors(),
    context: toEl(config.context) || document.body,
    elements: toEl(config.elements) || [],
    accurateText: config.hasOwnProperty("accurateText")
      ? config.accurateText
      : true,
    accurateTextTags: config.accurateTextTags || xivmap.accurateTextTags(),
    renderNoOpacity: config.hasOwnProperty("renderNoOpacity")
      ? config.renderNoOpacity
      : false,
    autohide: config.hasOwnProperty("autohide") ? config.autohide : false,
    autohideDelay: config.hasOwnProperty("autohideDelay")
      ? config.autohideDelay
      : 1500,
    roundingFn: config.roundingFn || Math.round,
    refreshOnLoad: config.hasOwnProperty("refreshOnLoad")
      ? config.refreshOnLoad
      : true,
  });

  // =======================================================
  // Code execution
  // =======================================================

  if (!o.minimap)
    throw Error(
      'Xivmap could not find a suitable container, please add a div with the "xivmap" class'
    );

  render();
  attachListeners();
  if (o.refreshOnLoad) refreshOnPageLoad();
  if (o.autohide) autoHideOnLoad();

  return { refresh, destroy };
};

/**
 * Returns a list of the default selectors used to create the minimap in
 * cases where no selectors are provided via the configuration object.
 *
 * @returns {string[]}
 */
xivmap.selectors = function() {
  return [
    "a",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "input",
    "button",
    "label",
    "q",
    "svg",
    "img",
    "map",
    "table",
    "tr",
    "object",
    "audio",
    "video",
    "iframe",
    "textarea",
    "code",
    "li",
    "form",
    "blockquote",
    "address",
    "p",
    "pre",
    ".include-in-xivmap",
  ];
};

/**
 * Returns a list of tags for which to use text nodes instead of the
 * element. Using text nodes means more accurate boxes based on text length.
 *
 * @returns {string[]}
 */
xivmap.accurateTextTags = function() {
  return ["H1", "H2", "H3", "H4", "H5", "H6", "P", "TEXTAREA", "CODE"];
};

export default xivmap;
