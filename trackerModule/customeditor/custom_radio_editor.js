/* eslint prefer-rest-params: 0 */
/* eslint no-param-reassign: 0 */
/**
 * @description - Custom editor for radio box.
 * @param - none.
 */
const CustomRadioBoxEditor = () => {
    /**
     * @description - intialize the custom editor.
     * @param - none.
     */
    const init = () => {
		addRadioboxEditor();
	},
    /**
     * @description - create the template for the radio box editor
     * @param - options - Hashmap [ key-value pair ]
     * @param - currValue - current value in the cell.
     */
    getTemplateString = function (options, currValue) {
        let templateString = '';
        Object.keys(options).forEach((key) => {
            if (Object.prototype.hasOwnProperty.call(options, key)) {
                const uniqId = `${key}_${(new Date()).getTime()}`;
                templateString += `<li><input type='radio' name="radioBtn" ${options[key] === currValue ? 'checked' : ''} value='${options[key]}' id='${uniqId}' /><label htmlFor=${uniqId}>${options[key]}</label></li>`;
            }
        });
        return templateString;
    },
    /**
     * @description - Intialize the editor. init method
     * @param - none.
     */
    initFunc = function () {
        // create a node.
        this.ulListElm = this.instance.rootDocument.createElement('UL');
        this.ulListElm.setAttribute('id', `customRadioBoxEditor_${new Date().getTime()}`);
        this.ulListElmStyle = this.ulListElm.style;
        this.ulListElmStyle.position = 'absolute';
        this.ulListElmStyle.top = 0;
        this.ulListElmStyle.left = 0;
        this.ulListElmStyle.zIndex = 9999;
        this.ulListElm.style.display = 'none';
        // Attach node to DOM, by appending it to the container holding the table
        this.instance.rootDocument.body.appendChild(this.ulListElm);
        const eventManager = new Handsontable.EventManager(this);
        eventManager.addEventListener(this.ulListElm, 'mousedown', event => Handsontable.dom.stopPropagation(event));
    },
    /**
     * @description - save the value common method of editor.
     * @param - value - Array - contains a string contains all the values.
     */
    saveValueFunc = function () {
        Handsontable.editors.BaseEditor.prototype.saveValue.apply(this, arguments);
    },
    /**
     * @description - prepare the editor to rendered call every time.
     * @param - none.
     */
    prepareFunc = function () {
        // Remember to invoke parent's method
        Handsontable.editors.BaseEditor.prototype.prepare.apply(this, arguments);
        const options = JSON.parse(JSON.stringify(this.cellProperties.radioBoxOptions));
        this.currentCellValue = this.instance.getDataAtCell(this.row, this.col);
        this.currentCellValue = this.currentCellValue ? this.currentCellValue : '';
        Handsontable.dom.empty(this.ulListElm); // clear DOM.
        Handsontable.dom.fastInnerHTML(this.ulListElm, getTemplateString(options, this.currentCellValue)); // append to the DOM.
        this.ulListElm.style.curser = 'pointer';
    },
    /**
     * @description - get the values from the custom editor that we have defined.
     * @param - none.
     */
    getValueFunc = function () {
        const value = this.ulListElm.querySelector('input[name="radioBtn"]:checked') ? this.ulListElm.querySelector('input[name="radioBtn"]:checked').value : '';
        return value;
    },
    /**
     * @description - set value to the cell.
     * @param - value - string
     */
    setValueFunc = function () {},
    /**
     * @description - function will help us to display the editor as desire. you can add class and set CSS for the editor instances.
     * @param - none.
     */
    openFunc = function () {
        const [width, offset] = [Handsontable.dom.outerWidth(this.TD), this.TD.getBoundingClientRect()];
        this.ulListElmStyle.top = `${this.instance.rootWindow.pageYOffset + offset.top + Handsontable.dom.outerHeight(this.TD)}px`;
        this.ulListElmStyle.left = `${this.instance.rootWindow.pageXOffset + offset.left}px`;
        // sets select dimensions to match cell size
        this.ulListElmStyle.height = 'auto';
        this.ulListElmStyle.minWidth = `${width}px`;
        this.ulListElmStyle.margin = '0px';
        this.ulListElmStyle.padding = '5px';
        this.ulListElmStyle.backgroundColor = '#fff';
        this.ulListElm.style.display = '';
    },
    /**
     * @description - function will help us to  hide the editor instance.
     * @param - none.
     */
    closeFunc = function () {
        this.ulListElm.style.display = 'none';
    },
    /**
     * @description - function will help us to bring foucs on the editor.
     * @param - none.
     */
    focusFunc = function () {
        this.instance.listen();
    },
    /**
     * @description - custom renderer function for our cell. you can build your OWN UI.
     * @param - none.
     */
    customRendererFunc = function (hotInstance, td, row, column, prop, value) {
        Handsontable.renderers.BaseRenderer.apply(this, arguments);
        Handsontable.dom.fastInnerHTML(td, `<div>${value ? value : ''}</div>`);
    },

    addRadioboxEditor = function () {
        const radioBoxCustomEditor = Handsontable.editors.BaseEditor.prototype.extend();
        radioBoxCustomEditor.prototype.init = initFunc;
        radioBoxCustomEditor.prototype.saveValue = saveValueFunc;
        radioBoxCustomEditor.prototype.prepare = prepareFunc;
        radioBoxCustomEditor.prototype.getValue = getValueFunc;
        radioBoxCustomEditor.prototype.setValue = setValueFunc;
        radioBoxCustomEditor.prototype.open = openFunc;
        radioBoxCustomEditor.prototype.close = closeFunc;
        radioBoxCustomEditor.prototype.focus = focusFunc;

        // @description - Register an editor for your custom renderer.
        Handsontable.editors.registerEditor('ma.radioBoxCustomEditor', radioBoxCustomEditor);

        // @description - Register an alias for your custom renderer.
        Handsontable.renderers.registerRenderer('ma.radioBoxRenderer', customRendererFunc);

        /**
         * @description -  Register an alias for our cell.
         * @param  - none.
         * @provide - you can provide editor, rendrer and validator that you have defined for the cell.
         */
        Handsontable.cellTypes.registerCellType('ma.radioBoxCell', {
            editor: radioBoxCustomEditor,
            renderer: customRendererFunc,
            // You can add additional options to the cell type based on Handsontable settings
            className: 'radioBtn',
            allowInvalid: false,
        });
    };

    return {
        init,
    };
};

export default CustomRadioBoxEditor;
