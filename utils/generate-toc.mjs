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
 *  <nav id="generated-toc"></nav>
 * 
 *  <!-- Rest of document on which the TOC references -->
 * 
 * ```
 * 
*/

const SUMMARY_TEXT = "Table of content";
const ID_TOC_ELEMENT = "generated-toc";

let addToArrayIfNotPreviousSibbling = (
  notPreviousSibblings,
  refElement,
  element
) => {
  if (element.parentNode === refElement.parentNode) {
    for (let child of element.parentNode.childNodes) {
      if (child === element) {
        return;
      }
      if (child === refElement) {
        notPreviousSibblings.push(element);
        return;
      }
    }
  } else {
    notPreviousSibblings.push(element);
  }
};

let getHeadings = (generate_from, tocElement) => {
  // add all levels of heading we're paying attention to to the
  // headings_to_treat dictionary, ready to be filled in later
  let headings_to_treat = ["h6"];
  for (let i = 5; i >= parseInt(generate_from); i--) {
    headings_to_treat.push("h" + i);
  }
  let headings = document.querySelectorAll(headings_to_treat.join(","));

  // make the basic elements of the TOC itself, ready to fill into
  let wantedHeadings = [];
  for (let heading of headings) {
    addToArrayIfNotPreviousSibbling(wantedHeadings, tocElement, heading);
  }

  return wantedHeadings;
};

let findFirstHeaderElement = function(node) {
  // a recursive function which returns the first header it finds inside
  // node, or null if there are no functions inside node.
  let nn = node.nodeName.toLowerCase();
  if (nn.match(/^h[1-6]$/)) {
    // this node is itself a header; return our name
    return nn;
  } else {
    let subvalue;

    if (node.nextElementSibling) {
      // Looking for the sibblings first
      subvalue = findFirstHeaderElement(node.nextElementSibling);
    }
    if (subvalue) return subvalue;

    if (node.hasChildNodes()) {
      // Then looking for the children
      subvalue = findFirstHeaderElement(node.firstElementChild);
    }
    if (subvalue) return subvalue;

    // no headers in this node at all
    return null;
  }
};
let getFirstHeaderLevel = function(tocElement) {
  // You can specify on which header level the TOC should look for
  // For example, to get only titles lower or equals to h3, use the following:
  //   <nav id="generated-toc" data-generate-from="3"></nav>
  // By default, the first heading element found after
  // the <nav> will be used as reference
  return parseInt(
    tocElement.dataset.generateFrom ||
      findFirstHeaderElement(tocElement).slice(1)
  );
};

let generate = function(document, headings, generate_from) {
  let cur_head_lvl = generate_from;

  let details = document.createElement("details");
  let summary = document.createElement("summary");
  summary.appendChild(document.createTextNode(SUMMARY_TEXT));

  let cur_list_el = document.createElement("ol");
  details.appendChild(summary);
  details.appendChild(cur_list_el);

  // now walk through our saved heading nodes
  for (let this_head_el of headings) {
    let this_head_lvl = parseInt(this_head_el.nodeName.slice(1)) || 6;

    if (!this_head_el.id) {
      // if heading doesn't have an ID, give it one
      this_head_el.id = generateRandID();
      this_head_el.setAttribute("tabindex", "-1");
    }

    while (this_head_lvl > cur_head_lvl) {
      // this heading is at a lower level than the last one;
      // create additional nested lists to put it at the right level

      // get the *last* LI in the current list, and add our new UL to it
      let last_listitem_el =
        cur_list_el.lastChild || document.createElement("li");
      let new_list_el = document.createElement("ol");
      last_listitem_el.appendChild(new_list_el);
      cur_list_el.appendChild(last_listitem_el);
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

  // go through the TOC and find all LIs that are "empty", i.e., contain
  // only ULs and no links, and give them class="missing"
  let allLIs = details.getElementsByTagName("li");
  for (let li of allLIs) {
    let children = li.children;
    let index = 0;
    let currentChild;
    do {
      currentChild = children.item(index++);
    } while (currentChild && currentChild.nodeName.toLowerCase() == "a");

    if (!currentChild) {
      allLIs.item(index).className = "missing";
    }
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

let generateStyle = (style, generate_from) => {
  style.sheet.insertRule(
    "#" + ID_TOC_ELEMENT + " ol{counter-reset: section;list-style-type: none;}"
  );
  style.sheet.insertRule(
    "#" +
      ID_TOC_ELEMENT +
      " li::before{counter-increment: section;content: counters(section,'.') '  ';}"
  );
  style.sheet.insertRule(":root{counter-reset: heading" + generate_from + ";}");
  for (let i = generate_from; i <= 6; i++) {
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

const init = function() {
  // Identify our TOC element, and what it applies to
  let tocElement = this.getElementById(ID_TOC_ELEMENT);
  if (!tocElement || tocElement.hasChildNodes()) {
    return;
  }

  let generate_from = getFirstHeaderLevel(tocElement, this.body);
  if (generate_from) {
    let style = this.createElement("style");
    this.head.appendChild(style);
    generateStyle(style, generate_from);

    tocElement.appendChild(
      generate(this, getHeadings(generate_from, tocElement), generate_from)
    );
  }
};

if (window.document.readyState === "loading") {
  window.document.addEventListener("DOMContentLoaded", init);
} else {
  init.apply(window.document);
}
