// var passwordEditor = Handsontable.editors.CheckboxEditor.prototype.extend();
// passwordEditor.prototype.prepare = function() { console.log(this);
//
//   // Invoke the original method...
//   Handsontable.editors.CheckboxEditor.prototype.prepare.apply(this, arguments);
//
// }
//
// passwordEditor.prototype.beginEditing = function() {
//  console.log(this);
// };
//
// passwordEditor.prototype.finishEditing = function() {
//  console.log(this);
// };


function getUISTring(options) {
  let templateString = ``;
  console.log(options);
  for (var option in options) {
    if (options.hasOwnProperty(option)) {
      const uniqId = `${option}_${(new Date()).getTime()}`;
      templateString += `<li><input type='checkbox' value='${options[option]}'  id='${uniqId}' /><label htmlFor=${uniqId}>${options[option]}</label></li>`;
    }
  }
  templateString += `<li data-name="addNew">Add New Option</li>`;
  return templateString;
}


var checkBoxCustomEditor = Handsontable.editors.BaseEditor.prototype.extend();
  checkBoxCustomEditor.prototype.init = function() {
  // create a node.
  this.ulListElm = document.createElement('UL');
  this.ulListElm.setAttribute('id','TestingNew');
  Handsontable.dom.addClass(this.ulListElm, 'checkBoxEditor2');
  this.ulListElm.style.display = 'none';

  // Attach node to DOM, by appending it to the container holding the table
  this.instance.rootElement.appendChild(this.ulListElm);
}

checkBoxCustomEditor.prototype.saveValue = function(value) {
  Handsontable.editors.BaseEditor.prototype.saveValue.apply(this, arguments);
  console.log(this.cellProperties.checkBoxOptions);
  console.log(value);
  this.cellProperties.checkBoxOptions = value[0];
}

checkBoxCustomEditor.prototype.finishEditing = function() {
  console.log('called');
  // Invoke the original method...
  Handsontable.editors.BaseEditor.prototype.finishEditing.apply(this, arguments);
}
// Create options in prepare() method
checkBoxCustomEditor.prototype.prepare = function() {
  // Remember to invoke parent's method
  Handsontable.editors.BaseEditor.prototype.prepare.apply(this, arguments);
  var _self = this;
  var checkBoxOptions = this.cellProperties.checkBoxOptions;
  var options;
  if (typeof checkBoxOptions == 'function') {
    options = this.prepareOptions(checkBoxOptions(this.row,
    this.col, this.prop))
  } else {
    options = this.prepareOptions(checkBoxOptions);
  }
  Handsontable.dom.empty(this.ulListElm);
  Handsontable.dom.fastInnerHTML(this.ulListElm, getUISTring(options));
  const elem = document.getElementById('TestingNew');
  elem.style.curser = 'pointer';
  Handsontable.dom.addEvent(elem, 'click', function (e) {
      
      if(event.target.dataset.name === 'addNew') {
        const inputElem = document.createElement('INPUT');
        inputElem.type = 'text';
        const spanElem = document.createElement('SPAN');
        spanElem.innerHTML = 'x';
        Handsontable.dom.addEvent(spanElem,'click',function(e){
          console.log(e);
        });
        
        Handsontable.dom.empty(event.target);
        e.target.appendChild(inputElem);
        e.target.appendChild(spanElem);
        // e.target.innerHTML = `<input type="text"> <span>x</span>`;
        e.target.focus();
        Handsontable.dom.addEvent(e.target,'keyup',function(event){
          if(event.keyCode === Handsontable.helper.KEY_CODES.ENTER) {
              console.log(e.target.firstChild.value);
              let value = e.target.firstChild.value;
              options[value] = value;
              Handsontable.dom.empty(_self.ulListElm);
              Handsontable.dom.fastInnerHTML(_self.ulListElm, getUISTring(options));
          }
        });
      }
  });
};

var onBeforeKeyDown = function(event) {
  var instance = this; // context of listener function is always set to Handsontable.Core instance
  var editor = instance.getActiveEditor();
  // var selectedIndex = editor.select.selectedIndex;
  console.log(editor,'test');
  // Handsontable.dom.enableImmediatePropagation(event);

  switch (event.keyCode) {
    case Handsontable.helper.KEY_CODES.ARROW_DOWN:
    console.log(editor);
      // var previousOption = editor.select.options[selectedIndex - 1];
      //
      // if (previousOption) { // if previous option exists
      //   editor.select.value = previousOption.value; // mark it as selected
      // }

      event.stopImmediatePropagation(); // prevent EditorManager from processing this event
      event.preventDefault(); // prevent browser from scrolling the page up
      break;
    }
}

checkBoxCustomEditor.prototype.prepareOptions = function(optionsToPrepare) {
  var preparedOptions = {};

  if (Array.isArray(optionsToPrepare)) {
    for(var i = 0, len = optionsToPrepare.length; i < len; i++) {
      preparedOptions[optionsToPrepare[i]] = optionsToPrepare[i];
    }
  } else if (typeof optionsToPrepare == 'object') {
    preparedOptions = optionsToPrepare;
  }
  return preparedOptions;
};

checkBoxCustomEditor.prototype.getValue = function() {
  const listElem = this.ulListElm.getElementsByTagName('input');
  let values = [];
  for(var elem of listElem) {
     if(elem.checked) values.push(elem.value);
 }
 return values.length ? values.join(',').toString() : 'empty';
};

checkBoxCustomEditor.prototype.setValue = function(value) {
  this.ulListElm.value = value;
};

checkBoxCustomEditor.prototype.open = function() {
  var width = Handsontable.dom.outerWidth(this.TD);
  var height = Handsontable.dom.outerHeight(this.TD);
  var rootOffset = Handsontable.dom.offset(this.instance.rootElement);
  var tdOffset = Handsontable.dom.offset(this.TD);

  // sets select dimensions to match cell size
  this.ulListElm.style.height = height + 'px';
  this.ulListElm.style.minWidth = width + 'px';

  // make sure that list positions matches cell position
  this.ulListElm.style.top = tdOffset.top - rootOffset.top + 'px';
  this.ulListElm.style.left = tdOffset.left - rootOffset.left + 'px';
  this.ulListElm.style.margin = '0px';

  // display the list
  this.ulListElm.style.display = '';
  // register listener
  // this.instance.addHook('beforeKeyDown', onBeforeKeyDown);
};

checkBoxCustomEditor.prototype.close = function() {
  this.ulListElm.style.display = 'none';
  // remove listener
  // this.instance.removeHook('beforeKeyDown', onBeforeKeyDown);
};

checkBoxCustomEditor.prototype.focus = function() {
  this.ulListElm.focus();
};


function customRenderer(hotInstance, td, row, column, prop, value, cellProperties) {
    // Optionally include `BaseRenderer` which is responsible for adding/removing CSS classes to/from the table cells.
    Handsontable.renderers.BaseRenderer.apply(this, arguments);
    Handsontable.dom.fastInnerHTML(td, '<div>'+ value +'</div>');
    // ...your custom logic of the renderer
  }

// Register an alias
Handsontable.renderers.registerRenderer('my.custom', customRenderer);









var data = [
 {"User Name": "Hollee", "Bame ": "option1", "Phone": "07079 896003", "Date": "December 7th, 2019"},
 {"User Name": "Hollee", "Bame ": "option2", "Phone": "07079 896003", "Date": "December 7th, 2019"}
];

var columns = [{type: 'text'},{
editor: checkBoxCustomEditor,
checkBoxOptions: ['option1', 'option2', 'option3'],
renderer: 'my.custom'
},
{},{}
];


var outputData = data.map( Object.values )
var container = document.getElementById('example');
var hot = new Handsontable(container, {
    data: JSON.parse(JSON.stringify(outputData)),
    columns: columns,
    rowHeaders: true,
    colHeaders: true,
    filters: true,
    stretchH: 'all',
    autoWrapRow: true,
    maxRows: 250,
    exportFile: true,
    dropdownMenu: true,
    contextMenu: true,
    manualRowMove: true,
    manualColumnMove: true,
    filters: true,
    autoColumnSize: {
     samplingRatio: 23
    },
    multiColumnSorting: {
      indicator: true
    },
    search: true,
    licenseKey: 'non-commercial-and-evaluation'
});
