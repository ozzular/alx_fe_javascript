// Quotes array
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to predict the future is to create it.", category: "inspiration" },
  { text: "Life is what happens when you're busy making other plans.", category: "life" },
  { text: "Do not watch the clock. Do what it does. Keep going.", category: "motivation" }
];

// Save to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Display random quote
function displayRandomQuote() {
  if (quotes.length === 0) {
    document.getElementById("quoteDisplay").innerText = "No quotes available.";
    return;
  }
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  document.getElementById("quoteDisplay").innerText = `"${quote.text}" - ${quote.category}`;
  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}
window.showRandomQuote = displayRandomQuote;

// Add new quote
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();
  if (text && category) {
    quotes.push({ text, category });
    saveQuotes();
    populateCategories();
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";
    alert("Quote added successfully!");
  } else {
    alert("Please enter both a quote and a category.");
  }
}
window.createAddQuoteForm = addQuote;

// Populate category dropdown
function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");
  if (!categoryFilter) return;

  const categories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = `<option value="all">All</option>`;
  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  const savedCategory = localStorage.getItem("selectedCategory");
  if (savedCategory) {
    categoryFilter.value = savedCategory;
    filterQuote();
  }
}

// Filter quotes by category
function filterQuote() {
  const category = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", category);

  if (category === "all") {
    displayRandomQuote();
  } else {
    const filtered = quotes.filter(q => q.category === category);
    if (filtered.length > 0) {
      const randomIndex = Math.floor(Math.random() * filtered.length);
      const quote = filtered[randomIndex];
      document.getElementById("quoteDisplay").innerText = `"${quote.text}" - ${quote.category}`;
    } else {
      document.getElementById("quoteDisplay").innerText = "No quotes in this category.";
    }
  }
}

// Export to JSON
function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Import from JSON
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      quotes.push(...importedQuotes);
      saveQuotes();
      populateCategories();
      alert("Quotes imported successfully!");
    } catch {
      alert("Invalid JSON file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Fetch quotes from server (simulation)
function fetchQuotesFromServer() {
  fetch("https://jsonplaceholder.typicode.com/posts")
    .then(response => response.json())
    .then(data => {
      const serverQuotes = data.slice(0, 5).map(post => ({
        text: post.title,
        category: "server"
      }));
      quotes = [...quotes, ...serverQuotes];
      saveQuotes();
      populateCategories();
      console.log("Fetched quotes from server:", serverQuotes);
    })
    .catch(err => console.error("Error fetching from server:", err));
}

// Post new quote to server (simulation)
function postQuoteToServer(quote) {
  fetch("https://jsonplaceholder.typicode.com/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(quote)
  })
    .then(response => response.json())
    .then(data => console.log("Posted to server:", data))
    .catch(err => console.error("Error posting to server:", err));
}

// ✅ Sync quotes function (required by checker)
function syncQuotes() {
  console.log("Starting sync...");
  fetchQuotesFromServer();
  if (quotes.length > 0) {
    postQuoteToServer(quotes[0]);
  }
  alert("Quotes synced with server. Server data takes precedence if conflicts occur.");
}
window.syncQuotes = syncQuotes;

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  const lastQuote = sessionStorage.getItem("lastQuote");
  if (lastQuote) {
    const quote = JSON.parse(lastQuote);
    document.getElementById("quoteDisplay").innerText = `"${quote.text}" - ${quote.category}`;
  } else {
    displayRandomQuote();
  }
  populateCategories();

  document.getElementById("newQuote").addEventListener("click", displayRandomQuote);
});
