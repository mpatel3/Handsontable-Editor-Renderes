/* eslint prefer-rest-params: 0 */
/* eslint no-param-reassign: 0 */
const handsonOverride = () => {
	const init = () => {
		overrideAutocomplete();
	},

	overrideAutocomplete = () => {
		// AutoComplete Renderer
		function autoCompleteRenderer(hotInstance, td, row, column, prop, value) {
			Handsontable.renderers.AutocompleteRenderer.apply(this, arguments);
			if (value) {
				const [userId, userName] = value.split(':');
				td.innerHTML = userName === undefined ? userId : userName;
				td.setAttribute('data-col-id', prop);
				return td;
			}
    }

    Handsontable.renderers.registerRenderer('autocomplete', autoCompleteRenderer);
    // AutoComplete Editor Changes
    const AutoCompleteEditor = Handsontable.editors.AutocompleteEditor.prototype.extend();

    AutoCompleteEditor.prototype.prepare = function () {
      Handsontable.editors.AutocompleteEditor.prototype.prepare.apply(this, arguments);
      const userName = ES6MangoSpring.trackerModule.tracker().extractTextFromHTMLString(this.originalValue).split(':').last();
      this.originalValue = userName;
    };

    Handsontable.editors.registerEditor('ma.AutoCompleteEditor', AutoCompleteEditor);
	};

	return {
		init,
	};
};

export default handsonOverride;
