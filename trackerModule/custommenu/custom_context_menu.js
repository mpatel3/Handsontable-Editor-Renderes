/* eslint prefer-rest-params: 0 */
/* eslint no-param-reassign: 0 */
/* eslint dot-notation: 0 */
/* object-shorthand:0 */
import utils from '../../utils';

const customContextMenu = () => {
    /**
     * @description - intialize the custom context menu.
     * @param - describe below.
     * @hoInstance - handsontable instance on which context menu is required.
     * @colHeaders - header values - Array of string.
     * @colInfo - column configuration - Array of objects.
     * @isArchiveView - Is Archive view.
     */
    const createCustomContextMenu = (hotInstance, colHeaders, colInfo, permissions, isArchiveView = false) => {
        const customMenu = {};
        /**
         * define Menu option here.
         * every option have three properties.
         * @name: which will be used to displayed
         * @function hidden - will return when to hide a custom menu option.
         * @function disabled - will return when to disable a custom menu option.
         */
        customMenu['row_above'] = {
            name: '<i class="fal fa-arrow-to-top"></i> Insert Record Above',
            hidden: function () {
              return !permissions.can_add_import;
            },
        };
        customMenu['row_below'] = {
            name: '<i class="fal fa-arrow-to-bottom"></i> Insert Record Below',
            hidden: function () {
              return !permissions.can_add_import;
            },
        };
        customMenu['sep1'] = '---------';
        customMenu['duplicate'] = {
            name: '<i class="fal fa-clone"></i> Duplicate Record',
            hidden: function () {
              return !permissions.can_add_import;
            },
            disabled: function () {
              const selectedRows = this.getSelected();
              if (selectedRows.length > 1) return true;
            },
            callback: function () {
              const rowNumber = this.getSelected()[0][0],
                    selectedData = this.getDataAtRow(rowNumber);
              /**
               * @param 1 - row number to start from
               * @param 2 - column number to start from.
               * @param 3 - data require to be filled.
               * @param 4 - end row
               * @param 5 - end column
               * @param 6 - source - populate method
               * @param 7 - method - shift_down, shift_right, overwrite [ possible values]
               * @param 8 - method - direction - left,right,up and down.
               */
              this.populateFromArray(rowNumber + 1, 1, [selectedData], undefined, undefined, 'edit', 'shift_down', 'down');
            },
        };
        customMenu['expand'] = {
            name: '<i class="fal fa-expand-alt"></i> Expand Record',
            disabled: function () {
              const selectedRows = this.getSelected();
              if (selectedRows.length > 1) return true;
            },
            callback: function () {
              const rowNumber = this.getSelected()[0][0],
                trackerID = utils.grabElement('tracker_id').value,
                trackerViewID = utils.grabElement('tracker_view_id').value,
                rowId = this.getSourceDataAtRow(rowNumber).id; // gives array
              // this.getSourceDataAtRow(0) - gives an object.
              ES6MangoSpring.trackerModule.tracker().initFancybox(`/user/v2/tracker/data/${rowId}/edit?tracker_id=${trackerID}&tracker_view_id=${trackerViewID}`, null, 600);
            },
        };
        customMenu['copyrecord'] = {
            name: '<i class="fal fa-link"></i> Copy Record URL',
        };
        customMenu['lock'] = {
            name: '<i class="fal fa-lock-alt"></i> Lock Record',
            disabled: function () {
              const selectedRows = this.getSelected();
              if (selectedRows.length > 1) return true;
            },
            hidden: function () {
              const rowNumber = this.getSelected()[0][0],
                    rowData = this.getSourceDataAtRow(rowNumber);
              if (rowData.is_locked || !permissions.can_edit_lock_archive) return true;
            },
            callback: function () {
              const rowNumber = this.getSelected()[0][0],
                    rowData = this.getSourceDataAtRow(rowNumber),
                    rowId = rowData.id,
                    trackerId = document.querySelector('input[name="tracker_id"]').value,
                    projectId = document.querySelector('input[name="project_id"]').value,
                    rowHeaders = this.getRowHeader();
              rowHeaders[rowNumber] = `<i class="fa fa-lock-alt"> ${rowHeaders[rowNumber]}`;
              jQuery.ajax({
                url: '/ce/pulse/teams/trackers/data/lock',
                type: 'PUT',
                data: {
                  ids: `${rowId}`,
                  tracker_id: trackerId,
                  project_id: projectId,
                },
                success: () => {
                  rowData.is_locked = true;
                  hotInstance.updateSettings({
                    rowHeaders,
                    cells: (row) => {
                      const cellProperties = {};
                      if (row === rowNumber) {
                        cellProperties.readOnly = true;
                      }
                      return cellProperties;
                    },
                  });
                },
              });
            },
        };
        customMenu['unlock'] = {
            name: '<i class="fal fa-unlock-alt"></i> Unlock Record',
            disabled: function () {
                const selectedRows = this.getSelected();
                if (selectedRows.length > 1) return true;
            },
            hidden: function () {
              const rowNumber = this.getSelected()[0][0],
                    rowData = this.getSourceDataAtRow(rowNumber);
              if (!rowData.is_locked || !permissions.can_edit_lock_archive) return true;
            },
            callback: function () {
              const rowNumber = this.getSelected()[0][0],
                    rowData = this.getSourceDataAtRow(rowNumber),
                    rowId = rowData.id,
                    trackerId = document.querySelector('input[name="tracker_id"]').value,
                    projectId = document.querySelector('input[name="project_id"]').value,
                    rowHeaders = this.getRowHeader();

              rowHeaders[rowNumber] = rowNumber;

              jQuery.ajax({
                url: '/ce/pulse/teams/trackers/data/unlock',
                type: 'PUT',
                data: {
                  ids: `${rowId}`,
                  tracker_id: trackerId,
                  project_id: projectId,
                },
                success: () => {
                  rowData.is_locked = false;
                  hotInstance.updateSettings({
                    rowHeaders,
                    cells: (row) => {
                      const cellProperties = {};
                      if (row === rowNumber) {
                        cellProperties.readOnly = false;
                      }
                      return cellProperties;
                    },
                  });
                },
              });
            },
        };
        customMenu['sep2'] = '---------';
        /* customMenu['col_left'] = {
            name: '<i class="fal fa-arrow-to-left"></i> Insert column left',
            disabled: function () {
              const selectedRows = this.getSelected();
              if (selectedRows.length > 1) return true;
            },
            callback: function () {
              const columnNumber = hotInstance.getSelected()[0][1],
                    columnLength = colInfo.length;
              colInfo.push({});
              colHeaders.push('Untitled');
              utils.reArrangeArray(colInfo, columnLength, columnNumber);
              utils.reArrangeArray(colHeaders, columnLength, columnNumber);
              hotInstance.updateSettings({
                columns: colInfo,
                colHeaders,
              });
            },
        };
        customMenu['col_right'] = {
            name: '<i class="fal fa-arrow-to-right"></i> Insert column Right',
            disabled: function () {
              const selectedRows = this.getSelected();
              if (selectedRows.length > 1) return true;
            },
            callback: function () {
              const columnNumber = hotInstance.getSelected()[0][1],
                    columnLength = colInfo.length;
              colInfo.push({});
              colHeaders.push('Untitled');
              utils.reArrangeArray(colInfo, columnLength, columnNumber + 1);
              utils.reArrangeArray(colHeaders, columnLength, columnNumber + 1);
              hotInstance.updateSettings({
                columns: colInfo,
                colHeaders,
              });
            },
        };
        customMenu['clear_column'] = {
            name: '<i class="fal fa-minus-circle"></i> Clear Column',
        };
        customMenu['remove_col'] = {
            name: '<i class="fal fa-trash-alt"></i> Delete Column',
            disabled: function () {
              // for which cells it should be disabled
            },
            callback: function () {
              const columnNumber = hotInstance.getSelected()[0][1];
              colInfo.splice(columnNumber, 1);
              colHeaders.splice(columnNumber, 1);
              hotInstance.updateSettings({
                columns: colInfo,
                colHeaders,
              });
            },
        };
        // creating a separator.
        customMenu['sep3'] = '---------'; */
        // If Archive view.
        if (!isArchiveView) {
            customMenu['archive'] = {
                name: '<i class="fal fa-archive"></i> Archive Record',
                hidden: function () {
                  return !permissions.can_edit_lock_archive;
                },
                disabled: function () {
                  const rowNumber = this.getSelected()[0][0];
                  return this.getSourceDataAtRow(rowNumber).is_locked;
                },
                callback: function () {
                  const rowNumber = this.getSelected()[0][0],
                        rowId = this.getSourceDataAtRow(rowNumber).id,
                        trackerId = document.querySelector('input[name="tracker_id"]').value;

                  jQuery.ajax({
                    url: '/user/v2/tracker/data/archive',
                    type: 'PUT',
                    data: {
                      ids: `${rowId}`,
                      tracker_id: trackerId,
                      v2: true,
                    },
                    success: (response) => {
                      if (response.archive_view_id) {
                        const options = {},
                              viewSelect = document.getElementById('view'),
                              selectedValue = viewSelect.value;
                        viewSelect.options.forEach((ele) => { options[ele.value] = ele.innerText; });
                        options[response.archive_view_id] = response.archive_view_name;
                        while (viewSelect.firstChild) viewSelect.removeChild(viewSelect.firstChild);
                        Object.keys(options).each((key) => {
                          viewSelect.options[viewSelect.options.length] = new Option(options[key], key);
                        });
                        viewSelect.value = selectedValue;
                        hotInstance.alter('remove_row', rowNumber);
                        jQuery('#notice').html('Row archived successfully.').show();
                        hideNotice('#notice');
                      }
                    },
                  });
                },
            };
        }

        if (isArchiveView) {
          customMenu['unarchive'] = {
            name: '<i class="fal fa-archive"></i> Unarchive Record',
            hidden: function () {
              return !permissions.can_edit_lock_archive;
            },
            disabled: function () {
              const rowNumber = this.getSelected()[0][0];
              return this.getSourceDataAtRow(rowNumber).is_locked;
            },
            callback: function () {
              const rowNumber = this.getSelected()[0][0],
                    rowId = this.getSourceDataAtRow(rowNumber).id,
                    trackerId = document.querySelector('input[name="tracker_id"]').value,
                    projectId = document.querySelector('input[name="project_id"]').value;

              jQuery.ajax({
                url: '/ce/pulse/teams/trackers/data/unarchive',
                type: 'PUT',
                data: {
                  ids: `${rowId}`,
                  tracker_id: trackerId,
                  project_id: projectId,
                },
                success: (response) => {
                  hotInstance.alter('remove_row', rowNumber);
                  jQuery('#notice').html('Row unarchived successfully.').show();
                  hideNotice('#notice');
                },
              });
            },

          };
        }
        customMenu['remove_row'] = {
            name: '<i class="fal fa-trash-alt"></i> Delete Record',
            hidden: function () {
              return !permissions.can_delete;
            },
            disabled: function () {
              const rowNumber = this.getSelected()[0][0];
              return this.getSourceDataAtRow(rowNumber).is_locked;
            },
            callback: function() {
              const rowNumber = this.getSelected()[0][0],
                rowData = this.getSourceDataAtRow(rowNumber),
                rowId = rowData.id,
                trackerId = document.querySelector('input[name="tracker_id"]').value,
                projectId = document.querySelector('input[name="project_id"]').value;
              jQuery.ajax({
                url: '/ce/pulse/teams/trackers/data/delete_all',
                type: 'DELETE',
                data: {
                  id: [rowId],
                  tracker_id: trackerId,
                  project_id: projectId
                },
                success: (response) => {
                  hotInstance.alter('remove_row', rowNumber);
                  jQuery('#notice').html('Row deleted successfully.').show();
                  hideNotice('#notice');
                },
              });
            }
        };
        return customMenu;
    };

    return {
        createCustomContextMenu,
    };
};
export default customContextMenu;
