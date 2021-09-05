import View from './View.js';
import icons from 'url:../../img/icons.svg';

class PaginationView extends View {
  _parentElement = document.querySelector('.pagination');

  addHandlerClick(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn--inline');
      //   guard: in case no dataset ---> null
      //   Cannot read property 'dataset' of null
      if (!btn) return;

      const goToPage = +btn.dataset.goto; //convert to number (type)
      handler(goToPage); //把要去的頁面傳回去 並且重新生成
    });
  }

  _generateMarkup() {
    const curPage = this._data.page;
    //   依照數量計算出總共有幾頁
    const numPages = Math.ceil(
      this._data.results.length / this._data.resultsPerPage
    );
    // Page 1, and there are other pages
    if (curPage === 1 && numPages > 1) {
      return `
      <button  data-goto="${
        curPage + 1
      }" class="btn--inline pagination__btn--next">
          <span>Page ${curPage + 1}</span>
          <svg class="search__icon">
            <use href="${icons}#icon-arrow-right"></use>
          </svg>
       </button>
      `;
    }
    // last page
    if (curPage === numPages && numPages > 1) {
      return `
       <button data-goto="${
         curPage - 1
       }" class="btn--inline pagination__btn--prev">
            <svg class="search__icon">
                <use href="${icons}#icon-arrow-left"></use>
            </svg>
        <span>Page ${curPage - 1}</span>
       </button>
      `;
    }
    // Other page
    if (curPage < numPages) {
      return `
        <button data-goto="${
          curPage - 1
        }" class="btn--inline pagination__btn--prev">
             <svg class="search__icon">
                 <use href="${icons}#icon-arrow-left"></use>
             </svg>
         <span>Page ${curPage - 1}</span>
        </button>

        <button data-goto="${
          curPage + 1
        }" class="btn--inline pagination__btn--next">
         <span>Page ${curPage + 1}</span>
           <svg class="search__icon">
             <use href="${icons}#icon-arrow-right"></use>
           </svg>
        </button>
       `;
    }
    // Page 1, and there are NO other pages
    return '';
  }
}

export default new PaginationView();
