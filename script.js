<<<<<<< HEAD
// WORD LAVA - characters, separate lava for each player, typing bots, big turn announcements
// Turn order: YOUR TURN -> FIRST BOT TURN -> SECOND BOT TURN -> repeat
// Features: combo streak, disaster events, boss rounds, last chance mode, personal stats

// ===== SETTINGS =====
const START_RISE = 15, RISE_PER_ROUND = 3, MAX_LAVA = 100;
const PUSH_SHORT = 0, PUSH_MEDIUM = 5, PUSH_LONG = 15, BONUS_LONG = 5;
const BASE_TIME = 15, MIN_TIME = 8;
const KEY = "wordLavaHighScore", STATS_KEY = "wordLavaStatistics";
const BOSS_INTERVAL = 5, BOSS_WORDS = 2;
const LAST_CHANCE_LEVEL = 90, LAST_CHANCE_TIME = 7;
const EVENT_CHANCE = 0.35, MAX_MULTIPLIER = 5;
const ANNOUNCE_MS = 1500;          // how long the big "YOUR TURN" screen stays

// Players, in turn order. Each one has a character (faces: normal, worried, melted) and their own lava.
// Bot settings:
//   acc    = chance the bot knows a word this turn (0 to 1)
//   think  = [fastest, slowest] seconds before the bot starts typing
//   speed  = milliseconds per letter while typing
//   maxLen = longest word the bot prefers to use
const PLAYERS = [
  { name: "You", bot: false, turnText: "YOUR TURN", faces: ["😎", "😰", "💀"] },
  { name: "Bot 1", bot: true, turnText: "FIRST BOT TURN", faces: ["🤖", "🥵", "💀"], acc: 0.55, think: [1.5, 4], speed: 230, maxLen: 6 },
  { name: "Bot 2", bot: true, turnText: "SECOND BOT TURN", faces: ["👽", "😱", "💀"], acc: 0.8, think: [0.8, 2.5], speed: 140, maxLen: 99 }
];

const EVENTS = [
  { name: "🔥 HEAT WAVE", desc: "Lava rises an extra 10%!", rise: 10, time: 0 },
  { name: "🌋 LAVA SURGE", desc: "Lava rises an extra 15%!", rise: 15, time: 0 },
  { name: "❄️ COOL BREEZE", desc: "Lava rise decreases by 5%!", rise: -5, time: 0 },
  { name: "⚡ VOLCANIC TREMOR", desc: "3 seconds less this turn!", rise: 0, time: 3 }
];

// ===== HELPERS =====
=======
// ===== SETTINGS =====
const START_RISE = 15;
const RISE_PER_ROUND = 3;
const MAX_LAVA = 100;

const PUSH_SHORT = 0;
const PUSH_MEDIUM = 5;
const PUSH_LONG = 15;
const BONUS_LONG = 5;

const BASE_TIME = 15;
const MIN_TIME = 8;

const KEY = "wordLavaHighScore";
const STATS_KEY = "wordLavaStatistics";

const BOSS_INTERVAL = 5;
const BOSS_WORDS = 2;
const LAST_CHANCE_LEVEL = 90;
const LAST_CHANCE_TIME = 7;
const EVENT_CHANCE = 0.35;
const MAX_MULTIPLIER = 5;

// ===== HTML ELEMENT HELPER =====
>>>>>>> a56c32a53aca08e2226c6c40f79631f9d4e29733
const $ = id => document.getElementById(id);

const screens = ["start", "how", "game", "over"];

const show = name => {
    screens.forEach(s => {
        $(s).classList.toggle("hidden", s !== name);
    });

    if (name !== "game") {
        $("heat").style.opacity = 0.15;
    }
};
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
const pushFor = len => len >= 8 ? PUSH_LONG : len >= 5 ? PUSH_MEDIUM : PUSH_SHORT;
const normalize = w => w.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z]/g, "");
const rand = (a, b) => a + Math.random() * (b - a);
const newPlayers = () => PLAYERS.map(p => ({
  ...p, score: 0, combo: 0, mult: 1, lava: 0, dead: false,
  tally: { words: 0, letters: 0, longBonus: 0, comboBonus: 0, lastBonus: 0, bosses: 0, timeouts: 0, longest: "", bestCombo: 0 }
}));

<<<<<<< HEAD
// ===== GAME STATE =====
let round = 0, turn = 0, used, current, timeLeft, roundTime;
let timerId, botTimer, transitionTimer, locked = true;
let players = newPlayers(), lastCats = [];
let bossRound = false, bossDone = 0, bossPush = 0, activeEvent = null, lastChance = false;

// ===== HIGH SCORE + STATISTICS (yours only) =====
const getBest = () => parseInt(load(KEY, 0), 10) || 0;
const getStats = () => ({
  gamesPlayed: 0, totalWords: 0, longestWord: "", bestRound: 0, totalScore: 0, highestScore: 0,
  ...load(STATS_KEY, {})
});

function refreshBest() {
  ["hsStart", "hsOver", "best"].forEach(id => $(id).textContent = getBest());
}

function renderStatistics() {
  const s = getStats();
  const avg = s.gamesPlayed ? Math.round(s.totalScore / s.gamesPlayed) : 0;
  const html = `
    <strong>📊 PERSONAL STATISTICS</strong>
    <div>🎮 Games Played: ${s.gamesPlayed}</div>
    <div>🏆 Best Round: ${s.bestRound}</div>
    <div>📝 Total Words: ${s.totalWords}</div>
    <div>📚 Longest Word: ${s.longestWord || "None yet"}</div>
    <div>⭐ Highest Score: ${s.highestScore}</div>
    <div>📈 Average Score: ${avg}</div>`;
  ["startStats", "overStats"].forEach(id => { if ($(id)) $(id).innerHTML = html; });
}

// ===== EXTRA UI: styles, lava lanes with characters, turn screen, stats cards =====
const CSS = `
  .tower{display:none!important}
  .feature-card{background:rgba(255,100,20,.1);border:1px solid rgba(255,130,40,.35);border-radius:10px;padding:12px;margin:12px 0;line-height:1.8;font-size:13px;text-align:left;color:#fff}
  #turnDisplay{color:#9fe870;font-weight:bold}
  #comboDisplay{color:#ffae42;font-weight:bold}
  #bossDisplay{color:#f66;font-weight:bold}
  #lastChanceDisplay{color:#f33;font-weight:bold}
  #eventBanner{color:#ffc45c;font-weight:bold;text-align:center}

  /* lanes: one character + one lava tower per player */
  #arena{display:flex;gap:.7rem;width:100%;justify-content:center;align-items:flex-end;margin-bottom:.8rem}
  .lane{flex:1;max-width:170px;min-width:0;display:flex;flex-direction:column;align-items:center;gap:5px;transition:opacity .4s,filter .4s}
  .lane.dead{opacity:.5;filter:grayscale(.8)}
  .avatar{font-size:clamp(2rem,9vw,3rem);line-height:1}
  .lane.active .avatar{animation:hop .6s ease-in-out infinite alternate}
  @keyframes hop{to{transform:translateY(-8px)}}
  .pname{font-weight:800;font-size:.85rem}
  .lane.active .pname{color:var(--molten)}
  .pscore{font-size:.8rem;color:var(--muted)}

  /* speech bubble used for the typing animation */
  .speech{min-height:30px;max-width:100%;padding:4px 10px;border-radius:12px;background:#fff6e8;color:#2b0e04;font-weight:800;font-size:.85rem;letter-spacing:.04em;opacity:0;transition:opacity .15s;position:relative;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .speech.on{opacity:1}
  .caret{display:inline-block;width:2px;height:1em;margin-left:2px;vertical-align:-2px;background:#2b0e04;animation:blink .6s steps(1) infinite}
  @keyframes blink{50%{opacity:0}}
  .dots i{display:inline-block;width:6px;height:6px;margin:0 2px;border-radius:50%;background:#2b0e04;animation:dot 1s infinite}
  .dots i:nth-child(2){animation-delay:.15s}
  .dots i:nth-child(3){animation-delay:.3s}
  @keyframes dot{0%,60%,100%{transform:translateY(0);opacity:.4}30%{transform:translateY(-5px);opacity:1}}

  /* the lava itself */
  .lavatower{position:relative;width:100%;height:clamp(150px,26vh,230px);background:#120a08;border:3px solid #4a342c;border-radius:12px;overflow:hidden;box-shadow:inset 0 0 18px rgba(0,0,0,.8);transition:border-color .3s,box-shadow .3s}
  .lane.active .lavatower{border-color:var(--molten);box-shadow:0 0 16px rgba(255,176,0,.55),inset 0 0 18px rgba(0,0,0,.8)}
  .lavafill{position:absolute;left:0;right:0;bottom:0;height:0%;opacity:0;transition:height .9s ease,opacity .3s;
    background:
      radial-gradient(ellipse 24px 12px at 20% 30%,rgba(40,8,2,.55),transparent 70%),
      radial-gradient(ellipse 32px 14px at 70% 60%,rgba(40,8,2,.5),transparent 70%),
      radial-gradient(ellipse 18px 10px at 45% 85%,rgba(40,8,2,.5),transparent 70%),
      radial-gradient(circle at 60% 20%,rgba(255,240,150,.75),transparent 35%),
      linear-gradient(180deg,#ffd23f 0%,#ff8a1f 25%,#e8400c 60%,#8a1403 100%);
    background-size:90px 70px,110px 80px,80px 90px,70px 70px,100% 100%;
    animation:drift 7s linear infinite;
    box-shadow:0 -6px 20px rgba(255,120,20,.85),inset 0 10px 16px rgba(255,235,130,.55)}
  @keyframes drift{to{background-position:90px 0,-110px 0,80px 0,-70px 0,0 0}}
  .lavafill::before{content:"";position:absolute;left:0;right:0;top:-8px;height:12px;
    background:radial-gradient(circle at 10px 12px,#ffd23f 9px,transparent 10px) repeat-x;background-size:20px 12px;
    filter:drop-shadow(0 -2px 4px rgba(255,150,30,.8));animation:ripple 2.5s linear infinite}
  @keyframes ripple{to{background-position:20px 0}}
  .lbub{position:absolute;bottom:0;border-radius:50%;background:radial-gradient(circle at 30% 30%,rgba(255,250,200,.95),rgba(255,180,40,.5) 60%,transparent 70%);animation:lrise var(--d) ease-in forwards}
  @keyframes lrise{to{transform:translateY(calc(var(--h) * -1)) scale(1.2);opacity:0}}
  .ember{position:absolute;width:4px;height:4px;border-radius:50%;background:#ffcf5a;box-shadow:0 0 6px #ff8a1f;animation:eup var(--d) ease-out forwards}
  @keyframes eup{to{transform:translate(var(--x),-60px);opacity:0}}
  .lpct{position:absolute;bottom:6px;left:0;right:0;text-align:center;font-weight:800;color:#fff;text-shadow:0 1px 3px #000;z-index:2}
  .critical-mode{animation:criticalPulse .8s infinite alternate}
  @keyframes criticalPulse{from{box-shadow:0 0 5px #ff2222}to{box-shadow:0 0 24px #ff2222}}

  /* score tally (results screen) */
  .tallywrap{overflow-x:auto}
  table.tally{width:100%;border-collapse:collapse;font-size:.8rem;text-align:center}
  .tally th,.tally td{padding:6px 4px;border-bottom:1px solid rgba(255,130,40,.25)}
  .tally th{font-size:.85rem}
  .tally td:first-child,.tally th:first-child{text-align:left;color:var(--muted)}
  .tally tr.total td{font-weight:900;color:var(--molten);font-size:.95rem;border-top:2px solid var(--ember)}

  /* big turn screen */
  #turnOverlay{position:fixed;inset:0;z-index:50;display:none;flex-direction:column;align-items:center;justify-content:center;gap:1rem;background:rgba(14,6,4,.92);pointer-events:none}
  #turnOverlay.show{display:flex;animation:turnIn .35s ease-out}
  @keyframes turnIn{from{transform:scale(.6);opacity:0}to{transform:scale(1);opacity:1}}
  #turnFace{font-size:clamp(4rem,22vw,9rem);line-height:1}
  #turnText{font-size:clamp(2.4rem,11vw,6rem);font-weight:900;text-align:center;line-height:1;letter-spacing:-.02em;padding:0 1rem;background:linear-gradient(180deg,#ffb000,#ff5a1f);-webkit-background-clip:text;background-clip:text;color:transparent}

  @media (prefers-reduced-motion:reduce){.lavafill,.lavafill::before,.lane.active .avatar,.critical-mode,#turnOverlay.show{animation:none}}`;

function createFeatureUI() {
  const style = document.createElement("style");
  style.textContent = CSS;
  document.head.appendChild(style);

  const card = (id, html = "") => {
    const d = document.createElement("div");
    d.id = id;
    d.className = "feature-card";
    d.innerHTML = html;
    return d;
  };

  $("start").appendChild(card("startStats"));
  $("over").appendChild(card("tallyCard"));
  $("over").appendChild(card("overStats"));

  // one lane (character + lava tower) per player
  const arena = document.createElement("div");
  arena.id = "arena";
  arena.innerHTML = players.map((p, i) => `
    <div class="lane" id="lane-${i}">
      <div class="speech" id="speech-${i}"></div>
      <div class="avatar" id="avatar-${i}">${p.faces[0]}</div>
      <div class="pname">${p.name}</div>
      <div class="lavatower" id="lt-${i}">
        <div class="lavafill" id="fill-${i}"></div>
        <div class="lpct" id="lpct-${i}">0%</div>
      </div>
      <div class="pscore" id="pscore-${i}">⭐ 0</div>
    </div>`).join("");
  document.querySelector(".board").before(arena);

  const banner = card("eventBanner");
  banner.style.display = "none";
  $("category").before(
    card("featureHud", '<div id="turnDisplay"></div><div id="comboDisplay"></div><div id="bossDisplay"></div><div id="lastChanceDisplay"></div>'),
    banner
  );

  const overlay = document.createElement("div");
  overlay.id = "turnOverlay";
  overlay.innerHTML = '<div id="turnFace"></div><div id="turnText"></div>';
  document.body.appendChild(overlay);

  renderStatistics();
}

function updateFeatureHUD() {
  const p = players[turn];
  $("turnDisplay").textContent = round ? `🎯 Turn ${round}: ${p.name}` : "";
  $("comboDisplay").textContent = `🔥 ${p.name} Combo: ${p.combo} | Multiplier: ${p.mult}x`;
  $("bossDisplay").textContent = bossRound ? `👹 BOSS ROUND: ${bossDone}/${BOSS_WORDS} words` : "";
  $("lastChanceDisplay").textContent = lastChance ? "🚨 LAST CHANCE MODE! DOUBLE POINTS! SURVIVE!" : "";
  players.forEach((_, i) => $("lt-" + i).classList.toggle("critical-mode", lastChance && i === turn));
}

function triggerDisaster() {
  activeEvent = Math.random() < EVENT_CHANCE ? EVENTS[Math.floor(Math.random() * EVENTS.length)] : null;
  const b = $("eventBanner");
  b.style.display = activeEvent ? "block" : "none";
  b.textContent = activeEvent ? `${activeEvent.name} - ${activeEvent.desc}` : "";
}

// ===== RESULTS: score tally (rubric) for every player =====
function renderTally() {
  const ranked = [...players].sort((a, b) => b.score - a.score);
  const winner = players.filter(p => !p.dead).sort((a, b) => b.score - a.score)[0];
  const place = ["1st", "2nd", "3rd"];
  const rows = [
    ["Words answered", p => p.tally.words],
    ["Points from letters", p => p.tally.letters],
    ["Long word bonus (8+ letters)", p => "+" + p.tally.longBonus],
    ["Combo multiplier bonus", p => "+" + p.tally.comboBonus],
    ["Last Chance bonus", p => "+" + p.tally.lastBonus],
    ["Boss rounds defeated", p => p.tally.bosses],
    ["Longest word", p => p.tally.longest || "-"],
    ["Best combo", p => p.tally.bestCombo],
    ["Time-outs", p => p.tally.timeouts],
    ["Final lava", p => Math.round(Math.min(p.lava, MAX_LAVA)) + "%"],
    ["Result", p => p === winner ? "🏆 Winner" : p.dead ? "🌋 Melted" : "Survived"],
    ["TOTAL SCORE", p => p.score, "total"],
    ["Rank", p => place[ranked.indexOf(p)], "total"]
  ];
  const head = players.map(p => `<th>${p.faces[0]}<br>${p.name}</th>`).join("");
  const body = rows.map(([label, value, cls]) =>
    `<tr class="${cls || ""}"><td>${label}</td>${players.map(p => `<td>${value(p)}</td>`).join("")}</tr>`
  ).join("");
  $("tallyCard").innerHTML =
    `<strong>🧾 SCORE TALLY</strong><div class="tallywrap"><table class="tally"><tr><th>Criteria</th>${head}</tr>${body}</table></div>`;
}

// ===== SPEECH BUBBLE (typing animation) =====
const DOTS = '<span class="dots"><i></i><i></i><i></i></span>';

function setBubble(i, html) {
  const b = $("speech-" + i);
  b.innerHTML = html;
  b.classList.toggle("on", !!html);
}

function showTyping(p, text) {
  setBubble(players.indexOf(p), text ? `${text}<span class="caret"></span>` : DOTS);
  $("answer").value = text;
}
=======
// ===== GAME VARIABLES =====
let lava, round, score, used, current;
let timeLeft, roundTime, timerId, locked;
let lastCats = [];

let combo = 0;
let multiplier = 1;
>>>>>>> a56c32a53aca08e2226c6c40f79631f9d4e29733

let bossRound = false;
let bossCompleted = 0;
let bossTarget = 0;
let bossPush = 0;

let activeEvent = null;
let lastChance = false;

let longestWord = "";
let transitionTimer = null;

// ===== STATISTICS =====
function defaultStats() {
    return {
        gamesPlayed: 0,
        totalWords: 0,
        longestWord: "",
        bestRound: 0,
        totalScore: 0,
        highestScore: 0
    };
}

function getStats() {
    try {
        return {
            ...defaultStats(),
            ...JSON.parse(localStorage.getItem(STATS_KEY))
        };
    } catch (e) {
        return defaultStats();
    }
}

function saveStats(stats) {
    try {
        localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    } catch (e) {}
}

function updateWordStats(word) {
    const stats = getStats();

    stats.totalWords++;

    if (word.length > stats.longestWord.length) {
        stats.longestWord = word;
    }

    saveStats(stats);
}

function renderStatistics() {
    const stats = getStats();

    const average = stats.gamesPlayed > 0
        ? Math.round(stats.totalScore / stats.gamesPlayed)
        : 0;

    const startStats = $("startStats");
    const overStats = $("overStats");

    const content = `
        <strong>📊 PERSONAL STATISTICS</strong>
        <div>🎮 Games Played: ${stats.gamesPlayed}</div>
        <div>🏆 Best Round: ${stats.bestRound}</div>
        <div>📝 Total Words: ${stats.totalWords}</div>
        <div>📚 Longest Word: ${stats.longestWord || "None yet"}</div>
        <div>⭐ Highest Score: ${stats.highestScore}</div>
        <div>📈 Average Score: ${average}</div>
    `;

    if (startStats) startStats.innerHTML = content;
    if (overStats) overStats.innerHTML = content;
}

// ===== HIGH SCORE =====
function getBest() {
    try {
        return parseInt(localStorage.getItem(KEY), 10) || 0;
    } catch (e) {
        return 0;
    }
}

function saveBest(v) {
    try {
        localStorage.setItem(KEY, String(v));
    } catch (e) {}
}

function refreshBest() {
    const best = getBest();

    $("hsStart").textContent = best;
    $("hsOver").textContent = best;
    $("best").textContent = best;
}

// ===== CREATE NEW UI ELEMENTS =====
function createFeatureUI() {
    const style = document.createElement("style");

    style.textContent = `
        .feature-card {
            background: rgba(255, 100, 20, 0.10);
            border: 1px solid rgba(255, 130, 40, 0.35);
            border-radius: 10px;
            padding: 12px;
            margin: 12px 0;
            line-height: 1.8;
            font-size: 13px;
            text-align: left;
            color: #fff;
        }

        #comboDisplay {
            color: #ffae42;
            font-weight: bold;
        }

        #bossDisplay {
            color: #ff6666;
            font-weight: bold;
        }

        #lastChanceDisplay {
            color: #ff3333;
            font-weight: bold;
        }

        #eventBanner {
            color: #ffc45c;
            font-weight: bold;
            text-align: center;
        }

        .critical-mode {
            animation: criticalPulse 0.8s infinite alternate;
        }

        @keyframes criticalPulse {
            from { box-shadow: 0 0 5px #ff2222; }
            to { box-shadow: 0 0 22px #ff2222; }
        }
    `;

    document.head.appendChild(style);

    const startStats = document.createElement("div");
    startStats.id = "startStats";
    startStats.className = "feature-card";
    $("start").appendChild(startStats);

    const overStats = document.createElement("div");
    overStats.id = "overStats";
    overStats.className = "feature-card";
    $("over").appendChild(overStats);

    const panel = document.querySelector(".panel");

    if (panel) {
        const hud = document.createElement("div");
        hud.id = "featureHud";
        hud.className = "feature-card";

        hud.innerHTML = `
            <div id="comboDisplay">🔥 Combo: 0 | Multiplier: 1x</div>
            <div id="bossDisplay"></div>
            <div id="lastChanceDisplay"></div>
        `;

        panel.insertBefore(hud, $("category").parentElement);

        const banner = document.createElement("div");
        banner.id = "eventBanner";
        banner.className = "feature-card";
        banner.style.display = "none";

        panel.insertBefore(banner, $("category").parentElement);
    }

    renderStatistics();
}

// ===== UPDATE FEATURE HUD =====
function updateFeatureHUD() {
    if ($("comboDisplay")) {
        $("comboDisplay").textContent =
            `🔥 Combo: ${combo} | Multiplier: ${multiplier}x`;
    }

    if ($("bossDisplay")) {
        $("bossDisplay").textContent = bossRound
            ? `👹 BOSS ROUND: ${bossCompleted}/${bossTarget} words`
            : "";
    }

    if ($("lastChanceDisplay")) {
        $("lastChanceDisplay").textContent = lastChance
            ? "🚨 LAST CHANCE MODE! DOUBLE POINTS! SURVIVE!"
            : "";
    }

    const tower = document.querySelector(".tower");

    if (tower) {
        tower.classList.toggle("critical-mode", lastChance);
    }
}

// ===== RANDOM DISASTER EVENTS =====
const DISASTER_EVENTS = [
    {
        name: "🔥 HEAT WAVE",
        description: "Lava rises an extra 10%!",
        rise: 10,
        time: 0
    },
    {
        name: "🌋 LAVA SURGE",
        description: "Lava rises an extra 15%!",
        rise: 15,
        time: 0
    },
    {
        name: "❄️ COOL BREEZE",
        description: "Lava rise decreases by 5%!",
        rise: -5,
        time: 0
    },
    {
        name: "⚡ VOLCANIC TREMOR",
        description: "You have 3 seconds less!",
        rise: 0,
        time: 3
    }
];

function triggerDisaster() {
    activeEvent = null;

    const banner = $("eventBanner");

    if (Math.random() < EVENT_CHANCE) {
        activeEvent = DISASTER_EVENTS[
            Math.floor(Math.random() * DISASTER_EVENTS.length)
        ];

        banner.style.display = "block";

        banner.textContent =
            activeEvent.name + " - " + activeEvent.description;
    } else {
        banner.style.display = "none";
        banner.textContent = "";
    }
}

// ===== START GAME =====
function startGame() {
<<<<<<< HEAD
  clearInterval(timerId);
  clearTimeout(botTimer);
  clearTimeout(transitionTimer);
  $("turnOverlay").classList.remove("show");
  round = bossDone = bossPush = 0;
  players = newPlayers();
  turn = players.length - 1;          // so the first turn goes to player 0 (you)
  used = new Set();
  lastCats = [];
  bossRound = lastChance = false;
  activeEvent = null;
  locked = true;

  const s = getStats();
  s.gamesPlayed++;
  save(STATS_KEY, s);

  updateHud();
  show("game");
  nextRound();
=======
    clearInterval(timerId);
    clearTimeout(transitionTimer);

    lava = 0;
    round = 0;
    score = 0;

    used = new Set();
    lastCats = [];

    combo = 0;
    multiplier = 1;

    bossRound = false;
    bossCompleted = 0;
    bossTarget = 0;
    bossPush = 0;

    activeEvent = null;
    lastChance = false;
    longestWord = "";

    const stats = getStats();
    stats.gamesPlayed++;
    saveStats(stats);

    updateHud();
    updateFeatureHUD();

    show("game");
    setTh();
    nextRound();
>>>>>>> a56c32a53aca08e2226c6c40f79631f9d4e29733
}

// ===== NEXT ROUND =====
function nextRound() {
<<<<<<< HEAD
  round++;
  do { turn = (turn + 1) % players.length; } while (players[turn].dead);   // skip melted players
  const p = players[turn];
  locked = true;                                  // frozen during the big turn screen
  lastChance = p.lava >= LAST_CHANCE_LEVEL;

  let choices = WORD_BANK.filter(c => !lastCats.includes(c.category));
  if (!choices.length) { lastCats = []; choices = WORD_BANK; }
  current = choices[Math.floor(Math.random() * choices.length)];
  lastCats.push(current.category);
  if (lastCats.length > 2) lastCats.shift();
  current.set = new Set(current.words.split(" ").map(normalize));

  bossRound = round % BOSS_INTERVAL === 0;
  bossDone = bossPush = 0;

  triggerDisaster();
  roundTime = lastChance ? LAST_CHANCE_TIME : Math.max(MIN_TIME, BASE_TIME - Math.floor((round - 1) / 2));
  if (activeEvent) roundTime = Math.max(4, roundTime - activeEvent.time);
  timeLeft = roundTime;

  players.forEach((_, i) => setBubble(i, ""));
  $("category").textContent = current.category;
  $("answer").value = "";
  $("answer").disabled = $("submit").disabled = true;
  setMsg("", "");
  updateHud();
  drawTimer();

  // big screen: YOUR TURN / FIRST BOT TURN / SECOND BOT TURN, then the turn begins
  $("turnFace").textContent = p.faces[0];
  $("turnText").textContent = p.turnText;
  $("turnOverlay").classList.add("show");
  transitionTimer = setTimeout(() => {
    $("turnOverlay").classList.remove("show");
    beginTurn(p);
  }, ANNOUNCE_MS);
}

function beginTurn(p) {
  locked = false;
  $("answer").disabled = $("submit").disabled = p.bot;      // only you can type on your turn
  setMsg(p.bot ? `${p.name} is thinking...` : "Your turn!", "");

  clearInterval(timerId);
  timerId = setInterval(() => {
    timeLeft -= 0.1;
    drawTimer();
    if (timeLeft <= 0) endRound(null);
  }, 100);

  if (p.bot) botTurn(p);
  else $("answer").focus();
}

// ===== BOT LOGIC =====
function botTurn(p) {
  setBubble(turn, DOTS);                           // thinking...
  const need = bossRound ? BOSS_WORDS : 1;
  const pool = [...current.set].filter(w => !used.has(w));
  const short = pool.filter(w => w.length <= p.maxLen);
  const source = short.length >= need ? short : pool;

  // The bot either knows a word this turn, or keeps "thinking" until time runs out.
  if (Math.random() > p.acc || source.length < need) return;

  const picks = [];
  while (picks.length < need) picks.push(source.splice(Math.floor(Math.random() * source.length), 1)[0]);

  const typeTime = picks.reduce((t, w) => t + w.length * p.speed / 1000 + 0.3, 0);
  let think = rand(p.think[0], p.think[1]);
  think = Math.min(think, roundTime - 0.4 - typeTime);   // squeeze thinking time so it can finish
  if (think < 0.3) return;                                // too slow for this round

  botTimer = setTimeout(() => typeWords(p, picks, 0), think * 1000);
}

// types one word letter by letter, then moves on to the next word or submits
function typeWords(p, picks, i) {
  const w = picks[i];
  let n = 0;
  const step = () => {
    if (locked) return;
    showTyping(p, w.slice(0, ++n));
    if (n < w.length) {
      botTimer = setTimeout(step, p.speed * rand(0.7, 1.3));
    } else {
      botTimer = setTimeout(() => {
        used.add(w);
        if (i + 1 < picks.length) {
          showTyping(p, "");
          typeWords(p, picks, i + 1);
        } else {
          botSubmit(p, picks);
        }
      }, 300);
    }
  };
  step();
}

function botSubmit(p, picks) {
  if (bossRound) {
    bossDone = picks.length;
    bossPush = picks.reduce((sum, w) => sum + pushFor(w.length), 0);
    picks.forEach(w => awardWord(w, p));
    endRound(picks[picks.length - 1], true);
  } else {
    endRound(picks[0]);
  }
}

function awardWord(word, p) {
  const len = word.length;
  p.combo++;
  p.mult = Math.min(MAX_MULTIPLIER, 1 + Math.floor(p.combo / 2));
  const longBonus = len >= 8 ? BONUS_LONG : 0;
  const comboBonus = (len + longBonus) * (p.mult - 1);
  const subtotal = (len + longBonus) * p.mult;
  const lastBonus = lastChance ? subtotal : 0;
  const points = subtotal + lastBonus;
  p.score += points;

  const t = p.tally;                               // rubric numbers for the results screen
  t.words++;
  t.letters += len;
  t.longBonus += longBonus;
  t.comboBonus += comboBonus;
  t.lastBonus += lastBonus;
  t.bestCombo = Math.max(t.bestCombo, p.combo);
  if (len > t.longest.length) t.longest = word;

  if (!p.bot) {                                   // statistics are for you only
    const s = getStats();
    s.totalWords++;
    if (len > s.longestWord.length) s.longestWord = word;
    save(STATS_KEY, s);
  }

  updateHud();
  return { points, len };
}

function submitWord() {
  const p = players[turn];
  if (locked || p.bot) return;
  const w = normalize($("answer").value);
  if (!w) return;
  if (used.has(w)) return reject("You already used that word.");
  if (!current.set.has(w)) return reject(`Not in the ${current.category} list. Try another word.`);
  used.add(w);

  if (bossRound) {
    const r = awardWord(w, p);
    bossDone++;
    bossPush += pushFor(w.length);
    if (bossDone >= BOSS_WORDS) return endRound(w, true);
    setMsg(`"${w}" accepted! +${r.points} points. ${BOSS_WORDS - bossDone} more word needed!`, "good");
    $("answer").value = "";
    $("answer").focus();
    return;
  }
  endRound(w);
}

function reject(text) {
  setMsg(text, "bad");
  const el = $("answer");
  el.classList.remove("shake");
  void el.offsetWidth;
  el.classList.add("shake");
  el.select();
}

function endRound(word, bossWon = false) {
  if (locked) return;
  locked = true;
  clearInterval(timerId);
  clearTimeout(botTimer);
  $("answer").disabled = $("submit").disabled = true;

  const p = players[turn];
  const owner = p.bot ? `${p.name}'s` : "Your";
  // The normal rise only happens when time runs out. A correct answer stops it,
  // so only a disaster event can still move the lava on a correct answer.
  const extra = activeEvent ? activeEvent.rise : 0;
  const rise = word ? 0 : START_RISE + (round - 1) * RISE_PER_ROUND;
  let push = 0, text;

  if (!word) {
    p.combo = 0;
    p.mult = 1;
    p.tally.timeouts++;
    text = (p.bot ? `${p.name} ran out of time!` : "Time's up!") + " The lava keeps rising.";
    if (p.bot) setBubble(turn, "⏰");
  } else if (bossWon) {
    push = bossPush;
    p.tally.bosses++;
    text = `👹 BOSS DEFEATED by ${p.name}! ${bossDone} words completed!`;
  } else {
    const r = awardWord(word, p);
    push = pushFor(word.length);
    text = `${p.name}: "${word}" = ${r.len} letters, +${r.points} pts.` + (lastChance ? " DOUBLE POINTS!" : "");
  }

  const net = rise + extra - push;   // change to THIS player's own lava
  p.lava = Math.min(MAX_LAVA, Math.max(0, p.lava + net));
  text += net > 0 ? ` ${owner} lava +${net}%.` : net < 0 ? ` ${owner} lava pushed back ${-net}%.` : ` ${owner} lava holds steady.`;

  if (p.lava >= MAX_LAVA) {
    p.dead = true;
    text += ` 🌋 ${p.bot ? p.name : "You"} melted!`;
  }
  setMsg(text, net > 0 || p.dead ? "bad" : "good");
  updateHud();

  // the game ends when you melt, or when both bots have melted
  const over = players[0].dead || players.filter(x => !x.dead).length === 1;
  transitionTimer = setTimeout(over ? gameOver : nextRound, over ? 1600 : 1800);
=======
    round++;
    locked = false;

    if (lava >= LAST_CHANCE_LEVEL) {
        lastChance = true;
    }

    const choices = WORD_BANK.filter(
        c => !lastCats.includes(c.category)
    );

    if (!choices.length) {
        lastCats = [];
        choices.push(...WORD_BANK);
    }

    current = choices[
        Math.floor(Math.random() * choices.length)
    ];

    lastCats.push(current.category);

    if (lastCats.length > 2) {
        lastCats.shift();
    }

    current.set = new Set(
        current.words.split(" ").map(normalize)
    );

    bossRound = round % BOSS_INTERVAL === 0;

    bossCompleted = 0;
    bossPush = 0;
    bossTarget = bossRound ? BOSS_WORDS : 0;

    roundTime = lastChance
        ? LAST_CHANCE_TIME
        : Math.max(
            MIN_TIME,
            BASE_TIME - Math.floor((round - 1) / 2)
        );

    triggerDisaster();

    if (activeEvent) {
        roundTime = Math.max(4, roundTime - activeEvent.time);
    }

    timeLeft = roundTime;

    $("category").textContent = current.category;

    $("answer").value = "";
    $("answer").disabled = false;
    $("submit").disabled = false;

    setMsg("", "");

    updateHud();
    updateFeatureHUD();
    drawTimer();

    $("answer").focus();

    clearInterval(timerId);

    timerId = setInterval(() => {
        timeLeft -= 0.1;

        drawTimer();

        if (timeLeft <= 0) {
            endRound(null);
        }
    }, 100);
}

// ===== NORMALIZE WORD =====
function normalize(w) {
    return w.normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z]/g, "");
}

// ===== SCORING AND COMBO =====
function awardWord(word) {
    const len = word.length;

    combo++;

    multiplier = Math.min(
        MAX_MULTIPLIER,
        1 + Math.floor(combo / 2)
    );

    const basePoints =
        len + (len >= 8 ? BONUS_LONG : 0);

    const points = basePoints * multiplier *
        (lastChance ? 2 : 1);

    score += points;

    updateWordStats(word);

    if (word.length > longestWord.length) {
        longestWord = word;
    }

    updateFeatureHUD();
    updateHud();

    return {
        points,
        len
    };
>>>>>>> a56c32a53aca08e2226c6c40f79631f9d4e29733
}

// ===== SUBMIT WORD =====
function submitWord() {
    if (locked) return;

    const w = normalize($("answer").value);

    if (!w) return;

    if (used.has(w)) {
        return reject("You already used that word.");
    }

    if (!current.set.has(w)) {
        return reject(
            "Not in the " + current.category + " list. Try another word."
        );
    }

    used.add(w);

    if (bossRound) {
        const result = awardWord(w);

        bossCompleted++;

        const push = w.length >= 8
            ? PUSH_LONG
            : w.length >= 5
                ? PUSH_MEDIUM
                : PUSH_SHORT;

        bossPush += push;

        if (bossCompleted < bossTarget) {
            setMsg(
                `"${w}" accepted! +${result.points} points. ` +
                `${bossTarget - bossCompleted} more word needed!`,
                "good"
            );

            $("answer").value = "";
            $("answer").focus();

            updateFeatureHUD();
            return;
        }

        endRound(w, true);
        return;
    }

    endRound(w);
}

// ===== INVALID WORD =====
function reject(text) {
    setMsg(text, "bad");

    const el = $("answer");

    el.classList.remove("shake");
    void el.offsetWidth;
    el.classList.add("shake");

    el.select();
}

// ===== END ROUND =====
function endRound(word, defeatedBoss = false) {
    if (locked) return;

    locked = true;

    clearInterval(timerId);

    $("answer").disabled = true;
    $("submit").disabled = true;

    const rise = START_RISE + (round - 1) * RISE_PER_ROUND;

    let push = 0;
    let text = "";

    if (word) {
        if (!defeatedBoss) {
            const result = awardWord(word);

            push = word.length >= 8
                ? PUSH_LONG
                : word.length >= 5
                    ? PUSH_MEDIUM
                    : PUSH_SHORT;

            text =
                `"${word}" = ${result.len} letters, ` +
                `+${result.points} pts. `;
        } else {
            push = bossPush;

            text =
                `👹 BOSS DEFEATED! ${bossCompleted} words completed! `;
        }

    } else {
        combo = 0;
        multiplier = 1;

        text = "Time's up! The lava keeps rising.";
    }

    // Disaster event
    let extraRise = activeEvent ? activeEvent.rise : 0;

    // Last Chance bonus
    if (lastChance && word) {
        text += " DOUBLE POINTS! ";
    }

    lava = Math.max(
        0,
        lava + rise + extraRise - push
    );

    lava = Math.min(lava, MAX_LAVA);

    text += `Lava +${rise + extraRise}%.`;

    if (push > 0) {
        text += ` Lava pushed back ${push}%.`;
    }

    setMsg(
        text,
        push > 0 ? "good" : "bad"
    );

    updateHud();
    updateFeatureHUD();

    if (lava >= MAX_LAVA) {
        transitionTimer = setTimeout(gameOver, 1400);
    } else {
        transitionTimer = setTimeout(nextRound, 1600);
    }
}

// ===== GAME OVER =====
function gameOver() {
<<<<<<< HEAD
  clearInterval(timerId);
  clearTimeout(botTimer);
  clearTimeout(transitionTimer);

  const me = players[0], best = getBest(), s = getStats();
  if (me.score > best) save(KEY, me.score);
  s.bestRound = Math.max(s.bestRound, round);
  s.totalScore += me.score;
  s.highestScore = Math.max(s.highestScore, me.score);
  save(STATS_KEY, s);

  const winner = players.filter(p => !p.dead).sort((a, b) => b.score - a.score)[0];
  refreshBest();
  renderStatistics();
  renderTally();
  $("finalScore").textContent = me.score;
  $("finalInfo").textContent =
    (me.dead ? `🌋 You melted in round ${round}! Winner: ${winner.name}. ` : `🏆 YOU WIN! Both bots melted by round ${round}! `) +
    players.map(p => `${p.name}: ${p.score}`).join(" | ") +
    (me.score > best && me.score > 0 ? " - NEW HIGH SCORE!" : "");
  show("over");
=======
    clearInterval(timerId);
    clearTimeout(transitionTimer);

    const best = getBest();

    if (score > best) {
        saveBest(score);
    }

    const stats = getStats();

    stats.bestRound = Math.max(stats.bestRound, round);
    stats.totalScore += score;
    stats.highestScore = Math.max(stats.highestScore, score);

    saveStats(stats);

    refreshBest();

    $("finalScore").textContent = score;

    $("finalInfo").textContent =
        `You survived ${round} rounds` +
        (score > best && score > 0
            ? " - NEW HIGH SCORE!"
            : ".");

    renderStatistics();

    show("over");
>>>>>>> a56c32a53aca08e2226c6c40f79631f9d4e29733
}

// ===== HUD =====
function updateHud() {
<<<<<<< HEAD
  players.forEach((p, i) => {
    const shown = Math.min(p.lava, MAX_LAVA);
    const fill = $("fill-" + i);
    fill.style.height = shown + "%";
    fill.style.opacity = shown > 0 ? 1 : 0;
    $("lpct-" + i).textContent = Math.round(shown) + "%";
    $("pscore-" + i).textContent = "⭐ " + p.score;
    $("avatar-" + i).textContent = p.dead ? p.faces[2] : shown >= 60 ? p.faces[1] : p.faces[0];
    $("lane-" + i).classList.toggle("dead", p.dead);
    $("lane-" + i).classList.toggle("active", round > 0 && !p.dead && i === turn);
  });
  $("heat").style.opacity = (Math.min(players[0].lava, MAX_LAVA) / MAX_LAVA * 0.7).toFixed(2);
  $("round").textContent = Math.max(round, 1);
  $("score").textContent = players[0].score;
  updateFeatureHUD();
=======
    const shown = Math.min(lava, MAX_LAVA);

    $("lava").style.height = shown + "%";

    $("heat").style.opacity =
        (shown / MAX_LAVA * 0.7).toFixed(2);

    $("pct").textContent = Math.round(shown) + "%";

    $("round").textContent = Math.max(round, 1);

    $("score").textContent = score;

    updateFeatureHUD();
>>>>>>> a56c32a53aca08e2226c6c40f79631f9d4e29733
}

function drawTimer() {
    const t = Math.max(0, timeLeft);

    $("time").textContent = Math.ceil(t);

    $("timerBar").style.width =
        (t / roundTime * 100) + "%";

    $("timerBar").style.background =
        t < 4 ? "var(--bad)" : "var(--molten)";
}

function setMsg(t, cls) {
    const m = $("msg");
    m.textContent = t;
    m.className = "msg " + cls;
}
<<<<<<< HEAD

function setMsg(t, cls) {
  const m = $("msg");
  m.textContent = t;
  m.className = "msg " + cls;
}
=======
>>>>>>> a56c32a53aca08e2226c6c40f79631f9d4e29733

// ===== EVENTS =====
$("startBtn").onclick = $("playBtn").onclick = $("againBtn").onclick = startGame;
$("howBtn").onclick = () => show("how");
$("submit").onclick = submitWord;
<<<<<<< HEAD
$("answer").addEventListener("keydown", e => { if (e.key === "Enter") submitWord(); });

// ===== LAVA EFFECTS: bubbles inside each lava + embers above the surface =====
const reduceMotion = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

function spawn(cls, css, ms, parent) {
  const el = document.createElement("span");
  el.className = cls;
  el.style.cssText = css;
  parent.appendChild(el);
  setTimeout(() => el.remove(), ms);
}

function lavaFx() {
  if (reduceMotion || $("game").classList.contains("hidden")) return;
  players.forEach((p, i) => {
    const h = $("fill-" + i).offsetHeight;
    if (p.dead || h < 10) return;
    if (Math.random() < 0.7) {
      const size = 5 + Math.random() * 10, d = 1.4 + Math.random() * 1.6;
      spawn("lbub", `width:${size}px;height:${size}px;left:${Math.random() * 88}%;--d:${d}s;--h:${h * (0.3 + Math.random() * 0.6)}px`, d * 1000, $("fill-" + i));
    }
    if (Math.random() < 0.35) {
      spawn("ember", `left:${8 + Math.random() * 84}%;bottom:${h}px;--d:1.4s;--x:${(Math.random() - 0.5) * 30}px`, 1400, $("lt-" + i));
    }
  });
}

// ===== INITIALIZE =====
createFeatureUI();
updateHud();
refreshBest();
setInterval(lavaFx, 350);
=======

$("answer").addEventListener("keydown", e => {
    if (e.key === "Enter") submitWord();
});

// ===== LAVA EFFECTS =====
const reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function setTh() {
    $("lava").style.setProperty(
        "--th",
        document.querySelector(".tower").clientHeight + "px"
    );
}

window.addEventListener("resize", setTh);

if (reduceMotion) {
    document.querySelectorAll("animate").forEach(a => a.remove());
}

function lavaFx() {
    if (reduceMotion || $("game").classList.contains("hidden")) {
        return;
    }

    const h = $("lava").offsetHeight;

    if (h < 10) return;

    const b = document.createElement("span");

    const size = 5 + Math.random() * 11;
    const d = 1.4 + Math.random() * 1.8;

    b.className = "bubble";

    b.style.cssText =
        `width:${size}px;height:${size}px;` +
        `left:${Math.random() * 90}%;` +
        `--d:${d}s;` +
        `--h:${h * (0.3 + Math.random() * 0.6)}px`;

    $("pool").appendChild(b);

    setTimeout(() => b.remove(), d * 1000);

    if (Math.random() < 0.6) {
        const s = document.createElement("span");

        s.className = "spark";

        s.style.cssText =
            `left:${8 + Math.random() * 84}%;` +
            `bottom:${h}px;` +
            `--d:1.6s;` +
            `--x:${(Math.random() - 0.5) * 40}px`;

        document.querySelector(".tower").appendChild(s);

        setTimeout(() => s.remove(), 1600);
    }
}

// ===== INITIALIZE GAME =====
createFeatureUI();
refreshBest();
renderStatistics();

setTh();

setInterval(lavaFx, 350);
>>>>>>> a56c32a53aca08e2226c6c40f79631f9d4e29733
