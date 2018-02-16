import xivmap from "./xivmap.mjs";
import waitForLazyLoad from "./chart.mjs";

/**
 * Based on the [Stuart Langridge script](https://kryogenix.org/code/browser/generated-toc/generated_toc.js)
 * Generated TOC
 * aduh95, 2017-09-28
 *
 * Generate a table of contents, based on headings in the page.
 *
 * To place the TOC on your Markdown or HTML document, insert this
 * script and add the following `nav` element to your document where
 * you want the TOC to be generated.
 * N.B.: All the headings before the `nav` element will be ignored.
 *
 * ```html
 *
 *  <!-- ... -->
 *
 *  <!-- The TOC will appear here -->
 *  <nav id="toc" data-label="Table of content"></nav>
 *  <!-- The data-label is optional, and default to "Table of content" -->
 *
 *  <!-- Rest of document on which the TOC references -->
 *
 * ```
 *
 */

const SUMMARY_TEXT = "Table of contents";
const ID_TOC_ELEMENT = "toc";

let addToArrayIfNotPreviousSibling = (
  notPreviousSiblings,
  refElement,
  element
) => {
  if (element.parentNode === refElement.parentNode) {
    for (let child of element.parentNode.childNodes) {
      if (child === element) {
        return;
      }
      if (child === refElement) {
        notPreviousSiblings.push(element);
        return;
      }
    }
  } else {
    notPreviousSiblings.push(element);
  }
};

let getHeadings = (tocElement, generate_from, generate_to) => {
  // add all levels of heading we're paying attention to to the
  // headings_to_treat dictionary, ready to be filled in later
  let headings_to_treat = "";
  for (let i = generate_from | 0; i <= (generate_to | 0); i++) {
    headings_to_treat += ",h" + i;
  }
  let headings = document.querySelectorAll(headings_to_treat.slice(1));

  // make the basic elements of the TOC itself, ready to fill into
  let wantedHeadings = [];
  for (let heading of headings) {
    addToArrayIfNotPreviousSibling(wantedHeadings, tocElement, heading);
  }

  return wantedHeadings;
};

/**
 * A recursive function which returns the first header it finds inside
 * node, or null if there are no functions inside node.
 * @param node The node used to look for the header
 * @return string | null The tagName of the first header element found
 */
let findFirstHeaderElement = function(node) {
  let nn = node.nodeName.toLowerCase();
  if (nn.match(/^h[1-6]$/)) {
    // this node is itself a header; return our name
    return nn;
  } else {
    let headerElementTagName;

    if (node.nextElementSibling) {
      // Looking for the siblings first
      headerElementTagName = findFirstHeaderElement(node.nextElementSibling);
    }
    if (headerElementTagName) return headerElementTagName;

    if (node.hasChildNodes()) {
      // Then looking for the children
      headerElementTagName = findFirstHeaderElement(node.firstElementChild);
    }
    if (headerElementTagName) return headerElementTagName;

    // no headers in this node at all
    return null;
  }
};
let getFirstHeaderLevel = tocElement =>
  parseInt(findFirstHeaderElement(tocElement).slice(1));

let computeYPositions = select => {
  for (let option of select.options) {
    option.dataset.top =
      document.getElementById(option.dataset.target).offsetTop -
      window.innerHeight / 5;
  }
};

let addOptionToSummary = (parent, targetId, text) => {
  let option = document.createElement("option");
  if (text) {
    option.appendChild(document.createTextNode(text));
  }
  option.dataset.target = targetId;
  parent.appendChild(option);
};

let generate = function(document, headings, generate_from, summaryText) {
  let cur_head_lvl = generate_from;

  let details = document.createElement("details");
  let summary = document.createElement("summary");
  summary.appendChild(document.createTextNode(summaryText || SUMMARY_TEXT));
  let select = document.createElement("select");
  let currentSelectSection;
  let selectScrollAnimationFrame;
  let selectComputeAnimationFrame;
  select.multiple = true;
  select.addEventListener("change", function() {
    location.assign("#" + select.selectedOptions[0].dataset.target);
  });
  addEventListener("resize", () => {
    if (selectComputeAnimationFrame) {
      cancelAnimationFrame(selectComputeAnimationFrame);
    }
    selectComputeAnimationFrame = requestAnimationFrame(() =>
      computeYPositions(select)
    );
  });
  summary.addEventListener("click", () => {
    computeYPositions(select);
    window.dispatchEvent(new Event("xivmap.render"));
  });
  addEventListener(
    "scroll",
    () => {
      // Tests if the select element is visible before trying to animate it
      if (details.open && select.offsetParent !== null) {
        if (selectScrollAnimationFrame) {
          cancelAnimationFrame(selectScrollAnimationFrame);
        }
        selectScrollAnimationFrame = requestAnimationFrame(() => {
          let i = 0;
          while (
            i < select.options.length &&
            (select.options[i].dataset.top | 0) < window.scrollY + 9
          ) {
            i++;
          }
          select.selectedIndex = i - 1;
        });
      }
    },
    { passive: true }
  );

  let cur_list_el = document.createElement("ol");
  details.appendChild(summary);
  details.appendChild(cur_list_el);
  details.appendChild(select);

  // now walk through our saved heading nodes
  for (let this_head_el of headings) {
    let this_head_lvl = parseInt(this_head_el.nodeName.slice(1)) || 6;

    if (!this_head_el.id) {
      // if heading doesn't have an ID, give it one
      this_head_el.id = generateRandID();
      this_head_el.setAttribute("tabindex", "-1");
    }

    if (this_head_lvl - generate_from === 0) {
      if (currentSelectSection && !currentSelectSection.hasChildNodes()) {
        addOptionToSummary(
          currentSelectSection,
          currentSelectSection.dataset.target
        );
      }
      currentSelectSection = document.createElement("optgroup");
      currentSelectSection.label = innerText(this_head_el);
      currentSelectSection.dataset.target = this_head_el.id;
      select.appendChild(currentSelectSection);
    } else if (this_head_lvl - generate_from === 1) {
      addOptionToSummary(
        currentSelectSection,
        this_head_el.id,
        innerText(this_head_el)
      );
    }

    while (this_head_lvl > cur_head_lvl) {
      // this heading is at a lower level than the last one;
      // create additional nested lists to put it at the right level

      // get the *last* LI in the current list, and add our new UL to it
      let last_listItem_el =
        cur_list_el.lastChild || document.createElement("li");
      let new_list_el = document.createElement("ol");
      last_listItem_el.appendChild(new_list_el);
      cur_list_el.appendChild(last_listItem_el);
      cur_list_el = new_list_el;
      cur_head_lvl++;
    }

    while (this_head_lvl < cur_head_lvl) {
      // this heading is at a higher level than the last one;
      // go back up the TOC to put it at the right level
      cur_list_el = cur_list_el.parentNode.parentNode;
      cur_head_lvl--;
    }

    // create a link to this heading, and add it to the TOC
    cur_list_el.appendChild(
      (function(li) {
        let a = document.createElement("a");
        a.href = "#" + this_head_el.id;
        a.appendChild(document.createTextNode(innerText(this_head_el)));
        li.appendChild(a);
        return li;
      })(document.createElement("li"))
    );
  }

  if (currentSelectSection && !currentSelectSection.hasChildNodes()) {
    addOptionToSummary(
      currentSelectSection,
      currentSelectSection.dataset.target
    );
  }
  return details;
};

let generateRandID = function() {
  let _return;
  do {
    _return = Math.random()
      .toString(36)
      .substr(2, 10);
  } while (document.getElementById(_return));

  return _return;
};

let innerText = function(el) {
  return typeof el.innerText != "undefined"
    ? el.innerText
    : typeof el.textContent != "undefined"
      ? el.textContent
      : el.innerHTML.replace(/<[^>]+>/g, "");
};

let generateStyle = (style, generate_from, deepestLevel) => {
  style.sheet.insertRule(
    "#" + ID_TOC_ELEMENT + " ol{counter-reset: section;list-style-type: none;}"
  );
  style.sheet.insertRule(
    "#" +
      ID_TOC_ELEMENT +
      " li::before{counter-increment: section;content: counters(section,'.') '  ';}"
  );
  style.sheet.insertRule(":root{counter-reset: heading" + generate_from + ";}");
  for (let i = generate_from; i <= deepestLevel; i++) {
    let content = "";
    for (let j = generate_from; i >= j; j++) {
      content += "counter(heading" + j + ") '.'";
    }
    style.sheet.insertRule(
      "#" +
        ID_TOC_ELEMENT +
        "~h" +
        i +
        "{counter-reset:heading" +
        (i + 1) +
        ";}"
    );
    style.sheet.insertRule(
      "#" +
        ID_TOC_ELEMENT +
        "~h" +
        i +
        "::before{counter-increment:heading" +
        i +
        ";content:" +
        content +
        " '  ';}"
    );
  }
};

const listenForMediaEvents = tocElement => {
  var mediaQueryList = window.matchMedia(
    "print, screen and (min-width:1600px)"
  );
  mediaQueryList.onchange = mql =>
    (tocElement.querySelector("details").open = mql.matches);
  return mediaQueryList;
};

const init = function() {
  if (!document.getElementById("xivmap")) {
    let xivmapElem = document.createElement("div");
    xivmapElem.id = "xivmap";
    xivmapElem.className = "xivmap top-right slide-in";

    document.body.appendChild(xivmapElem);
  }
  xivmap();

  // Identify our TOC element, and what it applies to
  let tocElement = this.getElementById(ID_TOC_ELEMENT);
  if (!tocElement || tocElement.hasChildNodes()) {
    return;
  }

  let shouldOpen = listenForMediaEvents(tocElement).matches;

  let generate_from = getFirstHeaderLevel(tocElement, this.body);
  let generate_to = tocElement.dataset.deepestLevel | 0 || 6;
  if (generate_from) {
    let style = this.createElement("style");
    this.head.appendChild(style);
    generateStyle(style, generate_from, generate_to);

    const details = generate(
      this,
      getHeadings(tocElement, generate_from, generate_to),
      generate_from,
      tocElement.dataset.label
    );
    tocElement.appendChild(details);

    if (shouldOpen) {
      waitForLazyLoad.then(promises => Promise.all(promises)).then(() => {
        computeYPositions(details.querySelector("select"));
        details.open = true;
      });
    }
  }
};

if (window.document.readyState === "loading") {
  window.document.addEventListener("DOMContentLoaded", init);
} else {
  init.apply(window.document);
}
