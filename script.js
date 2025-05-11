const API_KEY = '8ed7a9e3c5dc435696aa73f0497e89de'; // Replace with your Spoonacular API Key 
const form = document.getElementById('ingredient-form');
const recipesDiv = document.getElementById('recipes');
const favoritesButton = document.getElementById('show-favorites');
const favoritesListDiv = document.getElementById('favorites-list');
const shoppingListDiv = document.getElementById('shopping-list');
const shoppingListItems = document.getElementById('shopping-items');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const mealPlanDiv = document.getElementById('meal-plan');
const searchHistoryDiv = document.getElementById('history-list');
const viewShoppingListButton = document.getElementById('view-shopping-list');
const clearShoppingListButton = document.getElementById('clear-shopping-list');
const copyListButton = document.getElementById('copy-list');

// ---------------------- SHOPPING LIST LOGIC ----------------------
async function addToShoppingList(recipeId) {
  try {
    const res = await fetch(`https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${API_KEY}`);
    const { extendedIngredients, title } = await res.json();
    let shoppingList = JSON.parse(localStorage.getItem('shoppingList')) || [];
    shoppingList = [...shoppingList, ...extendedIngredients.map(ing => ing.original)];
    localStorage.setItem('shoppingList', JSON.stringify(shoppingList));
    alert(`Ingredients from "${title}" added to shopping list!`);
  } catch (err) {
    console.error('Error:', err);
    alert('Failed to add ingredients.');
  }
}

function displayShoppingList() {
shoppingListDiv.classList.add('visible');
  const shoppingList = JSON.parse(localStorage.getItem('shoppingList')) || [];
  shoppingListItems.innerHTML = shoppingList.length ? shoppingList.map(item => `<li>${item}</li>`).join('') : '<p>No items in your shopping list.</p>';
}

function clearShoppingList() {
  localStorage.removeItem('shoppingList');
  shoppingListItems.innerHTML = '<p>Shopping list cleared.</p>';
  alert('Shopping list cleared.');
}

function copyShoppingList() {
  const items = [...shoppingListItems.querySelectorAll('li')].map(li => li.textContent).join('\n');
  navigator.clipboard.writeText(items).then(() => alert('Shopping list copied!')).catch(err => alert('Failed to copy shopping list.'));
}

viewShoppingListButton.addEventListener('click', displayShoppingList);
clearShoppingListButton.addEventListener('click', clearShoppingList);
copyListButton.addEventListener('click', copyShoppingList);

// ---------------------- MEAL PLAN LOGIC ----------------------
const mealPlan = {};
const timeSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM', '11:00 PM', '12:00 AM'];
const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

function renderMealSchedule() {
  daysOfWeek.forEach(day => {
    const dayDiv = document.getElementById(day);
    dayDiv.innerHTML = `
      <span>${day.charAt(0).toUpperCase() + day.slice(1)}</span><br/>
      <div class="meal-slot">
        <label for="${day}_time">Select Time Slot</label>
        <select id="${day}_time" onchange="selectTimeSlot('${day}')">
          <option value="">Select Time</option>
          ${timeSlots.map(slot => `<option value="${slot}">${slot}</option>`).join('')}
        </select>
        <span id="${day}_meal">${mealPlan[day] ? mealPlan[day].map(meal => `${meal.time}: ${meal.name}`).join('<br/>') : 'No recipe selected'}</span>
      </div>
    `;
  });
}

function selectTimeSlot(day) {
  const selectedTime = document.getElementById(`${day}_time`).value;
  if (selectedTime) {
    const mealName = prompt(`Enter recipe name for ${day} at ${selectedTime}:`);
    if (mealName) {
      if (!mealPlan[day]) mealPlan[day] = [];
      mealPlan[day].push({ time: selectedTime, name: mealName });
      renderMealSchedule();
    }
  }
}

// ---------------------- FAVORITES LOGIC ----------------------
function isFavorite(id) {
  const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  return favorites.some(fav => fav.id === id);
}

function saveFavorite(recipe) {
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  if (!isFavorite(recipe.id)) {
    favorites.push(recipe);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    alert(`${recipe.title} has been added to favorites!`);
  } else {
    alert(`${recipe.title} is already in favorites.`);
  }
}

function removeFavorite(id) {
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  favorites = favorites.filter(fav => fav.id !== id);
  localStorage.setItem('favorites', JSON.stringify(favorites));
  alert('Recipe removed from favorites.');
  displayFavorites();
}

function displayFavorites() {
  const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  if (favorites.length === 0) {
    favoritesListDiv.innerHTML = '<p>No favorite recipes yet!</p>';
    return;
  }

  favoritesListDiv.innerHTML = favorites.map(fav => `
    <div class="recipe-card">
      <img src="${fav.image}" alt="${fav.title}" />
      <h3>${fav.title}</h3>
      <a href="https://spoonacular.com/recipes/${fav.title.replace(/\s+/g, '-').toLowerCase()}-${fav.id}" target="_blank">View Recipe</a>
      <button class="remove-favorite" data-id="${fav.id}">Remove from Favorites</button>
    </div>
  `).join('');

  document.querySelectorAll('.remove-favorite').forEach(button => {
    button.addEventListener('click', () => {
      const id = parseInt(button.dataset.id);
      removeFavorite(id);
    });
  });
}

// ---------------------- DISPLAY RECIPES ----------------------
function displayRecipes(recipes) {
  recipesDiv.innerHTML = recipes.map(recipe => `
    <div class="recipe-card" data-id="${recipe.id}" data-title="${recipe.title}" data-image="${recipe.image}">
      <img src="${recipe.image}" alt="${recipe.title}" />
      <h3>${recipe.title}</h3>
      <a href="https://spoonacular.com/recipes/${recipe.title.replace(/\s+/g, '-').toLowerCase()}-${recipe.id}" target="_blank">View Recipe</a>
      <div class="rating">
        <span class="star" data-rating="1">⭐</span>
        <span class="star" data-rating="2">⭐</span>
        <span class="star" data-rating="3">⭐</span>
        <span class="star" data-rating="4">⭐</span>
        <span class="star" data-rating="5">⭐</span>
      </div>
      <span class="favorite-icon" data-id="${recipe.id}" data-title="${recipe.title}" data-image="${recipe.image}">
        ${isFavorite(recipe.id) ? '❤️' : '🤍'}
      </span>
      <button class="add-to-shopping" data-id="${recipe.id}">🛒 Add to Shopping List</button>
    </div>
  `).join('');

  document.querySelectorAll('.favorite-icon').forEach(icon => {
    icon.addEventListener('click', () => {
      const id = parseInt(icon.dataset.id);
      const title = icon.dataset.title;
      const image = icon.dataset.image;
      const recipe = { id, title, image };

      if (isFavorite(id)) {
        removeFavorite(id);
        icon.textContent = '🤍';
      } else {
        saveFavorite(recipe);
        icon.textContent = '❤️';
      }
    });
  });

  document.querySelectorAll('.star').forEach(star => {
    star.addEventListener('click', () => {
      const rating = star.dataset.rating;
      alert(`You rated this recipe ${rating} stars!`);
    });
  });

  document.querySelectorAll('.add-to-shopping').forEach(button => {
    button.addEventListener('click', () => {
      const recipeId = button.dataset.id;
      addToShoppingList(recipeId);
    });
  });
}

// ---------------------- SEARCH LOGIC ----------------------
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const ingredients = document.getElementById('ingredients').value;
  const diet = document.getElementById('diet').value;

  if (!ingredients.trim()) return;
  recipesDiv.innerHTML = '<p>Loading...</p>';

  try {
    const res = await fetch(`https://api.spoonacular.com/recipes/findByIngredients?ingredients=${encodeURIComponent(ingredients)}&diet=${diet}&number=10&apiKey=${API_KEY}`);
    const recipes = await res.json();

    if (recipes.length === 0) {
     recipesDiv.innerHTML = '<p>No recipes found. Try different ingredients.</p>';
return;
}
displayRecipes(recipes);
saveSearchHistory(ingredients);
} catch (err) {
console.error(err);
recipesDiv.innerHTML = '<p>Error fetching recipes. Please try again.</p>';
}
});

// ---------------------- EXTRA FEATURES ----------------------
favoritesButton.addEventListener('click', displayFavorites);

darkModeToggle.addEventListener('click', () => {
document.body.classList.toggle('dark-mode');
darkModeToggle.textContent = document.body.classList.contains('dark-mode') ? '🌞 Light Mode' : '🌙 Dark Mode';
});

function saveSearchHistory(query) {
const history = JSON.parse(localStorage.getItem('searchHistory')) || [];
history.push(query);
localStorage.setItem('searchHistory', JSON.stringify(history));
renderSearchHistory();
}

function renderSearchHistory() {
const history = JSON.parse(localStorage.getItem('searchHistory')) || [];
searchHistoryDiv.innerHTML = history.map(item => `<li>${item}</li>`).join('');
}

// ---------------------- INITIALIZE ----------------------
renderSearchHistory();
renderMealSchedule();

