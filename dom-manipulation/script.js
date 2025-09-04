// Quotes array
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to predict the future is to invent it.", category: "Inspiration" },
  { text: "Simplicity is the soul of efficiency.", category: "Efficiency" },
  { text: "Code is like humor. When you have to explain it, it’s bad.", category: "Programming" }
];

// Save quotes to localStorage
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
  document.getElementById("quoteDisplay").innerText = `"${quote.text}" (${quote.category})`;
  sessionStorage.setItem("lastQuote", JSON.stringify(quote)); // session storage example
}

// Add new quote
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (text && category) {
    quotes.push({ text, category });
    saveQuotes();
    renderQuotes();
    renderCategories();
    textInput.value = "";
    categoryInput.value = "";
    alert("Quote added!");
  } else {
    alert("Please enter both text and category.");
  }
}

// Render all quotes
function renderQuotes(list = quotes) {
  const quotesList = document.getElementById("quotesList");
  quotesList.innerHTML = "";

  list.forEach((quote, index) => {
    const div = document.createElement("div");
    div.innerHTML = `
      <p>"${quote.text}" <em>(${quote.category})</em>
      <button data-index="${index}" class="delete-btn">Delete</button>
      </p>
    `;
    quotesList.appendChild(div);
  });
}

// Render categories dynamically
function renderCategories() {
  const categoryList = document.getElementById("categoryList");
  categoryList.innerHTML = "";

  const categories = [...new Set(quotes.map(q => q.category))];
  categories.forEach(category => {
    const btn = document.createElement("button");
    btn.textContent = category;
    btn.dataset.category = category;
    categoryList.appendChild(btn);
  });
}

// Show quotes by category
function displayQuotesByCategory(category) {
  const filtered = quotes.filter(q => q.category === category);
  renderQuotes(filtered);
}

// Event delegation for category filter
document.getElementById("categoryList").addEventListener("click", function(e) {
  if (e.target.tagName === "BUTTON") {
    const category = e.target.dataset.category;
    displayQuotesByCategory(category);
  }
});

// Event delegation for delete
document.getElementById("quotesList").addEventListener("click", function(e) {
  if (e.target.classList.contains("delete-btn")) {
    const index = e.target.dataset.index;
    quotes.splice(index, 1);
    saveQuotes();
    renderQuotes();
    renderCategories();
  }
});

// Export to JSON
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
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
    const importedQuotes = JSON.parse(e.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    renderQuotes();
    renderCategories();
    alert("Quotes imported successfully!");
  };
  fileReader.readAsText(event.target.files[0]);
}

// Event listener for random quote button
document.getElementById("newQuote").addEventListener("click", displayRandomQuote);

// Initialize app
renderQuotes();
renderCategories();
displayRandomQuote();
