/* eslint prefer-rest-params: 0 */
/* eslint no-param-reassign: 0 */
import customContextMenu from './custommenu/custom_context_menu';
import customDropDownMenu from './custommenu/custom_dropdown_menu';
import utils from '../utils';

const handsonModule = () => {
	const init = (colHeaders, colInfo, data, projectId, trackerId,trackerContainerRef, isWidget, searchElemRef) => {
    isWidget = JSON.parse(isWidget);
    colInfo.map((ele) => {
      if (ele.type === 'autocomplete') {
        ele.renderer = 'autocomplete';
        ele.allowHtml = true;
        ele.editor = 'ma.AutoCompleteEditor';
        ele.source = function (query, process) {
                      jQuery.ajax({
                        url: '/custom_user_autocomplete',
                        dataType: 'json',
                        data: { q: query, },
                        success: (response) => {
                          process(response.map(obj => `<span class='hide hot-ma-autocomplete'>${obj.id}:</span><span>${obj.name}</span>`));
                        },
                      });
                  };
      }
    });
    console.info(data);
		container = document.getElementById(trackerContainerRef);
    if(!window.HANDSONTABLEINSTANCES) {
      window.HANDSONTABLEINSTANCES = {};
    }
    window.HANDSONTABLEINSTANCES[trackerContainerRef] = new Handsontable(container, {
      data,
      colHeaders,
      columns: colInfo,
      rowHeaders: getRowHeaderValues.bind(null,data),
      filters: true,
      manualColumnResize: false,
      manualRowResize: false,
      currentRowClassName: 'currentRow',
      currentColClassName: 'currentCol',
      search: true,
      hiddenColumns: true,
      autoWrapRow: true,
      width: '100%',
      height: '78vh',
      licenseKey: 'non-commercial-and-evaluation',
      cells: function (row, column, prop) {
        const rowData = this.instance.getSourceDataAtRow(row),
              cellProperties = {};
        if (Handsontable.helper.isObject(rowData) && rowData.is_locked) cellProperties.readOnly = true;
        return cellProperties;
      },
      afterChange: (changes) => {
        if (changes !== null) {
          const changedElements = {};
          let datarowId,
              updatedAt;

          changes.forEach(([row, columnId, , newValue]) => {
            [datarowId, updatedAt] = (document.getElementsByClassName('htDimmed').filter((ele, index) => index === row)[0]).innerHTML.split(',');
            if (changedElements[datarowId] === undefined) changedElements[datarowId] = {};
            changedElements[datarowId]['DT_updated'] = updatedAt;

            if (typeof (newValue) !== 'number' && newValue.indexOf('hot-ma-autocomplete') !== -1) {
              changedElements[datarowId][columnId] = ES6MangoSpring.trackerModule.tracker().extractTextFromHTMLString(newValue);
            } else {
              changedElements[datarowId][columnId] = newValue;
            }
          });

          jQuery.ajax({
            url: '/user/v2/tracker/data/bulk_update',
            type: 'PUT',
            data: { project_id: projectId, changedElements, tracker_id: trackerId, },
            success: (response) => {
              utils.log('response', response);
            },
          });
        }
      },
      afterSelection: () => {},
      beforeOnCellMouseUp: function (event, coords, td) {
        /* if columnHeader/rowHeader is clicked - ignore
        if user double clicks - ignore.
        if user clicks on apart from I tag - ignore. */
        if ((coords.row < 0 || coords.col < 0) || event.detail === 2 || event.target.tagName !== 'I' || this.getSourceDataAtRow(coords.row).is_locked) {
          return;
        }
        const activeEditor = this.getActiveEditor();
        // Select the cell that we want to edit.
        this.selectCell(coords.row, coords.col);
        activeEditor.beginEditing();
      },
    });
    // Hide on widgets.
    if(!isWidget) {
      // Create Context Menu for handsontable.
      window.HANDSONTABLEINSTANCES[trackerContainerRef].updateSettings({
        contextMenu: {
          items: customContextMenu().createCustomContextMenu(window.HANDSONTABLEINSTANCES[trackerContainerRef], colHeaders, colInfo),
        },
        dropdownMenu: {
          items: customDropDownMenu().createCustomDropDownMenu(window.HANDSONTABLEINSTANCES[trackerContainerRef], colHeaders, colInfo),
        },
      });  
    }
    bindSearchEvent(searchElemRef, window.HANDSONTABLEINSTANCES[trackerContainerRef]);
  },

  getRowHeaderValues = function (data,index) {
    if(data[index].is_locked) {
      return `<i class="fa fa-lock-alt"> ${index}`;
    } else {
      return index;
    }
  },

  bindSearchEvent = (searchElemRef, hotInstance) => {
    const searchElem = utils.grabClassElements(searchElemRef);
    if (searchElem[0] !== undefined) {
      Handsontable.dom.addEvent(searchElem[0], 'keyup', function () {
        const search = hotInstance.getPlugin('search');
        search.query(this.value);
        hotInstance.render();
      });
    }
  };

	return {
		init,
	};
};

export default handsonModule;
