/* Word Lava - optional Word Bank browser.
   Additive feature: reads the existing WORD_BANK without changing game logic. */
(function () {
  "use strict";

  function initWordBank() {
    if (typeof WORD_BANK === "undefined" || !Array.isArray(WORD_BANK) || document.getElementById("wordBankBtn")) return;

    var startScreen = document.getElementById("start");
    var recordsButton = document.getElementById("recBtn");
    if (!startScreen || !recordsButton) return;

    var button = document.createElement("button");
    button.type = "button";
    button.id = "wordBankBtn";
    button.className = "btn ghost";
    button.textContent = "📚 Word Bank";
    button.setAttribute("aria-haspopup", "dialog");
    recordsButton.insertAdjacentElement("afterend", button);

    var overlay = document.createElement("div");
    overlay.id = "wordBankOverlay";
    overlay.className = "wb-overlay hidden";
    overlay.innerHTML = `
      <section class="wb-dialog" role="dialog" aria-modal="true" aria-labelledby="wbTitle">
        <header class="wb-header">
          <div>
            <p class="wb-eyebrow">WORD LAVA COLLECTION</p>
            <h2 id="wbTitle">📚 Word Bank</h2>
            <p class="wb-subtitle">Browse the words available in the game.</p>
          </div>
          <button type="button" class="wb-close" id="wbClose" aria-label="Close Word Bank">✕</button>
        </header>
        <div class="wb-controls">
          <input id="wbSearch" type="search" placeholder="Search a word or category..." autocomplete="off" aria-label="Search words or categories">
          <select id="wbCategory" aria-label="Choose a category">
            <option value="all">All categories</option>
          </select>
        </div>
        <p class="wb-count" id="wbCount" aria-live="polite"></p>
        <section class="wb-definition hidden" id="wbDefinition" aria-live="polite">
          <button type="button" class="wb-back" id="wbBack">← Back to words</button>
          <h3 id="wbDefWord"></h3>
          <p class="wb-pos" id="wbDefPos"></p>
          <p id="wbDefMeaning">Select a word to see its meaning.</p>
          <p class="wb-example" id="wbDefExample"></p>
          <p class="wb-source">English definitions are retrieved from an online dictionary when available.</p>
        </section>
        <div class="wb-results" id="wbResults"></div>
        <p class="wb-footnote">Some categories may depend on your selected difficulty or Filipino pack setting.</p>
      </section>`;
    document.body.appendChild(overlay);

    var search = overlay.querySelector("#wbSearch");
    var categorySelect = overlay.querySelector("#wbCategory");
    var results = overlay.querySelector("#wbResults");
    var count = overlay.querySelector("#wbCount");
    var closeButton = overlay.querySelector("#wbClose");
    var definitionPanel = overlay.querySelector("#wbDefinition");
    var definitionWord = overlay.querySelector("#wbDefWord");
    var definitionPos = overlay.querySelector("#wbDefPos");
    var definitionMeaning = overlay.querySelector("#wbDefMeaning");
    var definitionExample = overlay.querySelector("#wbDefExample");
    var backButton = overlay.querySelector("#wbBack");
    var meaningRequestToken = 0;

    var categories = WORD_BANK.map(function (item, index) {
      var words = String(item.words || "").split(/[ ,\n\r\t]+/).filter(Boolean);
      return {
        name: String(item.category || "Untitled category"),
        words: Array.from(new Set(words)),
        hard: !!item.hard,
        pack: item.pack || "",
        index: index
      };
    });

    categories.forEach(function (item) {
      var option = document.createElement("option");
      option.value = String(item.index);
      option.textContent = item.name + " (" + item.words.length + ")";
      categorySelect.appendChild(option);
    });

    function makeWordChip(word, category) {
      var chip = document.createElement("button");
      chip.type = "button";
      chip.className = "wb-word";
      chip.textContent = word;
      chip.addEventListener("click", function () { showDefinition(word, category); });
      return chip;
    }

    function showDefinition(word, category) {
      var requestToken = ++meaningRequestToken;
      results.classList.add("hidden");
      definitionPanel.classList.remove("hidden");
      count.textContent = "Word meaning";
      definitionWord.textContent = word;
      definitionPos.textContent = "";
      definitionMeaning.textContent = "Loading meaning...";
      definitionExample.textContent = "";

      // Show an offline meaning or category guide immediately for every word.
      var local = window.WordLavaMeanings
        ? window.WordLavaMeanings.lookup(word, category)
        : { text: "This word is listed under " + category + " in the Word Lava word bank.", label: "Word-bank note", kind: "category" };
      definitionPos.textContent = local.label || "Meaning";
      definitionMeaning.textContent = local.text;

      // For entries without a curated definition, try to improve the category guide
      // with a dictionary definition when the player is online. The local guide stays
      // visible if the request fails or the word is not in the English dictionary.
      if (local.kind !== "definition") {
        fetch("https://api.dictionaryapi.dev/api/v2/entries/en/" + encodeURIComponent(word))
          .then(function (response) {
            if (!response.ok) throw new Error("No dictionary entry");
            return response.json();
          })
          .then(function (data) {
            if (requestToken !== meaningRequestToken || definitionWord.textContent !== word) return;
            var entry = data && data[0];
            var meaning = entry && entry.meanings && entry.meanings[0];
            var definition = meaning && meaning.definitions && meaning.definitions[0];
            if (!definition || !definition.definition) return;
            definitionPos.textContent = (meaning.partOfSpeech ? meaning.partOfSpeech + " • " : "") + "Dictionary definition";
            definitionMeaning.textContent = definition.definition;
            if (definition.example) definitionExample.textContent = "Example: " + definition.example;
          })
          .catch(function () {
            // Keep the offline category guide; do not show a missing-definition error.
          });
      }
    }

    function showWordList() {
      definitionPanel.classList.add("hidden");
      results.classList.remove("hidden");
      render();
    }

    function render() {
      var query = search.value.trim().toLowerCase();
      var selected = categorySelect.value;
      var visible = categories.filter(function (item) {
        var categoryMatches = selected === "all" || String(item.index) === selected;
        var queryMatches = !query || item.name.toLowerCase().includes(query) ||
          item.words.some(function (word) { return word.toLowerCase().includes(query); });
        return categoryMatches && queryMatches;
      });

      results.textContent = "";
      var shownWords = 0;

      visible.forEach(function (item) {
        var matchingWords = item.words.filter(function (word) {
          return !query || item.name.toLowerCase().includes(query) || word.toLowerCase().includes(query);
        });
        if (!matchingWords.length && query) return;

        var card = document.createElement("article");
        card.className = "wb-category";
        var heading = document.createElement("div");
        heading.className = "wb-category-heading";

        var title = document.createElement("h3");
        title.textContent = item.name;
        var meta = document.createElement("span");
        meta.className = "wb-meta";
        meta.textContent = matchingWords.length + " words";
        heading.append(title, meta);

        var tags = document.createElement("div");
        tags.className = "wb-words";
        matchingWords.forEach(function (word) { tags.appendChild(makeWordChip(word, item.name)); });
        card.append(heading, tags);
        results.appendChild(card);
        shownWords += matchingWords.length;
      });

      count.textContent = visible.length + " categories • " + shownWords + " matching words";
      if (!results.children.length) {
        var empty = document.createElement("p");
        empty.className = "wb-empty";
        empty.textContent = "No matching words found. Try another search.";
        results.appendChild(empty);
      }
    }

    function open() {
      overlay.classList.remove("hidden");
      render();
      search.focus();
      document.body.classList.add("wb-open");
    }

    function close() {
      overlay.classList.add("hidden");
      document.body.classList.remove("wb-open");
      button.focus();
    }

    button.addEventListener("click", open);
    closeButton.addEventListener("click", close);
    backButton.addEventListener("click", showWordList);
    search.addEventListener("input", render);
    categorySelect.addEventListener("change", render);
    overlay.addEventListener("click", function (event) {
      if (event.target === overlay) close();
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !overlay.classList.contains("hidden")) close();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initWordBank);
  } else {
    initWordBank();
  }
})();