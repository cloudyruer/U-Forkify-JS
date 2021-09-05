import View from './View.js';
import icons from 'url:../../img/icons.svg';

/*
In OOP, extends represents an "is-a" relationship between 2 entities. For instance, "Student" / "Teacher" is a "Person". So its right to have "Student" extends "Person".

Now coming back to this context, this becomes "ResultsView" / "BookmarkView" is a "PreviewView" when really "PreviewView" is just a part of those 2 views. I believe this is also why Jonas imported "PreviewView" into those 2 views instead.
*/
class PreviewView extends View {
  _parentElement = '';

  _generateMarkup() {
    const id = window.location.hash.slice(1); // 網址中 hashtag(id) slice掉 #

    return `
    <li class="preview">
        <a class="preview__link ${
          this._data.id === id ? 'preview__link--active' : ''
        }" href="#${this._data.id}">
          <figure class="preview__fig">
            <img src="${this._data.image}" alt="${
      this._data.title
    }" crossorigin />
          </figure>
          <div class="preview__data">
            <h4 class="preview__title">${this._data.title}</h4>
            <p class="preview__publisher">${this._data.publisher}</p>
          
            <div class="preview__user-generated ${
              this._data.key ? '' : 'hidden'
            }">
              <svg>
                <use href="${icons}#icon-user"></use>
              </svg>
            </div>
          </div>
        </a>
    </li>
`;
  }
}

export default new PreviewView();
