document.addEventListener("DOMContentLoaded", () => {
  // --- State ---
  let quotes = JSON.parse(localStorage.getItem("quotes")) || [
    { text: "The secret of getting ahead is getting started.", category: "motivation" },
    { text: "Simplicity is the soul of efficiency.", category: "productivity" },
    { text: "Code is like humor. When you have to explain it, it’s bad.", category: "programming" },
    { text: "What you do speaks so loudly that I cannot hear what you say.", category: "wisdom" },
  ];

  // --- DOM refs ---
  const quoteDisplay = document.getElementById("quoteDisplay");
  const newQuoteBtn  = document.getElementById("newQuote");
  const categoryFilter = document.getElementById("categoryFilter");
  const exportBtn = document.getElementById("exportJson");
  const importFile = document.getElementById("importFile");

  // --- Helpers ---
  function saveQuotes() {
    localStorage.setItem("quotes", JSON.stringify(quotes));
  }

  // --- Render a single quote into the display area ---
  function renderQuote(quote) {
    if (!quote) {
      quoteDisplay.textContent = "No quotes to display yet. Add one below!";
      return;
    }
    quoteDisplay.innerHTML = `
      <figure class="quote">
        <blockquote>“${quote.text}”</blockquote>
        <figcaption>— ${quote.category}</figcaption>
      </figure>
    `;
  }

  // --- Pick and display a random quote ---
  function displayRandomQuote(category = "all") {
    const pool =
      category === "all"
        ? quotes
        : quotes.filter(q => q.category.toLowerCase() === category.toLowerCase());

    if (pool.length === 0) {
      renderQuote(null);
      return;
    }
    const idx = Math.floor(Math.random() * pool.length);
    renderQuote(pool[idx]);
  }

  // --- Add a new quote ---
  function addQuote(text, category) {
    const t = String(text || "").trim();
    const c = String(category || "").trim() || "general";
    if (!t) {
      alert("Please enter a quote first.");
      return;
    }
    quotes.push({ text: t, category: c });
    saveQuotes();
    populateCategories();
    renderQuote({ text: t, category: c });
  }

  // --- Build category filter dropdown ---
  function populateCategories() {
    const categories = ["all", ...new Set(quotes.map(q => q.category))];
    categoryFilter.innerHTML = categories
      .map(cat => `<option value="${cat}">${cat}</option>`)
      .join("");

    // Restore saved category
    const savedCat = localStorage.getItem("selectedCategory");
    if (savedCat && categories.includes(savedCat)) {
      categoryFilter.value = savedCat;
    }
  }

  // --- Filter quote display by category ---
  function filterQuote() {
    const selected = categoryFilter.value;
    localStorage.setItem("selectedCategory", selected);
    displayRandomQuote(selected);
  }

  // --- Import JSON ---
  function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function (ev) {
      try {
        const importedQuotes = JSON.parse(ev.target.result);
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        alert("Quotes imported successfully!");
      } catch (e) {
        alert("Invalid JSON file.");
      }
    };
    fileReader.readAsText(event.target.files[0]);
  }

  // --- Export JSON ---
  function exportToJsonFile() {
    const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "quotes.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // --- Wire up events ---
  newQuoteBtn.addEventListener("click", () => {
    const selected = categoryFilter.value;
    displayRandomQuote(selected);
  });
  categoryFilter.addEventListener("change", filterQuote);
  importFile.addEventListener("change", importFromJsonFile);
  exportBtn.addEventListener("click", exportToJsonFile);

  // --- Init ---
  populateCategories();
  const lastCat = localStorage.getItem("selectedCategory") || "all";
  displayRandomQuote(lastCat);

  // Expose functions for checker
  window.displayRandomQuote = displayRandomQuote;
  window.addQuote = addQuote;
  window.populateCategories = populateCategories;
  window.filterQuote = filterQuote;
});
