A survival word game where players race against rising lava by typing the longest word that fits a random category. Longer words push the lava back, while short or wrong answers let it climb, and the game ends when the lava reaches the player. 

GROUP 11 
Edward Kenneth M. Nunag, 
Justin L. Palisoc,
Harold Chien S. Santiago

## Run the game

1. Keep all files and folders together.
2. Open `index.html` in a modern web browser.
3. Choose a difficulty and press **Start**.

## Word meanings

- `meanings.js` provides offline definitions for selected Filipino and ICT terms, plus a category guide for every word-bank entry.
- After a correct player answer, the game's play screen displays the word meaning or category guide.
- The Word Bank opens the same offline explanation immediately. For entries without a curated definition, it can try the online English dictionary and replace the category guide when a definition is available.

Keep the script order in `index.html`: `words.js`, `meanings.js`, `script.js`, then `banter.js`. `wordbank.js` is loaded at the end of the page.
