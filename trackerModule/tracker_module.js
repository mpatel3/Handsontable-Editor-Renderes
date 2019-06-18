/* eslint prefer-rest-params: 0 */
/* eslint no-param-reassign: 0 */
import utils from '../utils';
import handsonOverride from './handson_override';
import handsonModule from './handson_module';
import CustomCheckBoxEditor from './customeditor/custom_checkbox_editor';
import CustomRadioBoxEditor from './customeditor/custom_radio_editor';
import CustomRichTextBoxEditor from './customeditor/custom_richtextbox_editor';

function tracker() {
  const init = () => {
    bindEvents();
    templateTrackerCreate();

  },

  initFancybox = (url, content, width, callback) => {
    jQuery.fancybox({
      width,
      height: 'auto',
      href: url,
      scrolling: 'no',
      transitionIn: 'none',
      transitionOut: 'none',
      hideOnOverlayClick: false,
      inline: true,
      autoScale: false,
      content,
      onComplete: () => {
        jQuery.fancybox.center();
        jQuery('#fancybox-content .dialog_body').css({ 'overflow-y': 'auto', 'overflow-x': 'hidden', });
        jQuery('#fancybox-outer').css({ height: 'auto', width: `${width}px`, });
        jQuery('#fancybox-content').css({ border: 0, height: 'auto', width: `${width}px`, });
        if (callback !== undefined) callback();
      },
    });
  },

  templateTrackerCreate = () => {
    const createTracker = utils.grabClassElements('tracker-create-template'),
          importTracker = utils.grabElement('tracker-import-spreadsheet');

    createTracker.forEach((element) => {
      element.addEventListener('click', () => {
        initFancybox('/user/v2/trackers/create_tracker_popup', null, 900, () => {
          const templateUl = utils.grabElement('ma-tracker-templates'),
            continueBtn = utils.grabElement('new_tracker_by_template'),
            listItems = templateUl.getElementsByTagName('LI');

          [...listItems].forEach(liItem => liItem.addEventListener('click', (e) => {
            [].forEach.call(templateUl.querySelectorAll('.active'), (el) => {
              el.classList.remove('active');
            });
            e.currentTarget.classList.add('active');
          }));

          continueBtn.addEventListener('click', () => {
            jQuery.fancybox.close();
            const activeLi = templateUl.querySelectorAll('.active'),
              templateId = activeLi[0].dataset.id,
              trackerName = activeLi[0].dataset.title;

            createTrackerFromTemplate(templateId, trackerName);
          });
        });
      });
    });

    if (importTracker !== undefined) {
      importTracker.addEventListener('click', () => {
        initFancybox('/user/v2/trackers/import_from_spreadsheet', null, 480, () => {
          if (jQuery('#myFormTeams').length) {
            jQuery('#myFormTeams').tokenInput(
              '/autocomplete?scope=teams_with_tracker_enabled', {
                theme: 'facebook',
                tokenLimit: 1,
                minChars: 1,
                searchDelay: 1000,
                hintText: team_typeahead_text,
                defaultText: team_typeahead_text,
              }
            );
          }
          shortcutIconInitalization();
          colorCodeInitalization();

          utils.grabElement('save-import-spreadsheet').addEventListener('click', (e) => {
            // call to submit import tracker data
            e.preventDefault();
            // saveSpreadSheetData();
          });
        });
      });
    }
  },

  createTrackerFromTemplate = (templateId, trackerName) => {
    initFancybox(`/user/v2/trackers/new?template_id=${templateId}&tracker_name=${trackerName}`, null, 900, () => {
      // for create tracker
      if (jQuery('#myFormTeams').length) {
        jQuery('#myFormTeams').tokenInput(
          '/autocomplete?scope=teams_with_tracker_enabled', {
            theme: 'facebook',
            tokenLimit: 1,
            minChars: 1,
            searchDelay: 1000,
            hintText: team_typeahead_text,
            defaultText: team_typeahead_text,
          }
        );
      }
      shortcutIconInitalization();
      colorCodeInitalization();
    });
  },

  bindTrackerSettingEvents = () => {
    const trackerId = utils.grabElement('tracker-master-id').value;
    shareTracker(trackerId);
    manageTrackerPermission(trackerId);
    notificationPref(trackerId);
    importDataToTracker(trackerId);
    cloneTracker(trackerId);
    moveTracker(trackerId);
    archiveTracker(trackerId);
    deleteTracker(trackerId);
  },

  saveShareConfigData = (url, data) => {
    jQuery.ajax({
      url,
      type: 'PUT',
      data,
    }).done(() => {
    });
  },

  shareTracker = (trackerId) => {
    const shareTrackerBtn = utils.grabElement('tracker-view-share-btn');
    shareTrackerBtn.addEventListener('click', () => {
      initFancybox(`/user/v2/trackers/setting_dialog?tracker_id=${trackerId}&type=share_view`, null, 600, () => {
        const showHideShareOptions = utils.grabElement('tracker-view-share'),
              publicShareTrackerView = utils.grabElement('public-share-tracker-view'),
              copyShareLink = utils.grabElement('view-copy-share-link'),
              copyMessage = utils.grabElement('copyMessageShareLink'),
              textInput = utils.grabElement('share_link_input'),
              submitSettingsBtn = utils.grabElement('save-share-settings'),
              trackerViewEditPermissionsMode = utils.grabElement('trackerViewEditPermissionsMode'),
              trackerViewType = utils.grabElement('trackerViewType'),
              submitUrl = submitSettingsBtn.getAttribute('url');

        showHideShareOptions.addEventListener('change', () => {
          toggleShareOptions(submitUrl, showHideShareOptions);
        });

        publicShareTrackerView.addEventListener('change', () => {
          saveShareConfigData(submitUrl, { public_access: publicShareTrackerView.checked, });
        });

        copyShareLink.addEventListener('click', () => {
          textInput.select();
          document.execCommand('copy');
          getSelection().removeAllRanges();
          copyMessage.style.display = 'inline';
          setTimeout(() => { copyMessage.style.display = 'none'; }, 300);
        });

        submitSettingsBtn.addEventListener('click', () => {
          jQuery.fancybox.close();
        });

        trackerViewEditPermissionsMode.addEventListener('change', (event) => {
          saveShareConfigData(submitUrl, { edit_access: event.target.selectedOptions[0].value, });
        });

        trackerViewType.addEventListener('change', (event) => {
          const selectedOption = event.target.selectedOptions[0].dataset;
          textInput.value = selectedOption.shareLink;
          showHideShareOptions.checked = selectedOption.isShared === 'true';
          publicShareTrackerView.checked = selectedOption.isShared === 'true';
          trackerViewEditPermissionsMode.value = selectedOption.editAccess;
          toggleShareOptions(showHideShareOptions);
        });
      });
    });
  },

  manageTrackerPermission = (trackerId) => {
    const trackerPermission = utils.grabElement('manage-tracker-permissions');
    trackerPermission.addEventListener('click', () => {
      initFancybox(`/user/v2/trackers/setting_dialog?tracker_id=${trackerId}&type=manage_permission`, null, 600, () => {
        const memberAddImport = utils.grabElement('setting-member-add-import'),
              memberEditArchiveLock = utils.grabElement('setting-member-edit-archive-lock'),
              memberDeleteRecord = utils.grabElement('setting-member-delete-record'),
              memberShareViews = utils.grabElement('setting-member-share-views'),
              guestAddImport = utils.grabElement('setting-guest-add-import'),
              guestEditArchiveLock = utils.grabElement('setting-guest-edit-archive-lock'),
              guestDeleteRecord = utils.grabElement('setting-guest-delete-record'),
              guestShareViews = utils.grabElement('setting-guest-share-views'),
              submitUrl = utils.grabElement('manage-tracker-permissions').getAttribute('url');

        memberAddImport.addEventListener('change', () => {
          saveShareConfigData(submitUrl, { tracker_settings: { member_add_import_record: memberAddImport.checked ? 1 : 0, }, });
        });

        memberEditArchiveLock.addEventListener('change', () => {
          saveShareConfigData(submitUrl, { tracker_settings: { member_edit_lock_archive_record: memberEditArchiveLock.checked ? 1 : 0, }, });
        });

        memberDeleteRecord.addEventListener('change', () => {
          saveShareConfigData(submitUrl, { tracker_settings: { member_delete_record: memberDeleteRecord.checked ? 1 : 0, }, });
        });

        memberShareViews.addEventListener('change', () => {
          saveShareConfigData(submitUrl, { tracker_settings: { member_share_views: memberShareViews.checked ? 1 : 0, }, });
        });

        guestAddImport.addEventListener('change', () => {
          saveShareConfigData(submitUrl, { tracker_settings: { guest_add_import_record: guestAddImport.checked ? 1 : 0, }, });
        });

        guestEditArchiveLock.addEventListener('change', () => {
          saveShareConfigData(submitUrl, { tracker_settings: { guest_edit_lock_archive_record: guestEditArchiveLock.checked ? 1 : 0, }, });
        });

        guestDeleteRecord.addEventListener('change', () => {
          saveShareConfigData(submitUrl, { tracker_settings: { guest_delete_record: guestDeleteRecord.checked ? 1 : 0, }, });
        });

        guestShareViews.addEventListener('change', () => {
          saveShareConfigData(submitUrl, { tracker_settings: { guest_share_views: guestShareViews.checked ? 1 : 0, }, });
        });
      });
    });
  },

  notificationPref = (trackerId) => {
    const trackerPermission = utils.grabElement('notification-pref');
    trackerPermission.addEventListener('click', () => {
      initFancybox(`/user/v2/trackers/setting_dialog?tracker_id=${trackerId}&type=notification_pref`, null, 600, () => {
      });
    });
  },

  importDataToTracker = (trackerId) => {
    const trackerPermission = utils.grabElement('import-data-to-tracker');
    trackerPermission.addEventListener('click', () => {
      initFancybox(`/user/v2/trackers/setting_dialog?tracker_id=${trackerId}&type=import_data_tracker`, null, 1000, () => {
      });
    });
  },

  cloneTracker = (trackerId) => {
    const trackerPermission = utils.grabElement('clone-tracker-v2');
    trackerPermission.addEventListener('click', () => {
      initFancybox(`/user/v2/trackers/setting_dialog?tracker_id=${trackerId}&type=clone_tracker`, null, 600, () => {
      });
    });
  },

  moveTracker = (trackerId) => {
    const trackerPermission = utils.grabElement('move-tracker-v2');
    trackerPermission.addEventListener('click', () => {
      initFancybox(`/user/v2/trackers/setting_dialog?tracker_id=${trackerId}&type=move_tracker`, null, 600, () => {
      });
    });
  },

  archiveTracker = (trackerId) => {
    const trackerPermission = utils.grabElement('archive-tracker-v2');
    trackerPermission.addEventListener('click', () => {
      initFancybox(`/user/v2/trackers/setting_dialog?tracker_id=${trackerId}&type=archive_tracker`, null, 600, () => {
      });
    });
  },

  deleteTracker = (trackerId) => {
    const trackerPermission = utils.grabElement('delete-tracker-v2');
    trackerPermission.addEventListener('click', () => {
      initFancybox(`/user/v2/trackers/setting_dialog?tracker_id=${trackerId}&type=delete_tracker`, null, 600, () => {
      });
    });
  },

  toggleShareOptions = (url, showHideShareOptions) => {
    const showHideShareContainer = utils.grabElement('share-show-hide-container');
    if (showHideShareOptions.checked) {
      showHideShareContainer.style.display = 'block';
    } else {
      showHideShareContainer.style.display = 'none';
    }
    saveShareConfigData(url, { is_shared: showHideShareOptions.checked, });
  },

  colorCodeInitalization = () => {
    jQuery('#priority_color_code').spectrum({
      showPaletteOnly: true,
      preferredFormat: 'hex',
      showPalette: true,
      hideAfterPaletteSelect: true,
      palette: [
        ['#f00', '#d8a455', '#ffa000', '#35d43b', '#00BCD4', '#00f', '#90f', '#f0f'],
        ['#e06666', '#f6b26b', '#ffd966', '#93c47d', '#76a5af', '#6fa8dc', '#8e7cc3', '#c27ba0'],
        ['#c00', '#e69138', '#f1c232', '#6aa84f', '#45818e', '#3d85c6', '#674ea7', '#a64d79'],
        ['#900', '#b45f06', '#bf9000', '#38761d', '#134f5c', '#0b5394', '#351c75', '#741b47'],
        ['#600', '#783f04', '#7f6000', '#274e13', '#0c343d', '#073763', '#20124d', '#4c1130']
      ],
      change: (color) => {
        jQuery('#priority_color_code').val(color);
      },
    });
  },

  shortcutIconInitalization = () => {
    jQuery('.icon_intranet').focus(() => {
      jQuery('#add-shortcut-icons').css('display', 'block');
    });
    jQuery('#add-shortcut-icons a').off('click').on('click', function () {
      jQuery('.ico_box_list a').removeClass('selected_icon');
      jQuery(this).addClass('selected_icon');
      const iconClass = jQuery(this).find('i').attr('class');
      jQuery('#link_css_class').val(iconClass);
      jQuery('.icon_intranet_preview i').attr('class', iconClass);
      // jQuery('.icon_intranet_preview i').show();
      // jQuery('#add-shortcut-input').attr('placeholder', '');
    });

    jQuery('body').click((e) => {
      if (jQuery(e.target).closest('#icon_intranet_parent').length === 0 && (!jQuery(e.target).attr('class') || jQuery(e.target).attr('class').indexOf('short-icons-div') === -1)) {
        jQuery('#add-shortcut-icons').css('display', 'none');
      }
    });
  },

  bindEvents = () => {
    utils.classClickListener('new-ms-tracker-reader')((event) => {
      event.preventDefault();
      event.stopPropagation();
      const url = event.target.closest('.new-ms-tracker-reader').getAttribute('data-href'),
        fancyBoxLoading = utils.grabElement('fancybox-loading');
      fancyBoxLoading.style.display = 'block';
      try {
        jQuery.get(url, (data) => {
          if (Object.prototype.hasOwnProperty.call(data, 'status')) {
            if (data.status === false) window.location.href = data.redirect_url;
          } else {
            const overlayWrapper = utils.grabClassElements('overlay-fullscreen'),
            overlay = jQuery(`<div class='overlay-fullscreen trac-submpp'> 
                                <div class='fullscreen_btn_style closeButton pull-right'>
                                  <a href='javascript://' class='actionbutton smallbutton smalliconbutton wk-full-screen waves-effect waves-dark wiki-content-normal-view-mode' title='${_i18n_bkp('Exit Fullscreen')}'>
                                    <i class='far fa-expand-alt'></i><i class='far fa-times'></i>
                                  </a>
                                </div>
                                <div class='overlay-content'></div>
                              </div>`);
            if (overlayWrapper.length > 0) overlayWrapper.remove();
            fancyBoxLoading.style.display = 'none';
            jQuery('body').append(overlay);
            jQuery('.overlay-fullscreen').find('.fullscreen_btn_style').bind('click', () => {
              jQuery('html').css('overflow', 'scroll');
              overlay.remove();
            });
            jQuery('html').css('overflow', 'hidden');
            overlay.find('.overlay-content').append(data);
          }
        });
      } catch (e) {
        alert(e.message);
      }
    });
  },

  binderTrackerTableEvents = () => {
    const viewSelect = document.querySelector('.trackerViewSelect')
    if (viewSelect !== undefined && viewSelect !== null) {
      viewSelect.on('change', (event) => {
        const trackerID = document.querySelector('input[name="tracker_id"]').value;
        if (event.target.value === 'create_new_view') {
          createNewView(trackerID);
        } else {
          jQuery.ajax({
            url: `/user/v2/tracker/views/${event.target.value}?tracker_id=${trackerID}`,
            dataType: 'script',
            type: 'get',
            success: () => {
            },
          });
        }
      });
        }
  },

  createNewView = (trackerID) => {
    initFancybox('/user/v2/tracker/views/view_type_dialog', null, 600, () => {
      const selectViewTypeBtn = document.getElementById('submitViewTypeBtn');

      selectViewTypeBtn.on('click', () => {
        const selectedViewType = document.querySelector('input[name="view_type"]:checked').value;
        if (selectedViewType === 'grid') {
          // jQuery.fancybox.close();
          initFancybox(`/user/v2/tracker/views/new?type=grid&tracker_id=${trackerID}`, null, 750, () => {
            gridViewForm();
          });
        } else {
          // jQuery.fancybox.close();
          initFancybox(`/user/v2/tracker/views/new?type=form&tracker_id=${trackerID}`, null, 750, () => {
            jQuery('#createNewFormView').validate({
              ignore: '',
              rules: {
                'tracker_view[name]': {
                  required: true,
                  remote: {
                    url: `/user/v2/tracker/views/view_name_validation?tracker_id=${trackerID}`,
                    type: 'get',
                    data: {
                      name: () => document.querySelector('#createNewFormView input[name="tracker_view[name]"]').value,
                    },
                  },
                },
              },
              messages: {
                'tracker_view[name]': {
                  remote: _i18n_bkp('View name should be unique'),
                },
              },
            });
          });
        }
      });
    });
  },

  updateGridView = (trackerID, trackerViewId) => {
    initFancybox(`/user/v2/tracker/views/${trackerViewId}/edit?type=grid&tracker_id=${trackerID}`, null, 750, () => {
      gridViewForm();
    });
  },

  duplicateView = () => {
    const trackerID = document.querySelector('input[name="tracker_id"]').value,
          trackerViewId = document.querySelector('input[name="tracker_view_id"]').value;

    initFancybox(`/user/v2/tracker/views/${trackerViewId}/duplicate?tracker_id=${trackerID}`, null, 600, () => {
      gridViewForm();
    });
  },

  deleteView = (event) => {
    const url = event.target.dataset.url;

    MS.CatsEye.showYesNo({
      title: _i18n_bkp('confirmation-dialogue'),
      button_text: [_i18n_bkp('ok-button'), _i18n_bkp('Cancel')],
      label: _i18n('Are you sure you want to remove this view?'),
      handleYes: function() {
        this.hide();
        jQuery.ajax({
          url,
          method: 'delete',
          success: (data) => {
            if (data.success) {
              const viewSelect = document.querySelector('select#view');
              viewSelect.value = viewSelect.options[0].value;
              viewSelect.dispatchEvent(new Event('change'));

              jQuery('#notice').html(data.msg).show();
              hideNotice('#notice');
            } else {
              jQuery('#error').html(data.msg).show();
              hideNotice('#error');
            }
          },
        });
      },
      handleNo: function() {
        this.hide();
        return false;
      },
    });
  },

  pinTracker = (event) => {
    const url = event.target.dataset.url;
    jQuery.ajax({
      url,
      type: 'PUT',
    }).done(() => {
    });
  },

  unPinTracker = (event) => {
    const url = event.target.dataset.url;
    jQuery.ajax({
      url,
      type: 'PUT',
    }).done(() => {
    });
  },

  gridViewForm = () => {
    jQuery('.tabs-menu').off('click').on('click', (event) => {
      const that = jQuery(event.target),
            containerId = that.attr('data-anchor');

      jQuery('.tabs-menu').removeClass('active');
      that.addClass('active');

      jQuery('.tabSection').addClass('hide');
      jQuery(containerId).removeClass('hide');

      (containerId === '#NameDescriptionTab') ? jQuery('#prevBtn').addClass('hide') : jQuery('#prevBtn').removeClass('hide');
      jQuery.fancybox.center();

      if (containerId === '#SetupRowsTab') {
        jQuery('#saveBtn').removeClass('hide');
        jQuery('#nextBtn').addClass('hide');
      } else if (containerId === '#SetupColumnsTab') {
        jQuery('#ol_detail_customize_reorder').sortable({
          update: () => {
            jQuery('#ol_detail_customize_reorder').find('li.module-list-item').each(function (index) {
             jQuery(this).find('input[type="hidden"]').val(index);
            });
          },
        });

        jQuery('#saveBtn').addClass('hide');
        jQuery('#nextBtn').removeClass('hide');
      } else {
        jQuery('#saveBtn').addClass('hide');
        jQuery('#nextBtn').removeClass('hide');
      }
    });
  },

  handleTabSwitching = (prevButton) => {
    if (prevButton) {
      jQuery('.trackerTabsContainer .tab.active').parent('li').prev().find('a')
                                                                      .click();
    } else {
      jQuery('.trackerTabsContainer .tab.active').parent('li').next().find('a')
                                                                      .click();
    }
  },

  renameFormViewFancybox = () => {
    initFancybox(null, document.getElementById('renameFormFancyboxContent').innerHTML, 450, () => {
      jQuery('form.renameViewForm').validate({
        ignore: '',
      });
    });
  },

  extractTextFromHTMLString = (string) => {
    const span = document.createElement('span');
    span.innerHTML = string;
    return span.textContent || span.innerText;
  },

  editFormViewField = (event) => {
    const fieldWrapper = event.target.closest('div.pay-FrmLinewrp');
    fieldWrapper.classList.add('edit-AddCls');
    fieldWrapper.getElementsByClassName('closeEditMode').forEach((element) => {
      element.removeEventListener('click', () => {});
      element.addEventListener('click', (e) => {
        e.target.closest('div.pay-FrmLinewrp').classList.remove('edit-AddCls');
      });
    });
  },

  trackerFromView = () => {
    const bindEvents = () => {
    },

    allowDrop = (event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      const target = event.target;

      if (target && target !== window.dragEl && target.className.indexOf('item') !== -1) {
        if (target.closest('.wrapperDropBox').lastElementChild === target) {
          target.closest('.wrapperDropBox').appendChild(window.dragEl);
        } else {
          target.closest('.wrapperDropBox').insertBefore(window.dragEl, target);
        }
      } else if (target && target !== window.dragEl && target.className.indexOf('wrapperDropBox') !== -1) {
        target.appendChild(window.dragEl);
      }
    },

    onDrag = (event) => {
      window.dragEl = event.target;

      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('Text', window.dragEl.textContent);

      setTimeout(() => {
        window.dragEl.classList.add('ghost');
      }, 0);
    },

    onDrop = (event) => {
      event.preventDefault();
      window.dragEl.classList.remove('ghost');
    },

    onDragEnd = (event) => {
      event.preventDefault();
      window.dragEl.classList.remove('ghost');
      updateTrackerViewCol(window.dragEl);
    },

    addAllField = (event) => {
      const leftContainerItems = document.querySelectorAll('.leftSideDropBoxWrpp .item'),
            rightContainer = document.querySelector('.rightSideDropBoxWrpp'),
            url = event.target.dataset.url;

      if (leftContainerItems.length > 0) {
        leftContainerItems.forEach((ele) => {
          rightContainer.appendChild(ele);
        });

        bulkUpdateTrackerViewCol(url, false);
      }
    },

    removeAllField = (event) => {
      const leftContainer = document.querySelector('.leftSideDropBoxWrpp'),
            rightContainerItems = document.querySelectorAll('.rightSideDropBoxWrpp .item'),
            url = event.target.dataset.url;

      if (rightContainerItems.length > 0) {
        rightContainerItems.forEach((ele) => {
          leftContainer.appendChild(ele);
        });

        bulkUpdateTrackerViewCol(url, true);
      }
    },

    bulkUpdateTrackerViewCol = (url, isHidden) => {
      const trackerViewColsData = [],
            trackerViewId = document.querySelector('input[name="tracker_view_id"]').value;

      if (isHidden === false) {
        document.querySelectorAll('.rightSideDropBoxWrpp .item').forEach((ele, index) => {
          trackerViewColsData.push([ele.dataset.viewColumnId, trackerViewId, index, isHidden]);
        });
      } else {
        document.querySelectorAll('.leftSideDropBoxWrpp .item').forEach((ele, index) => {
          trackerViewColsData.push([ele.dataset.viewColumnId, trackerViewId, index, isHidden]);
        });
      }

      jQuery.ajax({
        url,
        type: 'PUT',
        data: {
          data: trackerViewColsData,
        },
        success: () => {
        },
      });
    },

    updateTrackerViewCol = (dragEl) => {
      const isHidden = dragEl.parentElement.className.indexOf('leftSideDropBoxWrpp') !== -1,
            trackerViewId = document.querySelector('input[name="tracker_view_id"]').value,
            rankData = [];

      document.querySelector('.rightSideDropBoxWrpp').getElementsByClassName('item').forEach((ele, index) => {
        rankData.push([ele.dataset.viewColumnId, trackerViewId, index]);
      });

      jQuery.ajax({
        url: dragEl.dataset.url,
        type: 'PUT',
        data: {
          tracker_view_column: { is_hidden: isHidden, },
          rank_data: rankData,
        },
        success: () => {
          window.dragEl = null;
        },
      });
    },

    saveEditModeDetail = (event) => {
      const item = event.target.closest('.item'),
            url = item.dataset.url,
            isRequired = item.querySelector('input[name="onoffswitch"]').checked,
            elements = item.querySelector('form').elements,
            data = { is_hidden: false, };

      data.required = isRequired;
      elements.forEach((ele) => { data[ele.name] = ele.value; });

      jQuery.ajax({
        url,
        type: 'PUT',
        data: { tracker_view_column: data, },
        success: () => {
          if (data.required) {
            item.querySelector('.col-name').innerHTML = `${data.name}<span class="mandatory">*</span>`;
          } else {
            item.querySelector('.col-name').innerHTML = `${data.name}`;
          }
          item.classList.remove('edit-AddCls');
        },
      });
    },

    addNewColumnDialog = () => {
      const objectData = {
        data_type: 'S',
        values: 'Choice1___Choice2',
        visibility: 'E',
        metaInfo: {
          label: 'Add New Column',
        },
      };

      initFancybox(null, '<div id="initTrackerColumnFormWrpp"></div>', 650, () => {
        amplify.publish('initTrackerColumnForm', objectData);
      });
    };

    return {
      allowDrop,
      onDrag,
      onDrop,
      onDragEnd,
      bindEvents,
      saveEditModeDetail,
      addNewColumnDialog,
      addAllField,
      removeAllField,
    };
  };

  return {
    init,
    bindEvents,
    extractTextFromHTMLString,
    binderTrackerTableEvents,
    renameFormViewFancybox,
    duplicateView,
    updateGridView,
    createNewView,
    handleTabSwitching,
    bindTrackerSettingEvents,
    editFormViewField,
    trackerFromView,
    initFancybox,
    deleteView,
    pinTracker,
    unPinTracker,
  };
}

const trackerModule = {
  tracker,
  handsonOverride,
  handsonModule,
  CustomCheckBoxEditor,
  CustomRadioBoxEditor,
  CustomRichTextBoxEditor,
};

export default trackerModule;
