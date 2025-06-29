// script.js

// Array to store quote objects. Each quote has a text and a category.
let quotes = [
  { text: "The only way to do great work is to love what you do.", category: "Inspiration" },
  { text: "Strive not to be a success, but rather to be of value.", category: "Motivation" },
  { text: "The mind is everything. What you think you become.", category: "Philosophy" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", category: "Dreams" }
];

// Get DOM elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteButton = document.getElementById('newQuote');
const currentQuoteText = document.getElementById('currentQuoteText');
const currentQuoteCategory = document.getElementById('currentQuoteCategory');

/**
 * Displays a random quote from the 'quotes' array in the quoteDisplay area.
 * It updates the text and category elements with the selected quote's details.
 */
function showRandomQuote() {
  if (quotes.length === 0) {
    currentQuoteText.textContent = "No quotes available. Add some!";
    currentQuoteCategory.textContent = "";
    return;
  }
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const randomQuote = quotes[randomIndex];

  currentQuoteText.textContent = `"${randomQuote.text}"`;
  currentQuoteCategory.textContent = `- ${randomQuote.category}`;
}

/**
 * Dynamically creates and appends a form to the document body
 * that allows users to add new quotes and their categories.
 * This function uses advanced DOM manipulation to construct the form elements.
 */
function createAddQuoteForm() {
  // Create a container div for the form
  const formContainer = document.createElement('div');
  formContainer.id = 'addQuoteFormContainer';
  formContainer.className = 'container mt-8'; // Reusing the container style, adding top margin

  // Create input for new quote text
  const newQuoteTextInput = document.createElement('input');
  newQuoteTextInput.id = 'newQuoteText';
  newQuoteTextInput.type = 'text';
  newQuoteTextInput.placeholder = 'Enter a new quote';
  newQuoteTextInput.className = 'input-field';

  // Create input for new quote category
  const newQuoteCategoryInput = document.createElement('input');
  newQuoteCategoryInput.id = 'newQuoteCategory';
  newQuoteCategoryInput.type = 'text';
  newQuoteCategoryInput.placeholder = 'Enter quote category';
  newQuoteCategoryInput.className = 'input-field';

  // Create button to add quote
  const addQuoteButton = document.createElement('button');
  addQuoteButton.textContent = 'Add Quote';
  addQuoteButton.className = 'btn-primary';

  // Add event listener to the addQuote button
  addQuoteButton.addEventListener('click', addQuote);

  // Append elements to the form container
  formContainer.appendChild(newQuoteTextInput);
  formContainer.appendChild(newQuoteCategoryInput);
  formContainer.appendChild(addQuoteButton);

  // Append the form container to the body of the document
  document.body.appendChild(formContainer);
}

/**
 * Handles the addition of a new quote to the 'quotes' array
 * based on user input from the dynamically created form.
 * It also clears the input fields after adding the quote.
 */
function addQuote() {
  const newQuoteTextInput = document.getElementById('newQuoteText');
  const newQuoteCategoryInput = document.getElementById('newQuoteCategory');

  const quoteText = newQuoteTextInput.value.trim();
  const quoteCategory = newQuoteCategoryInput.value.trim();

  if (quoteText && quoteCategory) {
    quotes.push({ text: quoteText, category: quoteCategory });
    newQuoteTextInput.value = ''; // Clear the input field
    newQuoteCategoryInput.value = ''; // Clear the category field
    showRandomQuote(); // Display a new random quote, potentially including the new one
    console.log('Quote added:', { text: quoteText, category: quoteCategory });
  } else {
    // A simple way to provide feedback without using alert()
    // For a production app, this would be a more user-friendly modal or message
    alertMessage("Please enter both quote text and category.");
  }
}

/**
 * Creates and displays a simple alert message box.
 * This is used instead of the native `alert()` function for better UI control.
 * @param {string} message - The message to be displayed.
 */
function alertMessage(message) {
  const alertBox = document.createElement('div');
  alertBox.className = 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50';
  alertBox.textContent = message;
  document.body.appendChild(alertBox);

  setTimeout(() => {
    alertBox.remove();
  }, 3000); // Remove the alert after 3 seconds
}

// Event listener for the "Show New Quote" button
newQuoteButton.addEventListener('click', showRandomQuote);

// Initial calls when the script loads
document.addEventListener('DOMContentLoaded', () => {
  createAddQuoteForm(); // Create the form when the DOM is fully loaded
  showRandomQuote(); // Display an initial random quote
});