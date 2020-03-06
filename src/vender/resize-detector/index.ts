// detect content size change
export default function listenResize(element, callback) {
  if (!element) {
    return false;
  }

  return injectObject(element, callback);
}

function injectObject(element, callback) {
  if (element.__resizeTrigger__) {
    return;
  }

  createStyles(element.ownerDocument);

  if (getComputedStyle(element).position === "static") {
    element.style.position = "relative"; // 将static改为relative
  }
  element.__resizeListener__ = function(e) {
    e.stopImmediatePropagation();
    e.preventDefault();
    callback();
    resetTrigger(element);
  };

  var resizeTrigger = (element.__resizeTrigger__ = document.createElement(
    "div"
  ));
  resizeTrigger.innerHTML = ` 
  <div class="expand-trigger">
    <div></div>
  </div>
  <div class="contract-trigger"></div> `;
  resizeTrigger.className = "resize-triggers";
  element.appendChild(resizeTrigger);

  resetTrigger(element);
  var expand = getExpand(resizeTrigger);
  var contract = getContract(resizeTrigger);
  expand.addEventListener("scroll", element.__resizeListener__, true);
  contract.addEventListener("scroll", element.__resizeListener__, true);

  return (
    (element.removeResize = function() {
      // Remove
      element.removeEventListener("scroll", element.__resizeListener__, true);
      element.removeChild(element.__resizeTrigger__);
      element.__resizeListener__ = element.__resizeTrigger__ = null;
      delete element.removeResize;
    }) && element
  );
}

var resetTrigger = function(element) {
  var trigger = element.__resizeTrigger__;
  if (!trigger) {
    return;
  }
  var expand = getExpand(trigger);
  var contract = getContract(trigger);
  var expandChild = expand.firstElementChild;
  contract.scrollLeft = contract.scrollWidth;
  contract.scrollTop = contract.scrollHeight;
  expandChild.style.width = expand.offsetWidth + 1 + "px";
  expandChild.style.height = expand.offsetHeight + 1 + "px";
  expand.scrollLeft = expand.scrollWidth;
  expand.scrollTop = expand.scrollHeight;
};

var getExpand = function(elm) {
  return elm.firstElementChild;
};
var getContract = function(elm) {
  return elm.lastElementChild;
};

var createStyles = function(doc) {
  if (!doc.getElementById("detectElementResize")) {
    //opacity:0 works around a chrome bug https://code.google.com/p/chromium/issues/detail?id=286360
    var css =
        ".resize-triggers { " +
        "visibility: hidden; opacity: 0; } " +
        '.resize-triggers, .resize-triggers > div, .contract-trigger:before { content: " "; display: block; position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden; z-index: -1; } .resize-triggers > div { background: #eee; overflow: auto; } .contract-trigger:before { width: 200%; height: 200%; }',
      head = doc.head || doc.getElementsByTagName("head")[0],
      style = doc.createElement("style");

    style.id = "detectElementResize";
    style.type = "text/css";

    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(doc.createTextNode(css));
    }

    head.appendChild(style);
  }
};
