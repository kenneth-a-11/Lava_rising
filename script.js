// ===== SETTINGS (tweak to balance difficulty) =====
const START_RISE = 15;      // lava rise in round 1 (%)
const RISE_PER_ROUND = 3;   // extra rise added each round (%)
const MAX_LAVA = 100;       // lava level that ends the game (%)
const PUSH_SHORT = 0;       // 1-4 letters
const PUSH_MEDIUM = 5;      // 5-7 letters
const PUSH_LONG = 15;       // 8+ letters
const BONUS_LONG = 5;       // bonus points for 8+ letters
const BASE_TIME = 15,
      MIN_TIME = 8;
const KEY = "wordLavaHighScore";

const $ = id => document.getElementById(id);
const screens = ["start", "how", "game", "over"];
const show = name => {
  screens.forEach(s => $(s).classList.toggle("hidden", s !== name));
  if (name !== "game") $("heat").style.opacity = 0.15;
};

let lava,
    round,
    score,
    used,
    current,
    timeLeft,
    roundTime,
    timerId,
    locked,
    lastCats = [];

// ===== HIGH SCORE (localStorage) =====
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
  const b = getBest();
  $("hsStart").textContent = b;
  $("hsOver").textContent = b;
  $("best").textContent = b;
}

// ===== GAME FLOW =====
function startGame() {
  lava = 0;
  round = 0;
  score = 0;
  used = new Set();
  lastCats = [];
  updateHud();
  show("game");
  setTh();
  nextRound();
}

function nextRound() {
  round++;
  locked = false;

  const choices = WORD_BANK.filter(c => !lastCats.includes(c.category));
  current = choices[Math.floor(Math.random() * choices.length)];
  lastCats.push(current.category);
  if (lastCats.length > 2) lastCats.shift();
  current.set = new Set(current.words.split(" "));

  roundTime = Math.max(MIN_TIME, BASE_TIME - Math.floor((round - 1) / 2));
  timeLeft = roundTime;

  $("category").textContent = current.category;
  $("answer").value = "";
  $("answer").disabled = false;
  $("submit").disabled = false;
  setMsg("", "");
  updateHud();
  drawTimer();
  $("answer").focus();

  clearInterval(timerId);
  timerId = setInterval(() => {
    timeLeft -= 0.1;
    drawTimer();
    if (timeLeft <= 0) endRound(null);
  }, 100);
}

function normalize(w) {
  return w
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z]/g, "");
}

function submitWord() {
  if (locked) return;
  const w = normalize($("answer").value);
  if (!w) return;
  if (used.has(w)) return reject("You already used that word.");
  if (!current.set.has(w)) return reject("Not in the " + current.category + " list. Try another word.");
  used.add(w);
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

function endRound(word) {
  locked = true;
  clearInterval(timerId);
  $("answer").disabled = true;
  $("submit").disabled = true;

  const rise = START_RISE + (round - 1) * RISE_PER_ROUND;
  let push = 0,
      text;

  if (word) {
    const len = word.length;
    push = len >= 8 ? PUSH_LONG : len >= 5 ? PUSH_MEDIUM : PUSH_SHORT;
    const pts = len + (len >= 8 ? BONUS_LONG : 0);
    score += pts;
    text = `"${word}" = ${len} letters, +${pts} pts. ` + (push ? `Lava pushed back ${push}%.` : "Too short, no push-back.");
  } else {
    text = "Time's up! The lava keeps rising.";
  }

  lava = Math.max(0, lava + rise - push);
  setMsg(text + ` Lava +${rise}%.`, push ? "good" : "bad");
  updateHud();

  if (lava >= MAX_LAVA) {
    setTimeout(gameOver, 1400);
  } else {
    setTimeout(nextRound, 1600);
  }
}

function gameOver() {
  const best = getBest();
  if (score > best) saveBest(score);
  refreshBest();
  $("finalScore").textContent = score;
  $("finalInfo").textContent = `You survived ${round} round${round === 1 ? "" : "s"}` + (score > best && score > 0 ? " - new high score!" : ".");
  show("over");
}

// ===== UI HELPERS =====
function updateHud() {
  const shown = Math.min(lava, MAX_LAVA);
  $("lava").style.height = shown + "%";
  $("heat").style.opacity = (shown / MAX_LAVA * 0.7).toFixed(2);
  $("pct").textContent = Math.round(shown) + "%";
  $("round").textContent = Math.max(round, 1);
  $("score").textContent = score;
}

function drawTimer() {
  const t = Math.max(0, timeLeft);
  $("time").textContent = Math.ceil(t);
  $("timerBar").style.width = (t / roundTime * 100) + "%";
  $("timerBar").style.background = t < 4 ? "var(--bad)" : "var(--molten)";
}

function setMsg(t, cls) {
  const m = $("msg");
  m.textContent = t;
  m.className = "msg " + cls;
}

// ===== EVENTS =====
$("startBtn").onclick = startGame;
$("howBtn").onclick = () => show("how");
$("playBtn").onclick = startGame;
$("againBtn").onclick = startGame;
$("submit").onclick = submitWord;
$("answer").addEventListener("keydown", e => {
  if (e.key === "Enter") submitWord();
});
refreshBest();

// ===== LAVA EFFECTS: bubbles in the pool + sparks above the surface =====
const reduceMotion = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

function setTh() {
  $("lava").style.setProperty("--th", document.querySelector(".tower").clientHeight + "px");
}

window.addEventListener("resize", setTh);
if (reduceMotion) document.querySelectorAll("animate").forEach(a => a.remove());

function lavaFx() {
  if (reduceMotion || $("game").classList.contains("hidden")) return;
  const h = $("lava").offsetHeight;
  if (h < 10) return;

  const b = document.createElement("span"),
        size = 5 + Math.random() * 11,
        d = 1.4 + Math.random() * 1.8;
  b.className = "bubble";
  b.style.cssText = `width:${size}px;height:${size}px;left:${Math.random() * 90}%;--d:${d}s;--h:${h * (0.3 + Math.random() * 0.6)}px`;
  $("pool").appendChild(b);
  setTimeout(() => b.remove(), d * 1000);

  if (Math.random() < 0.6) {
    const s = document.createElement("span");
    s.className = "spark";
    s.style.cssText = `left:${8 + Math.random() * 84}%;bottom:${h}px;--d:1.6s;--x:${(Math.random() - 0.5) * 40}px`;
    document.querySelector(".tower").appendChild(s);
    setTimeout(() => s.remove(), 1600);
  }
}

setInterval(lavaFx, 350);
