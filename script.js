
"use strict";

// ---------- SETTINGS ----------
const START_RISE = 15;
const RISE_PER_ROUND = 3;
const MAX_LAVA = 100;
const BASE_TIME = 15;
const MIN_TIME = 8;
const BOSS_INTERVAL = 5;
const BOSS_WORDS = 2;
const EVENT_CHANCE = 0.35;
const MAX_MULTIPLIER = 5;
const DOUBLE_ANSWERS = 2;
const HINTS_PER_GAME = 3;

const STORAGE = {
  best: "wordLavaHighScore",
  leaderboard: "wordLavaLeaderboard",
  difficulty: "wordLavaDifficulty",
  sound: "wordLavaSoundEnabled",
  music: "wordLavaMusicEnabled",
  animations: "wordLavaAnimationsEnabled",
  stats: "wordLavaStatistics"
};

const $ = id => document.getElementById(id);

const load = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch {
    return fallback;
  }
};

const save = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
};

const normalize = value => String(value || "")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/[^a-z]/g, "");

const random = (min, max) => min + Math.random() * (max - min);

const DIFFICULTY = {
  easy: {
    label: "Easy",
    time: 3,
    rise: 0.7,
    botAccuracy: 0.65,
    botSpeed: 1.35
  },
  normal: {
    label: "Normal",
    time: 0,
    rise: 1,
    botAccuracy: 0.82,
    botSpeed: 1
  },
  hard: {
    label: "Hard",
    time: -2,
    rise: 1.3,
    botAccuracy: 0.95,
    botSpeed: 0.75
  }
};

const CHARACTERS = {
  explorer: {
    name: "Explorer",
    emoji: "🧑‍🚀"
  },
  warrior: {
    name: "Warrior",
    emoji: "🛡️"
  },
  wizard: {
    name: "Wizard",
    emoji: "🧙"
  },
  adventurer: {
    name: "Adventurer",
    emoji: "🧗"
  },
  scientist: {
    name: "Scientist",
    emoji: "👨‍🔬"
  }
};

const DISASTERS = [
  {
    icon: "🔥",
    title: "HEAT WAVE",
    description: "Lava rises an extra 10%!",
    rise: 10,
    time: 0
  },
  {
    icon: "🌋",
    title: "LAVA SURGE",
    description: "Lava rises an extra 15%!",
    rise: 15,
    time: 0
  },
  {
    icon: "❄️",
    title: "COOL BREEZE",
    description: "Lava rise is reduced by 5%!",
    rise: -5,
    time: 0
  },
  {
    icon: "⚡",
    title: "VOLCANIC TREMOR",
    description: "You have 3 seconds less!",
    rise: 0,
    time: 3
  }
];

let difficulty = load(STORAGE.difficulty, "normal");

if (!DIFFICULTY[difficulty]) {
  difficulty = "normal";
}

let soundEnabled = load(STORAGE.sound, true);
let musicEnabled = load(STORAGE.music, true);
let animationsEnabled = load(STORAGE.animations, true);

let round = 0;
let turn = 0;
let players = [];
let currentCategory = null;
let usedWords = new Set();
let lastCategories = [];

let timerId = null;
let botTimer = null;
let transitionTimer = null;

let timeLeft = 0;
let roundTime = 0;

let locked = true;
let paused = false;
let bossRound = false;
let bossWordsDone = 0;
let bossLavaPush = 0;

let activeDisaster = null;
let hintsLeft = HINTS_PER_GAME;
let doubleAnswersLeft = 0;
let doubleActive = false;

let selectedCharacter = "explorer";
let playerName = "Player";

let lastMessage = "";
let soundContext = null;
let ambientOscillators = [];
let ambientGain = null;

let gameFinished = false;

const difficultySettings = () => DIFFICULTY[difficulty];

const bestScore = () =>
  Number(load(STORAGE.best, 0)) || 0;


// ---------- PLAYER SETUP ----------

function makePlayers() {
  return [
    {
      name: playerName,
      bot: false,
      emoji: CHARACTERS[selectedCharacter].emoji,
      faces: [
        CHARACTERS[selectedCharacter].emoji,
        "😰",
        "💀"
      ],
      score: 0,
      lava: 0,
      combo: 0,
      multiplier: 1,
      dead: false,
      tally: {
        words: 0,
        letters: 0,
        longBonus: 0,
        comboBonus: 0,
        doubleBonus: 0,
        bosses: 0,
        timeouts: 0,
        longest: ""
      }
    },
    {
      name: "Juan",
      bot: true,
      emoji: "😎",
      faces: ["😎", "😅", "💀"],
      accuracy: 0.72,
      maxLength: 7,
      speed: 210,
      think: [1.8, 4.2],
      score: 0,
      lava: 0,
      combo: 0,
      multiplier: 1,
      dead: false,
      tally: {
        words: 0,
        letters: 0,
        longBonus: 0,
        comboBonus: 0,
        doubleBonus: 0,
        bosses: 0,
        timeouts: 0,
        longest: ""
      }
    },
    {
      name: "Maria",
      bot: true,
      emoji: "🤓",
      faces: ["🤓", "😬", "💀"],
      accuracy: 0.84,
      maxLength: 10,
      speed: 165,
      think: [1.4, 3.6],
      score: 0,
      lava: 0,
      combo: 0,
      multiplier: 1,
      dead: false,
      tally: {
        words: 0,
        letters: 0,
        longBonus: 0,
        comboBonus: 0,
        doubleBonus: 0,
        bosses: 0,
        timeouts: 0,
        longest: ""
      }
    }
  ];
}


// ---------- SCREEN HELPERS ----------

const SCREEN_IDS = [
  "start",
  "how",
  "game",
  "over",
  "leaderboard",
  "settings",
  "pause"
];

function showScreen(id) {
  SCREEN_IDS.forEach(screenId => {
    const screen = $(screenId);

    if (screen) {
      screen.classList.toggle(
        "hidden",
        screenId !== id
      );
    }
  });

  const heat = $("heat");

  if (heat && id !== "game") {
    heat.style.opacity = "0.15";
  }
}

function setMessage(message, type = "") {
  const target = $("msg");

  if (!target) return;

  lastMessage = message;
  target.textContent = message;
  target.className = "msg " + type;
}

function safeText(id, value) {
  const element = $(id);

  if (element) {
    element.textContent = value;
  }
}

function clearGameTimers() {
  clearInterval(timerId);
  clearTimeout(botTimer);
  clearTimeout(transitionTimer);

  timerId = null;
  botTimer = null;
  transitionTimer = null;
}


// ---------- GAME STYLES ----------

function addGameStyles() {
  if ($("wordLavaExtraStyles")) return;

  const style = document.createElement("style");

  style.id = "wordLavaExtraStyles";

  style.textContent = `
    #arena {
      display: flex;
      gap: 12px;
      align-items: flex-end;
      justify-content: center;
      margin: 10px auto 16px;
      width: 100%;
    }

    .wl-lane {
      position: relative;
      flex: 1;
      max-width: 180px;
      min-width: 0;
      text-align: center;
      color: #fff;
    }

    .wl-avatar {
      font-size: clamp(28px, 6vw, 48px);
      line-height: 1.2;
    }

    .wl-name {
      font-weight: 800;
      font-size: 13px;
      margin: 4px 0;
    }

    .wl-tower {
      height: clamp(125px, 22vh, 190px);
      background: #170c08;
      border: 2px solid #65402c;
      border-radius: 12px;
      overflow: hidden;
      position: relative;
    }

    .wl-fill {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 0%;
      background: linear-gradient(
        0deg,
        #8b1000,
        #ef3d08 55%,
        #ffb52e
      );
      transition: height .5s;
    }

    .wl-percent {
      position: absolute;
      bottom: 5px;
      left: 0;
      right: 0;
      color: #fff;
      font-weight: 900;
      text-shadow: 0 1px 4px #000;
    }

    .wl-score {
      font-size: 12px;
      color: #ffd27a;
      margin-top: 4px;
    }

    .wl-lane.active .wl-tower {
      border-color: #ff9b28;
      box-shadow: 0 0 14px #ff741d;
    }

    .wl-lane.dead {
      opacity: .45;
      filter: grayscale(1);
    }

    .wl-lane.leader .wl-score {
      color: #ffe16b;
      font-weight: 900;
    }

    #wlHud {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: center;
      margin: 8px 0;
      font-size: 13px;
    }

    #wlHud span {
      background: rgba(255,130,30,.13);
      border: 1px solid rgba(255,150,40,.3);
      padding: 6px 9px;
      border-radius: 8px;
    }

    #wlTurn {
      color: #ffbd62;
      font-weight: 900;
      text-align: center;
      margin: 6px 0;
    }

    #wlWordLog {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
      justify-content: center;
      margin: 8px 0;
      font-size: 11px;
    }

    #wlWordLog span {
      background: rgba(255,255,255,.1);
      padding: 4px 7px;
      border-radius: 20px;
    }

    #wlOverlay {
      position: fixed;
      inset: 0;
      background: rgba(10,5,3,.94);
      z-index: 99;
      display: none;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      color: white;
      text-align: center;
    }

    #wlOverlay.visible {
      display: flex;
    }

    #wlOverlay strong {
      font-size: clamp(28px, 8vw, 64px);
      color: #ff9b32;
    }

    .wl-power-active {
      border-color: #ffd54a !important;
      box-shadow: 0 0 12px #ffc52c;
    }

    .wl-leader-row {
      display: grid;
      grid-template-columns: 45px 1fr 80px;
      gap: 8px;
      padding: 9px;
      border-bottom: 1px solid rgba(255,255,255,.12);
    }

    .wl-leader-row:first-child {
      font-weight: 900;
      color: #ffd66b;
    }

    .wl-achievement {
      padding: 6px 9px;
      margin: 5px 0;
      border-radius: 8px;
      background: rgba(255,180,40,.12);
    }

    .wl-lane.active .wl-avatar {
      animation: wlHop .5s ease-in-out infinite alternate;
    }

    @keyframes wlHop {
      to {
        transform: translateY(-5px);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .wl-lane.active .wl-avatar {
        animation: none;
      }
    }
  `;

  document.head.appendChild(style);
}


// ---------- GAME ARENA ----------

function createGameArena() {
  addGameStyles();

  const board = document.querySelector("#game .board");

  if (!board) return;

  let arena = $("arena");

  if (!arena) {
    arena = document.createElement("div");
    arena.id = "arena";

    board.parentNode.insertBefore(arena, board);
  }

  arena.innerHTML = players.map((player, index) => `
    <div class="wl-lane" id="wlLane${index}">
      <div class="wl-avatar" id="wlAvatar${index}">
        ${player.emoji}
      </div>

      <div class="wl-name" id="wlName${index}">
        ${player.name}
      </div>

      <div class="wl-tower">
        <div class="wl-fill" id="wlFill${index}"></div>
        <div class="wl-percent" id="wlPercent${index}">
          0%
        </div>
      </div>

      <div class="wl-score" id="wlScore${index}">
        ⭐ 0
      </div>
    </div>
  `).join("");

  let hud = $("wlHud");

  if (!hud) {
    hud = document.createElement("div");
    hud.id = "wlHud";

    const panel = document.querySelector("#game .panel");
    const category = $("category");

    if (panel && category) {
      panel.insertBefore(hud, category);
    }
  }

  let turnDisplay = $("wlTurn");

  if (!turnDisplay) {
    turnDisplay = document.createElement("div");
    turnDisplay.id = "wlTurn";

    const category = $("category");

    if (category) {
      category.insertAdjacentElement(
        "afterend",
        turnDisplay
      );
    }
  }

  let log = $("wlWordLog");

  if (!log) {
    log = document.createElement("div");
    log.id = "wlWordLog";

    const message = $("msg");

    if (message) {
      message.insertAdjacentElement("afterend", log);
    }
  }

  let overlay = $("wlOverlay");

  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "wlOverlay";

    overlay.innerHTML = `
      <div id="wlOverlayEmoji" style="font-size:70px">
        🌋
      </div>

      <strong id="wlOverlayText">
        YOUR TURN
      </strong>

      <p id="wlOverlaySub"></p>
    `;

    document.body.appendChild(overlay);
  }
}


// ---------- UPDATE GAME DISPLAY ----------

function updateHUD() {
  const highest = Math.max(
    0,
    ...players.map(player => player.score)
  );

  const leaders = players.filter(
    player => player.score === highest
  );

  players.forEach((player, index) => {
    const lava = Math.min(MAX_LAVA, player.lava);

    safeText("wlName" + index, player.name);

    safeText(
      "wlAvatar" + index,
      player.dead
        ? "💀"
        : lava >= 60
          ? player.faces[1]
          : player.faces[0]
    );

    safeText(
      "wlPercent" + index,
      Math.round(lava) + "%"
    );

    safeText(
      "wlScore" + index,
      "⭐ " + player.score +
      (
        highest > 0 &&
        leaders.length === 1 &&
        player.score === highest
          ? " 👑"
          : ""
      )
    );

    const fill = $("wlFill" + index);

    if (fill) {
      fill.style.height = lava + "%";
    }

    const lane = $("wlLane" + index);

    if (lane) {
      lane.classList.toggle("dead", player.dead);

      lane.classList.toggle(
        "active",
        !player.dead && index === turn && round > 0
      );

      lane.classList.toggle(
        "leader",
        highest > 0 &&
        leaders.length === 1 &&
        player.score === highest
      );
    }
  });

  safeText("round", Math.max(1, round));

  safeText(
    "score",
    players[0] ? players[0].score : 0
  );

  safeText("best", bestScore());

  const heat = $("heat");

  if (heat) {
    heat.style.opacity = String(
      Math.min(players[0]?.lava || 0, MAX_LAVA) /
      MAX_LAVA * 0.7
    );
  }

  const me = players[0];

  if ($("wlHud") && me) {
    $("wlHud").innerHTML = `
      <span>🔥 Streak: <b>${me.combo}</b></span>
      <span>⚡ Combo: <b>x${me.multiplier}</b></span>
      <span>💡 Hints: <b>${hintsLeft}</b></span>
      <span>
        ✨ Double Points:
        <b>
          ${doubleActive
            ? doubleAnswersLeft + " answers left"
            : "Ready"}
        </b>
      </span>
    `;
  }

  safeText("streak", me?.combo || 0);
  safeText("combo", "x" + (me?.multiplier || 1));

  safeText(
    "bonusPoints",
    me?.tally?.doubleBonus || 0
  );

  safeText("hintCount", "Hints: " + hintsLeft);

  safeText(
    "doublePointsStatus",
    doubleActive
      ? "Active: " + doubleAnswersLeft + " answers left"
      : doubleAnswersLeft > 0
        ? "Ready to use"
        : "Available"
  );

  const powerCard = $("doublePointsCard");

  if (powerCard) {
    powerCard.classList.toggle(
      "wl-power-active",
      doubleActive
    );
  }

  const powerButton = $("doublePointsBtn");

  if (powerButton) {
    powerButton.disabled =
      locked ||
      players[turn]?.bot ||
      doubleActive ||
      doubleAnswersLeft > 0;

    powerButton.textContent =
      doubleActive
        ? "Active"
        : doubleAnswersLeft > 0
          ? "Activated"
          : "Activate";
  }

  safeText(
    "hintText",
    $("hintText")?.textContent || "Need help? Use a hint!"
  );

  safeText(
    "time",
    Math.ceil(Math.max(0, timeLeft))
  );

  if ($("timerBar")) {
    $("timerBar").style.width =
      roundTime
        ? Math.max(0, timeLeft / roundTime * 100) + "%"
        : "100%";

    $("timerBar").style.background =
      timeLeft <= 4 ? "#ef4444" : "";
  }
}


// ---------- SOUND EFFECTS ----------

function getAudioContext() {
  if (!soundEnabled) return null;

  const AudioContextClass =
    window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) return null;

  if (!soundContext) {
    try {
      soundContext = new AudioContextClass();
    } catch {
      return null;
    }
  }

  if (soundContext.state === "suspended") {
    soundContext.resume();
  }

  return soundContext;
}

function playTone(
  frequency,
  duration = 0.12,
  type = "sine",
  volume = 0.08,
  delay = 0
) {
  const context = getAudioContext();

  if (!context) return;

  const oscillator = context.createOscillator();
  const gain = context.createGain();

  const startAt = context.currentTime + delay;

  oscillator.type = type;

  oscillator.frequency.setValueAtTime(
    frequency,
    startAt
  );

  gain.gain.setValueAtTime(0.0001, startAt);

  gain.gain.exponentialRampToValueAtTime(
    volume,
    startAt + 0.015
  );

  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    startAt + duration
  );

  oscillator.connect(gain).connect(context.destination);

  oscillator.start(startAt);
  oscillator.stop(startAt + duration + 0.03);
}

function playSound(kind) {
  if (!soundEnabled) return;

  const patterns = {
    good: [523, 659, 784],
    bad: [220, 165],
    hint: [784, 988, 1175],
    turn: [660, 880],
    boss: [196, 262, 392],
    win: [523, 659, 784, 1047],
    lose: [392, 330, 262, 196],
    power: [660, 880, 1175]
  };

  (patterns[kind] || []).forEach(
    (frequency, index) => {
      playTone(
        frequency,
        0.16,
        kind === "bad" || kind === "lose"
          ? "triangle"
          : "sine",
        0.09,
        index * 0.1
      );
    }
  );
}

function startAmbientMusic() {
  if (
    !musicEnabled ||
    !soundEnabled ||
    ambientOscillators.length
  ) {
    return;
  }

  const context = getAudioContext();

  if (!context) return;

  ambientGain = context.createGain();
  ambientGain.gain.value = 0.018;
  ambientGain.connect(context.destination);

  [110, 164.81].forEach((frequency, index) => {
    const oscillator = context.createOscillator();

    oscillator.type = "sine";
    oscillator.frequency.value = frequency;

    const gain = context.createGain();

    gain.gain.value = index === 0 ? 0.5 : 0.25;

    oscillator.connect(gain).connect(ambientGain);
    oscillator.start();

    ambientOscillators.push(oscillator);
  });
}

function stopAmbientMusic() {
  ambientOscillators.forEach(oscillator => {
    try {
      oscillator.stop();
    } catch {}
  });

  ambientOscillators = [];
  ambientGain = null;
}


// ---------- SETTINGS ----------

function applyDifficulty(value) {
  if (!DIFFICULTY[value]) return;

  difficulty = value;

  save(STORAGE.difficulty, difficulty);

  if ($("settingsDifficulty")) {
    $("settingsDifficulty").value = difficulty;
  }
}

function syncSettings() {
  if ($("musicToggle")) {
    $("musicToggle").checked = musicEnabled;
  }

  if ($("soundToggle")) {
    $("soundToggle").checked = soundEnabled;
  }

  if ($("animationToggle")) {
    $("animationToggle").checked = animationsEnabled;
  }

  if ($("settingsDifficulty")) {
    $("settingsDifficulty").value = difficulty;
  }
}

function saveSettings() {
  musicEnabled = $("musicToggle")
    ? $("musicToggle").checked
    : musicEnabled;

  soundEnabled = $("soundToggle")
    ? $("soundToggle").checked
    : soundEnabled;

  animationsEnabled = $("animationToggle")
    ? $("animationToggle").checked
    : animationsEnabled;

  applyDifficulty(
    $("settingsDifficulty")?.value || difficulty
  );

  save(STORAGE.music, musicEnabled);
  save(STORAGE.sound, soundEnabled);
  save(STORAGE.animations, animationsEnabled);

  document.body.classList.toggle(
    "wl-no-animation",
    !animationsEnabled
  );

  if (musicEnabled && soundEnabled) {
    startAmbientMusic();
  } else {
    stopAmbientMusic();
  }

  setMessage("Settings saved!", "good");
  showScreen("start");
}

function renderCharacterPreview() {
  const select = $("characterSelect");

  if (!select) return;

  selectedCharacter = CHARACTERS[select.value]
    ? select.value
    : "explorer";

  const character = CHARACTERS[selectedCharacter];

  safeText(
    "characterPreview",
    `Selected: ${character.emoji} ${character.name}`
  );
}


// ---------- LEADERBOARD ----------

function getLeaderboard() {
  const entries = load(STORAGE.leaderboard, []);

  return Array.isArray(entries) ? entries : [];
}

function renderLeaderboard() {
  const list = $("leaderboardList");

  if (!list) return;

  const entries = getLeaderboard()
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  list.innerHTML = "";

  if (!entries.length) {
    list.innerHTML = `
      <div class="leaderboard-entry">
        <span>-</span>
        <span>No scores yet</span>
        <span>-</span>
      </div>
    `;

    return;
  }

  entries.forEach((entry, index) => {
    const row = document.createElement("div");

    row.className = "leaderboard-entry wl-leader-row";

    const rank = document.createElement("span");
    const name = document.createElement("span");
    const score = document.createElement("span");

    rank.textContent =
      ["🥇", "🥈", "🥉"][index] || String(index + 1);

    name.textContent =
      `${entry.emoji || "🎮"} ${entry.name}`;

    score.textContent =
      Number(entry.score).toLocaleString();

    row.append(rank, name, score);

    list.appendChild(row);
  });
}

function saveLeaderboardScore(score) {
  const entries = getLeaderboard();

  entries.push({
    name: playerName,
    emoji: CHARACTERS[selectedCharacter].emoji,
    score,
    date: new Date().toISOString()
  });

  entries.sort((a, b) => b.score - a.score);

  save(
    STORAGE.leaderboard,
    entries.slice(0, 10)
  );
}


// ---------- CATEGORY / WORD BANK ----------

function getWordCategories() {
  const bank =
    typeof WORD_BANK !== "undefined"
      ? WORD_BANK
      : window.WORD_BANK;

  if (!Array.isArray(bank) || !bank.length) {
    return [];
  }

  return bank.filter(category =>
    category &&
    typeof category.category === "string" &&
    typeof category.words === "string"
  );
}

function chooseCategory() {
  const bank = getWordCategories();

  if (!bank.length) {
    setMessage(
      "Word bank not found. Check that words.js loads before script.js.",
      "bad"
    );

    return null;
  }

  let choices = bank.filter(
    category => !lastCategories.includes(category.category)
  );

  if (!choices.length) {
    lastCategories = [];
    choices = bank;
  }

  const selected =
    choices[Math.floor(Math.random() * choices.length)];

  lastCategories.push(selected.category);

  if (lastCategories.length > 2) {
    lastCategories.shift();
  }

  return {
    category: selected.category,
    words: new Set(
      selected.words
        .split(/\s+/)
        .map(normalize)
        .filter(Boolean)
    )
  };
}


// ---------- TIMER ----------

function drawTimer() {
  safeText(
    "time",
    Math.ceil(Math.max(0, timeLeft))
  );

  if ($("timerBar")) {
    $("timerBar").style.width =
      (roundTime
        ? Math.max(0, timeLeft / roundTime)
        : 0) * 100 + "%";

    $("timerBar").style.background =
      timeLeft <= 4 ? "#ef4444" : "";
  }
}

function startTimer() {
  clearInterval(timerId);

  timerId = setInterval(() => {
    if (paused || locked) return;

    timeLeft = Math.max(0, timeLeft - 0.1);

    drawTimer();

    if (
      timeLeft <= 3 &&
      timeLeft > 0 &&
      Math.abs(timeLeft - Math.round(timeLeft)) < 0.06
    ) {
      playTone(880, 0.04, "square", 0.035);
    }

    if (timeLeft <= 0) {
      finishTurn(null);
    }
  }, 100);
}


// ---------- DISASTER EVENTS ----------

function chooseDisaster() {
  activeDisaster = Math.random() < EVENT_CHANCE
    ? DISASTERS[
        Math.floor(Math.random() * DISASTERS.length)
      ]
    : null;

  const box = $("disasterEvent");

  if (!box) return;

  box.classList.toggle("hidden", !activeDisaster);

  if (activeDisaster) {
    safeText("disasterIcon", activeDisaster.icon);
    safeText("disasterTitle", activeDisaster.title);

    safeText(
      "disasterDescription",
      activeDisaster.description
    );
  }
}


// ---------- TURN FLOW ----------

function showTurnOverlay(player) {
  const overlay = $("wlOverlay");

  if (!overlay) return;

  safeText("wlOverlayEmoji", player.emoji);

  safeText(
    "wlOverlayText",
    player.bot
      ? player.name.toUpperCase() + "'S TURN"
      : "YOUR TURN"
  );

  safeText(
    "wlOverlaySub",
    bossRound
      ? "👹 BOSS ROUND: answer two words!"
      : "Get ready!"
  );

  overlay.classList.add("visible");
}

function hideTurnOverlay() {
  $("wlOverlay")?.classList.remove("visible");
}

function startGame() {
  clearGameTimers();
  stopAmbientMusic();

  gameFinished = false;
  paused = false;

  round = 0;
  turn = 2;

  players = makePlayers();

  usedWords = new Set();
  lastCategories = [];

  hintsLeft = HINTS_PER_GAME;
  doubleAnswersLeft = 0;
  doubleActive = false;

  bossRound = false;
  bossWordsDone = 0;
  bossLavaPush = 0;

  activeDisaster = null;
  locked = true;

  createGameArena();

  safeText("finalScore", "0");
  safeText("doublePointsTimer", "");
  safeText("hintCount", "Hints: " + hintsLeft);

  if ($("hintText")) {
    $("hintText").textContent = "Need help? Use a hint!";
  }

  if ($("answer")) {
    $("answer").value = "";
    $("answer").disabled = true;
  }

  if ($("submit")) {
    $("submit").disabled = true;
  }

  if ($("hintBtn")) {
    $("hintBtn").disabled = true;
  }

  if ($("doublePointsBtn")) {
    $("doublePointsBtn").disabled = true;
  }

  if ($("pauseBtn")) {
    $("pauseBtn").disabled = false;
  }

  updateHUD();

  showScreen("game");

  startAmbientMusic();

  nextRound();
}

function nextRound() {
  if (gameFinished || paused) return;

  round++;

  let attempts = 0;

  do {
    turn = (turn + 1) % players.length;
    attempts++;
  } while (
    players[turn].dead &&
    attempts < players.length + 1
  );

  if (
    players.filter(player => !player.dead).length <= 1 ||
    players[0].dead
  ) {
    gameOver();
    return;
  }

  const player = players[turn];

  locked = true;

  bossRound = round % BOSS_INTERVAL === 0;

  bossWordsDone = 0;
  bossLavaPush = 0;

  usedWords = new Set();

  currentCategory = chooseCategory();

  if (!currentCategory) return;

  chooseDisaster();

  const settings = difficultySettings();

  const minimum = Math.max(
    5,
    MIN_TIME + settings.time
  );

  roundTime = Math.max(
    minimum,
    BASE_TIME +
    settings.time -
    Math.floor((round - 1) / 2)
  );

  if (activeDisaster) {
    roundTime = Math.max(
      4,
      roundTime - activeDisaster.time
    );
  }

  timeLeft = roundTime;

  safeText("category", currentCategory.category);

  if ($("answer")) {
    $("answer").value = "";

    $("answer").placeholder = bossRound
      ? "Boss round: enter two valid words..."
      : "Type a word...";

    $("answer").disabled = true;
  }

  if ($("submit")) {
    $("submit").disabled = true;
  }

  if ($("hintBtn")) {
    $("hintBtn").disabled = true;
  }

  if ($("hintText")) {
    $("hintText").textContent = bossRound
      ? "Boss round! You need two different words."
      : "Need help? Use a hint!";
  }

  safeText(
    "wlTurn",
    `Round ${round} · ${player.name} · ${difficultySettings().label}` +
    (bossRound ? " · BOSS ROUND" : "")
  );

  safeText("msg", "");

  drawTimer();
  updateHUD();

  showTurnOverlay(player);

  playSound(bossRound ? "boss" : "turn");

  transitionTimer = setTimeout(() => {
    hideTurnOverlay();
    beginTurn(player);
  }, 1100);
}

function beginTurn(player) {
  if (paused || gameFinished) return;

  locked = false;

  if ($("answer")) {
    $("answer").disabled = player.bot;
  }

  if ($("submit")) {
    $("submit").disabled = player.bot;
  }

  if ($("hintBtn")) {
    $("hintBtn").disabled =
      player.bot || hintsLeft <= 0;
  }

  if ($("doublePointsBtn")) {
    $("doublePointsBtn").disabled =
      player.bot ||
      doubleActive ||
      doubleAnswersLeft > 0;
  }

  setMessage(
    player.bot
      ? `${player.name} is thinking...`
      : "Your turn! Enter a word before time runs out."
  );

  startTimer();

  if (player.bot) {
    botTurn(player);
  } else {
    $("answer")?.focus();

    if (
      activeDisaster?.title === "HEAT WAVE" ||
      activeDisaster?.title === "LAVA SURGE"
    ) {
      playTone(220, 0.25, "sawtooth", 0.06);
    }

    if (
      activeDisaster?.title === "VOLCANIC TREMOR"
    ) {
      playTone(65, 0.4, "square", 0.07);
    }

    if (
      activeDisaster?.title === "COOL BREEZE"
    ) {
      playTone(880, 0.25, "sine", 0.04);
    }
  }
}


// ---------- BOT PLAYERS ----------

function botTurn(player) {
  const settings = difficultySettings();

  const allWords = [
    ...currentCategory.words
  ].filter(word => !usedWords.has(word));

  const shorterWords = allWords.filter(
    word => word.length <= player.maxLength
  );

  const pool = shorterWords.length
    ? shorterWords
    : allWords;

  const needed = bossRound ? BOSS_WORDS : 1;

  const accuracy = Math.min(
    0.97,
    player.accuracy * settings.botAccuracy
  );

  if (Math.random() > accuracy || pool.length < needed) {
    return;
  }

  const picks = [];
  const available = [...pool];

  while (
    picks.length < needed &&
    available.length
  ) {
    const index = Math.floor(
      Math.random() * available.length
    );

    picks.push(available.splice(index, 1)[0]);
  }

  if (picks.length < needed) return;

  const thinkTime = random(
    player.think[0],
    player.think[1]
  );

  const typingTime = picks.reduce(
    (sum, word) =>
      sum +
      word.length *
      player.speed *
      settings.botSpeed /
      1000,
    0
  );

  if (thinkTime + typingTime > timeLeft - 0.3) {
    return;
  }

  botTimer = setTimeout(() => {
    if (locked || paused) return;

    picks.forEach(word => usedWords.add(word));

    if (bossRound) {
      picks.forEach(word => awardWord(word, player));

      bossWordsDone = picks.length;

      bossLavaPush = picks.reduce(
        (sum, word) => sum + pushFor(word.length),
        0
      );

      finishTurn(
        picks[picks.length - 1],
        true
      );
    } else {
      finishTurn(picks[0]);
    }
  }, thinkTime * 1000 + typingTime * 1000);
}


// ---------- SCORING ----------

function pushFor(length) {
  if (length >= 8) return 15;
  if (length >= 5) return 5;

  return 0;
}

function awardWord(word, player) {
  const length = word.length;

  player.combo++;

  player.multiplier = Math.min(
    MAX_MULTIPLIER,
    1 + Math.floor(player.combo / 2)
  );

  const longBonus = length >= 8 ? 5 : 0;

  const comboBonus =
    (length + longBonus) *
    (player.multiplier - 1);

  let points =
    (length + longBonus) *
    player.multiplier;

  let doubleBonus = 0;

  if (
    !player.bot &&
    doubleActive &&
    doubleAnswersLeft > 0
  ) {
    doubleBonus = points;
    points *= 2;

    doubleAnswersLeft--;

    if (doubleAnswersLeft <= 0) {
      doubleActive = false;
    }
  }

  player.score += points;

  player.tally.words++;
  player.tally.letters += length;
  player.tally.longBonus += longBonus;
  player.tally.comboBonus += comboBonus;
  player.tally.doubleBonus += doubleBonus;

  if (length > player.tally.longest.length) {
    player.tally.longest = word;
  }

  playSound("good");

  logWord(word, player, points);

  updateHUD();

  return points;
}

function logWord(word, player, points) {
  const log = $("wlWordLog");

  if (!log) return;

  const entry = document.createElement("span");

  entry.textContent =
    `${player.name}: ${word.toUpperCase()} +${points}`;

  log.prepend(entry);

  while (log.children.length > 6) {
    log.lastElementChild.remove();
  }
}


// ---------- PLAYER ANSWER ----------

function submitWord() {
  if (
    locked ||
    paused ||
    players[turn].bot
  ) {
    return;
  }

  const word = normalize(
    $("answer")?.value || ""
  );

  if (!word) return;

  if (usedWords.has(word)) {
    setMessage(
      "That word has already been used this round. Try another one.",
      "bad"
    );

    playSound("bad");

    return;
  }

  if (!currentCategory.words.has(word)) {
    setMessage(
      `"${word}" is not in the ${currentCategory.category} word list. Try another word.`,
      "bad"
    );

    playSound("bad");

    return;
  }

  usedWords.add(word);

  const player = players[turn];

  if (bossRound) {
    const points = awardWord(word, player);

    bossWordsDone++;

    bossLavaPush += pushFor(word.length);

    if (bossWordsDone >= BOSS_WORDS) {
      finishTurn(word, true);
    } else {
      safeText(
        "msg",
        `Accepted! +${points} points. Enter one more different word to defeat the boss!`
      );

      $("answer").value = "";
      $("answer").focus();
    }

    return;
  }

  finishTurn(word);
}


// ---------- HINT SYSTEM ----------

function useHint() {
  if (
    locked ||
    paused ||
    players[turn]?.bot ||
    hintsLeft <= 0
  ) {
    return;
  }

  const choices = [
    ...currentCategory.words
  ].filter(word => !usedWords.has(word));

  if (!choices.length) {
    setMessage(
      "No unused words are available for a hint.",
      "bad"
    );

    return;
  }

  const word =
    choices[Math.floor(Math.random() * choices.length)];

  hintsLeft--;

  const hint =
    `${word[0].toUpperCase()}` +
    `${"_".repeat(Math.max(0, word.length - 1))}` +
    ` (${word.length} letters)`;

  if ($("hintText")) {
    $("hintText").textContent =
      `💡 Hint: ${hint}`;
  }

  safeText(
    "hintCount",
    `Hints: ${hintsLeft}`
  );

  if ($("hintBtn")) {
    $("hintBtn").disabled = hintsLeft <= 0;
  }

  setMessage(
    `Hint used. The word starts with "${word[0].toUpperCase()}" and has ${word.length} letters.`
  );

  playSound("hint");

  updateHUD();
}


// ---------- DOUBLE POINTS ----------

function activateDoublePoints() {
  if (
    locked ||
    paused ||
    players[turn]?.bot ||
    doubleActive ||
    doubleAnswersLeft > 0
  ) {
    return;
  }

  doubleActive = true;
  doubleAnswersLeft = DOUBLE_ANSWERS;

  if ($("doublePointsStatus")) {
    $("doublePointsStatus").textContent =
      "Active for your next 2 correct answers!";
  }

  if ($("doublePointsTimer")) {
    $("doublePointsTimer").textContent =
      "Your next two successful answers earn double points.";
  }

  if ($("doublePointsBtn")) {
    $("doublePointsBtn").disabled = true;
  }

  setMessage(
    "⚡ Double Points activated! Your next two correct answers are worth twice as much.",
    "good"
  );

  playSound("power");

  updateHUD();
}


// ---------- END TURN / LAVA ----------

function finishTurn(word, bossDefeated = false) {
  if (locked || gameFinished) return;

  locked = true;

  clearInterval(timerId);
  clearTimeout(botTimer);

  if ($("answer")) {
    $("answer").disabled = true;
  }

  if ($("submit")) {
    $("submit").disabled = true;
  }

  if ($("hintBtn")) {
    $("hintBtn").disabled = true;
  }

  if ($("doublePointsBtn")) {
    $("doublePointsBtn").disabled = true;
  }

  const player = players[turn];

  let rise = 0;
  let push = 0;
  let message = "";

  const disasterRise = activeDisaster
    ? activeDisaster.rise
    : 0;

  if (!word) {
    player.combo = 0;
    player.multiplier = 1;

    player.tally.timeouts++;

    rise = Math.round(
      (
        START_RISE +
        (round - 1) * RISE_PER_ROUND
      ) * difficultySettings().rise
    );

    message = player.bot
      ? `${player.name} ran out of time!`
      : "Time's up! The lava rises!";

    playSound("bad");
  } else if (bossDefeated) {
    push = bossLavaPush;

    player.tally.bosses++;

    message =
      `👹 Boss defeated! ${player.name} completed ${BOSS_WORDS} words!`;
  } else {
    const points = awardWord(word, player);

    push = pushFor(word.length);

    message =
      `${player.name} answered "${word}" and earned ${points} points.`;
  }

  const net =
    rise + disasterRise - push;

  player.lava = Math.max(
    0,
    Math.min(MAX_LAVA, player.lava + net)
  );

  if (net > 0) {
    message += ` Lava +${net}%.`;
  } else if (net < 0) {
    message += ` Lava pushed back ${Math.abs(net)}%.`;
  } else {
    message += " Lava stays at the same level.";
  }

  if (player.lava >= MAX_LAVA) {
    player.dead = true;

    message += ` 🌋 ${player.name} has melted!`;

    playSound("lose");
  }

  setMessage(
    message,
    net > 0 || player.dead ? "bad" : "good"
  );

  updateHUD();

  const gameOverNow =
    players[0].dead ||
    players.filter(item => !item.dead).length <= 1;

  transitionTimer = setTimeout(() => {
    if (gameOverNow) {
      gameOver();
    } else {
      nextRound();
    }
  }, 1500);
}


// ---------- PAUSE / RESUME ----------

function pauseGame() {
  if (
    locked ||
    paused ||
    gameFinished ||
    $("game")?.classList.contains("hidden")
  ) {
    return;
  }

  paused = true;

  clearInterval(timerId);
  clearTimeout(botTimer);
  clearTimeout(transitionTimer);

  showScreen("pause");
}

function resumeGame() {
  if (!paused || gameFinished) return;

  paused = false;

  showScreen("game");

  if (players[turn].bot) {
    startTimer();
    botTurn(players[turn]);
  } else {
    if ($("answer")) {
      $("answer").disabled = false;
    }

    if ($("submit")) {
      $("submit").disabled = false;
    }

    if ($("hintBtn")) {
      $("hintBtn").disabled = hintsLeft <= 0;
    }

    if ($("doublePointsBtn")) {
      $("doublePointsBtn").disabled =
        doubleActive || doubleAnswersLeft > 0;
    }

    startTimer();

    $("answer")?.focus();
  }
}

function restartGame() {
  paused = false;
  startGame();
}


// ---------- ACHIEVEMENTS ----------

function buildAchievements() {
  const me = players[0];

  const achievements = [];

  if (me.score >= 50) {
    achievements.push(
      "⭐ Score Hunter: Earned 50 or more points."
    );
  }

  if (me.score >= 100) {
    achievements.push(
      "🏆 Lava Legend: Earned 100 or more points."
    );
  }

  if (me.tally.longest.length >= 8) {
    achievements.push(
      "📚 Word Master: Submitted a word with 8+ letters."
    );
  }

  if (me.tally.bosses > 0) {
    achievements.push(
      "👹 Boss Slayer: Defeated a boss round."
    );
  }

  if (me.combo >= 3 || me.multiplier >= 2) {
    achievements.push(
      "🔥 Combo Starter: Built a scoring streak."
    );
  }

  if (me.dead === false) {
    achievements.push(
      "🛡️ Survivor: Finished the game without melting."
    );
  }

  const list = $("achievementList");

  if (!list) return;

  list.innerHTML = "";

  if (!achievements.length) {
    list.textContent =
      "Keep playing to unlock achievements!";

    return;
  }

  achievements.forEach(item => {
    const p = document.createElement("p");

    p.className = "wl-achievement";
    p.textContent = item;

    list.appendChild(p);
  });
}


// ---------- GAME OVER ----------

function gameOver() {
  if (gameFinished) return;

  gameFinished = true;
  locked = true;
  paused = false;

  clearGameTimers();
  hideTurnOverlay();
  stopAmbientMusic();

  const me = players[0];
  const oldBest = bestScore();

  if (me.score > oldBest) {
    save(STORAGE.best, me.score);
  }

  saveLeaderboardScore(me.score);

  const stats = load(STORAGE.stats, {
    gamesPlayed: 0,
    totalScore: 0,
    highestScore: 0,
    totalWords: 0,
    bestRound: 0
  });

  stats.gamesPlayed++;
  stats.totalScore += me.score;

  stats.highestScore = Math.max(
    stats.highestScore,
    me.score
  );

  stats.totalWords += me.tally.words;

  stats.bestRound = Math.max(
    stats.bestRound,
    round
  );

  save(STORAGE.stats, stats);

  const survivors = players
    .filter(player => !player.dead)
    .sort((a, b) => b.score - a.score);

  const winner =
    survivors[0] ||
    [...players].sort((a, b) => b.score - a.score)[0];

  safeText(
    "finalScore",
    me.score.toLocaleString()
  );

  safeText(
    "finalInfo",
    `${me.dead ? "🌋 You melted" : "🏆 You survived"} in round ${round}. ` +
    `Winner: ${winner.name}. ` +
    players.map(player =>
      `${player.name}: ${player.score} points`
    ).join(" | ") +
    (me.score > oldBest
      ? " · NEW HIGH SCORE!"
      : "")
  );

  const title = document.querySelector("#over h2");

  if (title) {
    title.textContent = me.dead
      ? "The lava got you!"
      : "You survived!";
  }

  safeText("hsOver", bestScore());

  buildAchievements();
  renderLeaderboard();

  showScreen("over");

  playSound(me.dead ? "lose" : "win");
}


// ---------- EVENT LISTENERS ----------

function bindEvents() {
  $("startBtn")?.addEventListener(
    "click",
    startGame
  );

  $("playBtn")?.addEventListener(
    "click",
    startGame
  );

  $("againBtn")?.addEventListener(
    "click",
    startGame
  );

  $("howBtn")?.addEventListener(
    "click",
    () => showScreen("how")
  );

  $("leaderboardBtn")?.addEventListener(
    "click",
    () => {
      renderLeaderboard();
      showScreen("leaderboard");
    }
  );

  $("overLeaderboardBtn")?.addEventListener(
    "click",
    () => {
      renderLeaderboard();
      showScreen("leaderboard");
    }
  );

  $("leaderboardBackBtn")?.addEventListener(
    "click",
    () => showScreen("start")
  );

  $("settingsBtn")?.addEventListener(
    "click",
    () => {
      syncSettings();
      showScreen("settings");
    }
  );

  $("settingsBackBtn")?.addEventListener(
    "click",
    () => showScreen("start")
  );

  $("saveSettingsBtn")?.addEventListener(
    "click",
    saveSettings
  );

  $("pauseBtn")?.addEventListener(
    "click",
    pauseGame
  );

  $("resumeBtn")?.addEventListener(
    "click",
    resumeGame
  );

  $("restartBtn")?.addEventListener(
    "click",
    restartGame
  );

  $("pauseMenuBtn")?.addEventListener(
    "click",
    () => {
      clearGameTimers();

      paused = false;
      gameFinished = true;

      stopAmbientMusic();

      showScreen("start");
    }
  );

  $("submit")?.addEventListener(
    "click",
    submitWord
  );

  $("answer")?.addEventListener(
    "keydown",
    event => {
      if (event.key === "Enter") {
        submitWord();
      }
    }
  );

  $("hintBtn")?.addEventListener(
    "click",
    useHint
  );

  $("doublePointsBtn")?.addEventListener(
    "click",
    activateDoublePoints
  );

  $("characterSelect")?.addEventListener(
    "change",
    renderCharacterPreview
  );

  $("settingsDifficulty")?.addEventListener(
    "change",
    event => {
      if (DIFFICULTY[event.target.value]) {
        difficulty = event.target.value;
      }
    }
  );

  $("answer")?.addEventListener(
    "input",
    () => {
      if (
        !locked &&
        !paused &&
        !players[turn]?.bot
      ) {
        if ($("answer").value.length > 0) {
          setMessage(
            "Keep going! Press Enter when your word is ready."
          );
        }
      }
    }
  );
}


// ---------- INITIALIZATION ----------

function initialize() {
  selectedCharacter =
    $("characterSelect")?.value || "explorer";

  if (!CHARACTERS[selectedCharacter]) {
    selectedCharacter = "explorer";
  }

  renderCharacterPreview();
  syncSettings();

  safeText("hsStart", bestScore());
  safeText("hsOver", bestScore());
  safeText("best", bestScore());

  renderLeaderboard();

  bindEvents();

  createGameArena();

  updateHUD();

  showScreen("start");
}

document.addEventListener(
  "DOMContentLoaded",
  initialize
);
