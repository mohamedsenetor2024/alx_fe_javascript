// Load quotes from localStorage or use defaults
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to predict the future is to invent it.", category: "inspiration" },
  { text: "Do not be afraid to give up the good to go for the great.", category: "motivation" },
  { text: "Success usually comes to those who are too busy to be looking for it.", category: "success" }
];

// DOM references
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const categorySelect = document.getElementById("categorySelect");
const addQuoteBtn = document.getElementById("addQuoteBtn");
const newQuoteText = document.getElementById("newQuoteText");
const newQuoteCategory = document.getElementById("newQuoteCategory");
const exportBtn = document.getElementById("exportBtn");
const importFile = document.getElementById("importFile");

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Load categories into dropdown
function updateCategoryOptions() {
  const categories = [...new Set(quotes.map(q => q.category))];
  categorySelect.innerHTML = `<option value="all">All</option>`;
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    categorySelect.appendChild(option);
  });
}

// Show random quote by category
function displayRandomQuote() {
  const selectedCategory = categorySelect.value;
  const filteredQuotes = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes available for this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const selectedQuote = filteredQuotes[randomIndex];

  // Display quote
  quoteDisplay.textContent = `"${selectedQuote.text}" — ${selectedQuote.category}`;

  // Store last shown quote in sessionStorage
  sessionStorage.setItem("lastQuote", JSON.stringify(selectedQuote));
}

// Add new quote
function addQuote() {
  const text = newQuoteText.value.trim();
  const category = newQuoteCategory.value.trim().toLowerCase();

  if (!text || !category) {
    alert("Please fill in both the quote and category.");
    return;
  }

  quotes.push({ text, category });
  saveQuotes(); // persist to localStorage
  updateCategoryOptions();

  newQuoteText.value = "";
  newQuoteCategory.value = "";
  alert("Quote added!");
}

// Export quotes as JSON file
function exportQuotes() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Import quotes from JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);
      if (!Array.isArray(importedQuotes)) throw new Error("Invalid file format.");

      quotes.push(...importedQuotes);
      saveQuotes();
      updateCategoryOptions();
      alert("Quotes imported successfully!");
    } catch (err) {
      alert("Failed to import: Invalid JSON format.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Restore last quote from sessionStorage
function restoreLastViewedQuote() {
  const last = sessionStorage.getItem("lastQuote");
  if (last) {
    const q = JSON.parse(last);
    quoteDisplay.textContent = `"${q.text}" — ${q.category}`;
  }
}

// Event listeners
newQuoteBtn.addEventListener("click", displayRandomQuote);
addQuoteBtn.addEventListener("click", addQuote);
exportBtn.addEventListener("click", exportQuotes);
importFile.addEventListener("change", importFromJsonFile);

// Initialize
updateCategoryOptions();
restoreLastViewedQuote();




