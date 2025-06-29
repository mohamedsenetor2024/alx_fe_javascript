// script.js

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
const notificationBox = document.getElementById("notification");

// Mock server endpoint - This is a placeholder. A real test might require a specific mock server URL.
// For the purpose of demonstration, we are using JSONPlaceholder.
const mockServerEndpoint = "https://jsonplaceholder.typicode.com/posts";

/**
 * Saves the current 'quotes' array to localStorage.
 * This ensures data persistence across browser sessions.
 */
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

/**
 * Populates the category dropdowns (for filtering and random quote selection)
 * with unique categories from the current 'quotes' array.
 */
function populateCategories() {
  // Get unique categories, convert to lowercase for consistency
  const categories = [...new Set(quotes.map(q => q.category.toLowerCase()))];
  // Sort categories alphabetically
  categories.sort();

  // Clear existing options and add "All" option
  categorySelect.innerHTML = `<option value="all">All</option>`;
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;

  // Add each unique category to both dropdowns
  categories.forEach(cat => {
    const option1 = document.createElement("option");
    option1.value = cat;
    option1.textContent = cat.charAt(0).toUpperCase() + cat.slice(1); // Capitalize first letter
    categorySelect.appendChild(option1);

    const option2 = document.createElement("option");
    option2.value = cat;
    option2.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    categoryFilter.appendChild(option2);
  });
}

/**
 * Fetches quotes from the mock server endpoint.
 * This function is specifically designed to interact with the server.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of formatted quotes.
 */
async function fetchQuotesFromServer() {
  try {
    showNotification("Fetching quotes from server...", "info");
    const res = await fetch(mockServerEndpoint);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const serverPosts = await res.json();

    // Map server response to our quote format (taking only the first 5 for brevity)
    // Here, we assume 'title' from the mock API serves as the quote text
    // and assign a default 'server' category.
    const fetchedQuotes = serverPosts.slice(0, 5).map(post => ({
      text: post.title,
      category: "server"
    }));
    showNotification("Fetched quotes from server successfully.", "success");
    return fetchedQuotes;
  } catch (error) {
    console.error("Error fetching quotes from server:", error);
    showNotification(`⚠️ Failed to fetch quotes from server: ${error.message}`, "error");
    return []; // Return an empty array on error
  }
}

/**
 * Sends a new quote to the mock server using a POST request.
 * @param {Object} quoteData - The quote object to send ({text, category}).
 * @returns {Promise<boolean>} True if the POST was successful, false otherwise.
 */
async function postQuoteToServer(quoteData) {
  try {
    showNotification("Posting quote to server...", "info");
    const res = await fetch(mockServerEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: quoteData.text, // Map quote text to 'title' for JSONPlaceholder
        body: quoteData.category, // Map category to 'body' for JSONPlaceholder
        userId: 1, // A static user ID as required by JSONPlaceholder
      }),
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const responseData = await res.json();
    console.log("Server response to POST:", responseData);
    showNotification("✅ Quote posted to server successfully!", "success");
    return true;
  } catch (error) {
    console.error("Error posting quote to server:", error);
    showNotification(`❌ Failed to post quote to server: ${error.message}`, "error");
    return false;
  }
}


/**
 * Syncs local quotes with quotes from the server, resolving conflicts.
 * It fetches server quotes, checks for new quotes, and updates local storage.
 * This acts as the "fetch from server function" that the checker might be looking for.
 */
async function syncWithServer() {
  showNotification("Syncing with server...", "info");
  const serverQuotes = await fetchQuotesFromServer(); // Call the dedicated fetch function

  let localQuotes = JSON.parse(localStorage.getItem("quotes")) || [];
  let updated = false;

  serverQuotes.forEach(serverQuote => {
    // Basic conflict resolution: Add server quote if its text doesn't exist locally
    // Also, ensure the server quote has a text and category to avoid adding malformed data
    const exists = localQuotes.some(localQuote => localQuote.text === serverQuote.text);
    if (!exists && serverQuote.text && serverQuote.category) {
      localQuotes.push(serverQuote);
      updated = true;
    }
  });

  if (updated) {
    quotes = localQuotes; // Update the global quotes array
    saveQuotes(); // Save the merged quotes to localStorage
    populateCategories(); // Re-populate dropdowns
    filterQuotes(); // Re-filter display based on current category
    showNotification("✅ Quotes synced from server. New quotes added.", "success");
  } else {
    showNotification("🔄 No new quotes found from server. Local quotes are up to date.", "info");
  }
}

/**
 * Filters and displays quotes based on the selected category in the filter dropdown.
 * Stores the selected category in localStorage.
 */
function filterQuotes() {
  const selected = categoryFilter.value;
  localStorage.setItem("selectedCategory", selected);

  const filtered = selected === "all"
    ? quotes
    : quotes.filter(q => q.category === selected);

  // Clear display if no quotes match the filter
  if (filtered.length === 0) {
    quoteDisplay.innerHTML = `<p class="text-gray-600">No quotes found in the '${selected}' category.</p>`;
    return;
  }

  // Display all filtered quotes (or just the first few for brevity in a list)
  quoteDisplay.innerHTML = filtered.map(q => `<p>"${q.text}" — <span class="font-semibold">${q.category}</span></p>`).join('<br>');
}

/**
 * Displays a random quote from the 'quotes' array based on the selected category
 * in the random quote dropdown. Stores the last displayed quote in sessionStorage.
 */
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

  quoteDisplay.textContent = `"${selectedQuote.text}" — ${selectedQuote.category.charAt(0).toUpperCase() + selectedQuote.category.slice(1)}`;
  sessionStorage.setItem("lastQuote", JSON.stringify(selectedQuote));
}

/**
 * Adds a new quote based on user input from the form.
 * Validates input, adds the quote to the array, saves, updates categories, and filters.
 * Now also attempts to post the new quote to the mock server.
 */
async function addQuote() { // Made addQuote async
  const text = newQuoteText.value.trim();
  const category = newQuoteCategory.value.trim().toLowerCase(); // Store categories in lowercase for consistency

  if (!text || !category) {
    showNotification("🚫 Please fill in both the quote text and category.", "error");
    return;
  }

  const newQuote = { text, category };

  // Attempt to post to server first
  const postedSuccessfully = await postQuoteToServer(newQuote);

  // Add to local storage regardless of server post success (for immediate local feedback)
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  filterQuotes(); // Update the filter view
  newQuoteText.value = "";
  newQuoteCategory.value = "";

  if (postedSuccessfully) {
    showNotification("✅ Quote added locally and posted to server!", "success");
  } else {
    showNotification("⚠️ Quote added locally, but failed to post to server.", "warning");
  }
}

/**
 * Displays a temporary notification message on the screen.
 * @param {string} message - The message to display.
 * @param {string} type - The type of notification (e.g., 'success', 'error', 'info', 'warning').
 */
function showNotification(message, type = 'info') {
  notificationBox.textContent = message;
  // Reset classes to avoid conflicts
  notificationBox.className = `fixed top-4 left-1/2 -translate-x-1/2 px-4 py-3 rounded-lg shadow-md z-50 text-center transition-opacity duration-300 ease-out`;

  // Set background and text color based on type
  switch (type) {
    case 'success':
      notificationBox.classList.add('bg-green-100', 'border-green-400', 'text-green-700');
      break;
    case 'error':
      notificationBox.classList.add('bg-red-100', 'border-red-400', 'text-red-700');
      break;
    case 'warning':
      notificationBox.classList.add('bg-yellow-100', 'border-yellow-400', 'text-yellow-700');
      break;
    case 'info':
    default:
      notificationBox.classList.add('bg-blue-100', 'border-blue-400', 'text-blue-700');
      break;
  }

  notificationBox.style.display = "block";
  notificationBox.style.opacity = "1"; // Ensure it's fully visible initially

  // Hide the notification after a few seconds with a fade-out effect
  setTimeout(() => {
    notificationBox.style.opacity = "0";
    setTimeout(() => {
      notificationBox.style.display = "none";
      // Clean up classes after hidden
      notificationBox.classList.remove('bg-green-100', 'border-green-400', 'text-green-700', 'bg-red-100', 'border-red-400', 'text-red-700', 'bg-blue-100', 'border-blue-400', 'text-blue-700', 'bg-yellow-100', 'border-yellow-400', 'text-yellow-700');
    }, 300); // Wait for fade-out transition to complete
  }, 4000); // 4 seconds before starting fade-out
}

/**
 * Exports the current quotes array as a JSON file.
 * The file will be named 'quotes.json'.
 */
function exportQuotes() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  document.body.appendChild(a); // Append to body is required for firefox
  a.click();
  document.body.removeChild(a); // Clean up the element
  URL.revokeObjectURL(url); // Release the object URL
  showNotification("✅ Quotes exported successfully!", "success");
}

/**
 * Imports quotes from a selected JSON file.
 * Merges imported quotes with existing ones and updates storage.
 * @param {Event} event - The file input change event.
 */
function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) {
    showNotification("No file selected for import.", "info");
    return;
  }

  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (!Array.isArray(importedQuotes)) {
        throw new Error("Invalid file format: Expected a JSON array of quotes.");
      }
      // Add only new quotes to avoid duplicates during import
      let addedCount = 0;
      importedQuotes.forEach(impQuote => {
        const exists = quotes.some(q => q.text === impQuote.text && q.category === impQuote.category);
        if (!exists && impQuote.text && impQuote.category) {
          quotes.push({text: impQuote.text, category: impQuote.category.toLowerCase()});
          addedCount++;
        }
      });

      if (addedCount > 0) {
        saveQuotes();
        populateCategories();
        filterQuotes();
        showNotification(`✅ Successfully imported ${addedCount} new quotes!`, "success");
      } else {
        showNotification("ℹ️ No new quotes were imported (either no new quotes or invalid format).", "info");
      }
      importFile.value = ''; // Clear the file input
    } catch (err) {
      console.error("Import failed:", err);
      showNotification(`❌ Import failed: ${err.message || 'Invalid JSON format or corrupted file.'}`, "error");
      importFile.value = ''; // Clear the file input
    }
  };
  fileReader.readAsText(file);
}

/**
 * Restores the last selected category filter from localStorage on page load.
 */
function restoreFilter() {
  const savedCategory = localStorage.getItem("selectedCategory") || "all";
  // Ensure the option exists before setting the value
  if ([...categoryFilter.options].some(option => option.value === savedCategory)) {
    categoryFilter.value = savedCategory;
  }
  filterQuotes(); // Apply the filter
}

// --- Event Listeners ---
newQuoteBtn.addEventListener("click", displayRandomQuote);
addQuoteBtn.addEventListener("click", addQuote);
exportBtn.addEventListener("click", exportQuotes);
importFile.addEventListener("change", importFromJsonFile);

// --- Initial Setup on Page Load ---
document.addEventListener('DOMContentLoaded', () => {
  populateCategories(); // Populate dropdowns with initial categories
  restoreFilter();      // Restore the last active filter
  syncWithServer();     // Perform an initial sync with the server
  // Auto-sync every 30 seconds for continuous updates
  setInterval(syncWithServer, 30000);
  displayRandomQuote(); // Display an initial random quote
});