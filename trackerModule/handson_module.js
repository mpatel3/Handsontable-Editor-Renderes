/* eslint prefer-rest-params: 0 */
/* eslint no-param-reassign: 0 */
import customContextMenu from './custommenu/custom_context_menu';
import customDropDownMenu from './custommenu/custom_dropdown_menu';
import utils from '../utils';
import customPagiNationModule from './pagination/handson_pagination';
import customSearchModule from './search/handson_search';

const handsonModule = () => {
	const init = (colHeaders, colInfo, data, projectId, trackerId, trackerViewId, trackerContainerRef, isWidget, searchElemRef, permissions, isArchiveView) => {
    isWidget = JSON.parse(isWidget);
    // Widgets are Read only.
    if (isWidget && colInfo && Array.isArray(colInfo)) {
      Handsontable.helper.arrayEach(colInfo, (obj) => { obj.editor = false; });
    }
    // Get reference.
    container = document.getElementById(trackerContainerRef);
    // Create instancs on single object.
    if (!window.HANDSONTABLEINSTANCES) {
      window.HANDSONTABLEINSTANCES = {};
    }
    // Intialize hansontable instance.
    window.HANDSONTABLEINSTANCES[trackerContainerRef] = new Handsontable(container, {
      data,
      colHeaders,
      columns: colInfo,
      rowHeaders: getRowHeaderValues.bind(null, data),
      filters: true,
      manualColumnResize: false,
      manualRowResize: false,
      currentRowClassName: 'currentRow',
      currentColClassName: 'currentCol',
      search: true,
      hiddenColumns: true,
      hiddenRows: {
        copyPasteEnabled: true,
        indicators: true,
      },
      autoWrapRow: true,
      minRows: 3,
      width: '100%',
      stretchH: 'all',
      height: isWidget ? '280px' : '78vh',
      licenseKey: 'non-commercial-and-evaluation',
      cells: function (row) {
        // if(isWidget) return; // Return in case it's a widget.
        const [cellProperties, rowData] = [{}, this.instance.getSourceDataAtRow(row)];

        if (Handsontable.helper.isObject(rowData) && rowData.is_locked) {
          cellProperties.readOnly = true;
        } else {
          if (!permissions.is_team_member) {
            if (permissions.edit_scope === 'D') {
              cellProperties.readOnly = true;
            } else if (permissions.edit_scope === 'M') {
              if (Handsontable.helper.isObject(rowData) && rowData.user_id !== permissions.user_id) cellProperties.readOnly = true;
            }
          }
        }

        return cellProperties;
      },
      afterChange: function (changes) {
        if (changes !== null) {
          const changedElements = { newRec: {}, updatedRec: {}, };
          let datarowId,
              updatedAt,
              ele;

          window.selectedRowsData = [];

          changes.forEach(([row, columnId, , newValue], index) => {
            const rowData = this.getSourceDataAtRow(row);
            [datarowId, updatedAt] = [rowData.id, rowData.updated_at];
            window.selectedRowsData.push(rowData);

            if (datarowId === null || datarowId === undefined) {
              ele = changedElements['newRec'][index];
            } else {
              ele = changedElements['updatedRec'][datarowId];
            }

            if (ele === undefined) ele = {};
            ele['DT_updated'] = updatedAt;

            if (typeof (newValue) !== 'number' && newValue.indexOf('hot-ma-autocomplete') !== -1) {
              ele[columnId.gsub('data.', '')] = ES6MangoSpring.trackerModule.tracker().extractTextFromHTMLString(newValue);
            } else {
              ele[columnId.gsub('data.', '')] = newValue;
            }

            if (datarowId === null || datarowId === undefined) {
              changedElements['newRec'][index] = ele;
            } else {
              changedElements['updatedRec'][datarowId] = ele;
            }
          });

          jQuery.ajax({
            url: '/user/v2/tracker/data/bulk_update',
            type: 'PUT',
            data: { project_id: projectId, changedElements, tracker_id: trackerId, tracker_view_id: trackerViewId },
            success: (response) => {
              window.selectedRowsData.each((rowData) => { rowData.updated_at = response.data[rowData.id]; });
              window.selectedRowsData = null;
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
        activeEditor && activeEditor.beginEditing();
      },
    });
    // Hide on widgets.
    if (!isWidget) {
      // Create Context Menu for handsontable.
      window.HANDSONTABLEINSTANCES[trackerContainerRef].updateSettings({
        contextMenu: {
          items: customContextMenu().createCustomContextMenu(window.HANDSONTABLEINSTANCES[trackerContainerRef], colHeaders, colInfo, permissions, isArchiveView),
        },
        dropdownMenu: {
          items: customDropDownMenu().createCustomDropDownMenu(window.HANDSONTABLEINSTANCES[trackerContainerRef], colHeaders, colInfo, permissions, isArchiveView),
        },
      });
    }
    customSearchModule(searchElemRef, window.HANDSONTABLEINSTANCES[trackerContainerRef]).bindSearchEvent();
    // customPagiNationModule(trackerContainerRef,15);
  },

  getRowHeaderValues = function (data, index) {
    if (data[index].is_locked) {
      return `<i class="fa fa-lock-alt"> ${index}`;
    }
    return index;
  };

	return {
		init,
	};
};

export default handsonModule;
