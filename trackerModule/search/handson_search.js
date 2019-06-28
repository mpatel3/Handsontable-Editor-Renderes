import utils from '../../utils';

/* eslint no-param-reassign: 0 */
const customSearchModule = (searchElemRef, hotInstance) => {
    let hiddenRowArray = [];
    const [hiddenRowPlugin, searchPlugin] = [hotInstance.getPlugin('hiddenRows'), hotInstance.getPlugin('search')],
        searchQueryMethod = (query, value) => {
            if (Handsontable.helper.isUndefined(query) || query === null || !query.toLowerCase || query.length === 0) return false;
            if (Handsontable.helper.isUndefined(value) || value === null) return false;
            return value.toString().toLowerCase().indexOf(query.toLowerCase()) !== -1;
        },
        searchResultCallBack = (instance, row, col, data, testResult) => {
            // const DEFAULT_CALLBACK = function(instance, row, col, data, testResult) {
            //     instance.getCellMeta(row, col).isSearchResult = testResult;
            // };
            // DEFAULT_CALLBACK.apply(this, arguments);
        },
        /**
         * @description - Debounce the search function for performance measures.
         * @param {value} String - search Term
         */
        debounceSearchFn = Handsontable.helper.debounce((value) => {
            // Register
            // searchPlugin.setQueryMethod(searchQueryMethod);
            // searchPlugin.setCallback(searchResultCallBack);
            // show
            hiddenRowPlugin.showRows(hiddenRowArray);
            hotInstance.render();
            hiddenRowArray = [];
            const queryResult = searchPlugin.query(value);
            let j = 0;
            // Empty value.
            if (value === '') {
                hiddenRowPlugin.showRows(hiddenRowArray);
                hotInstance.render();
                return;
            }
            for (let i = 1; i <= hotInstance.countRows(); i += 1) {
                if (j < queryResult.length && i !== (queryResult[j]['row'] + 1)) {
                    hiddenRowArray.push(i - 1);
                } else if (j >= queryResult.length) {
                    hiddenRowArray.push(i - 1);
                } else {
                    j += 1;
                }
            }
            hiddenRowPlugin.hideRows(hiddenRowArray);
            hotInstance.render();
        }, 500),
        /**
         * @description - Bind Search event on an element with key up event.
         */
        bindSearchEvent = () => {
            const searchElem = utils.grabClassElements(searchElemRef);
            if (searchElem[0] !== undefined) {
                Handsontable.dom.addEvent(searchElem[0], 'keyup', function () {
                    debounceSearchFn(this.value);
                });
            }
        };

    return {
        bindSearchEvent,
    };
};

export default customSearchModule;
