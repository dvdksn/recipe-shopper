const endpoint = "https://cors-anywhere.herokuapp.com/http://www.recipepuppy.com/api";
const searchForm = document.querySelector("form#search");
const addCustomForm = document.querySelector("form#add-custom");
const searchResultsList = document.querySelector(".search-results-list");
const shoppingListContainer = document.querySelector(".shopping-list");
const ingredientsEl = document.querySelector(".shopping-list .ingredients");
const recipesEl = document.querySelector(".shopping-list .recipes")
const startContainer = document.querySelector(".start");
let data = [];
let shoppingListItems = [];

const removeItem = e => {
    const item = e.currentTarget.parentElement;
    const itemName = e.currentTarget.previousElementSibling.textContent;
    const itemIndex = shoppingListItems.indexOf(itemName);
    shoppingListItems.splice(itemIndex, 1);
    const parent = item.parentElement;
    renderList();
}

const removeRecipe = e => {
    const item = e.currentTarget.parentElement;
    const parent = item.parentElement;
    renderList();
}

const activateButtons = () => {
    recipesEl.querySelectorAll("button.remove-recipe").forEach(
        btn => btn.addEventListener("click", removeRecipe)
    );
    ingredientsEl.querySelectorAll("button.remove-item").forEach(
        btn => btn.addEventListener("click", removeItem)
    );
}

const renderList = () => {
    const addedRecipes = data.filter(recipe => recipe.state === "adding");
    addedRecipes.forEach(recipes => recipes.ingredients.forEach(
        ingredient => 
            !shoppingListItems.find(entry => entry === ingredient)
            && shoppingListItems.push(ingredient)
    ));
    const preExistingRecipes = data.filter(recipe => recipe.state === "added");
    const recipesToRender = addedRecipes.concat(preExistingRecipes);
    const recipesHTML = recipesToRender.map(recipe =>
    `<div class="recipe">
        <button class="remove-recipe" data-src="${recipe.href}">${recipe.title}
            <span>&times;</span>
        </button>
    </div>`).join("");
    const shoppingListHTML = shoppingListItems.map(ingredient => 
        `<div class="ingredient">
            <p>${ingredient}</p>
            <button class="remove-item">Remove</button>
        </div>`).join("");
    recipesEl.innerHTML = recipesHTML;
    !recipesEl.firstElementChild
        && recipesEl.insertAdjacentHTML("afterbegin", `<p>No recipes selected.</p>`);
    ingredientsEl.innerHTML = shoppingListHTML;
    !ingredientsEl.firstElementChild &&
        ingredientsEl.insertAdjacentHTML("afterbegin", `<p>No ingredients selected.</p>`);
    shoppingListContainer.removeAttribute("style");
    startContainer.removeAttribute("style");
    activateButtons();
}

const addItems = e => {
    const recipeEl = e.currentTarget.closest(".search-results-item");
    const recipeHref = recipeEl.querySelector(".recipe-src").href;
    const recipe = data[data.findIndex(e => e.href === recipeHref)];
    recipe.state = "adding";
    renderList();
    recipe.state = "added";
}

const renderSearch = recipes => {
    const resultsHTML = recipes.map(recipe => 
        `<div class="search-results-item">
            <h3 class="recipe-name">${ recipe.title }</h3>
            ${ recipe.thumbnail && `<img class="thumbnail" src="${ recipe.thumbnail }" />`}
            <p><strong>Ingredients: </strong>
                <span class="ingredients">${ recipe.ingredients.join(", ")}</span>
            </p>
            <a class="recipe-src" href="${recipe.href}">View recipe</a>
            <button class="add-recipe">Add Items</button>
        </div>`
    ).join("");
    searchResultsList.innerHTML = resultsHTML;
    searchResultsList.querySelectorAll("button.add-recipe").forEach(
        btn => btn.addEventListener("click", addItems)
    );
    searchResultsList.getAttribute("style") && searchResultsList.removeAttribute("style");
}

const fetchRecipes = query => {
    const request = fetch(`${endpoint}?q=${query}`)
                    .then(response => response.json());
    return request;
}

const searchRecipes = async e => {
    e.preventDefault();
    const query = e.target.query.value;
    const request = await fetchRecipes(query);
    const results = request.results.map(recipe => ({
        title: recipe.title,
        href: recipe.href,
        thumbnail: recipe.thumbnail,
        ingredients: recipe.ingredients.split(", "),
        state: "loaded"
    }));
    results.forEach(result => {
        !data.find(entry => entry.href === result.href)
        && data.push(result);
    })
    renderSearch(results);
}

const addCustomItem = e => {
    e.preventDefault();
    const newItem = e.target.item.value;
    !shoppingListItems.find(item => item === newItem)
        && shoppingListItems.push(newItem);
    renderList();
    addCustomForm.reset();
}

searchForm.addEventListener("submit", searchRecipes);
addCustomForm.addEventListener("submit", addCustomItem);
addCustomForm.reset();
searchForm.reset();