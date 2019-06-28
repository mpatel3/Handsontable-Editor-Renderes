const filter = {
  init(container, config, data) {
    this.config = config;
    this.data = data;
    this.cacheDom(container);
    this.bindEvents();
    this.initEditData();
  },

  cacheDom(container) {
    this.container = jQuery(`.${container}`);
    this.addNewFilterBtn = this.container.find('.addNewFilterBtn');
    this.filterContainer = this.container.find('.filterContainer');
    this.filterPlaceholder = this.container.find('.filterPlaceholder');

    this.addNewGroupByBtn = this.container.find('.addNewGroupByBtn');
    this.groupByContainer = this.container.find('.groupByContainer');
    this.groupByPlaceholder = this.container.find('.groupByPlaceholder');

    this.addNewSortByBtn = this.container.find('.addNewSortByBtn');
    this.sortByContainer = this.container.find('.sortByContainer');
    this.sortByPlaceholder = this.container.find('.sortByPlaceholder');
  },

  bindEvents() {
    this.addNewFilterBtn.on('click', this.addNewFilter.bind(this));
    this.addNewGroupByBtn.on('click', this.addNewGroupBy.bind(this));
    this.addNewSortByBtn.on('click', this.addNewSortBy.bind(this));
  },

  initEditData() {
    if (!this.data)
      return true;

    if (this.data.filter) {
      Object.keys(this.data.filter).each((key) => {
        this.addNewFilterBtn.trigger('click');
        const rowData = this.data.filter[key],
              itemRow = this.filterContainer.find('.filter-item-row:last-child');

        itemRow.find('.columnSelect').val(rowData.column).trigger('change');
        itemRow.find('.criteriaSelect').val(rowData.criteria).trigger('change');
        itemRow.find('.valueSelectWrpp input, .valueSelectWrpp select')[0].value = rowData.value;
      });    
    }

    if (this.data.group_by) {
      this.data.group_by.column.each((columnId) => {
        this.addNewGroupByBtn.trigger('click');
        const itemRow = this.groupByContainer.find('.group-by-item-row:last-child');
        itemRow.find('select').val(columnId);
      });
    }

    if (this.data.sort_by) {
      Object.keys(this.data.sort_by).each((key) => {
        this.addNewSortByBtn.trigger('click');
        const rowData = this.data.sort_by[key],
              itemRow = this.sortByContainer.find('.sort-by-item-row:last-child');

        itemRow.find('.sortByColumnSelect').val(rowData.column);
        itemRow.find('.sortByOrderSelect').val(rowData.order);
      });    
    }
  },

  addNewFilter(event) {
    event.preventDefault();
    event.stopPropagation();
    const obj = jQuery(event.target.dataset.formPrepend),
      dateTime = new Date().getTime();

    obj.data('uniqId', `${dateTime}`);
    obj[0].dataset.uniqId = `${dateTime}`;

    obj.find('select').each(function () {
      jQuery(this).attr('name', function () {
        return jQuery(this)
          .attr('name')
          .replace('new_record', dateTime);
      });

      jQuery(this).attr('id', function () {
        return jQuery(this)
          .attr('id')
          .replace('new_record', dateTime);
      });
    });

    if (this.filterContainer.find('.filter-item-row').length === 0) {
      obj.find('.conditionConnector').html('where');
    } else {
      obj.find('.conditionConnector a').text(document.getElementById('filterConditionConnectorInput').value);
    }

    this.filterContainer.append(obj);
    this.toggleFilterPlaceholder();
    // Bind Events
    this.container.find('.removeFilterItemBtn').off('click').on('click', this.removeFilterItem.bind(this));
    this.container.find('.columnSelect').off('change').on('change', this.handleColumnSelectChange.bind(this));
    this.container.find('.criteriaSelect').off('change').on('change', this.handleCriteriaChange.bind(this));
    this.container.find('.conditionConnector a').off('click').on('click', this.toggleConditionConnector.bind(this));
    // Trigger Change Event
    obj.find('.columnSelect').trigger('change');
  },

  removeFilterItem(event) {
    event.target.closest('.filter-item-row').remove();
    this.toggleFilterPlaceholder();
  },

  toggleFilterPlaceholder() {
    if (this.filterContainer.find('.filter-item-row').length >= 1) {
      this.filterContainer.find('.filter-item-row:first-child').find('.conditionConnector').html('where');
      this.filterPlaceholder.hide();
    } else {
      this.filterPlaceholder.show();
    }
  },

  handleColumnSelectChange(event) {
    const selectedColumnId = event.target.value,
          itemRow = event.target.closest('.filter-item-row'),
          criteries = this.getDataTypeCriteries(null, selectedColumnId),
          criteriaSelect = itemRow.querySelector('.criteriaSelect');

    while (criteriaSelect.firstChild) criteriaSelect.removeChild(criteriaSelect.firstChild);

    criteries.each((criteria) => {
      criteriaSelect.options[criteriaSelect.options.length] = new Option(criteria, criteria);
    });

    this.buildValueField(itemRow, selectedColumnId, criteriaSelect.value);
  },

  handleCriteriaChange(event) {
    const selectedCriteria = event.target.value,
          itemRow = event.target.closest('.filter-item-row'),
          selectedColumnId = itemRow.querySelector('.columnSelect').value;
    this.buildValueField(itemRow, selectedColumnId, selectedCriteria);
  },

  buildValueField(itemRow, selectedColumnId, selectedCriteria) {
    const metaData = this.getColumnMetaData(selectedColumnId),
          uniqId = itemRow.dataset.uniqId,
          criteriaMetaInfo = metaData[selectedCriteria];

    if (criteriaMetaInfo.field_type === 'input') {
      this.addInputTypeField(itemRow, uniqId);
    } else if (criteriaMetaInfo.field_type === 'team_typahead') {
      this.addTeamLookaheadField(itemRow, uniqId);
    } else if (criteriaMetaInfo.field_type === 'checkbox') {
      this.addCheckboxField(itemRow, uniqId, criteriaMetaInfo);
    } else if (criteriaMetaInfo.field_type === 'dropdown') {
      this.addDropdownField(itemRow, uniqId, criteriaMetaInfo);
    } else if (criteriaMetaInfo.field_type === 'date_picker') {
      this.addDatePickerField(itemRow, uniqId, criteriaMetaInfo);
    }
  },

  addInputTypeField(itemRow, uniqId) {
    const input = document.createElement('input');
    input.setAttribute('name', `tracker_view[configuration][filter][${uniqId}][value]`);
    input.setAttribute('class', 'form-control');
    itemRow.querySelector('.valueSelectWrpp').innerHTML = '';
    itemRow.querySelector('.valueSelectWrpp').appendChild(input);
  },

  addTeamLookaheadField(itemRow, uniqId) {
    const input = document.createElement('input'),
          placeholder = 'Start typing a team name';

    input.setAttribute('name', `tracker_view[configuration][filter][${uniqId}][value]`);
    input.setAttribute('class', 'form-control');
    itemRow.querySelector('.valueSelectWrpp').innerHTML = '';
    itemRow.querySelector('.valueSelectWrpp').appendChild(input);

    jQuery(input).tokenInput(
      `/t_all_teams?user_id=${window.current_user_id}&domain_id=${window.current_domain_id}`,
      {
        theme: 'facebook',
        tokenLimit: 1,
        minChars: 1,
        searchDelay: 1000,
        hintText: placeholder,
        defaultText: placeholder,
        searchingText: false,
      }
    );
  },

  addCheckboxField(itemRow, uniqId, criteriaMetaInfo) {
    const select = document.createElement('select');
    
    select.setAttribute('class', 'col-xs-12 form-control');
    select.setAttribute('name', `tracker_view[configuration][filter][${uniqId}][value]`);
    select.setAttribute('multiple', true);

    criteriaMetaInfo.options.each((text) => {
      select.options[select.options.length] = new Option(text, text);
    });
    itemRow.querySelector('.valueSelectWrpp').innerHTML = '';
    itemRow.querySelector('.valueSelectWrpp').appendChild(select);

    jQuery(select).multiselect({
      classes: 'ma-filter-multi-value',
      minWidth: 420,
      position: {
          at: 'left bottom',
          my: 'left top',
      },
      placeholder: 'Choose options',
    });
  },

  addDropdownField(itemRow, uniqId, criteriaMetaInfo) {
    const select = document.createElement('select'),
          placeholder = document.createElement('option');

    placeholder.text = 'Choose option';
    placeholder.value = '';
    select.appendChild(placeholder);

    select.setAttribute('class', 'col-xs-12 form-control');
    select.setAttribute('name', `tracker_view[configuration][filter][${uniqId}][value]`);

    criteriaMetaInfo.options.each((text) => {
      select.options[select.options.length] = new Option(text, text);
    });
    itemRow.querySelector('.valueSelectWrpp').innerHTML = '';
    itemRow.querySelector('.valueSelectWrpp').appendChild(select);
  },

  addDatePickerField(itemRow, uniqId, criteriaMetaInfo) {
    const input = document.createElement('input');
    input.setAttribute('name', `tracker_view[configuration][filter][${uniqId}][value]`);
    input.setAttribute('class', 'inline-block calendarTextBox');
    itemRow.querySelector('.valueSelectWrpp').innerHTML = '';
    itemRow.querySelector('.valueSelectWrpp').appendChild(input);
    MSTrackerDesigner.MSTrackerDesignerView.prototype.setDateTimePickerOptions(jQuery(input), criteriaMetaInfo.format, null, null);
  },

  getColumnMetaData(selectedColumnId) {
    return this.config[selectedColumnId];
  },

  getDataTypeCriteries(metaData, selectedColumnId) {
    return (metaData == null) ? Object.keys(this.config[selectedColumnId]) : Object.keys(metaData);
  },

  toggleConditionConnector() {
    const filterConditionConnectorInput = document.getElementById('filterConditionConnectorInput');

    if (filterConditionConnectorInput.value === 'and') {
      filterConditionConnectorInput.value = 'or';
    } else {
      filterConditionConnectorInput.value = 'and';
    }

    document.querySelectorAll('.conditionConnector a').forEach((ele) => {
      ele.text = filterConditionConnectorInput.value;
    });
  },

  addNewGroupBy(event) {
    event.preventDefault();
    event.stopPropagation();
    const obj = jQuery(event.target.dataset.formPrepend);

    if (this.groupByContainer.find('.group-by-item-row').length === 0) {
      obj.find('.groupByLabel').html('Group By');
    } else {
      obj.find('.groupByLabel').html('And Then By');
    }

    this.groupByContainer.append(obj);
    this.toggleGroupByPlaceholder();
    // Bind Events
    this.container.find('.removeGroupByItemBtn').off('click').on('click', this.removeGroupByItem.bind(this));
  },

  toggleGroupByPlaceholder() {
    if (this.groupByContainer.find('.group-by-item-row').length >= 1) {
      this.groupByContainer.find('.group-by-item-row:first-child').find('.groupByLabel').html('Group By');
      this.groupByPlaceholder.hide();
    } else {
      this.groupByPlaceholder.show();
    }
  },

  removeGroupByItem(event) {
    event.target.closest('.group-by-item-row').remove();
    this.toggleGroupByPlaceholder();
  },

  addNewSortBy(event) {
    event.preventDefault();
    event.stopPropagation();
    const obj = jQuery(event.target.dataset.formPrepend),
          dateTime = new Date().getTime();

    obj.find('select').each(function () {
      jQuery(this).attr('name', function () {
        return jQuery(this)
          .attr('name')
          .replace('new_record', dateTime);
      });

      jQuery(this).attr('id', function () {
        return jQuery(this)
          .attr('id')
          .replace('new_record', dateTime);
      });
    });

    if (this.sortByContainer.find('.sort-by-item-row').length === 0) {
      obj.find('.sortByLabel').html('Sort By');
    } else {
      obj.find('.sortByLabel').html('And Then By');
    }

    this.sortByContainer.append(obj);
    this.toggleSortByPlaceholder();
    // Bind Events
    this.container.find('.removeSortByItemBtn').off('click').on('click', this.removeSortByItem.bind(this));
  },

  toggleSortByPlaceholder() {
    if (this.sortByContainer.find('.sort-by-item-row').length >= 1) {
      this.sortByContainer.find('.sort-by-item-row:first-child').find('.sortByLabel').html('Sort By');
      this.sortByPlaceholder.hide();
    } else {
      this.sortByPlaceholder.show();
    }
  },

  removeSortByItem(event) {
    event.target.closest('.sort-by-item-row').remove();
    this.toggleSortByPlaceholder();
  },
};

export default filter;
