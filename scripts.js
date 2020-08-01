const endpoint = "https://cors-anywhere.herokuapp.com/http://www.recipepuppy.com/api";
const searchForm = document.querySelector("form#search");
const addCustomForm = document.querySelector("form#add-custom");
const goButton = document.querySelector("button.go");
const searchResultsList = document.querySelector(".search-results-list");
const searchHeader = document.querySelector(".search-header");
const shoppingListContainer = document.querySelector(".shopping-list");
const ingredientsEl = document.querySelector(".shopping-list .ingredients");
const recipesEl = document.querySelector(".shopping-list .recipes")
const startContainer = document.querySelector(".start");
let data = [];
let shoppingListItems = [];

const removeItem = e => {
    const itemName = e.currentTarget.previousElementSibling.textContent;
    const itemIndex = shoppingListItems.indexOf(itemName);
    shoppingListItems.splice(itemIndex, 1);
    renderList();
}

const removeRecipe = e => {
    const deletedRecipe = e.currentTarget.dataset.src;
    const recipeIndex = data.findIndex(recipe => recipe.href === deletedRecipe);
    data[recipeIndex].state = "removed";
    const newShoppingList = [];
    shoppingListItems.forEach(item => {
        // Get the index of reference to the deleted recipe
        const recipeLink = item.src.indexOf(deletedRecipe);
        console.log(recipeLink);
        // Delete the reference
        recipeLink !== -1 && item.src.splice(recipeLink, 1)
        item.src.length !== 0 && newShoppingList.push(item);
    })
    shoppingListItems = newShoppingList;
    console.log(shoppingListItems);
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

const addRecipeDependencies = recipe => {
    const recipeSrc = recipe.href;
    recipe.ingredients.forEach(ingredient => {
        const itemIndex = shoppingListItems.findIndex(entry => entry.name === ingredient);
        switch (itemIndex === -1) {
            case true: 
                shoppingListItems.push({ name: ingredient, src: [recipeSrc] })
                break;
            case false: 
                shoppingListItems[itemIndex].src.push(recipeSrc)
                break;
        }
    })
}

const renderList = () => {
    const addedRecipes = data.filter(recipe => recipe.state === "adding");
    addedRecipes.forEach(recipe => addRecipeDependencies(recipe));
    const preExistingRecipes = data.filter(recipe => recipe.state === "added");
    const recipesToRender = addedRecipes.concat(preExistingRecipes);
    const recipesHTML = recipesToRender.map(recipe =>
    `<div class="recipe">
        <button class="remove-recipe" data-src="${recipe.href}">${recipe.title}
            <span>&times;</span>
        </button>
    </div>`).join("");
    const shoppingListHTML = shoppingListItems.map(ingredient => 
        `<div class="ingredient" data-src="${ingredient.src}">
            <p>${ingredient.name}</p>
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

const openSearch = e => {
    searchForm.reset();
    searchHeader.style.display = "block";
    e.currentTarget.removeEventListener("click", openSearch);
    e.currentTarget.remove();
}

const addItems = async e => {
    const recipeEl = e.currentTarget.closest(".search-results-item");
    const recipeHref = recipeEl.querySelector(".recipe-src").href;
    const recipe = data[data.findIndex(e => e.href === recipeHref)];
    recipe.state = "adding";
    renderList();
    e.currentTarget.setAttribute("disabled", "true");
    e.currentTarget.textContent = "Added"
    recipe.state = "added";
    const addMoreRecipes = document.createElement("button")
    addMoreRecipes.textContent = "Want to add more recipes?";
    addMoreRecipes.addEventListener("click", openSearch);
    setTimeout(() => {
        searchHeader.style.display = "none";
        searchResultsList.style.display = "none";
        !searchHeader.previousElementSibling && searchHeader.insertAdjacentElement("beforebegin", addMoreRecipes);
    }, 1500);
}

const renderSearch = recipes => {
    if (recipes.length === 0) {
        searchResultsList.innerHTML = `<h3>No results found. Please try again.</h3>`
    } else {
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
        searchResultsList.removeAttribute("style");
    }
}

const fetchRecipes = query => {
    const request = fetch(`${endpoint}?q=${query}`).then(response => response.json());
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
        ingredients: Array.from(new Set(recipe.ingredients.split(", "))),
        state: "loaded"
    }));
    results.forEach(result => {
        !data.find(entry => entry.href === result.href)
        && data.push(result);
    })
    renderSearch(results)
}

const addCustomItem = e => {
    e.preventDefault();
    const newItem = e.target.item.value;
    !shoppingListItems.find(item => item === newItem)
        && shoppingListItems.push({
            name: newItem,
            src: "custom",
        });
    renderList();
    addCustomForm.reset();
}

const goShopping = e => {
    e.preventDefault;
    alert("Oops! This feature wasn't implemented... yet.");
}

searchForm.addEventListener("submit", searchRecipes);
addCustomForm.addEventListener("submit", addCustomItem);
goButton.addEventListener("click", goShopping);

addCustomForm.reset();
searchForm.reset();