let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The secret of getting ahead is getting started.", category: "motivation" },
  { text: "Simplicity is the soul of efficiency.", category: "productivity" },
  { text: "Code is like humor. When you have to explain it, it’s bad.", category: "programming" },
];

const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const categoryFilter = document.getElementById("categoryFilter");
const notification = document.getElementById("notification");

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Render quote
function renderQuote(quote) {
  if (!quote) {
    quoteDisplay.textContent = "No quotes available.";
    return;
  }
  quoteDisplay.innerHTML = `
    <figure>
      <blockquote>“${quote.text}”</blockquote>
      <figcaption>— ${quote.category}</figcaption>
    </figure>
  `;
}

// Display random quote
function displayRandomQuote() {
  const category = categoryFilter.value || "all";
  const pool = category === "all" ? quotes : quotes.filter(q => q.category === category);
  if (pool.length === 0) {
    renderQuote(null);
    return;
  }
  const random = Math.floor(Math.random() * pool.length);
  renderQuote(pool[random]);
}

// Add a new quote
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim() || "general";
  if (!text) return alert("Please enter a quote.");

  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  displayRandomQuote();
  postQuoteToServer({ text, category }); // push to server
}

// Populate category dropdown
function populateCategories() {
  const uniqueCats = ["all", ...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = uniqueCats.map(c => `<option value="${c}">${c}</option>`).join("");
  categoryFilter.value = localStorage.getItem("selectedCategory") || "all";
}

categoryFilter.addEventListener("change", () => {
  localStorage.setItem("selectedCategory", categoryFilter.value);
  displayRandomQuote();
});

// Export quotes to JSON file
function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

// Import from JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    const imported = JSON.parse(e.target.result);
    quotes.push(...imported);
    saveQuotes();
    populateCategories();
    displayRandomQuote();
    notifyUser("Quotes imported successfully!");
  };
  fileReader.readAsText(event.target.files[0]);
}

// ✅ Fetch from mock API
async function fetchQuotesFromServer() {
  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/posts");
    const data = await res.json();
    // Simulate quotes with titles
    const serverQuotes = data.slice(0, 5).map(p => ({
      text: p.title,
      category: "server"
    }));

    // Conflict resolution: server overwrites duplicates
    quotes = [...quotes.filter(q => q.category !== "server"), ...serverQuotes];
    saveQuotes();
    populateCategories();
    notifyUser("Quotes synced from server.");
  } catch (err) {
    console.error("Error fetching server quotes:", err);
  }
}

// ✅ Post new quote to server
async function postQuoteToServer(quote) {
  try {
    await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quote),
    });
    notifyUser("Quote synced to server.");
  } catch (err) {
    console.error("Error posting quote:", err);
  }
}

// ✅ Sync quotes periodically
async function syncQuotes() {
  await fetchQuotesFromServer();
}
setInterval(syncQuotes, 15000); // every 15s

// Notify user
function notifyUser(message) {
  notification.textContent = message;
  setTimeout(() => (notification.textContent = ""), 4000);
}

// Init
newQuoteBtn.addEventListener("click", displayRandomQuote);
populateCategories();
displayRandomQuote();
syncQuotes();
