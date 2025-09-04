// ============================
// QUOTE GENERATOR
// ============================

// Load quotes from localStorage or set default
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The future depends on what you do today.", category: "Motivation" },
  { text: "Simplicity is the soul of efficiency.", category: "Productivity" }
];

// Save to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Display quotes in the list
function displayQuotes(filteredQuotes = quotes) {
  const list = document.getElementById("quoteList");
  list.innerHTML = "";
  filteredQuotes.forEach((quote) => {
    const li = document.createElement("li");
    li.textContent = `${quote.text} (${quote.category})`;
    list.appendChild(li);
  });
}

// Add new quote
function createAddQuoteForm() {
  const text = document.getElementById("quoteText").value.trim();
  const category = document.getElementById("quoteCategory").value.trim();

  if (text && category) {
    quotes.push({ text, category });
    saveQuotes();
    populateCategories();
    displayQuotes();
    document.getElementById("quoteText").value = "";
    document.getElementById("quoteCategory").value = "";
  }
}

// ============================
// CATEGORY FILTERING
// ============================

function populateCategories() {
  const filter = document.getElementById("categoryFilter");
  const categories = [...new Set(quotes.map((q) => q.category))];

  filter.innerHTML = `<option value="all">All</option>`;
  categories.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    filter.appendChild(option);
  });

  // Restore saved filter
  const savedCategory = localStorage.getItem("selectedCategory");
  if (savedCategory) {
    filter.value = savedCategory;
    filterQuote();
  }
}

function filterQuote() {
  const selected = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", selected);

  if (selected === "all") {
    displayQuotes();
  } else {
    const filtered = quotes.filter((q) => q.category === selected);
    displayQuotes(filtered);
  }
}

// ============================
// JSON IMPORT/EXPORT
// ============================

function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        displayQuotes();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid JSON format.");
      }
    } catch {
      alert("Error reading file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// ============================
// SERVER SYNC (Task 3)
// ============================

// Simulated server endpoint (mock API)
const serverUrl = "https://jsonplaceholder.typicode.com/posts";

function syncWithServer() {
  const statusDiv = document.getElementById("syncStatus");
  statusDiv.textContent = "Syncing with server...";

  // 1. Fetch server data
  fetch(serverUrl)
    .then((response) => response.json())
    .then((data) => {
      // Simulate server quotes (use title as text)
      const serverQuotes = data.slice(0, 5).map((item) => ({
        text: item.title,
        category: "Server",
      }));

      // Conflict resolution: server wins
      quotes = [...serverQuotes, ...quotes];
      saveQuotes();
      populateCategories();
      displayQuotes();

      statusDiv.textContent = "✅ Sync completed. Server data merged.";
    })
    .catch((err) => {
      statusDiv.textContent = "❌ Error syncing with server.";
      console.error(err);
    });
}

// Auto-sync every 60 seconds
setInterval(syncWithServer, 60000);

// ============================
// INIT
// ============================

window.onload = function () {
  populateCategories();
  displayQuotes();
};
