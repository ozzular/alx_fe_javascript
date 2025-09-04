// Utility to create elements
function h(tag, props = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === "class") el.className = v;
    else if (k === "dataset" && v && typeof v === "object") {
      for (const [dk, dv] of Object.entries(v)) el.dataset[dk] = dv;
    } else if (k in el) el[k] = v;
    else el.setAttribute(k, v);
  }
  for (const child of children.flat()) {
    if (child == null) continue;
    el.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
  }
  return el;
}

document.addEventListener("DOMContentLoaded", () => {
  // --- State ---
  let quotes = JSON.parse(localStorage.getItem("quotes") || "[]");
  if (!quotes.length) {
    quotes = [
      { text: "The secret of getting ahead is getting started.", category: "motivation" },
      { text: "Simplicity is the soul of efficiency.", category: "productivity" },
      { text: "Code is like humor. When you have to explain it, it’s bad.", category: "programming" },
      { text: "What you do speaks so loudly that I cannot hear what you say.", category: "wisdom" },
    ];
  }

  // --- DOM refs ---
  const quoteDisplay = document.getElementById("quoteDisplay");
  const newQuoteBtn   = document.getElementById("newQuote");
  const categoryFilter = document.getElementById("categoryFilter");
  const notification = document.getElementById("notification");
  const importFile = document.getElementById("importFile");
  const exportBtn = document.getElementById("exportBtn");

  // --- Helpers ---
  function notifyUser(msg) {
    notification.textContent = msg;
    setTimeout(() => notification.textContent = "", 3000);
  }

  function saveQuotes() {
    localStorage.setItem("quotes", JSON.stringify(quotes));
  }

  // --- Render quote ---
  function renderQuote(quote) {
    if (!quote) {
      quoteDisplay.textContent = "No quotes to display yet. Add one below!";
      return;
    }
    const view = h(
      "figure",
      { class: "quote" },
      h("blockquote", {}, `“${quote.text}”`),
      h("figcaption", {}, `— ${quote.category}`)
    );
    quoteDisplay.replaceChildren(view);
  }

  // --- Random quote ---
  function showRandomQuote(category = categoryFilter.value || "all") {
    const pool = category === "all"
      ? quotes
      : quotes.filter(q => q.category.toLowerCase() === category.toLowerCase());
    if (!pool.length) { renderQuote(null); return; }
    const idx = Math.floor(Math.random() * pool.length);
    renderQuote(pool[idx]);
  }

  // --- Add quote ---
  function addQuote(text, category) {
    const t = String(text || "").trim();
    const c = String(category || "").trim() || "general";
    if (!t) { alert("Please enter a quote first."); return; }
    quotes.push({ text: t, category: c });
    saveQuotes();
    populateCategories();
    renderQuote({ text: t, category: c });
    postQuoteToServer({ text: t, category: c });
  }

  // --- Populate categories ---
  function populateCategories() {
    const unique = ["all", ...new Set(quotes.map(q => q.category.toLowerCase()))];
    categoryFilter.replaceChildren(...unique.map(c => h("option", { value: c }, c)));
    const last = localStorage.getItem("lastCategory") || "all";
    categoryFilter.value = last;
  }

  function filterQuotes() {
    const cat = categoryFilter.value;
    localStorage.setItem("lastCategory", cat);
    showRandomQuote(cat);
  }

  // --- Import/Export ---
  importFile.addEventListener("change", event => {
    const reader = new FileReader();
    reader.onload = e => {
      const imported = JSON.parse(e.target.result);
      quotes.push(...imported);
      saveQuotes();
      populateCategories();
      notifyUser("Quotes imported successfully!");
    };
    reader.readAsText(event.target.files[0]);
  });

  exportBtn.addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = h("a", { href: url, download: "quotes.json" });
    document.body.appendChild(a); a.click(); a.remove();
  });

  // --- Server Sync ---
  async function fetchQuotesFromServer() {
    try {
      const res = await fetch("https://jsonplaceholder.typicode.com/posts");
      const data = await res.json();
      const serverQuotes = data.slice(0, 5).map(p => ({ text: p.title, category: "server" }));
      quotes = [...quotes.filter(q => q.category !== "server"), ...serverQuotes];
      saveQuotes();
      populateCategories();
      notifyUser("Quotes synced with server!");
    } catch (err) { console.error(err); }
  }

  async function postQuoteToServer(quote) {
    try {
      await fetch("https://jsonplaceholder.typicode.com/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quote)
      });
      notifyUser("Quotes synced with server!");
    } catch (err) { console.error(err); }
  }

  async function syncQuotes() {
    await fetchQuotesFromServer();
  }

  setInterval(syncQuotes, 30000); // every 30s

  // --- Init ---
  categoryFilter.addEventListener("change", filterQuotes);
  newQuoteBtn.addEventListener("click", () => showRandomQuote());
  populateCategories();
  showRandomQuote();
  createAddQuoteForm();

  // --- Dynamic Add Quote Form ---
  function createAddQuoteForm() {
    const form = h(
      "form",
      { id: "addQuoteForm", class: "stack", autocomplete: "off" },
      h("input", { id: "newQuoteText", name: "newQuoteText", type: "text", placeholder: "Enter a new quote", required: true }),
      h("input", { id: "newQuoteCategory", name: "newQuoteCategory", type: "text", placeholder: "Enter quote category" }),
      h("button", { type: "submit", class: "btn" }, "Add Quote")
    );
    quoteDisplay.insertAdjacentElement("afterend", form);
    form.addEventListener("submit", e => {
      e.preventDefault();
      addQuote(form.newQuoteText.value, form.newQuoteCategory.value);
      form.reset();
      form.newQuoteText.focus();
    });
  }

  // Expose globally for console/debug
  window.showRandomQuote = showRandomQuote;
  window.addQuote = addQuote;
  window.createAddQuoteForm = createAddQuoteForm;
  window.populateCategories = populateCategories;
  window.filterQuotes = filterQuotes;
  window.fetchQuotesFromServer = fetchQuotesFromServer;
  window.postQuoteToServer = postQuoteToServer;
  window.syncQuotes = syncQuotes;
});
