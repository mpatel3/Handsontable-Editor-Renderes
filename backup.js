let templateString = ``;
for (var option in options) {
  if (options.hasOwnProperty(option)) {
    const uniqId = `${option}_${(new Date()).getTime()}`;
    templateString += `<li><input type='checkbox' value=${options[option]}'  id='${uniqId}' /><label htmlFor=${uniqId}>${options[option]}</label></li>`;
  }
}
templateString += `<li id="test">Add New Option</li>`;
Handsontable.dom.fastInnerHTML(this.ulListElm, templateString);
const elem = document.getElementById('test');
elem.style.curser = 'pointer';
Handsontable.dom.addEvent(elem, 'click', function (e) {
    console.log(e.target);
    e.target.innerHTML = '<input type="text">';
    Handsontable.dom.addEvent(e.target,'blur',function(e){
      console.log(e);
    });

    e.target.focus();
});

for (var option in options) {
  if (options.hasOwnProperty(option)) {
    const optionElement = document.createElement('LI'),
          labelElement = document.createElement('label'),
           checkboxElement = document.createElement('input'),
           uniqId = `${option}_${(new Date()).getTime()}`;


        checkboxElement.type = 'checkbox';
        // checkboxElement.addClassName('filled-in');
        checkboxElement.value = options[option];
        checkboxElement.id = uniqId;

        labelElement.innerHTML = options[option];
        labelElement.htmlFor = uniqId;
        // labelElement.addClassName('greytext middle block left-7');

        // optionElement.addClassName('bottom_spacing5');
        optionElement.appendChild(checkboxElement);
        optionElement.appendChild(labelElement);

        Handsontable.dom.fastInnerHTML(this.ulListElm, optionElement);
        this.ulListElm.appendChild(optionElement);
    }
  }
