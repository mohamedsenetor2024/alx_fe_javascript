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
const categoryFilter = document.getElementById("categoryFilter");


// Mock server endpoint (simulated using JSONPlaceholder for demo)
const mockServerEndpoint = "https://jsonplaceholder.typicode.com/posts";


// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Populate categories into both dropdowns
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];

  // Update quote form select
  categorySelect.innerHTML = `<option value="all">All</option>`;
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach(cat => {
    const option1 = document.createElement("option");
    option1.value = cat;
    option1.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    categorySelect.appendChild(option1);

    const option2 = document.createElement("option");
    option2.value = cat;
    option2.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    categoryFilter.appendChild(option2);
  });
}

async function syncWithServer() {
  try {
    const res = await fetch(mockServerEndpoint);
    const serverQuotes = await res.json();

    // Simulate quote objects from server response
    const formattedQuotes = serverQuotes.slice(0, 5).map(post => ({
      text: post.title,
      category: "server"
    }));

    let localQuotes = JSON.parse(localStorage.getItem("quotes")) || [];
    let updated = false;

    // Add only new server quotes (by text)
    formattedQuotes.forEach(serverQuote => {
      const exists = localQuotes.some(localQuote => localQuote.text === serverQuote.text);
      if (!exists) {
        localQuotes.push(serverQuote);
        updated = true;
      }
    });

    if (updated) {
      quotes = localQuotes;
      localStorage.setItem("quotes", JSON.stringify(quotes));
      populateCategories();
      filterQuotes();
      showNotification("✅ Quotes synced from server.");
    }
  } catch (error) {
    console.error("Error syncing:", error);
    showNotification("⚠️ Failed to sync with server.");
  }
}



// Show filtered quotes
function filterQuotes() {
  const selected = categoryFilter.value;
  localStorage.setItem("selectedCategory", selected); // persist filter

  const filtered = selected === "all"
    ? quotes
    : quotes.filter(q => q.category === selected);

  if (filtered.length === 0) {
    quoteDisplay.innerHTML = "No quotes found in this category.";
  } else {
    quoteDisplay.innerHTML = filtered.map(q => 
      `<p>"${q.text}" — ${q.category}</p>`
    ).join('');
  }
}

// Show single random quote (optional button logic)
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

  quoteDisplay.textContent = `"${selectedQuote.text}" — ${selectedQuote.category}`;
  sessionStorage.setItem("lastQuote", JSON.stringify(selectedQuote)); // optional
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
  saveQuotes();
  populateCategories();
  filterQuotes(); // immediately apply current filter

  newQuoteText.value = "";
  newQuoteCategory.value = "";
  alert("Quote added!");
}

function showNotification(message) {
  const box = document.getElementById("notification");
  box.textContent = message;
  box.style.display = "block";
  setTimeout(() => {
    box.style.display = "none";
  }, 4000);
}


// Export quotes to JSON file
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
      if (!Array.isArray(importedQuotes)) throw new Error("Invalid file format");

      quotes.push(...importedQuotes);
      saveQuotes();
      populateCategories();
      filterQuotes();
      alert("Quotes imported successfully!");
    } catch (err) {
      alert("Import failed: Invalid JSON format.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Restore category filter from localStorage
function restoreFilter() {
  const savedCategory = localStorage.getItem("selectedCategory") || "all";
  categoryFilter.value = savedCategory;
  filterQuotes();
}

// Event listeners
newQuoteBtn.addEventListener("click", displayRandomQuote);
addQuoteBtn.addEventListener("click", addQuote);
exportBtn.addEventListener("click", exportQuotes);
importFile.addEventListener("change", importFromJsonFile);

// Initialize on load
populateCategories();
restoreFilter();

// Auto-sync every 30 seconds
setInterval(syncWithServer, 30000);

// Optionally run on first page load
syncWithServer();
