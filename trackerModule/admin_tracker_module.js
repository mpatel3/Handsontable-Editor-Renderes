/* eslint prefer-rest-params: 0 */
/* eslint no-param-reassign: 0 */
import utils from '../utils';
import handsonModule from './handson_module';
import CustomCheckBoxEditor from './customeditor/custom_checkbox_editor';
import CustomRadioBoxEditor from './customeditor/custom_radio_editor';
import CustomRichTextBoxEditor from './customeditor/custom_richtextbox_editor';

function adminTracker() {
  const init = () => {
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

  createCustomTemplate = () => {
    const url = event.target.closest('a').dataset.url;
    initFancybox(`${url}`, null, 800, () => {
      shortcutIconInitalization();
      colorCodeInitalization();
    });
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
  reorderTemplates = (event) => {
    const url = event.target.closest('a').dataset.url;
    initFancybox(`${url}`, null, 800, () => {
    
    });
  },

  deactivateTemplate = () => {
  	const url = event.target.closest('a').dataset.url;
    initFancybox(`${url}`, null, 600, () => {
    });
  	
  },	

  cloneEditTemplate = () => {

  },

  deleteTemplate = () => {

  };

  return {
    init,
    reorderTemplates,
    deactivateTemplate,
    initFancybox,
    createCustomTemplate,
  };

}
const adminTrackerModule = {
  adminTracker,
  handsonModule,
  CustomCheckBoxEditor,
  CustomRadioBoxEditor,
  CustomRichTextBoxEditor,
};

export default adminTrackerModule;
