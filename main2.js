(function (window,Handsontable) {
    const privatePool = new WeakMap();
    window.customAutoCompleteEditor = Handsontable.editors.HandsontableEditor.prototype.extend();
    customAutoCompleteEditor.prototype.init = function() {
        Handsontable.editors.HandsontableEditor.prototype.init.apply(this, arguments);
        this.query = null;
        this.strippedChoices = [];
        this.rawChoices = [];

        privatePool.set(this, {
            skipOne: false,
        });
    }
    
    customAutoCompleteEditor.prototype.prepare  = function(row,col,prop,td,cellProperties) {
        console.info(this,'prepare');
        Handsontable.editors.HandsontableEditor.prototype.prepare.apply(this, arguments);
    }
    
    customAutoCompleteEditor.prototype.createElements  = function(row,col,prop,td,cellProperties) {
        Handsontable.editors.HandsontableEditor.prototype.createElements.apply(this, arguments);
        // addClass(this.htContainer, 'autocompleteEditor');
        // addClass(this.htContainer, this.hot.rootWindow.navigator.platform.indexOf('Mac') === -1 ? '' : 'htMacScroll');
    }

    customAutoCompleteEditor.prototype.beginEditing = function() {
        console.info(this,'beginEditing');
        Handsontable.editors.HandsontableEditor.prototype.beginEditing.apply(this, arguments);
    }
    
    customAutoCompleteEditor.prototype.finishEditing = function() {
        console.info(this,'finishEditing');
        Handsontable.editors.HandsontableEditor.prototype.finishEditing.apply(this, arguments);
    }
    
    customAutoCompleteEditor.prototype.saveValue = function() {
        console.info(this,'saveValue');
        Handsontable.editors.HandsontableEditor.prototype.saveValue.apply(this, arguments);
    }
    
    customAutoCompleteEditor.prototype.getValue = function() {
        console.info(this,'getValue');
    }
    
    customAutoCompleteEditor.prototype.setValue = function() {
        console.info(this,'setValue');
    }
    
    customAutoCompleteEditor.prototype.open = function() {
        Handsontable.editors.HandsontableEditor.prototype.open.apply(this, arguments);
        console.info(this,'open');
        const priv = privatePool.get(this);

        // this.addHook('beforeKeyDown', event => this.onBeforeKeyDown(event));
        // Ugly fix for handsontable which grab window object for autocomplete scroll listener instead table element.
        this.TEXTAREA_PARENT.style.overflow = 'auto';
        // super.open();
        this.TEXTAREA_PARENT.style.overflow = '';
    
        const choicesListHot = this.htEditor.getInstance();
        const trimDropdown = this.cellProperties.trimDropdown === void 0 ? true : this.cellProperties.trimDropdown;
    
        this.showEditableElement();
        this.focus();
    
        const scrollbarWidth = Handsontable.dom.getScrollbarWidth(this.instance.rootDocument);
    
        choicesListHot.updateSettings({
          colWidths: trimDropdown ? [Handsontable.dom.outerWidth(this.TEXTAREA) - 2] : void 0,
          width: trimDropdown ? Handsontable.dom.outerWidth(this.TEXTAREA) + scrollbarWidth + 2 : void 0,
          afterRenderer: (TD, row, col, prop, value) => {
            const { filteringCaseSensitive, allowHtml } = this.cellProperties;
            const query = this.query;
            console.info(query);
            debugger;
            let cellValue = Handsontable.helper.stringify(value);
            let indexOfMatch;
            let match;
    
            if (cellValue && !allowHtml) {
              indexOfMatch = filteringCaseSensitive === true ? cellValue.indexOf(query) : cellValue.toLowerCase().indexOf(query.toLowerCase());
    
              if (indexOfMatch !== -1) {
                match = cellValue.substr(indexOfMatch, query.length);
                cellValue = cellValue.replace(match, `<strong>${match}</strong>`);
              }
            }
    
            TD.innerHTML = cellValue;
          },
          autoColumnSize: true,
          modifyColWidth(width, col) {
            // workaround for <strong> text overlapping the dropdown, not really accurate
            const autoColumnSize = this.getPlugin('autoColumnSize');
            let columnWidth = width;
    
            if (autoColumnSize) {
              const autoWidths = autoColumnSize.widths;
    
              if (autoWidths[col]) {
                columnWidth = autoWidths[col];
              }
            }
    
            return trimDropdown ? columnWidth : columnWidth + 15;
          }
        });
    
        // Add additional space for autocomplete holder
        this.htEditor.view.wt.wtTable.holder.parentNode.style['padding-right'] = `${scrollbarWidth + 2}px`;
    
        if (priv.skipOne) {
          priv.skipOne = false;
        }
    
        this.instance._registerTimeout(() => {
          this.queryChoices(this.TEXTAREA.value);
        });
    };

    customAutoCompleteEditor.prototype.queryChoices = function(query) {
        const source = this.cellProperties.source;
        console.info(source);
        this.query = query;

        if (typeof source === 'function') {
        source.call(this.cellProperties, query, (choices) => {
            debugger;
            choices = Handsontable.helper.arrayMap(choices, choice => choice.phoneNumber);
            this.rawChoices = choices;
            this.updateChoicesList(this.stripValuesIfNeeded(choices));
        });

        } else if (Array.isArray(source)) {
        this.rawChoices = source;
        // this.updateChoicesList(this.stripValuesIfNeeded(source));

        } else {
            this.updateChoicesList([]);
        }
    };

    customAutoCompleteEditor.prototype.stripValuesIfNeeded =  function(values) {
        const { allowHtml } = this.cellProperties;
    
        const stringifiedValues = Handsontable.helper.arrayMap(values, value => Handsontable.helper.stringify(value));
        const strippedValues = Handsontable.helper.arrayMap(stringifiedValues, value => (allowHtml ? value : Handsontable.helper.stripTags(value)));
    
        return strippedValues;
    }

    customAutoCompleteEditor.prototype.updateChoicesList = function(choicesList) {
        const pos = Handsontable.dom.getCaretPosition(this.TEXTAREA);
        const endPos = Handsontable.dom.getSelectionEndPosition(this.TEXTAREA);
        const sortByRelevanceSetting = this.cellProperties.sortByRelevance;
        const filterSetting = this.cellProperties.filter;
        let orderByRelevance = null;
        let highlightIndex = null;
        let choices = choicesList;

        if (sortByRelevanceSetting) {
        orderByRelevance = customAutoCompleteEditor.sortByRelevance(
            this.stripValueIfNeeded(this.getValue()),
            choices,
            this.cellProperties.filteringCaseSensitive
        );
        }
        const orderByRelevanceLength = Array.isArray(orderByRelevance) ? orderByRelevance.length : 0;

        if (filterSetting === false) {
            if (orderByRelevanceLength) {
                highlightIndex = orderByRelevance[0];
            }
        } else {
        const sorted = [];

        for (let i = 0, choicesCount = choices.length; i < choicesCount; i++) {
            if (sortByRelevanceSetting && orderByRelevanceLength <= i) {
            break;
            }
            if (orderByRelevanceLength) {
            sorted.push(choices[orderByRelevance[i]]);
            } else {
            sorted.push(choices[i]);
            }
        }

        highlightIndex = 0;
        choices = sorted;
        }

        this.strippedChoices = choices;
        console.info(choices);
        console.info([choices]);
        console.info(Handsontable.helper.pivot([choices]));
        this.htEditor.loadData(Handsontable.helper.pivot([choices]));

        // this.updateDropdownHeight();
        // this.flipDropdownIfNeeded();

        if (this.cellProperties.strict === true) {
            // this.highlightBestMatchingChoice(highlightIndex);
        }

        this.instance.listen(false);

        Handsontable.dom.setCaretPosition(this.TEXTAREA, pos, (pos === endPos ? void 0 : endPos));
    };

    customAutoCompleteEditor.prototype.stripValueIfNeeded  = function (value) {
        return this.stripValuesIfNeeded([value])[0];
    };
    
    customAutoCompleteEditor.prototype.close = function() {
        console.info(this,'close');
    };
    
    customAutoCompleteEditor.prototype.focus = function() {
        console.info(this,'focus');
    };
    
    /**
     * Filters and sorts by relevance.
     *
     * @param value
     * @param choices
     * @param caseSensitive
     * @returns {Number[]} array of indexes in original choices array
     */
    customAutoCompleteEditor.sortByRelevance = function(value, choices, caseSensitive) {
        const choicesRelevance = [];
        let currentItem;
        const valueLength = value.length;
        let valueIndex;
        let charsLeft;
        const result = [];
        let i;
        let choicesCount = choices.length;
    
        if (valueLength === 0) {
        for (i = 0; i < choicesCount; i++) {
            result.push(i);
        }
        return result;
        }
    
        for (i = 0; i < choicesCount; i++) {
        currentItem = Handsontable.helper.stripTags(Handsontable.helper.stringify(choices[i]));
    
        if (caseSensitive) {
            valueIndex =currentItem.indexOf(value);
        } else {
            valueIndex = currentItem.toLowerCase().indexOf(value.toLowerCase());
        }
    
        if (valueIndex !== -1) {
            charsLeft = currentItem.length - valueIndex - valueLength;
    
            choicesRelevance.push({
            baseIndex: i,
            index: valueIndex,
            charsLeft,
            value: currentItem
            });
        }
        }
    
        choicesRelevance.sort((a, b) => {
    
        if (b.index === -1) {
            return -1;
        }
        if (a.index === -1) {
            return 1;
        }
    
        if (a.index < b.index) {
            return -1;
        } else if (b.index < a.index) {
            return 1; 
        } else if (a.index === b.index) {
            if (a.charsLeft < b.charsLeft) {
            return -1;
            } else if (a.charsLeft > b.charsLeft) {
            return 1;
            }
        }
    
        return 0;
        });
    
        for (i = 0, choicesCount = choicesRelevance.length; i < choicesCount; i++) {
        result.push(choicesRelevance[i].baseIndex);
        }
    
        return result;
  };
    function Autocomplete2Renderer() {
      Handsontable.renderers.BaseRenderer.apply(this, arguments);
      // Handsontable.dom.fastInnerHTML(td, '<div>'+ 'test' +'</div>');
    }
    
    // Handsontable.renderers.Autocomplete2Renderer = Autocomplete2Renderer;
    // Handsontable.renderers.registerRenderer('customAutoComplete', Autocomplete2Renderer);
    Handsontable.editors.registerEditor('customAutoCompleteEditor', customAutoCompleteEditor);
    console.info(Autocomplete2Renderer);
    Handsontable.renderers.registerRenderer('Autocomplete2Rendsdferer', Autocomplete2Renderer);
    // Autocomplete2Renderer End
    


})(window,Handsontable);
