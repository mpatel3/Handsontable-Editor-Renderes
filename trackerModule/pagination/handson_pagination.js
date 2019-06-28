import utils from '../../utils';

/* eslint no-param-reassign: 0 */
const customPagiNationModule = (trackerContainerRef, pageSize) => {
  const paginationContainer = utils.grabElement(`${trackerContainerRef}-pagination`),
        newDataSet = window.HANDSONTABLEINSTANCES[trackerContainerRef].getData(),
        fancyBoxLoading = utils.grabElement('fancybox-loading'),
         /**
         * @description - Bind event to the pagination dom element and it will render the new content based on pageNumber
         */
        bindEvents = () => {
          paginationContainer.addEventListener('click', (e) => {
            const pageNumber = e.target.innerHTML;
            if (e.taget !== paginationContainer) {
              fancyBoxLoading.style.display = 'block';
              window.HANDSONTABLEINSTANCES[trackerContainerRef].updateSettings({
                hiddenRows: {
                  rows: getrowArray(pageNumber),
                  indicators: false,
                },
              });
            }
          });
        },
        /**
         * @description - Referesh the pagination container based on sorting and filtering.
         */
        pagingRefresh = () => {
              paginationContainer.innerHTML = '';
              createPages();
              window.HANDSONTABLEINSTANCES[trackerContainerRef].updateSettings({
                hiddenRows: {
                  rows: getrowArray(1),
                  indicators: false,
                },
              });
              paginationContainer.firstElementChild.focus();
        },
        /**
         * @description - create the btn elements to render.
         */
        createPages = () => {
          let bt;
          const els = Math.ceil(newDataSet.length / pageSize);
          for (let i = 0; i < els; i += 1) {
            bt = document.createElement('BUTTON');
            bt.className = 'myBt';
            bt.innerHTML = i + 1;
            paginationContainer.appendChild(bt);
          }
        },
        /**
         * @description - Function will get list of rows which will require to be hidden.
         */
        getrowArray = (pageNumber) => {
              const arr = [];
              if (pageNumber === 1) {
                for (let i = (pageNumber * pageSize); i < newDataSet.length; i += 1) { arr.push(i); }
                return arr;
              } else {
                for (let j = 0; j < (pageNumber * pageSize) - pageSize; j += 1) { arr.push(j); }
                for (let i = (pageNumber * pageSize); i < newDataSet.length; i += 1) { arr.push(i); }
                setTimeout(() => { fancyBoxLoading.style.display = 'none'; }, 500);
                return arr;
              }
        };
        bindEvents(); // bind events.
        createPages(); // render pagination element.
        window.HANDSONTABLEINSTANCES[trackerContainerRef].updateSettings({
          hiddenRows: {
            rows: getrowArray(1),
            indicators: false,
          },
        });
  return {
    pagingRefresh,
    createPages,
    getrowArray,
  };
};

export default customPagiNationModule;
