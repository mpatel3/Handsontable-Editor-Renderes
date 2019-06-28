const utils = (() => {
  const grabElement = id => document.getElementById(id),
    grabClassElements = className => document.getElementsByClassName(className),
    grabWithCssSelector = selector => document.querySelectorAll(selector),
    idClickListener = id => callback => grabElement(id).addEventListener('click', callback),
    idChangeListener = id => callback => grabElement(id).addEventListener('change', callback),
    classClickListener = className => callback => grabClassElements(className).forEach((element) => {
        element.addEventListener('click', callback);
      }),
    cloneNodeClickListener = (className, callback) => grabClassElements(className).forEach((element) => {
        const elementClone = element.cloneNode(true);
        element.parentNode.replaceChild(elementClone, element);
        elementClone.addEventListener('click', callback);
      }),
    addClickListener = selector => callback => grabWithCssSelector(selector).forEach((element) => {
        element.addEventListener('click', callback);
      }),
    cloneNodeChangeListener = (className, callback) => grabClassElements(className).forEach((element) => {
        const elementClone = element.cloneNode(true);
        element.parentNode.replaceChild(elementClone, element);
        elementClone.addEventListener('change', callback);
      }),
    checkBlankForm = formElementsArray => formElementsArray.filter(element => grabElement(element).value === ''),
    copyToClipboard = (
      inputElement,
      priorCallback = () => {},
      postCallback = () => {}
    ) => {
      priorCallback();
      const copyInput = grabElement(inputElement);
      copyInput.focus();
      copyInput.select();
      document.execCommand('copy');
      postCallback();
    },
    copyClipboardCallback = (
      event,
      cssStyleString = 'display: block; width: 150px; top: 34px;',
      postAppendCallback = () => {},
      setTimeOutCallback = () => {},
      customAttribute = 'title'
    ) => {
      const displayString = `<span id="copy_apply_podcast_message" class="copiedMsg_link copied-msg-link-dialog">${event.target.getAttribute(
          customAttribute
        ) || 'Copied to Clipboard'}</span>`,
        displayElement = new DOMParser().parseFromString(
          displayString,
          'text/html'
        );
      event.target.parentElement.classList.add('relative');
      event.target.parentElement.appendChild(displayElement.body.firstChild);
      grabElement('copy_apply_podcast_message').style.cssText = cssStyleString;
      postAppendCallback();
      setTimeout(() => {
        grabElement('copy_apply_podcast_message').remove();
        event.target.parentElement.classList.remove('relative');
        setTimeOutCallback();
      }, 1000);
    },
    copyToClipboardWithTempInput = (
      textTobeCopied,
      priorCallback = () => {},
      postCallback = () => {}
    ) => {
      priorCallback();
      if (!grabElement('customCopyInput')) {
        const el = document.createElement('input');
        el.id = 'customCopyInput';
        el.value = textTobeCopied;
        el.setAttribute('readonly', '');
        el.style.position = 'absolute';
        el.style.left = '-9999px';
        document.body.appendChild(el);
        el.focus();
        el.select();
        document.execCommand('copy');
        el.style.display = 'none';
      } else {
        const el = grabElement('customCopyInput');
        el.value = textTobeCopied;
        el.style.display = 'block';
        el.focus();
        el.select();
        document.execCommand('copy');
        el.style.display = 'none';
      }
      postCallback();
    },
    reArrangeArray = (
      arrayObj,
      fromIndex,
      toIndex
    ) => {
      const elem = arrayObj[fromIndex];
      arrayObj.splice(fromIndex, 1);
      arrayObj.splice(toIndex, 0, elem);
    },
    { log, error, } = console,
    { location, history, } = window;
  return {
    grabElement,
    grabClassElements,
    grabWithCssSelector,
    idClickListener,
    idChangeListener,
    classClickListener,
    cloneNodeClickListener,
    addClickListener,
    cloneNodeChangeListener,
    checkBlankForm,
    copyToClipboard,
    copyClipboardCallback,
    copyToClipboardWithTempInput,
    reArrangeArray,
    log,
    error,
    location,
    history,
  };
})();

export default utils;
