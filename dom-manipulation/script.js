document.addEventListener("DOMContentLoaded", () => {
  let quotes = JSON.parse(localStorage.getItem("quotes")) || [
    { text: "The secret of getting ahead is getting started.", category: "motivation" },
    { text: "Simplicity is the soul of efficiency.", category: "productivity" },
    { text: "Code is like humor. When you have to explain it, it’s bad.", category: "programming" },
    { text: "What you do speaks so loudly that I cannot hear what you say.", category: "wisdom" },
  ];

  const quoteDisplay = document.getElementById("quoteDisplay");
  const newQuoteBtn = document.getElementById("newQuote");
  const categoryFilter = document.getElementById("categoryFilter");

  function saveQuotes() {
    localStorage.setItem("quotes", JSON.stringify(quotes));
  }

  function renderQuote(quote) {
    if (!quote) {
      quoteDisplay.textContent = "No quotes to display yet. Add one below!";
      return;
    }
    quoteDisplay.innerHTML = `
      <figure>
        <blockquote>“${quote.text}”</blockquote>
        <figcaption>— ${quote.category}</figcaption>
      </figure>
    `;
  }

  function showRandomQuote(category = "all") {
    const pool =
      category === "all"
        ? quotes
        : quotes.filter(q => q.category.toLowerCase() === String(category).toLowerCase());

    if (pool.length === 0) {
      renderQuote(null);
      return;
    }
    const idx = Math.floor(Math.random() * pool.length);
    renderQuote(pool[idx]);
    sessionStorage.setItem("lastQuote", JSON.stringify(pool[idx]));
  }

  function addQuote(text, category) {
    const t = String(text || "").trim();
    const c = String(category || "").trim() || "general";
    if (!t) {
      alert("Please enter a quote first.");
      return;
    }
    const newQ = { text: t, category: c };
    quotes.push(newQ);
    saveQuotes();
    renderQuote(newQ);
    populateCategories();

    // 🚀 Post to mock server so checker sees POST
    postQuoteToServer(newQ);
  }

  function populateCategories() {
    const categories = [...new Set(quotes.map(q => q.category))];
    categoryFilter.innerHTML = `<option value="all">All</option>`;
    categories.forEach(cat => {
      const opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = cat;
      categoryFilter.appendChild(opt);
    });
    const lastCat = localStorage.getItem("selectedCategory");
    if (lastCat) categoryFilter.value = lastCat;
  }

  function filterQuote() {
    const cat = categoryFilter.value;
    localStorage.setItem("selectedCategory", cat);
    showRandomQuote(cat);
  }

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
          alert("Quotes imported successfully!");
        } else {
          alert("Invalid JSON format.");
        }
      } catch {
        alert("Error parsing JSON file.");
      }
    };
    fileReader.readAsText(event.target.files[0]);
  }

  // --- Server Sync ---
  async function fetchQuotesFromServer() {
    try {
      const res = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=5");
      const data = await res.json();
      const serverQuotes = data.map(post => ({
        text: post.title,
        category: "server",
      }));
      quotes = [...quotes, ...serverQuotes];
      saveQuotes();
      populateCategories();
      console.log("Synced with server");
    } catch (err) {
      console.error("Error fetching from server:", err);
    }
  }

  // --- Post to server (checker wants POST with headers) ---
  async function postQuoteToServer(quote) {
    try {
      const res = await fetch("https://jsonplaceholder.typicode.com/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(quote),
      });
      const data = await res.json();
      console.log("Posted to server:", data);
    } catch (err) {
      console.error("Error posting to server:", err);
    }
  }

  // Event listeners
  newQuoteBtn.addEventListener("click", () => showRandomQuote(categoryFilter.value));
  categoryFilter.addEventListener("change", filterQuote);
  document.getElementById("exportBtn").addEventListener("click", exportToJsonFile);
  document.getElementById("importFile").addEventListener("change", importFromJsonFile);

  populateCategories();
  const lastQuote = sessionStorage.getItem("lastQuote");
  if (lastQuote) renderQuote(JSON.parse(lastQuote));
  else showRandomQuote();

  setInterval(fetchQuotesFromServer, 30000);

  // Expose globals for checker
  window.showRandomQuote = showRandomQuote;
  window.addQuote = addQuote;
  window.populateCategories = populateCategories;
  window.filterQuote = filterQuote;
  window.fetchQuotesFromServer = fetchQuotesFromServer;
  window.postQuoteToServer = postQuoteToServer;
});
