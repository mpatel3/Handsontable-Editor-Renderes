/* eslint prefer-rest-params: 0 */
/* eslint no-param-reassign: 0 */
/* eslint dot-notation: 0 */
import utils from '../../utils';

const customDropDownMenu = () => {
    /**
     * @description - intialize the custom dropdown menu.
     * @param - describe below.
     * @hoInstance - handsontable instance on which dropdown menu is required.
     * @colHeaders - header values - Array of string.
     * @colInfo - column configuration - Array of objects.
     * @isArchiveView - Is Archive view.
     */
    const createCustomDropDownMenu = (hotInstance, colHeaders, colInfo, isArchiveView = false) => {
        const dropDownMenu = {};
        dropDownMenu['customize'] = {
            name: '<i class="far fa-users-cog"></i> Customize Column',
            disable: {},
            callback: function (key, selection) {
              const colNumber = selection[0].end.col,
                    colId = this.getCellMeta(0, colNumber).prop,
                    trackerId = document.querySelector('input[name="tracker_id"]').value,
                    url = `/user/v2/tracker/tracker_columns/${colId}/edit?tracker_id=${trackerId}`,
                    content = '<div id="initTrackerColumnFormWrpp"></div>';

              jQuery.ajax({
                url,
                type: 'get',
                dataType: 'JSON',
                success: function (response) {
                  ES6MangoSpring.trackerModule.tracker().initFancybox(null, content, 650, () => {
                    amplify.publish('initTrackerColumnForm', JSON.parse(response.data));
                  });
                },
                error: function (err) { utils.log(err); },
              });
            },
        };
        dropDownMenu['col_left'] = {
            name: '<i class="fal fa-arrow-to-left"></i> Insert column left',
            disabled: function () {
              const selectedRows = this.getSelected();
              if (selectedRows.length > 1) return true;
            },
            callback: function () {
              const content = '<div id="initTrackerColumnFormWrpp"></div>',
                    data = {
                            data_type: 'S',
                            values: 'Choice1___Choice2',
                            visibility: 'E',
                            metaInfo: {
                              label: 'Insert Column Left',
                              position: (hotInstance.getSelected()[0][1] - 1),
                            },
                          };
              ES6MangoSpring.trackerModule.tracker().initFancybox(null, content, 650, () => {
                amplify.publish('initTrackerColumnForm', data);
              });
              // const columnNumber = hotInstance.getSelected()[0][1],
              //       columnLength = colInfo.length;
              // colInfo.push({});
              // colHeaders.push('Untitled');
              // utils.reArrangeArray(colInfo, columnLength, columnNumber);
              // utils.reArrangeArray(colHeaders, columnLength, columnNumber);
              // hotInstance.updateSettings({
              //   columns: colInfo,
              //   colHeaders,
              // });
            },
        };
        dropDownMenu['col_right'] = {
            name: '<i class="fal fa-arrow-to-right"></i> Insert column Right',
            disabled: function () {
              const selectedRows = this.getSelected();
              if (selectedRows.length > 1) return true;
            },
            callback: function () {
              // const columnNumber = hotInstance.getSelected()[0][1],
              //       columnLength = colInfo.length;
              // colInfo.push({});
              // colHeaders.push('Untitled');
              // utils.reArrangeArray(colInfo, columnLength, columnNumber + 1);
              // utils.reArrangeArray(colHeaders, columnLength, columnNumber + 1);
              // hotInstance.updateSettings({
              //   columns: colInfo,
              //   colHeaders,
              // });
              const content = '<div id="initTrackerColumnFormWrpp"></div>',
                    data = {
                            data_type: 'S',
                            values: 'Choice1___Choice2',
                            visibility: 'E',
                            metaInfo: {
                              label: 'Insert Column Right',
                              position: (hotInstance.getSelected()[0][1]),
                            },
                          };
              ES6MangoSpring.trackerModule.tracker().initFancybox(null, content, 650, () => {
                amplify.publish('initTrackerColumnForm', data);
              });
            },
        };
        // dropDownMenu['clear_column'] = {
        //     name: '<i class="fal fa-minus-circle"></i> Clear Column',
        // };
        dropDownMenu['remove_col'] = {
            name: '<i class="fal fa-trash-alt"></i> Delete Column',
            disabled: function () {
              // for which cells it should be disabled
            },
            callback: function (key, selection) {
              const colNumber = selection[0].end.col,
                    colId = this.getCellMeta(0, colNumber).prop,
                    trackerId = document.querySelector('input[name="tracker_id"]').value,
                    trackerViewId = document.querySelector('input[name="tracker_view_id"]').value,
                    url = `/user/v2/tracker/tracker_columns/${colId}/destory_dialog?tracker_id=${trackerId}&tracker_view_id=${trackerViewId}`;

              ES6MangoSpring.trackerModule.tracker().initFancybox(url, null, 650, () => {
                
              });

                    // url = `/user/v2/tracker/tracker_columns/${colId}/edit?tracker_id=${trackerId}`,
                    // content = '<div id="initTrackerColumnFormWrpp"></div>';

              // const columnNumber = hotInstance.getSelected()[0][1];
              // colInfo.splice(columnNumber, 1);
              // colHeaders.splice(columnNumber, 1);
              // hotInstance.updateSettings({
              //   columns: colInfo,
              //   colHeaders,
              // });
            },
        }; 
        dropDownMenu['sep1'] = '---------';
        dropDownMenu['alignment'] = {
            name: '<i class="far fa-align-left lft-arw-opct"></i> Alignment <i class="far fa-chevron-right dd-rgArowTbl"></i>',
        };
        dropDownMenu['hidden_columns_hide'] = {
            name: '<i class="far fa-eye-slash"></i> Hide Column',
            disabled: function () {},
            callback: function (key, selection) {
                const colNumber = selection[0].end.col,
                  colId = this.getCellMeta(0, colNumber).prop,
                  trackerId = document.querySelector('input[name="tracker_id"]').value,
                  trackerViewId = document.querySelector('input[name="tracker_view_id"]').value,
                  url = `/user/v2/tracker/views/${trackerViewId}/tracker_view_columns/hide_column?tracker_id=${trackerId}&tracker_column_id=${colId}`;

                jQuery.ajax({
                  url,
                  type: 'PUT',
                  dataType: 'JSON',
                  success: (response) => {
                    if (response.success) {
                      let columArray = [];
                      columArray = Handsontable.helper.deepClone(hotInstance.getPlugin('hiddenColumns').hiddenColumns);
                      columArray.push(colNumber);
                      hotInstance.updateSettings({
                          hiddenColumns: {
                              columns: columArray,
                              indicators: true,
                          },
                      });
                    }
                  },
                });
            },
        };
        // dropDownMenu['lockcolumn'] = {
        //     name: '<i class="far fa-lock"></i> Lock Column',
        //     callback: (key, selection) => {
        //         const colNumber = selection[0].start.col;
        //         hotInstance.updateSettings({
        //             cells: (row, col) => {
        //                 const cellProperties = {};
        //                 if (col === colNumber) {
        //                     cellProperties.readOnly = true;
        //                 }
        //                 return cellProperties;
        //             },
        //         });
        //     },
        // };
        // dropDownMenu['unlockcolumn'] = {
        //     name: '<i class="far fa-unlock"></i> Unlock Column',
        //     callback: (key, selection) => {
        //         const colNumber = selection[0].start.col;
        //         hotInstance.updateSettings({
        //             cells: (row, col) => {
        //                 const cellProperties = {};
        //                 if (col === colNumber) {
        //                     cellProperties.readOnly = false;
        //                 }
        //                 return cellProperties;
        //             },
        //         });
        //     },
        // };
        dropDownMenu['---------'];
        dropDownMenu['filter_by_condition'] = {
            name: 'Filter by Condition',
        };
        dropDownMenu['filter_operators'] = {
            name: 'Filter by Operator',
        };
        dropDownMenu['filter_by_condition2'] = {
            name: 'Filter by Condition2',
        };
        dropDownMenu['filter_by_value'] = {
            name: 'Filter by Value',
        };
        dropDownMenu['filter_action_bar'] = {
            name: 'Filter by Action Bar',
        };
        return dropDownMenu;
	};

    return {
        createCustomDropDownMenu,
    };
};
export default customDropDownMenu;
