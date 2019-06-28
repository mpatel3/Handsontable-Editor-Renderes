import commonUtility from '../commonUtility/commonUtility';

/* eslint prefer-rest-params: 0 */
/* eslint no-param-reassign: 0 */
/**
 * @description - Custom editor for checkbox.
 * @param - none.
 */
const CustomCheckBoxEditor = () => {
    /**
     * @description - intialize the custom editor.
     * @param - none.
     */
    const init = () => {
		addCheckboxEditor();
	},
    /**
     * @description - create the template for the checkbox editor
     * @param - options - Hashmap [ key-value pair ]
     * @param - currValue - current value in the cell.
     */
    getTemplateString = function (options, currValue) {
        let templateString = '';
        Object.keys(options).forEach((key) => {
            if (Object.prototype.hasOwnProperty.call(options, key)) {
                const uniqId = `${key}_${(new Date()).getTime()}`,
                    isOptionChecked = currValue.indexOf(options[key]) > -1;
                templateString += `<li class='bottom-5'><input type='checkbox' class='filled-in' value='${options[key]}' ${isOptionChecked ? 'checked' : ''} id='${uniqId}' /><label class='fixwidth text-truncation left-p-30' for='${uniqId}'>${options[key]}</label></li>`;
            }
        });
        templateString += `<li data-name='addNew' class='wrap-add-new theme_color'><i class="fal fa-plus"></i> Add New Option</li>`;
        return templateString;
    },
    /**
     * @description - Intialize the editor. init method
     * @param - none.
     */
    initFunc = function () {
        // create a node.
        const elem = document.getElementById('customCheckBoxEditor');
        if (elem) elem.remove();
        this.ulListElm = this.instance.rootDocument.createElement('UL');
        this.ulListElm.setAttribute('id', 'customCheckBoxEditor');
        Handsontable.dom.addClass(this.ulListElm,'clikBoxWrapper');
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
    saveValueFunc = function (value) {
        Handsontable.editors.BaseEditor.prototype.saveValue.apply(this, arguments);
        const self = this,
            latestValues = value[0][0].length ? value[0][0].split(',') : [];
        if (latestValues.length) {
            Object.keys(latestValues).forEach((key) => {
                if (self.cellPropertiesBackup.indexOf(latestValues[key]) < 0) {
                    self.cellProperties.checkBoxOptions.push(latestValues[key]);
                }
            });
        } else {
            this.cellProperties.checkBoxOptions = JSON.parse(JSON.stringify(this.cellPropertiesBackup));
        }
    },
    /**
     * @description - prepare the editor to rendered call every time.
     * @param - none.
     */
    prepareFunc = function () {
        // Remember to invoke parent's method
        Handsontable.editors.BaseEditor.prototype.prepare.apply(this, arguments);
        const [self, checkBoxOptions] = [this, this.cellProperties.checkBoxOptions];
        this.currentCellValue = this.instance.getDataAtCell(this.row, this.col);
        this.currentCellValue = this.currentCellValue ? this.currentCellValue.split(',') : [];
        let options;
        this.cellPropertiesBackup = JSON.parse(JSON.stringify(checkBoxOptions)); // copy.

        if (typeof checkBoxOptions === 'function') {
            options = this.prepareOptions(checkBoxOptions(this.row,
            this.col, this.prop));
        } else {
            options = this.prepareOptions(checkBoxOptions);
        }
        Handsontable.dom.empty(this.ulListElm); // clear DOM.
        Handsontable.dom.fastInnerHTML(this.ulListElm, getTemplateString(options, self.currentCellValue)); // append to the DOM.
        this.ulListElm.style.curser = 'pointer';
        // Attach dom event.
        Handsontable.dom.addEvent(this.ulListElm, 'click', (e) => {
            if (e.target.dataset.name === 'addNew') {
                const inputElem = document.createElement('INPUT'),
                    spanElem = document.createElement('SPAN');
                inputElem.type = 'text';
                spanElem.innerHTML = `<i data-spanid='cross-button' class='fal fa-times'></i>`;
                spanElem.setAttribute('data-spanid', 'cross-button');
                Handsontable.dom.empty(e.target);
                e.target.appendChild(inputElem);
                e.target.appendChild(spanElem);
                e.target.focus();
                Handsontable.dom.addEvent(e.target, 'keyup', (event) => {
                    if (event.keyCode === Handsontable.helper.KEY_CODES.ENTER) {
                        const value = e.target.firstChild.value;
                        options[value] = value;
                        Handsontable.dom.empty(self.ulListElm);
                        Handsontable.dom.fastInnerHTML(self.ulListElm, getTemplateString(options, self.currentCellValue));
                    }
                });
            }
            if (e.target.dataset.spanid === 'cross-button') {
                if (e.target.tagName === 'I' && e.target.parentElement && e.target.parentElement.parentElement) {
                    e.target.parentElement.parentElement.innerText = 'Add New Option';
                }
                if(e.target.tagName === 'SPAN' && e.target.parentElement) {
                    e.target.parentElement.innerText = 'Add New Option';
                }
            }
        });
    },
     /**
     * @description - Function will preapre the options parameter [make it rendered].
     * @param - none.
     */
    prepareOptionsFunc = function (optionsToPrepare) {
        let preparedOptions = {};
        if (Array.isArray(optionsToPrepare)) {
            for (let i = 0, len = optionsToPrepare.length; i < len; i += 1) {
            preparedOptions[optionsToPrepare[i]] = optionsToPrepare[i];
            }
        } else if (typeof optionsToPrepare === 'object') {
            preparedOptions = optionsToPrepare;
        }
        return preparedOptions;
    },
    /**
     * @description - get the values from the custom editor that we have defined.
     * @param - none.
     */
    getValueFunc = function () {
        const listElem = this.ulListElm.getElementsByTagName('input'),
            values = [];
        Object.keys(listElem).forEach((key) => {
            if (listElem[key].checked) values.push(listElem[key].value);
        });
        return values.length ? values.join(',').toString() : '';
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
        const width = Handsontable.dom.outerWidth(this.TD),
            editorHeight = this.ulListElm.getHeight(),
            offset = this.TD.getBoundingClientRect(),
            cellInstnaceHeight = Handsontable.dom.outerHeight(this.TD),
            flipNeeded = commonUtility.isFlipNeeded(this.TD, this.instance.view.wt.wtTable.TABLE, this.instance.view.wt.wtTable.THEAD, editorHeight);
        // sets select dimensions to match cell size
        this.ulListElmStyle.height = 'auto';
        this.ulListElmStyle.minWidth = `${width}px`;
        this.ulListElmStyle.margin = '0px';
        this.ulListElmStyle.padding = '5px';
        this.ulListElmStyle.backgroundColor = '#fff';
        if (flipNeeded) {
            this.ulListElmStyle.top = `${this.instance.rootWindow.pageYOffset + offset.top - editorHeight - 5}px`;
            this.ulListElmStyle.left = `${this.instance.rootWindow.pageXOffset + offset.left}px`;
        } else {
            this.ulListElmStyle.top = `${this.instance.rootWindow.pageYOffset + offset.top + cellInstnaceHeight}px`;
            this.ulListElmStyle.left = `${this.instance.rootWindow.pageXOffset + offset.left}px`;
        }
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
        // this.ulListElm.focus();
        this.instance.listen();
    },
    /**
     * @description - custom renderer function for our cell. you can build your OWN UI.
     * @param - none.
     */
    customRendererFunc = function (hotInstance, td, row, column, prop, value = '') {
        Handsontable.renderers.BaseRenderer.apply(this, arguments);
        Handsontable.dom.fastInnerHTML(td, `<div>${value ? value : ''}</div>`);
    },

    addCheckboxEditor = function () {
        const checkBoxCustomEditor = Handsontable.editors.BaseEditor.prototype.extend();
        checkBoxCustomEditor.prototype.init = initFunc;
        checkBoxCustomEditor.prototype.saveValue = saveValueFunc;
        checkBoxCustomEditor.prototype.prepare = prepareFunc;
        checkBoxCustomEditor.prototype.prepareOptions = prepareOptionsFunc;
        checkBoxCustomEditor.prototype.getValue = getValueFunc;
        checkBoxCustomEditor.prototype.setValue = setValueFunc;
        checkBoxCustomEditor.prototype.open = openFunc;
        checkBoxCustomEditor.prototype.close = closeFunc;
        checkBoxCustomEditor.prototype.focus = focusFunc;

        // @description - Register an editor for your custom renderer.
        Handsontable.editors.registerEditor('ma.checkBoxCustomEditor', checkBoxCustomEditor);

        // @description - Register an alias for your custom renderer.
        Handsontable.renderers.registerRenderer('ma.checkBoxRenderer', customRendererFunc);

        /**
         * @description -  Register an alias for our cell.
         * @param  - none.
         * @provide - you can provide editor, rendrer and validator that you have defined for the cell.
         */
        Handsontable.cellTypes.registerCellType('ma.checkBoxCell', {
            editor: checkBoxCustomEditor,
            renderer: customRendererFunc,
            // You can add additional options to the cell type based on Handsontable settings
            className: 'checkBox',
            allowInvalid: false,
        });
    };

    return {
        init,
    };
};

export default CustomCheckBoxEditor;
