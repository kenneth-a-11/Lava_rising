// ===== BANTER: the bots tease you when you miss =====
// Load this AFTER script.js (index.html already does). It doesn't edit script.js,
// it just wraps reject() and endRound() so a miss triggers a bot comment.
(function () {
  if (typeof reject !== "function" || typeof endRound !== "function") return;   // script.js not loaded? do nothing

  // each bot's teasing lines, by type of miss (shown in the game in Taglish)
  const LINES = {
    Juan: {
      list:    ["Ay, mali 'yan, pre! 😅", "Anong klaseng salita 'yan?", "Sablay ka, tol!", "Wala sa listahan 'yan, lodi!"],
      dupe:    ["Ginamit na 'yan, pre!", "Uulitin pa, e! 😂", "Hoy, nasabi mo na 'yan!"],
      short:   ["5 letters pataas, pre!", "Ang ikli naman niyan!", "Haba-haba naman, tol!"],
      timeout: ["Zzz... naubusan ka ng oras! 😴", "Ang bagal mo, tol!", "Hoy, gising na! 😎"]
    },
    Maria: {
      list:    ["Hala, mali yata 'yan, bes!", "Naku, wala 'yan sa category! 🤓", "Hindi 'yan, bes! Ulit!", "Try mo ulit, kaya mo 'yan!"],
      dupe:    ["Nasabi mo na 'yan, bes!", "Paulit-ulit, ha 😬", "Ginamit na 'yan kanina!"],
      short:   ["Kulang ng letra, bes!", "Dagdagan mo pa, 5+ dapat!", "Maikli pa 'yan, bes!"],
      timeout: ["Naku, naubusan ka, bes!", "Sayang, kulang sa oras!", "Ingat sa lava, ha! 😬"]
    }
  };

  const COOLDOWN_MS = 2500, CHANCE = 0.65, SHOW_MS = 2200;   // not every miss gets a comment, so it doesn't get annoying
  let lastAt = 0;
  const lastLine = {};

  const gameOn = () => !document.getElementById("game").classList.contains("hidden");

  // only one bot teases per miss (a living one)
  function tease(kind, force) {
    if (!gameOn() || players[0].dead) return;
    const now = Date.now();
    if (!force && (now - lastAt < COOLDOWN_MS || Math.random() > CHANCE)) return;
    const bots = players.map((p, i) => ({ p, i })).filter(x => x.p.bot && !x.p.dead && LINES[x.p.name]);
    if (!bots.length) return;
    const { p, i } = bots[Math.floor(Math.random() * bots.length)];
    const pool = LINES[p.name][kind];
    if (!pool || !pool.length) return;
    let line, tries = 0;
    do { line = pool[Math.floor(Math.random() * pool.length)]; } while (pool.length > 1 && line === lastLine[p.name + kind] && ++tries < 6);
    lastLine[p.name + kind] = line;
    lastAt = now;

    const html = esc(line);
    setBubble(i, html, true);
    // clear the bubble after a moment (unless something else replaced it)
    setTimeout(() => {
      const el = document.getElementById("speech-" + i);
      if (el && el.innerHTML === html) setBubble(i, "");
    }, SHOW_MS);
  }

  // wrong word / repeated word / too short
  const origReject = reject;
  reject = function (text, kind) {
    origReject.apply(this, arguments);
    tease(kind === "dupe" ? "dupe" : kind === "short" ? "short" : "list");
  };

  // you ran out of time on your turn
  const origEnd = endRound;
  endRound = function (word) {
    const mineTimeout = !locked && !word && turn === 0;
    origEnd.apply(this, arguments);
    if (mineTimeout) tease("timeout", true);   // a time-out always gets a comment
  };
})();