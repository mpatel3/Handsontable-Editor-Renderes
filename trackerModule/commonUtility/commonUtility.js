import utils from '../../utils';
/* eslint no-param-reassign: 0 */
const commonUtility = (() => {
    const element = document.createElement('textarea');
    element.style.visibility = 'hidden';
    /**
     * @description - Function will desantize the content available in string to display HTML content.
     * @param {str} str - string containing unsenitized code.
     */
    const decodeHTMLEntities = (str) => {
            try {
                if (str && typeof str === 'string') {
                    str = str.replace(/</g, '&lt;');
                    str = str.replace(/>/g, '&gt;');
                    element.innerHTML = str;
                    str = element.textContent;
                    element.textContent = '';
                }
                return str;
            } catch (err) {
                utils.log(err);
            }
    },
    /**
     * @description - This function will determine if a handsontable editor instance require to be display on Top OR bottom of Table TD instance.
     * @param {*} tdRef - TD in context - HTML element ref.
     * @param {*} tableElemRef  - Table in context - HTML element ref.
     * @param {*} tableHeaderElemRef - Table header in conext - HTML element ref.
     * @param {*} editorHeight - height of editor elem - Number.
     */
    isFlipNeeded = (tdRef, tableElemRef, tableHeaderElemRef, editorHeight) => {
        try {
            // If defined then return determine the flip value and return.
            if (Handsontable.helper.isDefined(tdRef) && Handsontable.helper.isDefined(tableElemRef) && Handsontable.helper.isDefined(tableHeaderElemRef) && Handsontable.helper.isDefined(editorHeight)) {
                const offset = tdRef.getBoundingClientRect(),
                    cellInstnaceHeight = Handsontable.dom.outerHeight(tdRef),
                    trimmingContainer = Handsontable.dom.getTrimmingContainer(tableElemRef),
                    headersHeight = Handsontable.dom.outerHeight(tableHeaderElemRef),
                    containerOffset = Handsontable.dom.offset(trimmingContainer),
                    spaceAbove = offset.top - containerOffset.top - headersHeight,
                    spaceBelow = Handsontable.dom.outerHeight(trimmingContainer) - spaceAbove - headersHeight - cellInstnaceHeight,
                    flipNeeded = editorHeight > spaceBelow && spaceAbove > spaceBelow;
                return flipNeeded;
            }
            return false; // If not defined.
        } catch (err) {
            utils.log(err);
            return false; // return false if error.
        }
    };

    return {
        decodeHTMLEntities,
        isFlipNeeded,
      };
    })();

export default commonUtility;
