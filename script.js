// ===== SETTINGS =====
const START_RISE = 12, RISE_PER_ROUND = 3, MAX_LAVA = 100;
// the lava creeps up a little on EVERY turn, even after a correct word. Long words push it back.
// creep = BASE_RISE, +1 every BASE_RISE_EVERY rounds, capped at BASE_RISE_MAX, then scaled by difficulty
const BASE_RISE = 4, BASE_RISE_MAX = 8, BASE_RISE_EVERY = 9;
const PUSH_MEDIUM = 5, PUSH_LONG = 15, BONUS_LONG = 5;
const BASE_TIME = 15, MIN_TIME = 8;
const BOSS_INTERVAL = 5, BOSS_WORDS = 2;
const LAST_CHANCE_LEVEL = 90, LAST_CHANCE_TIME = 7;
const EVENT_CHANCE = 0.35, MAX_MULTIPLIER = 5;
const ANNOUNCE_MS = 1400, SPARK_COST = 5, LOG_MAX = 6, RECENT_CATS = 8, BOARD_MAX = 10;
const KEY = "wordLavaHighScore", STATS_KEY = "wordLavaStatistics", DIFF_KEY = "wordLavaDifficulty", MUTE_KEY = "wordLavaMuted", THEME_KEY = "wordLavaTheme";
const ACH_KEY = "wordLavaAchievements", DAILY_KEY = "wordLavaDaily", BOARD_KEY = "wordLavaBoard";

// acc/speed/think scale bot stats, rise scales lava creep and time-out lava, time adjusts the turn timer
const DIFFICULTY = {
  easy:   { label: "Easy",   acc: 0.8,  speed: 1.4, think: 1.3,  rise: 0.7, time: 3,  desc: "Slower, less accurate bots. Lava creeps slowly, you get extra time, and the toughest categories are left out." },
  normal: { label: "Normal", acc: 1,    speed: 1,   think: 1,    rise: 1,   time: 0,  desc: "The standard Word Lava challenge." },
  hard:   { label: "Hard",   acc: 1.15, speed: 0.8, think: 0.75, rise: 1.3, time: -2, desc: "Sharp, fast bots. Lava rises quickly, the timer is shorter, and the toughest categories show up often." }
  insane: { label: "Insane", acc: 1.3, speed: 0.6, think: 0.5, rise: 1.5, time: -4, desc: "The ultimate challenge! Bots are lightning fast and accurate, lava rises like a geyser, and the timer is brutal." }
};

const EVENTS = [
  { id: "heat",    name: "🔥 HEAT WAVE",        desc: "Lava rises an extra 10%!",             rise: 10, time: 0 },
  { id: "surge",   name: "🌋 LAVA SURGE",       desc: "Lava rises an extra 15%!",             rise: 15, time: 0 },
  { id: "breeze",  name: "❄️ COOL BREEZE",      desc: "Lava rise decreases by 5%!",           rise: -5, time: 0 },
  { id: "tremor",  name: "⚡ VOLCANIC TREMOR",  desc: "3 seconds less!",                      rise: 0,  time: 3 },
  { id: "double",  name: "✌️ DOUBLE COMBO",     desc: "Combo grows twice as fast!",           rise: 0,  time: 0 },
  { id: "min5",    name: "📏 LONG WORDS ONLY",  desc: "Words must be 5+ letters!",            rise: 0,  time: 0 },
  { id: "nospark", name: "🚫 NO SPARK",         desc: "Spark hints are disabled this round!", rise: 0,  time: 0 }
];

// faces = emoji fallback [normal, hot (60%+ lava), melted]; hue tints the face image per player
// chat = what the bots say (speech bubble) when something happens: timeout, melt, lead, hot, long, rival (another bot melted), gloat (you melted)
const PLAYERS = [
  { name: "You",   bot: false, faces: ["🧑", "😰", "💀"], turnText: "YOUR TURN", hue: 0 },
  { name: "Juan",  bot: true,  faces: ["😎", "😅", "💀"], turnText: "JUAN'S TURN",  hue: 160, acc: 0.7,  maxLen: 12, speed: 230, think: [2, 4],   style: "greedy",
    chat: {
      timeout: ["Ay, ang bagal ko!", "Naubusan ako ng oras!", "Sayang, muntik na!"],
      melt:    ["Natunaw na ako! 🌋", "Hanggang dito na lang!", "Paalam, mga lodi!"],
      lead:    ["Ako na ang lamang! 😎", "Petmalu 'to!", "Habol kayo, pre!"],
      hot:     ["Uy, ang init na!", "Pawis na pawis na ako!", "Mainit na, pre!"],
      long:    ["Ganyan ang diskarte!", "Haba nito, pre! 😎"],
      rival:   ["Sayang, {n}!", "Ingat sa lava, {n}!"],
      gloat:   ["Easy lang 'to! 😎", "Ayos, panalo ako!"]
    } },
  { name: "Maria", bot: true,  faces: ["🤓", "😬", "💀"], turnText: "MARIA'S TURN", hue: 290, acc: 0.92, maxLen: 6,  speed: 110, think: [1, 2.5], style: "safe",
    chat: {
      timeout: ["Naku, ang bagal ko!", "Hay, nalito ako!", "Kulang sa oras!"],
      melt:    ["Natunaw na ako... 🌋", "Hay, paalam na!", "Ingat kayo diyan!"],
      lead:    ["Steady lang, lamang ako!", "Ayos, ako muna! 🤓", "Dahan-dahan, panalo!"],
      hot:     ["Medyo mainit na...", "Kinakabahan ako!", "Naku, init!"],
      long:    ["Ayan, may sinabi!", "Mahaba 'yan, ha!"],
      rival:   ["Naku, {n}!", "Condolence, {n}! 😬"],
      gloat:   ["Sayang, bes!", "Ingat sa susunod! 🤓"]
    } }
];

// ===== HELPERS =====
const $ = id => document.getElementById(id);
const screens = ["start", "how", "game", "over", "records"];
const show = name => {
  screens.forEach(s => $(s).classList.toggle("hidden", s !== name));
  if (name !== "game") {
    $("heat").style.opacity = 0.15;
    document.body.classList.remove("lastchance", "kbd");
    bgStop();
  }
};
// every saved value is stored per account: "wl:<username>:<key>" (WL_USER is set by auth.js, "guest" if missing)
const uk = k => "wl:" + (window.WL_USER || "guest") + ":" + k;
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(uk(k))) ?? d; } catch (e) { return d; } };
const save = (k, v) => { try { localStorage.setItem(uk(k), JSON.stringify(v)); } catch (e) {} };
const pushFor = len => len >= 8 ? PUSH_LONG : len >= 5 ? PUSH_MEDIUM : 0;
const normalize = w => w.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z]/g, "");
const rand = (a, b) => a + Math.random() * (b - a);
const esc = s => s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const restart = (el, cls) => { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); };
const reduceMotion = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
const coarse = window.matchMedia && matchMedia("(pointer: coarse)").matches;   // touch screens
const newPlayers = () => PLAYERS.map(p => ({
  ...p, score: 0, combo: 0, mult: 1, lava: 0, dead: false, diedRound: 0, hotSaid: false,
  tally: { words: 0, letters: 0, longBonus: 0, comboBonus: 0, lastBonus: 0, bosses: 0, timeouts: 0, longest: "", bestCombo: 0 }
}));

// local calendar day, used by the daily challenge (YYYY-MM-DD)
const keyOf = d => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
const dayKey = (offset = 0) => { const d = new Date(); d.setDate(d.getDate() + offset); return keyOf(d); };

// small seeded random generator so everyone gets the same categories and events on the same day
function seeded(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
  let a = (h ^ (h >>> 16)) >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ===== GAME STATE =====
let round = 0, turn = 0, used, current, timeLeft, roundTime, timerId, botTimer, transitionTimer, locked = true;
let players = newPlayers(), lastCats = [];
let bossRound = false, bossDone = 0, bossPush = 0, activeEvent = null, lastChance = false;
let daily = false, dailyKey = "", rng = Math.random, leaderAtStart = -1, runUnlocked = [];
let difficulty = load(DIFF_KEY, "normal");
if (!DIFFICULTY[difficulty]) difficulty = "normal";

// ===== ACHIEVEMENTS (saved in localStorage; some unlock themes) =====
const ACHIEVEMENTS = [
  { id: "long",     icon: "🔤", name: "Wordsmith",    desc: "Play a word with 8+ letters." },
  { id: "combo",    icon: "🔥", name: "Combo King",   desc: "Reach a 4x multiplier.", unlocks: "neon" },
  { id: "boss",     icon: "👹", name: "Boss Slayer",  desc: "Defeat a boss round.", unlocks: "forest" },
  { id: "last",     icon: "🚨", name: "Close Call",   desc: "Play a word in Last Chance mode." },
  { id: "r20",      icon: "⏳", name: "Marathoner",   desc: "Reach round 20." },
  { id: "score300", icon: "⭐", name: "Big Brain",    desc: "Score 300 points in one game." },
  { id: "win",      icon: "🏆", name: "Lava Master",  desc: "Win a game: melt both bots." },
  { id: "flawless", icon: "❄️", name: "Cool Head",    desc: "Win a game without a single time-out." },
  { id: "hardwin",  icon: "🌋", name: "Hot Stuff",    desc: "Win a game on Hard." },
  { id: "fil10",    icon: "🌴", name: "Mabuhay!",     desc: "Answer 10 words in Filipino/Tagalog pack categories." },
  { id: "daily",    icon: "📅", name: "Daily Driver", desc: "Finish a daily challenge." },
  { id: "streak3",  icon: "🔁", name: "On a Roll",    desc: "Play the daily challenge 3 days in a row." }
];
const unlocked = load(ACH_KEY, {});
const themeLock = k => ACHIEVEMENTS.find(a => a.unlocks === k);
const themeUnlocked = k => { const a = themeLock(k); return !a || !!unlocked[a.id]; };

// ===== THEMES (colors live in style.css as :root[data-theme="..."]) =====
const THEMES = { lava: "🌋 Lava", ocean: "🌊 Ocean", neon: "🌈 Neon", clean: "☀️ Clean", forest: "🌲 Forest" };
let theme = load(THEME_KEY, "lava");
if (!THEMES[theme] || !themeUnlocked(theme)) theme = "lava";
document.documentElement.dataset.theme = theme;   // applied immediately so there is no color flash

let lastTickSec = 0, sparkUsed = false, wordLog = [], defaultPH = "";
const levelName = () => daily ? "normal" : difficulty;    // the daily challenge always plays on Normal
const diff = () => DIFFICULTY[levelName()];
const botSpeed = p => p.speed * diff().speed;
const minLen = () => activeEvent && activeEvent.id === "min5" ? 5 : 0;
const noSpark = () => activeEvent && activeEvent.id === "nospark";

// lava creep for a turn (applies even when you answer correctly) and what it is right now incl. the event
const baseRise = () => Math.round(Math.min(BASE_RISE_MAX, BASE_RISE + Math.floor((round - 1) / BASE_RISE_EVERY)) * diff().rise);
const riseNow = () => baseRise() + (activeEvent ? activeEvent.rise : 0);

// the leader's index, or -1 when nobody is clearly ahead
function clearLeader() {
  const top = Math.max(...players.map(p => p.score)), leaders = players.filter(p => p.score === top);
  return top > 0 && leaders.length === 1 ? players.indexOf(leaders[0]) : -1;
}

// game preferences (saved) and pause state (set while the settings panel is open during a game)
const PREFS_KEY = "wordLavaPrefs";
const prefs = { shake: true, fil: true, ...load(PREFS_KEY, {}) };
let paused = false;

// like setTimeout, but waits while the game is paused; `assign` keeps the live timer id so clearTimeout still works
function gated(fn, ms, assign) {
  const run = () => { if (paused) assign(setTimeout(run, 100)); else fn(); };
  assign(setTimeout(run, ms));
}

// ===== CATEGORY POOL =====
// Easy hides "hard" categories, Hard draws them 3x as often, the Filipino pack can be switched off (daily always uses it)
function categoryPool() {
  const level = levelName(), filOn = daily || prefs.fil, out = [];
  WORD_BANK.forEach(c => {
    if (c.pack === "fil" && !filOn) return;
    if (c.hard && level === "easy") return;
    const weight = c.hard && level === "hard" ? 3 : 1;
    for (let i = 0; i < weight; i++) out.push(c);
  });
  return out.length ? out : WORD_BANK;
}

// ===== FACE IMAGES (images/*.webp, falls back to emoji if a file is missing) =====
const FACE_DIR = "images/", FACE_EXT = ".webp";
const FACE_IMG = { normal: "confidence", hot: "nervous", panic: "anxiety", dead: "melted" };
const FACE_EMOJI = { normal: 0, hot: 1, panic: 1, dead: 2 };   // index into p.faces for the fallback
const faceState = p => p.dead ? "dead" : p.lava >= LAST_CHANCE_LEVEL ? "panic" : p.lava >= 60 ? "hot" : "normal";
const faceHtml = (p, state = faceState(p)) =>
  `<img class="face" src="${FACE_DIR}${FACE_IMG[state]}${FACE_EXT}" alt="" draggable="false" style="--hue:${p.hue || 0}deg" ` +
  `onerror="this.replaceWith(document.createTextNode('${p.faces[FACE_EMOJI[state]]}'))">`;

// only touch the DOM when the face actually changes, so the image doesn't flicker
function setFace(el, p, state = faceState(p)) {
  if (el.dataset.state === state) return;
  el.dataset.state = state;
  el.innerHTML = faceHtml(p, state);
}
Object.values(FACE_IMG).forEach(n => { new Image().src = FACE_DIR + n + FACE_EXT; });

// ===== SOUND =====
// Audio files go in ./sounds/<name>.mp3. A missing or broken file falls back to the built-in Web Audio sound.
const SOUND_DIR = "sounds/", SOUND_EXT = ".mp3";
const SOUND_VOL = {   // 0 to 1, tweak per sound
  good: 0.6, bad: 0.6, tick: 0.4, tickHot: 0.6, rumble: 0.7, turn: 0.5, boss: 0.7, melt: 0.7,
  win: 0.7, lose: 0.7, spark: 0.5, heat: 0.6, tremor: 0.7, breeze: 0.5, dupe: 0.5, timeout: 0.6, rule: 0.5
};
let muted = !!load(MUTE_KEY, false), audioCtx = null;

// per-channel settings (saved): sound effects and music each have an on/off switch and a 0-1 volume
const AUDIO_KEY = "wordLavaAudio";
const audioSet = { sfxOn: true, sfxVol: 0.8, musicOn: true, musicVol: 0.5, ...load(AUDIO_KEY, {}) };
["sfxVol", "musicVol"].forEach(k => { audioSet[k] = Math.min(1, Math.max(0, Number(audioSet[k]) || 0)); });
const saveAudio = () => save(AUDIO_KEY, audioSet);
const sfxOn = () => !muted && audioSet.sfxOn;     // the top-right button is still a master mute
const musicOn = () => !muted && audioSet.musicOn;

const files = {};   // name -> { audio, ok }
function preloadSounds() {
  Object.keys(SOUND_VOL).forEach(name => {
    try {
      const audio = new Audio();
      const entry = files[name] = { audio, ok: false };
      audio.preload = "auto";
      audio.addEventListener("canplaythrough", () => { entry.ok = true; }, { once: true });
      audio.addEventListener("error", () => { entry.ok = false; });
      audio.src = SOUND_DIR + name + SOUND_EXT;
      audio.load();
    } catch (e) {}
  });
}

function playFile(name, vol) {
  const f = files[name];
  if (!sfxOn() || !f || !f.ok) return false;
  try {
    const a = f.audio.cloneNode();   // clone so quick repeats can overlap
    a.volume = Math.min(1, Math.max(0, vol * audioSet.sfxVol));
    const p = a.play();
    if (p && p.catch) p.catch(() => {});
    return true;
  } catch (e) { return false; }
}

function getCtx() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try { audioCtx = new AC(); } catch (e) { return null; }
  }
  if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
  return audioCtx;
}
// unlock audio on the first gesture even if it isn't the Start button
["pointerdown", "keydown"].forEach(ev => addEventListener(ev, getCtx, { once: true }));

function tone(freq, dur, { type = "sine", vol = 0.15, at = 0, slideTo } = {}) {
  const c = sfxOn() && getCtx();
  if (!c) return;
  const t = c.currentTime + at, o = c.createOscillator(), g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0001, vol * audioSet.sfxVol), t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + dur + 0.05);
}

function rumble() {
  const c = sfxOn() && getCtx();
  if (!c) return;
  const dur = 0.9, len = Math.floor(c.sampleRate * dur), t = c.currentTime;
  const buf = c.createBuffer(1, len, c.sampleRate), data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource(), filter = c.createBiquadFilter(), g = c.createGain();
  src.buffer = buf;
  filter.type = "lowpass";
  filter.frequency.value = 140;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0001, 0.5 * audioSet.sfxVol), t + 0.15);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(filter).connect(g).connect(c.destination);
  src.start(t);
}

// play a list of [freq, dur, at] notes with shared options
const notes = (list, o = {}) => list.forEach(([f, d, at = 0]) => tone(f, d, { ...o, at }));

// built-in fallback sounds
const synth = {
  good(len, soft) {
    notes([[523, .14], [659, .14, .09], [784, .2, .18], ...(len >= 8 ? [[1047, .3, .28]] : [])], { vol: soft ? 0.07 : 0.15 });
  },
  bad() { tone(170, 0.28, { type: "sawtooth", vol: 0.12, slideTo: 80 }); },
  tick() { tone(880, 0.05, { type: "square", vol: 0.05 }); },
  tickHot() { notes([[110, .09], [110, .09, .14]], { type: "sine", vol: 0.2 }); },
  rumble,
  turn(isYou) { isYou ? notes([[660, .12], [880, .18, .1]], { vol: 0.12 }) : tone(440, 0.1, { vol: 0.07 }); },
  boss() { notes([[196, .25], [262, .25, .2], [392, .4, .4]], { type: "triangle", vol: 0.18 }); },
  melt() { tone(400, 0.7, { type: "sawtooth", vol: 0.12, slideTo: 60 }); rumble(); },
  win() { notes([[523, .25], [659, .25, .14], [784, .25, .28], [1047, .25, .42]], { vol: 0.16 }); },
  lose() { notes([[392, .3], [330, .3, .2], [262, .3, .4], [196, .3, .6]], { type: "triangle", vol: 0.15 }); },
  spark() {
    notes([[784, .18], [988, .18, .07], [1175, .18, .14], [1568, .18, .21]], { vol: 0.12 });
    tone(2093, 0.4, { vol: 0.05, at: 0.3, slideTo: 2637 });
  },
  heat() {
    tone(220, 0.55, { type: "sawtooth", vol: 0.08, slideTo: 440 });
    tone(330, 0.55, { type: "triangle", vol: 0.08, at: 0.1, slideTo: 660 });
  },
  tremor() { notes([[60, .1], [60, .1, .12], [60, .1, .24], [60, .1, .36]], { type: "square", vol: 0.1 }); rumble(); },
  breeze() { notes([[880, .25], [1175, .3, .12], [1397, .4, .24]], { vol: 0.05 }); },
  dupe() { notes([[300, .07], [300, .07, .1]], { type: "square", vol: 0.1 }); },
  timeout(soft) { tone(500, 0.6, { type: "triangle", vol: soft ? 0.06 : 0.14, slideTo: 150 }); },
  rule() { notes([[392, .12], [523, .12, .1], [392, .12, .2], [523, .2, .3]], { type: "square", vol: 0.07 }); }
};

// public sfx: try the audio file first, otherwise use the synth version
const sfx = {};
Object.keys(synth).forEach(name => {
  sfx[name] = (...args) => {
    let vol = SOUND_VOL[name] ?? 0.6;
    if (name === "good" && args[1]) vol *= 0.5;      // bots play softer
    if (name === "timeout" && args[0]) vol *= 0.4;
    if (!playFile(name, vol)) synth[name](...args);
  };
});

// ===== BACKGROUND SOUND PER THEME (sounds/bg-<theme>.mp3, synth drone as fallback) =====
const bgVolume = () => audioSet.musicVol * 0.5;                    // audio file volume (slider 50% = 0.25)
const bgGain = () => Math.max(0.0001, audioSet.musicVol * 0.1);    // synth drone gain (slider 50% = 0.05)

// apply the music slider live to whatever is playing
function applyMusicVolume() {
  if (bgAudio) bgAudio.volume = bgVolume();
  if (bgNode) {
    const { g, c } = bgNode;
    g.gain.cancelScheduledValues(c.currentTime);
    g.gain.setTargetAtTime(bgGain(), c.currentTime, 0.05);
  }
}
const BG_DRONE = {   // fallback drone: [note 1 Hz, note 2 Hz, waveform]
  lava:   [55, 82.4, "sawtooth"],
  ocean:  [110, 164.8, "sine"],
  neon:   [65.4, 98, "square"],
  clean:  [130.8, 196, "triangle"],
  forest: [98, 147, "sine"]
};
let bgAudio = null, bgNode = null, bgPlaying = false;

function bgStop() {
  bgPlaying = false;
  if (bgAudio) { bgAudio.pause(); bgAudio = null; }
  if (bgNode) {
    const { g, nodes, c } = bgNode;
    g.gain.cancelScheduledValues(c.currentTime);
    g.gain.setTargetAtTime(0.0001, c.currentTime, 0.2);
    nodes.forEach(o => { try { o.stop(c.currentTime + 1); } catch (e) {} });
    bgNode = null;
  }
}

function bgSynth(name) {
  const c = getCtx();
  if (!c || !bgPlaying) return;
  const [f1, f2, type] = BG_DRONE[name];
  const g = c.createGain(), filt = c.createBiquadFilter(), lfo = c.createOscillator(), lg = c.createGain();
  filt.type = "lowpass";
  filt.frequency.value = 400;
  lfo.frequency.value = 0.15;          // slow filter sweep so the drone breathes
  lg.gain.value = 120;
  lfo.connect(lg).connect(filt.frequency);
  g.gain.setValueAtTime(0.0001, c.currentTime);
  g.gain.exponentialRampToValueAtTime(bgGain(), c.currentTime + 2);
  const oscs = [f1, f2].map(f => {
    const o = c.createOscillator();
    o.type = type;
    o.frequency.value = f;
    o.connect(filt);
    return o;
  });
  filt.connect(g).connect(c.destination);
  const nodes = [lfo, ...oscs];
  nodes.forEach(o => o.start());
  bgNode = { g, nodes, c };
}

function bgStart() {
  bgStop();
  if (!musicOn()) return;
  bgPlaying = true;
  const name = theme, a = new Audio(SOUND_DIR + "bg-" + name + SOUND_EXT);
  a.loop = true;
  a.volume = bgVolume();
  bgAudio = a;
  const fallback = () => { if (bgAudio === a) { bgAudio = null; bgSynth(name); } };
  a.addEventListener("error", fallback, { once: true });
  const p = a.play();
  if (p && p.catch) p.catch(fallback);   // missing or unsupported file -> synth drone
}

function renderMute() {
  const b = $("muteBtn");
  b.textContent = muted ? "🔇" : "🔊";
  b.setAttribute("aria-pressed", String(muted));
  b.setAttribute("aria-label", muted ? "Unmute sound" : "Mute sound");
  b.title = muted ? "Unmute all sound" : "Mute all sound";
}

function toggleMute() {
  muted = !muted;
  save(MUTE_KEY, muted);
  renderMute();
  renderAudioSettings();
  if (muted) bgStop();
  else {
    sfx.good(0, true);
    if (!$("game").classList.contains("hidden")) bgStart();
  }
}

// ===== TOASTS (achievement and unlock messages) =====
function toast(text) {
  const box = $("toasts");
  if (!box) return;
  while (box.children.length >= 3) box.firstChild.remove();
  const t = Object.assign(document.createElement("div"), { className: "toast", textContent: text });
  box.appendChild(t);
  setTimeout(() => t.remove(), 3800);
}

function unlock(id) {
  if (unlocked[id]) return;
  const a = ACHIEVEMENTS.find(x => x.id === id);
  if (!a) return;
  unlocked[id] = Date.now();
  save(ACH_KEY, unlocked);
  runUnlocked.push(id);
  toast(`${a.icon} Achievement unlocked: ${a.name}` + (a.unlocks ? ` — ${THEMES[a.unlocks]} theme unlocked!` : ""));
  renderThemes();
}

// ===== DIFFICULTY PICKER =====
function renderDifficulty() {
  document.querySelectorAll(".diffbtn[data-diff]").forEach(b => b.setAttribute("aria-checked", String(b.dataset.diff === difficulty)));
  $("diffDesc").textContent = DIFFICULTY[difficulty].desc;
}

function setDifficulty(name) {
  if (!DIFFICULTY[name]) return;
  difficulty = name;
  save(DIFF_KEY, name);
  renderDifficulty();
}

function renderThemes() {
  document.querySelectorAll(".themebtn").forEach(b => {
    const k = b.dataset.theme, open = themeUnlocked(k), a = themeLock(k);
    b.textContent = (open ? "" : "🔒 ") + THEMES[k];
    b.title = open ? "" : `Unlock it with the "${a.name}" achievement: ${a.desc}`;
    b.classList.toggle("locked", !open);
    b.setAttribute("aria-checked", String(k === theme));
  });
}

function setTheme(name) {
  if (!THEMES[name]) return;
  if (!themeUnlocked(name)) {
    const a = themeLock(name);
    toast(`🔒 ${THEMES[name]} unlocks with "${a.name}": ${a.desc}`);
    return;
  }
  theme = name;
  document.documentElement.dataset.theme = name;
  save(THEME_KEY, name);
  renderThemes();
  if (bgPlaying) bgStart();
}

// ===== HIGH SCORE + STATISTICS (yours only) =====
const getBest = () => parseInt(load(KEY, 0), 10) || 0;
const getStats = () => ({ gamesPlayed: 0, totalWords: 0, longestWord: "", bestRound: 0, totalScore: 0, highestScore: 0, filWords: 0, ...load(STATS_KEY, {}) });

function refreshBest() { ["hsStart", "hsOver", "best"].forEach(id => $(id).textContent = getBest()); }

function renderStatistics() {
  const s = getStats(), avg = s.gamesPlayed ? Math.round(s.totalScore / s.gamesPlayed) : 0;
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

// ===== DAILY CHALLENGE + LOCAL TOP 10 =====
const getDaily = () => ({ day: "", best: 0, last: "", streak: 0, bestStreak: 0, ...load(DAILY_KEY, {}) });
const dailyStreak = r => r.last === dayKey() || r.last === dayKey(-1) ? r.streak : 0;

function recordDaily(score) {
  const r = getDaily();
  if (r.day !== dailyKey) { r.day = dailyKey; r.best = 0; }
  r.best = Math.max(r.best, score);
  if (r.last !== dailyKey) {
    const [y, m, d] = dailyKey.split("-").map(Number);
    r.streak = r.last === keyOf(new Date(y, m - 1, d - 1)) ? r.streak + 1 : 1;
    r.last = dailyKey;
    r.bestStreak = Math.max(r.bestStreak, r.streak);
  }
  save(DAILY_KEY, r);
  return r;
}

function renderDailyInfo() {
  const r = getDaily(), s = dailyStreak(r);
  $("dailyInfo").textContent = r.day === dayKey()
    ? `Today's best: ${r.best} · 🔁 streak ${s}`
    : s ? `🔁 Streak ${s}: play today to keep it going!` : "Same categories and events for everyone, every day.";
}

function addToBoard(me) {
  if (me.score <= 0) return;
  const board = load(BOARD_KEY, []);
  board.push({ score: me.score, mode: daily ? "Daily" : diff().label, round, date: dayKey(), won: !me.dead });
  board.sort((a, b) => b.score - a.score);
  save(BOARD_KEY, board.slice(0, BOARD_MAX));
}

function renderRecords() {
  const r = getDaily(), s = dailyStreak(r);
  $("recDaily").textContent = `📅 Daily: ${r.day === dayKey() ? "today's best " + r.best : "not played today"} · 🔁 streak ${s} (best ${r.bestStreak})`;
  $("achList").innerHTML = ACHIEVEMENTS.map(a => {
    const got = !!unlocked[a.id];
    return `<div class="ach${got ? " got" : ""}"><span class="ach-ico">${got ? a.icon : "🔒"}</span>` +
      `<div><strong>${a.name}</strong><br><small>${a.desc}${a.unlocks ? ` 🎨 Unlocks ${THEMES[a.unlocks]}` : ""}</small></div></div>`;
  }).join("");
  const board = load(BOARD_KEY, []);
  $("boardCard").innerHTML = `<strong>🏅 TOP ${BOARD_MAX} RUNS (this device)</strong>` + (board.length
    ? `<div class="tallywrap"><table class="tally"><tr><th>#</th><th>Score</th><th>Mode</th><th>Round</th><th></th><th>Date</th></tr>` +
      board.map((b, i) => `<tr><td>${i + 1}</td><td>${b.score}</td><td>${esc(b.mode)}</td><td>R${b.round}</td><td>${b.won ? "🏆" : "🌋"}</td><td>${esc(b.date)}</td></tr>`).join("") +
      `</table></div>`
    : `<div>No runs yet. Play a game!</div>`);
}

function checkEndAchievements(won, dailyRec) {
  const me = players[0];
  if (won) {
    unlock("win");
    if (!me.tally.timeouts) unlock("flawless");
    if (!daily && difficulty === "hard") unlock("hardwin");
  }
  if (round >= 20) unlock("r20");
  if (me.score >= 300) unlock("score300");
  if (daily) {
    unlock("daily");
    if (dailyRec && dailyRec.streak >= 3) unlock("streak3");
  }
}

function renderRunAchievements() {
  const el = $("achCard");
  if (!runUnlocked.length) { el.classList.add("hidden"); return; }
  el.classList.remove("hidden");
  el.innerHTML = `<strong>🏆 NEW ACHIEVEMENTS</strong>` + runUnlocked.map(id => {
    const a = ACHIEVEMENTS.find(x => x.id === id);
    return `<div>${a.icon} ${a.name}: ${a.desc}${a.unlocks ? ` 🎨 ${THEMES[a.unlocks]} theme unlocked!` : ""}</div>`;
  }).join("");
}

// ===== AFTER A LOSS: WORDS YOU MISSED =====
function renderMissed() {
  const el = $("missedCard"), me = players[0];
  if (!me.dead || !current) { el.classList.add("hidden"); return; }
  const left = [...current.set].filter(w => !used.has(w) && w.length >= minLen()).sort((a, b) => b.length - a.length);
  if (!left.length) { el.classList.add("hidden"); return; }
  // the 3 longest (they push the lava back the most) plus a few random others
  const rest = left.slice(3).sort(() => Math.random() - 0.5).slice(0, 5);
  const shown = [...left.slice(0, 3), ...rest].sort((a, b) => b.length - a.length);
  el.classList.remove("hidden");
  el.innerHTML = `<strong>📚 YOU MISSED THESE IN "${esc(current.category.toUpperCase())}"</strong>` +
    `<div class="missed-chips">${shown.map(w =>
      `<span class="mchip${w.length >= 8 ? " long" : ""}">${esc(w.toUpperCase())} <small>${w.length}${w.length >= 8 ? " · big push!" : w.length >= 5 ? " · push-back" : ""}</small></span>`).join("")}</div>` +
    `<div class="missed-note">${left.length} valid word${left.length === 1 ? " was" : "s were"} still available. 5+ letters push the lava back, 8+ pushes it back hard.</div>`;
}

// ===== LIVE LENGTH / PUSH HINT =====
function updateLenHint() {
  const h = $("lenHint");
  if (!h) return;
  const n = normalize($("answer").value).length;
  if (locked || players[turn].bot || !n) { h.textContent = ""; h.className = "lenhint"; return; }
  const push = pushFor(n);
  let t;
  if (bossRound) t = `${n} letters · ${push ? `-${push}% lava` : "no push-back"}`;   // boss rounds add the creep once, at the end
  else {
    const net = riseNow() - push;
    t = `${n} letters · ${net > 0 ? `+${net}% lava` : net < 0 ? `${net}% lava` : "lava holds steady"}`;
  }
  if (n >= 8) t += ` · +${BONUS_LONG} bonus`;
  else if (n >= 5) t += ` · ${8 - n} more for big push`;
  else t += minLen() && n < minLen() ? ` · needs ${minLen()}+` : ` · ${5 - n} more to push back`;
  h.textContent = t;
  h.className = "lenhint " + (n >= 8 ? "t2" : n >= 5 ? "t1" : "");
}

// ===== EXTRA UI: lava lanes, turn screen, stats cards =====
function createFeatureUI() {
  const el = (tag, id, props = {}) => Object.assign(document.createElement(tag), { id }, props);
  const card = (id, html = "") => el("div", id, { className: "feature-card", innerHTML: html });

  $("start").appendChild(card("startStats"));
  $("over").append(card("missedCard"), card("achCard"), card("podiumCard"), card("tallyCard"), card("overStats"));
  $("missedCard").classList.add("hidden");
  $("achCard").classList.add("hidden");

  document.querySelector(".board").before(el("div", "arena", {
    innerHTML: players.map((p, i) => `
      <div class="lane" id="lane-${i}">
        <div class="speech" id="speech-${i}"></div>
        <div class="avatar" id="avatar-${i}">${faceHtml(p, "normal")}</div>
        <div class="pname">${p.name}</div>
        <div class="lavatower" id="lt-${i}"><div class="lavafill" id="fill-${i}"></div><div class="lpct" id="lpct-${i}">0%</div></div>
        <div class="pscore" id="pscore-${i}">⭐ 0</div>
      </div>`).join("")
  }));
  players.forEach((_, i) => { $("avatar-" + i).dataset.state = "normal"; });

  // theme picker, placed under the difficulty picker
  const themeRow = el("div", "themePicker", { className: "diff" });
  themeRow.setAttribute("role", "radiogroup");
  themeRow.setAttribute("aria-label", "Theme");
  themeRow.innerHTML = Object.entries(THEMES).map(([k, label]) =>
    `<button type="button" role="radio" class="diffbtn themebtn" data-theme="${k}">${label}</button>`).join("");
  themeRow.onclick = e => { const b = e.target.closest(".themebtn"); if (b) setTheme(b.dataset.theme); };
  $("diffDesc").after(themeRow);

  const banner = card("eventBanner");
  banner.style.display = "none";
  $("category").before(
    card("featureHud", '<div id="turnDisplay"></div><div id="comboDisplay"></div><div id="bossDisplay"></div><div id="lastChanceDisplay"></div>'),
    banner
  );

  $("submit").after(el("button", "sparkBtn", { className: "btn ghost", type: "button", disabled: true, textContent: `✨ Spark hint (-${SPARK_COST})`, onclick: useSpark }));
  const log = el("div", "wordLog");
  log.setAttribute("aria-label", "Recent words");
  $("msg").after(log);
  document.body.appendChild(el("div", "turnOverlay", { innerHTML: '<div id="turnFace"></div><div id="turnText"></div>' }));

  const toasts = el("div", "toasts");
  toasts.setAttribute("aria-live", "polite");
  document.body.appendChild(toasts);

  // announce game messages (turn, accepted/rejected words, results) to screen readers
  $("msg").setAttribute("role", "status");
  $("msg").setAttribute("aria-live", "polite");
  $("msg").setAttribute("aria-atomic", "true");

  defaultPH = $("answer").placeholder || "Type a word...";
  $("answer").after(el("div", "lenHint", { className: "lenhint" }));
  $("lenHint").setAttribute("aria-hidden", "true");   // keeps screen readers quiet while typing
  renderStatistics();
}

function updateFeatureHUD() {
  const p = players[turn];
  $("turnDisplay").textContent = round ? `🎯 Turn ${round}: ${p.name} (${diff().label}${daily ? " · Daily" : ""})` : "";
  $("comboDisplay").textContent = `🔥 ${p.name} Combo: ${p.combo} | Multiplier: ${p.mult}x`;
  $("bossDisplay").textContent = bossRound ? `👹 BOSS ROUND: ${bossDone}/${BOSS_WORDS} words` : "";
  $("lastChanceDisplay").textContent = lastChance ? "🚨 LAST CHANCE MODE! DOUBLE POINTS! SURVIVE!" : "";
  players.forEach((_, i) => $("lt-" + i).classList.toggle("critical-mode", lastChance && i === turn));
  document.body.classList.toggle("lastchance", lastChance && turn === 0 && round > 0);
}

function triggerDisaster() {
  activeEvent = rng() < EVENT_CHANCE ? EVENTS[Math.floor(rng() * EVENTS.length)] : null;
  // don't ask for 5+ letter words in a category that barely has any
  if (activeEvent && activeEvent.id === "min5" && [...current.set].filter(w => w.length >= 5).length < 4) activeEvent = null;
  const b = $("eventBanner");
  b.style.display = activeEvent ? "block" : "none";
  b.textContent = activeEvent ? `${activeEvent.name} - ${activeEvent.desc}` : "";
}

// sounds + visuals that play when the turn actually begins
function playEventFx() {
  if (!activeEvent) return;
  const id = activeEvent.id;
  if (id === "heat" || id === "surge") sfx.heat();
  if (id === "tremor") { sfx.tremor(); shake(); }
  if (id === "breeze") { sfx.breeze(); restart($("lt-" + turn), "cooled"); }
  if (id === "double" || id === "min5" || id === "nospark") sfx.rule();
}

// ===== SCREEN SHAKE + FLOATING POPUPS =====
function shake() {
  if (reduceMotion || !prefs.shake) return;
  const el = document.querySelector(".app");
  restart(el, "quake");
  setTimeout(() => el.classList.remove("quake"), 450);
}

function popup(i, text, cls) {
  const el = Object.assign(document.createElement("span"), { className: "pop " + cls, textContent: text });
  $("lane-" + i).appendChild(el);
  setTimeout(() => el.remove(), 1250);
}

// ===== RANKING =====
// Highest score wins. Ties: survivor beats melted, then the player who melted later.
const rankPlayers = () => [...players].sort((a, b) => b.score - a.score || a.dead - b.dead || b.diedRound - a.diedRound);

// ===== PODIUM (3rd left, 1st center, 2nd right) =====
function renderPodium() {
  const ranked = rankPlayers();
  const pod = i => {
    const p = ranked[i];
    return `<div class="pod p${i + 1}">
      <div class="pod-face">${faceHtml(p, p.dead ? "dead" : "normal")}</div>
      <div class="pod-name">${p.name}</div>
      <div class="pod-score">⭐ ${p.score}</div>
      <div class="pod-status">${p.dead ? "🌋 Melted R" + p.diedRound : "Survived"}</div>
      <div class="pod-step">${i + 1}</div>
    </div>`;
  };
  $("podiumCard").innerHTML = `<strong>🏆 FINAL PODIUM</strong><div class="podium">${[2, 0, 1].map(pod).join("")}</div>`;
}

// ===== RESULTS: score tally =====
function renderTally() {
  const ranked = rankPlayers(), winner = ranked[0], place = ["1st", "2nd", "3rd"];
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
  const head = players.map(p => `<th>${faceHtml(p, p.dead ? "dead" : "normal")}<br>${p.name}</th>`).join("");
  const body = rows.map(([label, value, cls = ""]) =>
    `<tr class="${cls}"><td>${label}</td>${players.map(p => `<td>${value(p)}</td>`).join("")}</tr>`).join("");
  $("tallyCard").innerHTML = `<strong>🧾 SCORE TALLY (${diff().label}${daily ? " · Daily" : ""})</strong><div class="tallywrap"><table class="tally"><tr><th>Criteria</th>${head}</tr>${body}</table></div>`;
}

// ===== SPEECH BUBBLES =====
const DOTS = '<span class="dots"><i></i><i></i><i></i></span>';

function setBubble(i, html, say = false) {
  const b = $("speech-" + i);
  b.innerHTML = html;
  b.classList.toggle("on", !!html);
  b.classList.toggle("say", !!html && say);   // reactions may wrap onto two lines, typing never does
}

function showTyping(p, text) {
  setBubble(players.indexOf(p), text ? `${text}<span class="caret"></span>` : DOTS);
  $("answer").value = text;
}

// ===== BOT PERSONALITY: short reactions in the speech bubble =====
const lastLine = {};
function say(p, kind, vars = {}) {
  const lines = p.bot && p.chat && p.chat[kind];
  if (!lines || !lines.length) return;
  let line;
  do { line = lines[Math.floor(Math.random() * lines.length)]; } while (lines.length > 1 && line === lastLine[p.name + kind]);
  lastLine[p.name + kind] = line;
  setBubble(players.indexOf(p), esc(line.replace("{n}", vars.n || "")), true);
}

// one reaction per turn, the most dramatic one first
function botReact(p, word) {
  if (p.bot) {
    if (p.dead) say(p, "melt");
    else if (!word) say(p, "timeout");
    else if (clearLeader() === turn && leaderAtStart !== turn) say(p, "lead");
    else if (p.lava >= 60 && !p.hotSaid) say(p, "hot");
    else if (word.length >= 8 && Math.random() < 0.5) say(p, "long");
    if (p.lava >= 60) p.hotSaid = true;
    else if (p.lava < 40) p.hotSaid = false;
  }
  if (p.dead) {
    // the other bots react when someone melts
    players.forEach((q, i) => {
      if (!q.bot || q.dead || i === turn) return;
      say(q, p.bot ? "rival" : "gloat", { n: p.name });
    });
  }
}

// ===== RECENT WORDS LOG =====
function logWord(word, p, points) {
  wordLog.unshift({ word: word.toUpperCase(), init: p.name[0], points, net: null, mine: !p.bot });
  if (wordLog.length > LOG_MAX) wordLog.pop();
  renderLog();
}

// each badge shows the word, who played it, the points, and the net lava change of that turn
function renderLog() {
  $("wordLog").innerHTML = wordLog.map((e, i) =>
    `<span class="wbadge${e.mine ? " mine" : ""}${i === 0 ? " latest" : ""}">${e.mine ? "● " : ""}${esc(e.word)} · ${e.init} · +${Math.round(e.points)}${e.net !== null ? ` · ${e.net > 0 ? "+" : ""}${e.net}% lava` : ""}</span>`
  ).join("");
}

function clearLogSmooth() {
  if (!wordLog.length) return;
  const l = $("wordLog");
  l.classList.add("fade");
  setTimeout(() => { wordLog = []; renderLog(); l.classList.remove("fade"); }, 350);
}

// ===== SPARK HINT (one per game, costs points) =====
function useSpark() {
  const p = players[turn];
  if (locked || p.bot || sparkUsed || noSpark()) return;
  const pool = [...current.set].filter(w => !used.has(w) && w.length >= minLen());
  if (!pool.length) return setMsg("No unused words left to hint!", "bad");
  const w = pool[Math.floor(Math.random() * pool.length)], L = w[0].toUpperCase();
  sparkUsed = true;
  p.score = Math.max(0, p.score - SPARK_COST);
  $("sparkBtn").disabled = true;
  $("answer").placeholder = `Starts with "${L}" ${L}${"_".repeat(w.length - 1)} (${w.length} letters)`;
  $("answer").classList.add("spark");
  $("answer").focus();
  setMsg(`✨ Spark: a valid word starts with "${L}" and has ${w.length} letters. -${SPARK_COST} pts.`, "good");
  popup(0, `-${SPARK_COST} ✨`, "gold");
  sfx.spark();
  updateHud();
}

function resetPlaceholder() {
  $("answer").placeholder = defaultPH;
  $("answer").classList.remove("spark");
}

// ===== START GAME =====
// dailyMode = true: fixed seed for today's date, always Normal, always includes the Filipino pack
function startGame(dailyMode = false) {
  getCtx();
  clearInterval(timerId);
  clearTimeout(botTimer);
  clearTimeout(transitionTimer);
  paused = false;
  $("turnOverlay").classList.remove("show");
  daily = !!dailyMode;
  dailyKey = dayKey();
  rng = daily ? seeded("wordlava-" + dailyKey) : Math.random;
  round = bossDone = bossPush = 0;
  players = newPlayers();
  turn = players.length - 1;          // so the first turn goes to player 0 (you)
  used = new Set();
  lastCats = [];
  wordLog = [];
  runUnlocked = [];
  leaderAtStart = -1;
  bossRound = lastChance = sparkUsed = false;
  activeEvent = null;
  locked = true;
  renderLog();
  resetPlaceholder();
  updateHud();   // games played is counted when a game finishes
  show("game");
  bgStart();
  nextRound();
}

// ===== NEXT ROUND =====
function nextRound() {
  round++;
  do { turn = (turn + 1) % players.length; } while (players[turn].dead);
  const p = players[turn];
  locked = true;
  lastChance = p.lava >= LAST_CHANCE_LEVEL;
  used = new Set();                    // a word can be used once per round
  leaderAtStart = clearLeader();

  const bank = categoryPool();
  let choices = bank.filter(c => !lastCats.includes(c.category));
  if (!choices.length) { lastCats = []; choices = bank; }
  current = choices[Math.floor(rng() * choices.length)];
  lastCats.push(current.category);
  while (lastCats.length > RECENT_CATS) lastCats.shift();
  current.set = new Set(current.words.split(" ").map(normalize));

  bossRound = round % BOSS_INTERVAL === 0;
  bossDone = bossPush = 0;

  triggerDisaster();
  const d = diff(), minTime = Math.max(5, MIN_TIME + d.time);
  roundTime = lastChance
    ? Math.max(4, LAST_CHANCE_TIME + Math.round(d.time / 2))
    : Math.max(minTime, BASE_TIME + d.time - Math.floor((round - 1) / 2));
  if (activeEvent) roundTime = Math.max(4, roundTime - activeEvent.time);
  timeLeft = roundTime;

  players.forEach((_, i) => setBubble(i, ""));
  clearLogSmooth();
  resetPlaceholder();
  $("category").textContent = current.category;
  $("answer").value = "";
  $("answer").disabled = $("submit").disabled = $("sparkBtn").disabled = true;
  setMsg("", "");
  updateHud();
  drawTimer();

  $("turnFace").innerHTML = faceHtml(p);
  $("turnText").textContent = p.turnText;
  $("turnOverlay").classList.add("show");
  if (bossRound) { sfx.boss(); shake(); } else sfx.turn(!p.bot);
  gated(() => {
    $("turnOverlay").classList.remove("show");
    beginTurn(p);
  }, ANNOUNCE_MS, id => transitionTimer = id);
}

function beginTurn(p) {
  locked = false;
  lastTickSec = 0;
  $("answer").disabled = $("submit").disabled = p.bot;
  $("sparkBtn").disabled = p.bot || sparkUsed || noSpark();
  setMsg(p.bot ? `${p.name} is thinking...` : coarse ? "Your turn! Tap the box to type." : "Your turn!", "");
  playEventFx();

  clearInterval(timerId);
  timerId = setInterval(() => {
    if (paused) return;
    timeLeft -= 0.1;
    drawTimer();
    const sec = Math.ceil(timeLeft);
    const lim = lastChance ? 99 : 3;
    if (!p.bot && sec <= lim && sec > 0 && sec !== lastTickSec) {
      lastTickSec = sec;
      lastChance ? sfx.tickHot() : sfx.tick();
    }
    if (timeLeft <= 0) endRound(null);
  }, 100);

  if (p.bot) botTurn(p); else $("answer").focus();
}

// ===== BOT LOGIC =====
// "greedy" bots favor the longest words. "safe" bots stick to 5+ letter words (reliable, and they still push the lava back),
// falling back to the shortest words only when the category has nothing longer they know.
function pickPool(p, pool, need) {
  if (!p.style) return pool;
  const s = [...pool].sort((a, b) => a.length - b.length);
  if (p.style === "greedy") return s.slice(-Math.max(need, Math.ceil(s.length / 2)));
  const steady = s.filter(w => w.length >= 5);
  return steady.length >= need ? steady : s.slice(0, Math.max(need, Math.ceil(s.length / 2)));
}

function botTurn(p) {
  setBubble(turn, DOTS);
  const d = diff(), acc = Math.min(0.97, p.acc * d.acc), need = bossRound ? BOSS_WORDS : 1;
  const pool = [...current.set].filter(w => !used.has(w) && w.length >= minLen());
  const short = pool.filter(w => w.length <= p.maxLen);
  const source = pickPool(p, short.length >= need ? short : pool, need);

  if (Math.random() > acc || source.length < need) return;

  const picks = [];
  while (picks.length < need) picks.push(source.splice(Math.floor(Math.random() * source.length), 1)[0]);

  const typeTime = picks.reduce((t, w) => t + w.length * botSpeed(p) / 1000 + 0.3, 0);
  const think = Math.min(rand(p.think[0], p.think[1]) * d.think, roundTime - 0.4 - typeTime);
  if (think < 0.3) return;

  gated(() => typeWords(p, picks, 0), think * 1000, id => botTimer = id);
}

function typeWords(p, picks, i) {
  const w = picks[i];
  let n = 0;
  const step = () => {
    if (locked) return;
    showTyping(p, w.slice(0, ++n));
    if (n < w.length) { gated(step, botSpeed(p) * rand(0.7, 1.3), id => botTimer = id); return; }
    gated(() => {
      used.add(w);
      if (i + 1 < picks.length) { showTyping(p, ""); typeWords(p, picks, i + 1); }
      else botSubmit(p, picks);
    }, 300, id => botTimer = id);
  };
  step();
}

function botSubmit(p, picks) {
  if (!bossRound) return endRound(picks[0]);
  bossDone = picks.length;
  bossPush = picks.reduce((sum, w) => sum + pushFor(w.length), 0);
  picks.forEach(w => awardWord(w, p));
  endRound(picks[picks.length - 1], true);
}

// ===== SCORING =====
function awardWord(word, p) {
  const len = word.length;
  p.combo += activeEvent && activeEvent.id === "double" ? 2 : 1;
  p.mult = Math.min(MAX_MULTIPLIER, 1 + Math.floor(p.combo / 2));
  const longBonus = len >= 8 ? BONUS_LONG : 0;
  const subtotal = (len + longBonus) * p.mult;
  const lastBonus = lastChance ? subtotal : 0;
  const points = subtotal + lastBonus;
  p.score += points;

  const t = p.tally;
  t.words++;
  t.letters += len;
  t.longBonus += longBonus;
  t.comboBonus += (len + longBonus) * (p.mult - 1);
  t.lastBonus += lastBonus;
  t.bestCombo = Math.max(t.bestCombo, p.combo);
  if (len > t.longest.length) t.longest = word;

  if (!p.bot) {
    const s = getStats();
    s.totalWords++;
    if (len > s.longestWord.length) s.longestWord = word;
    if (current.pack === "fil") s.filWords++;
    save(STATS_KEY, s);
    if (len >= 8) unlock("long");
    if (p.mult >= 4) unlock("combo");
    if (lastChance) unlock("last");
    if (s.filWords >= 10) unlock("fil10");
  }

  sfx.good(len, p.bot);
  logWord(word, p, points);
  popup(players.indexOf(p), `+${points}`, "good");
  updateHud();
  return { points, len };
}

// ===== SUBMIT WORD (your turn only) =====
function submitWord() {
  const p = players[turn];
  if (locked || p.bot) return;
  const w = normalize($("answer").value);
  if (!w) return;
  if (used.has(w)) return reject(`"${w}" was already used this round. Try a different word.`, "dupe");
  if (w.length < minLen()) return reject(`This round needs words of ${minLen()}+ letters.`, "short");
  if (!current.set.has(w)) return reject(`"${w}" is not in the ${current.category} list. Try another word.`, "list");
  used.add(w);
  if (!bossRound) return endRound(w);

  const r = awardWord(w, p);
  bossDone++;
  bossPush += pushFor(w.length);
  if (bossDone >= BOSS_WORDS) return endRound(w, true);
  const left = BOSS_WORDS - bossDone;
  $("answer").placeholder = `Boss round: ${left} more word${left > 1 ? "s" : ""} needed`;
  setMsg(`"${w}" accepted! +${r.points} points. ${left} more word needed!`, "good");
  $("answer").value = "";
  setBubble(0, "");
  $("answer").focus();
}

function reject(text, kind) {
  setMsg(text, "bad");
  kind === "dupe" ? sfx.dupe() : sfx.bad();
  popup(0, kind === "dupe" ? "↺ USED" : kind === "short" ? "📏 TOO SHORT" : "✗ NOT IN LIST", "bad");
  restart($("answer"), "shake");
  $("answer").select();
}

// ===== END ROUND =====
// lava change this turn = creep + (time-out jump) + (event) - (push-back from word length)
function endRound(word, bossWon = false) {
  if (locked) return;
  locked = true;
  updateLenHint();
  clearInterval(timerId);
  clearTimeout(botTimer);
  $("answer").disabled = $("submit").disabled = $("sparkBtn").disabled = true;
  document.querySelectorAll(".breeze").forEach(el => el.remove());

  const p = players[turn], owner = p.bot ? `${p.name}'s` : "Your";
  const extra = activeEvent ? activeEvent.rise : 0;
  const base = baseRise();
  const timeoutRise = word ? 0 : Math.round((START_RISE + (round - 1) * RISE_PER_ROUND) * diff().rise);
  let push = 0, text;

  if (!word) {
    p.combo = 0;
    p.mult = 1;
    p.tally.timeouts++;
    text = (p.bot ? `${p.name} ran out of time!` : "Time's up!") + " The lava keeps rising.";
    if (p.bot) setBubble(turn, "⏰");
    sfx.timeout(p.bot);
    popup(turn, "⏰ TIME", "bad");
  } else if (bossWon) {
    push = bossPush;
    p.tally.bosses++;
    if (!p.bot) unlock("boss");
    text = `👹 BOSS DEFEATED by ${p.name}! ${bossDone} words completed!`;
  } else {
    const r = awardWord(word, p);
    push = pushFor(word.length);
    text = `${p.name}: "${word}" = ${r.len} letters, +${r.points} pts.` + (lastChance ? " DOUBLE POINTS!" : "");
  }

  const net = base + timeoutRise + extra - push;
  if (word && wordLog[0]) { wordLog[0].net = net; renderLog(); }   // newest badge shows this turn's lava change
  p.lava = Math.min(MAX_LAVA, Math.max(0, p.lava + net));
  const parts = [`+${base}% creep`, timeoutRise && `+${timeoutRise}% time-out`, extra && `${extra > 0 ? "+" : ""}${extra}% event`, push && `-${push}% push-back`].filter(Boolean);
  text += net > 0 ? ` ${owner} lava +${net}%` : net < 0 ? ` ${owner} lava pushed back ${-net}%` : ` ${owner} lava holds steady`;
  text += ` (${parts.join(", ")}).`;

  if (net > 0) { sfx.rumble(); popup(turn, `+${net}% LAVA`, "bad"); if (net >= 10) shake(); }
  else if (net < 0) popup(turn, `${net}% LAVA`, "good");

  if (p.lava >= MAX_LAVA) {
    p.dead = true;
    p.diedRound = round;
    text += ` 🌋 ${p.bot ? p.name : "You"} melted!`;
    sfx.melt();
    shake();
  }
  botReact(p, word);
  setMsg(text, net > 0 || p.dead ? "bad" : "good");
  updateHud();

  const over = players[0].dead || players.filter(x => !x.dead).length === 1;
  gated(over ? gameOver : nextRound, over ? 1600 : 1800, id => transitionTimer = id);
}

// ===== GAME OVER =====
function gameOver() {
  clearInterval(timerId);
  clearTimeout(botTimer);
  clearTimeout(transitionTimer);

  const me = players[0], best = getBest(), s = getStats(), won = !me.dead;
  if (me.score > best) save(KEY, me.score);
  s.gamesPlayed++;
  s.bestRound = Math.max(s.bestRound, round);
  s.totalScore += me.score;
  s.highestScore = Math.max(s.highestScore, me.score);
  save(STATS_KEY, s);
  addToBoard(me);
  const dailyRec = daily ? recordDaily(me.score) : null;
  checkEndAchievements(won, dailyRec);

  const winner = rankPlayers()[0];
  refreshBest();
  renderStatistics();
  renderDailyInfo();
  renderMissed();
  renderRunAchievements();
  renderTally();
  renderPodium();
  $("overTitle").textContent = me.dead ? "The lava got you" : "You survived!";
  $("finalScore").textContent = me.score;
  $("finalInfo").textContent =
    (daily ? "📅 Daily challenge. " : "") +
    (me.dead ? `🌋 You melted in round ${round}! ` : `🌋 Both bots melted in round ${round}! `) +
    (winner === me ? "🏆 YOU WIN! " : `Winner: ${winner.name}. `) +
    players.map(p => `${p.name}: ${p.score}`).join(" | ") +
    (me.score > best && me.score > 0 ? " - NEW HIGH SCORE!" : "");
  show("over");
  me.dead ? sfx.lose() : sfx.win();
}

// ===== HUD =====
function updateHud() {
  const top = Math.max(...players.map(p => p.score)), leaders = players.filter(p => p.score === top);
  players.forEach((p, i) => {
    const shown = Math.min(p.lava, MAX_LAVA), fill = $("fill-" + i), lane = $("lane-" + i);
    const isLeader = top > 0 && leaders.length === 1 && p.score === top;   // crown only for a clear leader
    fill.style.height = shown + "%";
    fill.style.opacity = shown > 0 ? 1 : 0;
    $("lpct-" + i).textContent = Math.round(shown) + "%";
    $("pscore-" + i).textContent = "⭐ " + p.score + (isLeader ? " 👑" : "");
    setFace($("avatar-" + i), p);
    lane.classList.toggle("dead", p.dead);
    lane.classList.toggle("leader", isLeader);
    lane.classList.toggle("active", round > 0 && !p.dead && i === turn);
  });
  $("heat").style.opacity = (Math.min(players[0].lava, MAX_LAVA) / MAX_LAVA * 0.7).toFixed(2);
  $("round").textContent = Math.max(round, 1);
  $("score").textContent = players[0].score;
  updateFeatureHUD();
}

function drawTimer() {
  const t = Math.max(0, timeLeft);
  $("time").textContent = Math.ceil(t);
  $("timerBar").style.width = (t / roundTime * 100) + "%";
  $("timerBar").style.background = t < 4 ? "var(--bad)" : "var(--molten)";
  updateLenHint();
}

function setMsg(t, cls) {
  const m = $("msg");
  m.textContent = t;
  m.className = "msg " + cls;
}

// ===== EVENTS =====
$("startBtn").onclick = $("playBtn").onclick = () => startGame(false);
$("dailyBtn").onclick = () => startGame(true);
$("againBtn").onclick = () => startGame(daily);        // play again in the same mode
$("howBtn").onclick = () => show("how");
$("recBtn").onclick = () => { renderRecords(); show("records"); };
$("backBtn").onclick = $("menuBtn").onclick = $("recBackBtn").onclick = () => show("start");
$("muteBtn").onclick = toggleMute;
$("submit").onclick = submitWord;
$("answer").addEventListener("keydown", e => { if (e.key === "Enter") submitWord(); });
// live typing preview in your own speech bubble, like the bots
$("answer").addEventListener("input", () => {
  updateLenHint();
  if (locked || players[turn].bot) return;
  const v = $("answer").value;
  setBubble(0, v ? `${esc(v)}<span class="caret"></span>` : "");
});
document.querySelectorAll(".diffbtn[data-diff]").forEach(b => b.onclick = () => setDifficulty(b.dataset.diff));

// pause the music while the tab is hidden
document.addEventListener("visibilitychange", () => {
  if (bgAudio) document.hidden ? bgAudio.pause() : bgAudio.play().catch(() => {});
  if (bgNode) document.hidden ? bgNode.c.suspend() : bgNode.c.resume();
});

// ===== MOBILE: keep the input visible above the on-screen keyboard =====
// When the keyboard opens the visual viewport shrinks. While it is open, the page switches to a compact layout
// (body.kbd hides the stats row, HUD and word log, see features.css) and the input is scrolled into view.
const vv = window.visualViewport;
function syncKeyboard() {
  const input = $("answer");
  const open = !!vv && document.activeElement === input && window.innerHeight - vv.height > 150;
  document.body.classList.toggle("kbd", open);
  if (open) requestAnimationFrame(() => input.scrollIntoView({ block: "center", behavior: reduceMotion ? "auto" : "smooth" }));
}
if (vv) vv.addEventListener("resize", syncKeyboard);
$("answer").addEventListener("focus", () => setTimeout(syncKeyboard, 300));
$("answer").addEventListener("blur", () => document.body.classList.remove("kbd"));

// ===== LAVA EFFECTS: bubbles, embers, breeze motes =====
function spawn(cls, css, ms, parent) {
  const el = Object.assign(document.createElement("span"), { className: cls });
  el.style.cssText = css;
  parent.appendChild(el);
  setTimeout(() => el.remove(), ms);
}

function lavaFx() {
  if (reduceMotion || $("game").classList.contains("hidden")) return;
  players.forEach((p, i) => {
    if (p.dead) return;
    const h = $("fill-" + i).offsetHeight;
    if (!locked && activeEvent && activeEvent.id === "breeze" && i === turn && Math.random() < 0.6)
      spawn("breeze", `top:${10 + Math.random() * 75}%;--x:${50 + Math.random() * 60}px`, 1600, $("lt-" + i));
    if (h < 10) return;
    if (Math.random() < 0.7) {
      const size = 5 + Math.random() * 10, d = 1.4 + Math.random() * 1.6;
      spawn("lbub", `width:${size}px;height:${size}px;left:${Math.random() * 88}%;--d:${d}s;--h:${h * (0.3 + Math.random() * 0.6)}px`, d * 1000, $("fill-" + i));
    }
    if (Math.random() < 0.35)
      spawn("ember", `left:${8 + Math.random() * 84}%;bottom:${h}px;--d:1.4s;--x:${(Math.random() - 0.5) * 30}px`, 1400, $("lt-" + i));
  });
}

// ===== SETTINGS PANEL (gear button) =====
// audio (sfx + music, each with on/off and volume), difficulty, theme, screen shake, Filipino pack,
// restart / quit, reset statistics. The game pauses while the panel is open.
const inGame = () => !$("game").classList.contains("hidden");

function renderAudioSettings() {
  if (!$("sfxToggle")) return;
  [["sfx", audioSet.sfxOn, audioSet.sfxVol], ["music", audioSet.musicOn, audioSet.musicVol]].forEach(([k, on, vol]) => {
    const t = $(k + "Toggle"), sl = $(k + "Vol"), pct = Math.round(vol * 100);
    const icon = k === "sfx" ? ["🔊", "🔇"] : ["🎵", "🔇"], name = k === "sfx" ? "Sound effects" : "Music";
    t.textContent = on ? icon[0] : icon[1];
    t.title = t.ariaLabel = `${name}: ${on ? "on" : "off"} (click to turn ${on ? "off" : "on"})`;
    t.setAttribute("aria-checked", String(on));
    sl.value = pct;
    sl.disabled = !on;
    sl.setAttribute("aria-valuetext", pct + "%");
    $(k + "VolOut").textContent = pct + "%";
  });
  $("setNote").textContent = muted ? "🔇 Everything is muted by the speaker button (top right)." : "";
}

function renderSettings() {
  if (!$("shakeToggle")) return;
  renderAudioSettings();
  const g = inGame();
  $("shakeToggle").textContent = prefs.shake ? "📳" : "📴";
  $("shakeToggle").title = $("shakeToggle").ariaLabel = `Screen shake: ${prefs.shake ? "on" : "off"} (click to turn ${prefs.shake ? "off" : "on"})`;
  $("shakeToggle").setAttribute("aria-checked", String(prefs.shake));
  $("filToggle").textContent = prefs.fil ? "🌴" : "🚫";
  $("filToggle").title = $("filToggle").ariaLabel = `Filipino/Tagalog pack: ${prefs.fil ? "on" : "off"} (click to turn ${prefs.fil ? "off" : "on"})`;
  $("filToggle").setAttribute("aria-checked", String(prefs.fil));
  $("filNote").textContent = g && daily ? "The daily challenge always uses the pack." : "Adds Tagalog categories like body parts, nature and polite words.";
  document.querySelectorAll("#setDiff .diffbtn").forEach(b => { b.disabled = g; });
  $("setDiffNote").textContent = g ? "Difficulty can only be changed from the menu." : "";
  $("setGameBtns").classList.toggle("hidden", !g);
  $("setPaused").textContent = paused ? "⏸ Game paused while settings are open" : "";
  renderDifficulty();
  renderThemes();
}

function applyMusicSetting() {
  if (!musicOn()) bgStop();
  else if (inGame() && !bgPlaying) bgStart();
  else applyMusicVolume();
}

function createSettingsUI() {
  const gear = Object.assign(document.createElement("button"), { id: "settingsBtn", className: "mute gear", type: "button", textContent: "⚙️" });
  gear.setAttribute("aria-label", "Open settings");
  gear.setAttribute("aria-haspopup", "dialog");
  gear.title = "Settings";

  const panel = Object.assign(document.createElement("div"), { id: "settings", className: "hidden" });
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "true");
  panel.setAttribute("aria-label", "Settings");
  const toggleRow = (k, label) => `
    <div class="set-row">
      <div class="set-head"><span>${label}</span><button type="button" role="switch" class="diffbtn set-toggle" id="${k}Toggle"></button></div>
      <div class="set-slide"><input type="range" id="${k}Vol" min="0" max="100" step="1" aria-label="${label} volume"><output id="${k}VolOut" for="${k}Vol"></output></div>
    </div>`;
  panel.innerHTML = `<div class="set-card">
    <h2>⚙️ Settings</h2>
    <p class="set-paused" id="setPaused"></p>
    ${toggleRow("sfx", "🔊 Sound effects")}
    ${toggleRow("music", "🎵 Music")}
    <div class="set-row">
      <div class="set-head"><span>🎮 Difficulty</span></div>
      <div class="diff" id="setDiff" role="radiogroup" aria-label="Difficulty">
        ${Object.entries(DIFFICULTY).map(([k, d]) => `<button type="button" role="radio" class="diffbtn" data-diff="${k}">${d.label}</button>`).join("")}
      </div>
      <p class="set-note" id="setDiffNote"></p>
    </div>
    <div class="set-row">
      <div class="set-head"><span>🎨 Theme</span></div>
      <div class="diff" id="setTheme" role="radiogroup" aria-label="Theme">
        ${Object.entries(THEMES).map(([k, label]) => `<button type="button" role="radio" class="diffbtn themebtn" data-theme="${k}">${label}</button>`).join("")}
      </div>
    </div>
    <div class="set-row">
      <div class="set-head"><span>📳 Screen shake</span><button type="button" role="switch" class="diffbtn set-toggle" id="shakeToggle"></button></div>
    </div>
    <div class="set-row">
      <div class="set-head"><span>🌴 Filipino / Tagalog pack</span><button type="button" role="switch" class="diffbtn set-toggle" id="filToggle"></button></div>
      <p class="set-note" id="filNote"></p>
    </div>
    <div class="set-actions hidden" id="setGameBtns">
      <button type="button" class="btn ghost" id="restartBtn">↻ Restart game</button>
      <button type="button" class="btn ghost" id="quitBtn">⌂ Quit to menu</button>
    </div>
    <button type="button" class="btn ghost" id="resetStatsBtn">🗑 Reset statistics</button>
    <p class="set-note" id="setNote"></p>
    <button type="button" class="btn" id="settingsClose">Close</button>
  </div>`;
  document.body.append(gear, panel);

  const open = () => {
    if (inGame()) paused = true;
    panel.classList.remove("hidden");
    renderSettings();
    $("settingsClose").focus();
  };
  const close = () => {
    panel.classList.add("hidden");
    paused = false;
    if (inGame() && !$("answer").disabled) $("answer").focus(); else gear.focus();
  };
  gear.onclick = open;
  $("settingsClose").onclick = close;
  panel.addEventListener("mousedown", e => { if (e.target === panel) close(); });
  addEventListener("keydown", e => { if (e.key === "Escape" && !panel.classList.contains("hidden")) close(); });

  // audio
  $("sfxToggle").onclick = () => {
    audioSet.sfxOn = !audioSet.sfxOn;
    saveAudio();
    renderAudioSettings();
    if (audioSet.sfxOn) sfx.good(0, true);
  };
  $("sfxVol").addEventListener("input", e => {
    audioSet.sfxVol = e.target.value / 100;
    $("sfxVolOut").textContent = e.target.value + "%";
    saveAudio();
  });
  $("sfxVol").addEventListener("change", () => sfx.good(0, true));   // preview when the slider is released
  $("musicToggle").onclick = () => {
    audioSet.musicOn = !audioSet.musicOn;
    saveAudio();
    renderAudioSettings();
    applyMusicSetting();
  };
  $("musicVol").addEventListener("input", e => {
    audioSet.musicVol = e.target.value / 100;
    $("musicVolOut").textContent = e.target.value + "%";
    saveAudio();
    applyMusicVolume();
  });

  // difficulty, theme, shake, Filipino pack
  $("setDiff").onclick = e => {
    const b = e.target.closest("[data-diff]");
    if (b && !b.disabled) { setDifficulty(b.dataset.diff); renderSettings(); }
  };
  $("setTheme").onclick = e => {
    const b = e.target.closest(".themebtn");
    if (b) setTheme(b.dataset.theme);
  };
  $("shakeToggle").onclick = () => {
    prefs.shake = !prefs.shake;
    save(PREFS_KEY, prefs);
    renderSettings();
    if (prefs.shake) shake();
  };
  $("filToggle").onclick = () => {
    prefs.fil = !prefs.fil;
    save(PREFS_KEY, prefs);
    renderSettings();
  };

  // game actions
  $("restartBtn").onclick = () => {
    if (!confirm("Restart the game? Your current progress will be lost.")) return;
    panel.classList.add("hidden");
    startGame(daily);
  };
  $("quitBtn").onclick = () => {
    if (!confirm("Quit to the menu? Your current progress will be lost.")) return;
    paused = false;
    clearInterval(timerId);
    clearTimeout(botTimer);
    clearTimeout(transitionTimer);
    locked = true;
    $("turnOverlay").classList.remove("show");
    panel.classList.add("hidden");
    show("start");
    gear.focus();
  };
  // achievements and unlocked themes are kept; this clears the high score, statistics and the top 10 list
  $("resetStatsBtn").onclick = () => {
    if (!confirm("Reset your high score, statistics and top 10 list? Achievements are kept.")) return;
    save(KEY, 0);
    save(STATS_KEY, {});
    save(BOARD_KEY, []);
    refreshBest();
    renderStatistics();
  };
  renderSettings();
}

// ===== INITIALIZE =====
preloadSounds();
createFeatureUI();
createSettingsUI();
updateHud();
refreshBest();
renderDifficulty();
renderThemes();
renderMute();
renderDailyInfo();
setInterval(lavaFx, 350);
