import { API_URL, RES_PER_PAGE, KEY } from './config.js';
// import { getJSON, sendJSON } from './helper.js';
import { AJAX } from './helper.js';

export const state = {
  recipe: {},
  search: {
    query: '',
    results: [],
    page: 1,
    resultsPerPage: RES_PER_PAGE,
  },
  bookmarks: [],
};

const createRecipeObject = function (data) {
  const { recipe } = data.data;
  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    ...(recipe.key && { key: recipe.key }), //只有key存在時才生效; conditionally add properties to an object
  };
};

export const loadRecipe = async function (id) {
  try {
    const data = await AJAX(`${API_URL}${id}?key=${KEY}`);

    // const res = await fetch(`${API_URL}/${id}`);
    // const data = await res.json();

    // if (!res.ok) throw new Error(`${data.message} (${res.status})`);

    state.recipe = createRecipeObject(data);

    // bookmark: determine whether add 'fill' or not
    if (state.bookmarks.some(bookmark => bookmark.id === id))
      state.recipe.bookmarked = true;
    else state.recipe.bookmarked = false;

    console.log(state.recipe);
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const loadSearchResults = async function (query) {
  try {
    state.search.query = query;

    const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);
    console.log(data);

    state.search.results = data.data.recipes.map(rec => {
      return {
        id: rec.id,
        title: rec.title,
        publisher: rec.publisher,
        image: rec.image_url,
        ...(rec.key && { key: rec.key }),
      };
    });
    state.search.page = 1; //reset the page to 1 ; 不然會保留在上次的頁數
    // console.log(state.search.results);
  } catch (err) {
    console.log(err);
    throw err;
  }
};

// loadSearchResults('pizza');

export const getSearchResultsPage = function (page = state.search.page) {
  state.search.page = page;

  const start = (page - 1) * state.search.resultsPerPage; //0;
  const end = page * state.search.resultsPerPage; //9; NOTE slice doesn't include the last value we pass in

  return state.search.results.slice(start, end);
};

export const updateServings = function (newServings) {
  state.recipe.ingredients.forEach(ing => {
    ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
    // newQt = oldQt * newServings / oldServings // 2 * 8 / 4 =4
  });

  // after calc then update
  state.recipe.servings = newServings;
};

// localStorage save bookmarks
const persistBookmarks = function () {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

export const addBookmark = function (recipe) {
  // Add bookmark
  state.bookmarks.push(recipe);

  // Mark current recipe as bookmarked
  // if (recipe.id === state.recipe.id) // extra; but Jonas but this here
  state.recipe.bookmarked = true;

  persistBookmarks();
};

export const deleteBookmark = function (id) {
  // Delete bookmark
  const index = state.bookmarks.findIndex(el => el.id === id); // find index and use for delete later
  state.bookmarks.splice(index, 1); //index, how many item wanna delete: 1 in this case

  // Mark current recipe as NOT bookmarked
  // if (recipe.id === state.recipe.id) // extra; but Jonas but this here
  state.recipe.bookmarked = false;

  persistBookmarks();
};

const init = function () {
  const storage = localStorage.getItem('bookmarks');
  if (storage) state.bookmarks = JSON.parse(storage);
};

init();

// for DEV
const clearBookmarks = function () {
  localStorage.clear('bookmarks');
};

// clearBookmarks();

// NOTE clear bookmarks from localStorage (my version)

// const clearLocalStorage = () => {
//   const createdTime = localStorage.getItem('createdTime');
//   const currentTime = Date.now();
//   const resetExpiryTime = () =>
//     localStorage.setItem('createdTime', currentTime);

//   if (!createdTime) return resetExpiryTime();

//   // NOTE after 5 secs then clear localStorage up (5*1000)
//   // NOTE change to longer time after testing
//   if (currentTime - createdTime > 5000) {
//     alert('clear: Do Something'); // render modal, redirect etc.
//     localStorage.clear(); // clear all or only clear specific data
//     return resetExpiryTime();
//   }

//   resetExpiryTime(); //postpone/reset the expired time if still under the allowed expiration
// };

// clearLocalStorage();

export const uploadRecipe = async function (newRecipe) {
  try {
    // console.log(Object.entries(newRecipe)); //轉回array
    const ingredients = Object.entries(newRecipe)
      .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
      .map(ing => {
        // const ingArr = ing[1].replaceAll(' ', '').split(',');
        const ingArr = ing[1].split(',').map(el => el.trim()); //改掉有空格的bug e.g. chocolate milk 會變成 chocolatemilk 因此每個各別 trim()
        if (ingArr.length !== 3)
          throw new Error(
            'Wrong ingredient format! Please use the correct format 😒😒😒'
          );

        const [quantity, unit, description] = ingArr;
        return { quantity: quantity ? +quantity : null, unit, description };
      });

    const recipe = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      ingredients,
    };

    // console.log(recipe);
    const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);
    // console.log(data);
    state.recipe = createRecipeObject(data);
    addBookmark(state.recipe);
  } catch (err) {
    // re-throw the promise error

    throw err;
  }
};
