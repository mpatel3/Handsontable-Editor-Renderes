/* eslint prefer-rest-params: 0 */
/* eslint no-param-reassign: 0 */
/**
 * @description - Custom editor for Rich text box editor.
 * @param - none.
 */
const CustomRichTextBoxEditor = () => {
    /**
     * @description - intialize the custom editor.
     * @param - none.
     */
    const init = () => {
		addRichTextBoxEditor();
	},
    /**
     * @description - Intialize the editor. init method
     * @param - none.
     */
    initFunc = function () {
        // create a node.
        this.wrapperDiv = this.instance.rootDocument.createElement('div');
        this.wrapperDiv.setAttribute('id', `customRichTextBoxEditor_${new Date().getTime()}`);
        this.wrapperDivStyle = this.wrapperDiv.style;
        this.wrapperDivStyle.position = 'absolute';
        this.wrapperDivStyle.boxShadow = '-1px 2px 5px 3px rgba(224,224,224,1)';
        this.wrapperDivStyle.padding = '0';
        this.wrapperDivStyle.top = 0;
        this.wrapperDivStyle.left = 0;
        this.wrapperDivStyle.zIndex = 9999;
        this.wrapperDiv.style.display = 'none';
        // Attach node to DOM, by appending it to the container holding the table
        this.instance.rootDocument.body.appendChild(this.wrapperDiv);
        const eventManager = new Handsontable.EventManager(this);
        eventManager.addEventListener(this.wrapperDiv, 'mousedown', event => Handsontable.dom.stopPropagation(event));
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
    prepareFunc = function (row, col, prop, td) {
        Handsontable.editors.BaseEditor.prototype.prepare.apply(this, arguments);
        const htmlContent = td.querySelector('.htmlEditContent').innerHTML,
                uniqId = `editor_${new Date().getTime()}`;
        Handsontable.dom.empty(this.wrapperDiv); // clear DOM.
        this.textarea = document.createElement('textarea');
        td.id = uniqId;
        this.textarea.rows = '10';
        this.textarea.value = htmlContent;
        this.textarea.style.width = '97%';
        this.textarea.style.height = '96%';
        this.textarea.style.border = 'none';
        this.textarea.id = 'tracker-rich-text-editor';
        this.textarea.dataset.configuration = '{"editor_config":{}}';
        this.wrapperDiv.appendChild(this.textarea);
        Handsontable.dom.addClass(this.wrapperDiv, 'htmlEditorWrapper');
        this.wrapperDiv.dataset.relatedTd = uniqId;
    },
    /**
     * @description - get the values from the custom editor that we have defined.
     * @param - none.
     */
    getValueFunc = function () {
        const htmlContent = CKEDITOR.instances[this.textarea.id].getData();
        return htmlContent ? htmlContent : '';
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
        const [options, offset] = [{
            toolbar: 'Minimalistic',
            height: '316px',
            width: '400px',
            scayt_maxSuggestions: 3,
            scayt_autoStartup: false,
            startupFocus: true,
        }, this.TD.getBoundingClientRect()];
        this.wrapperDivStyle.top = `${this.instance.rootWindow.pageYOffset + offset.top + Handsontable.dom.outerHeight(this.TD)}px`;
        this.wrapperDivStyle.left = `${this.instance.rootWindow.pageXOffset + offset.left}px`;
        this.wrapperDivStyle.height = 'auto';
        // Intranet.prototype.initEditor(jQuery(this.textarea), 'Minimalistic');
        CKEDITOR.replace(this.textarea.id, options);
        this.wrapperDiv.style.display = '';
    },
    /**
     * @description - function will help us to  hide the editor instance.
     * @param - none.
     */
    closeFunc = function () {
        this.wrapperDiv.style.display = 'none';
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
        const el = document.createElement('div');
        Handsontable.dom.fastInnerHTML(el, value ? value: '');
        const tmplateString = `<div><a class="htmlEditExpand right"><i class="fas fa-expand" aria-hidden="true"></i></a><div class="htmlEditContent">${el.innerText}</div></div>`;
        Handsontable.dom.empty(td);
        Handsontable.dom.fastInnerHTML(td, tmplateString);
        td.setAttribute('data-col-id', prop);
        return td;
    },

    addRichTextBoxEditor = function () {
        const richTextBoxCustomEditor = Handsontable.editors.BaseEditor.prototype.extend();
        richTextBoxCustomEditor.prototype.init = initFunc;
        richTextBoxCustomEditor.prototype.saveValue = saveValueFunc;
        richTextBoxCustomEditor.prototype.prepare = prepareFunc;
        richTextBoxCustomEditor.prototype.getValue = getValueFunc;
        richTextBoxCustomEditor.prototype.setValue = setValueFunc;
        richTextBoxCustomEditor.prototype.open = openFunc;
        richTextBoxCustomEditor.prototype.close = closeFunc;
        richTextBoxCustomEditor.prototype.focus = focusFunc;

        // @description - Register an editor for your custom renderer.
        Handsontable.editors.registerEditor('ma.richTextBoxCustomEditor', richTextBoxCustomEditor);

        // @description - Register an alias for your custom renderer.
        Handsontable.renderers.registerRenderer('ma.richTextBoxCustomRenderer', customRendererFunc);

        /**
         * @description -  Register an alias for our cell.
         * @param  - none.
         * @provide - you can provide editor, rendrer and validator that you have defined for the cell.
         */
        Handsontable.cellTypes.registerCellType('ma.richTextBoxCell', {
            editor: richTextBoxCustomEditor,
            renderer: customRendererFunc,
            // You can add additional options to the cell type based on Handsontable settings
            className: 'richTextBoxCell',
            allowInvalid: true,
            // Or you can add custom properties which will be accessible in `cellProperties`
            // myCustomCellState: 'complete',
        });
    };

    return {
        init,
    };
};

export default CustomRichTextBoxEditor;
