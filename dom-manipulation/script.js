// --- Quotes array at top-level ---
let quotes = [
  { text: "The secret of getting ahead is getting started.", category: "motivation" },
  { text: "Simplicity is the soul of efficiency.", category: "productivity" },
  { text: "Code is like humor. When you have to explain it, it’s bad.", category: "programming" },
  { text: "What you do speaks so loudly that I cannot hear what you say.", category: "wisdom" },
];

// --- Render a quote ---
function renderQuote(quote) {
  const quoteDisplay = document.getElementById("quoteDisplay");
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

// --- displayRandomQuote function (must exist by this name) ---
function displayRandomQuote() {
  if (quotes.length === 0) {
    renderQuote(null);
    return;
  }
  const idx = Math.floor(Math.random() * quotes.length);
  renderQuote(quotes[idx]);
}

// --- addQuote function (must exist by this name) ---
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim() || "general";

  if (!text) {
    alert("Please enter a quote first.");
    return;
  }

  quotes.push({ text, category });
  renderQuote({ text, category });

  // Clear inputs
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
}

// --- Event listener for "Show New Quote" button ---
document.addEventListener("DOMContentLoaded", () => {
  const newQuoteBtn = document.getElementById("newQuote");
  newQuoteBtn.addEventListener("click", displayRandomQuote);
  displayRandomQuote(); // show one at load
});
