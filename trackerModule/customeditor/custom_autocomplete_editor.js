/* eslint prefer-rest-params: 0 */
/* eslint no-param-reassign: 0 */
import commonUtility from '../commonUtility/commonUtility';

/**
 * @description - Custom editor for Rich text box editor.
 * @param - none.
 */
const CustomAutoCompleteEditor = () => {
    /**
     * @description - intialize the custom editor.
     * @param - none.
     */
    const init = () => {
		addAutoCompleteEditor();
	},
    /**
     * @description - Intialize the editor. init method
     * @param - none.
     */
    initFunc = function () {
        // create a node.
        const elem = document.getElementById('customAutoCompleteEditor');
        if (elem) elem.remove();
        this.wrapperDiv = this.instance.rootDocument.createElement('div');
        this.wrapperDiv.setAttribute('id', 'customAutoCompleteEditor');
        this.wrapperDivStyle = this.wrapperDiv.style;
        this.wrapperDivStyle.position = 'absolute';
        this.wrapperDivStyle.width = '250px';
        this.wrapperDivStyle.zIndex = 9999;
        this.wrapperDiv.style.display = 'none';
        this.autoCompleteChoices = [];
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
        Handsontable.dom.empty(this.wrapperDiv); // clear DOM.
        this.selectElem = this.instance.rootDocument.createElement('select');
        this.selectElem.setAttribute('multiple', 'multiple');
        Handsontable.dom.addClass(this.selectElem, 'customSelectBoxEditor');
        this.wrapperDiv.appendChild(this.selectElem);
        const uniqId = `editor_${new Date().getTime()}`;
        td.id = uniqId;
        this.wrapperDiv.dataset.relatedTd = uniqId;
    },
    /**
     * @description - get the values from the custom editor that we have defined.
     * @param - none.
     */
    getValueFunc = function () {
        const userIds = jQuery(this.selectElem).val();
        if (this.autoCompleteChoices.length && userIds && userIds.length) {
            let filteredArray = Handsontable.helper.arrayFilter(this.autoCompleteChoices, function (obj) { return userIds.includes(obj.id.toString()); });
            filteredArray = Handsontable.helper.arrayMap(filteredArray, function (obj) { return obj.id + ':' + obj.name });
            filteredArray = filteredArray.length ? filteredArray.join(',') : '';
            return filteredArray;
        }
        return '';
    },
    /**
     * @description - set value to the cell.
     * @param - value - string
     */
    setValueFunc = function () {},

    formatState = function (state) {
        if (isNaN(state.id)) {
            return jQuery(`<span>${state.text}</span>`);
        }
        const $state = jQuery(
            `<span><img height='24' width='24' src='${state.image}'/>${state.name}</span>`
        );
        return $state;
    },

    formatRepoSelection = function (state) {
        return state.name || state.text;
    },

    /**
     * @description - function will help us to display the editor as desire. you can add class and set CSS for the editor instances.
     * @param - none.
     */
    openFunc = function () {
        const offset = this.TD.getBoundingClientRect(),
            editorHeight = this.wrapperDiv.getHeight(),
            cellInstnaceHeight = Handsontable.dom.outerHeight(this.TD),
            SELF = this,
            selectElem = jQuery('.customSelectBoxEditor'),
            flipNeeded = commonUtility.isFlipNeeded(this.TD, this.instance.view.wt.wtTable.TABLE, this.instance.view.wt.wtTable.THEAD, editorHeight);

        if (flipNeeded) {
            this.wrapperDivStyle.top = `${this.instance.rootWindow.pageYOffset + offset.top - editorHeight - 45}px`;
            this.wrapperDivStyle.left = `${this.instance.rootWindow.pageXOffset + offset.left}px`;
        } else {
            this.wrapperDivStyle.top = `${this.instance.rootWindow.pageYOffset + offset.top + cellInstnaceHeight}px`;
            this.wrapperDivStyle.left = `${this.instance.rootWindow.pageXOffset + offset.left}px`;
        }
        this.wrapperDivStyle.height = 'auto';
        // intialize the dropdowns.
        if (selectElem.length > 0){
            selectElem.select2({
                ajax: {
                    url: SELF.cellProperties.url,
                    dataType: 'json',
                    delay: 250,
                    data: function (params) {
                        return {
                            q: params.term, // search query
                            page: params.page,
                        };
                    },
                    processResults: function (data, params) {
                        // Process the result.
                        params.page = params.page || 1;
                        SELF.autoCompleteChoices = Handsontable.helper.deepClone(data);
                        return {
                            results: data,
                            pagination: {
                                more: (params.page * 30) < data.total_count,
                            },
                        };
                    },
                    cache: true,
                },
                placeholder: 'Start typing in a username',
                escapeMarkup: function (markup) { return markup; }, // let our custom formatter work
                minimumInputLength: 1,
                templateResult: formatState,
                templateSelection: formatRepoSelection,
                multiple: true,               
                width: '100%',
                tags: true,
            });
            setTimeout(() => { selectElem.select2('open'); }, 0);
            // utils.grabClassElements('select2-search__field')[0].focus();
            // utils.grabClassElements('select2-search__field')[0].click();
        }
        this.wrapperDiv.style.display = '';
    },
    /**
     * @description - function will call before editor finished editing.
     */
    finishEditingFunc = function () {
        Handsontable.editors.BaseEditor.prototype.finishEditing.apply(this, arguments);
    },
    /**
     * @description - function will help us to  hide the editor instance.
     * @param - none.
     */
    closeFunc = function () {
        const selectElem = jQuery('.customSelectBoxEditor');
        selectElem.select2('destroy');
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
        let templateString = '';
        if (value) {
            value = value.split(',');
            if (Array.isArray(value)) {
                Object.keys(value).forEach((key) => {
                    const spltArray = value[key].split(':');
                    if (spltArray.length === 1) {
                        templateString += `<a>${spltArray[0]}</a> , `;
                    } else {
                        templateString += `<a data-id='${spltArray[0]}'>${spltArray[1]}</a> , `;
                    }
                });
            }
        } else {
            value = templateString;
        }
        Handsontable.dom.empty(td);
        Handsontable.dom.fastInnerHTML(td, templateString);
        td.setAttribute('data-col-id', prop);
        return td;
    },

    addAutoCompleteEditor = function () {
        const autoCompleteCustomEditor = Handsontable.editors.BaseEditor.prototype.extend();
        autoCompleteCustomEditor.prototype.init = initFunc;
        autoCompleteCustomEditor.prototype.saveValue = saveValueFunc;
        autoCompleteCustomEditor.prototype.prepare = prepareFunc;
        autoCompleteCustomEditor.prototype.getValue = getValueFunc;
        autoCompleteCustomEditor.prototype.setValue = setValueFunc;
        autoCompleteCustomEditor.prototype.finishEditing = finishEditingFunc;
        autoCompleteCustomEditor.prototype.open = openFunc;
        autoCompleteCustomEditor.prototype.close = closeFunc;
        autoCompleteCustomEditor.prototype.focus = focusFunc;

        // @description - Register an editor for your custom renderer.
        Handsontable.editors.registerEditor('ma.autoCompleteCustomEditor', autoCompleteCustomEditor);

        // @description - Register an alias for your custom renderer.
        Handsontable.renderers.registerRenderer('ma.autoCompleteCustomRenderer', customRendererFunc);

        /**
         * @description -  Register an alias for our cell.
         * @param  - none.
         * @provide - you can provide editor, rendrer and validator that you have defined for the cell.
         */
        Handsontable.cellTypes.registerCellType('ma.autoCompleteCell', {
            editor: autoCompleteCustomEditor,
            renderer: customRendererFunc,
            // You can add additional options to the cell type based on Handsontable settings
            className: 'autoCompleteCell',
            allowInvalid: true,
            // Or you can add custom properties which will be accessible in `cellProperties`
            // myCustomCellState: 'complete',
        });
    };

    return {
        init,
    };
};

export default CustomAutoCompleteEditor;
