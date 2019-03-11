// detect content size change
export default function listenResize(element, callback) {
  return injectObject(element, callback);
}

function injectObject(element, callback) {
  if (element.__resizeTrigger__) {
    return;
  }

  if (getComputedStyle(element).position === 'static') {
    element.style.position = 'relative'; // 将static改为relative
  }
  element.__resizeListener__ = e => {
    e.stopImmediatePropagation();
    e.preventDefault();
    callback();
    resetTrigger(element);
  };

  const resizeTrigger = (element.__resizeTrigger__ = document.createElement(
    'div'
  ));
  resizeTrigger.innerHTML = ` 
  <div class="expand-trigger">
    <div></div>
  </div>
  <div class="contract-trigger"></div> `;
  resizeTrigger.className = 'resize-triggers';
  element.appendChild(resizeTrigger);

  resetTrigger(element);
  const expand = getExpand(resizeTrigger);
  const contract = getContract(resizeTrigger);
  expand.addEventListener('scroll', element.__resizeListener__, true);
  contract.addEventListener('scroll', element.__resizeListener__, true);

  return (element.removeResize = () => {
    // Remove
    element.removeEventListener('scroll', element.__resizeListener__, true);
    element.removeChild(element.__resizeTrigger__);
    element.__resizeListener__ = element.__resizeTrigger__ = null;
    delete element.removeResize;
  });
}

const resetTrigger = element => {
  const trigger = element.__resizeTrigger__;
  const expand = getExpand(trigger);
  const contract = getContract(trigger);
  const expandChild = expand.firstElementChild;
  contract.scrollLeft = contract.scrollWidth;
  contract.scrollTop = contract.scrollHeight;
  expandChild.style.width = expand.offsetWidth + 1 + 'px';
  expandChild.style.height = expand.offsetHeight + 1 + 'px';
  expand.scrollLeft = expand.scrollWidth;
  expand.scrollTop = expand.scrollHeight;
};

const getExpand = elm => {
  return elm.firstElementChild;
};
const getContract = elm => {
  return elm.lastElementChild;
};
