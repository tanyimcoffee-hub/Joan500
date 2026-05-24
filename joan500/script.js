const lessonBands = [
  { min: 0, max: 9, title: "Home row start", keys: "asdf jkl;", words: ["asdf", "jkl", "sad", "lad", "fall", "ask", "dash"] },
  { min: 10, max: 19, title: "Home row balance", keys: "asdfgh jkl;", words: ["glass", "flag", "shall", "half", "flash", "skill", "salad"] },
  { min: 20, max: 29, title: "Top row reach", keys: "qwerty uiop", words: ["quiet", "power", "type", "upper", "write", "query", "tower"] },
  { min: 30, max: 39, title: "Bottom row reach", keys: "zxcvbnm", words: ["zoom", "mix", "van", "calm", "basic", "comic", "climb"] },
  { min: 40, max: 49, title: "Common words", keys: "all letters", words: ["quick", "brown", "market", "planet", "window", "bright", "garden"] },
  { min: 50, max: 59, title: "Capital letters", keys: "shift", words: ["London", "Friday", "Signal", "Harbor", "Pixel", "North", "Teacher"] },
  { min: 60, max: 69, title: "Numbers", keys: "1234567890", words: ["2026", "15", "84", "500", "room 42", "level 67", "score 99"] },
  { min: 70, max: 79, title: "Symbols", keys: ".,?!:;'", words: ["yes.", "wait!", "ready?", "note:", "focus;", "it is", "don't"] },
  { min: 80, max: 89, title: "Sentences", keys: "phrases", words: ["steady hands type clean lines", "small habits build strong speed", "accuracy comes before speed"] },
  { min: 90, max: 100, title: "Fluency", keys: "full keyboard", words: ["The calm typist keeps a steady rhythm.", "Every clean keystroke builds useful speed.", "Practice with focus, breathe, and keep moving."] }
];

const keyboardRows = ["qwertyuiop", "asdfghjkl;", "zxcvbnm,./"];
const storageKey = "typetrack100-progress";

const state = {
  level: 0,
  startedAt: null,
  progress: loadProgress()
};

const currentLevel = document.querySelector("#currentLevel");
const levelRange = document.querySelector("#levelRange");
const levelSlider = document.querySelector("#levelSlider");
const previousLevel = document.querySelector("#previousLevel");
const nextLevel = document.querySelector("#nextLevel");
const restartLesson = document.querySelector("#restartLesson");
const lessonBand = document.querySelector("#lessonBand");
const lessonTitle = document.querySelector("#lessonTitle");
const lessonStatus = document.querySelector("#lessonStatus");
const promptText = document.querySelector("#promptText");
const typingInput = document.querySelector("#typingInput");
const focusInput = document.querySelector("#focusInput");
const completeLevel = document.querySelector("#completeLevel");
const wpmStat = document.querySelector("#wpmStat");
const accuracyStat = document.querySelector("#accuracyStat");
const progressStat = document.querySelector("#progressStat");
const bestStat = document.querySelector("#bestStat");
const levelMap = document.querySelector("#levelMap");
const keyboardView = document.querySelector("#keyboardView");
const completedCount = document.querySelector("#completedCount");
const progressMessage = document.querySelector("#progressMessage");
const historyList = document.querySelector("#historyList");
const menuToggle = document.querySelector(".menu-toggle");
const topNav = document.querySelector(".top-nav");

function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) || {};
  } catch {
    return {};
  }
}

function saveProgress() {
  localStorage.setItem(storageKey, JSON.stringify(state.progress));
}

function bandForLevel(level) {
  return lessonBands.find((band) => level >= band.min && level <= band.max) || lessonBands[0];
}

function clampLevel(level) {
  return Math.max(0, Math.min(100, Number(level) || 0));
}

function buildPrompt(level) {
  const band = bandForLevel(level);
  const targetLength = Math.min(9 + Math.floor(level / 5), 26);
  const offset = level % band.words.length;
  const words = [];

  for (let index = 0; index < targetLength; index += 1) {
    words.push(band.words[(index + offset) % band.words.length]);
  }

  return words.join(" ");
}

function renderPrompt(target, typed) {
  promptText.innerHTML = target.split("").map((char, index) => {
    const typedChar = typed[index];
    let className = "";

    if (typedChar === undefined) className = "";
    else if (typedChar === char) className = "correct";
    else className = "wrong";

    const display = char === " " ? "&nbsp;" : escapeHtml(char);
    return `<span class="${className}">${display}</span>`;
  }).join("");
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function calculateStats(target, typed) {
  const elapsedMinutes = state.startedAt ? Math.max((Date.now() - state.startedAt) / 60000, 1 / 60000) : 0;
  const checked = typed.slice(0, target.length).split("");
  const correct = checked.filter((char, index) => char === target[index]).length;
  const accuracy = checked.length ? Math.round((correct / checked.length) * 100) : 100;
  const progress = Math.min(100, Math.round((typed.length / target.length) * 100));
  const wpm = elapsedMinutes ? Math.round((correct / 5) / elapsedMinutes) : 0;

  return { accuracy, progress, wpm, correct };
}

function setLevel(level) {
  state.level = clampLevel(level);
  state.startedAt = null;
  typingInput.value = "";
  levelSlider.value = state.level;

  const band = bandForLevel(state.level);
  const target = buildPrompt(state.level);
  currentLevel.textContent = state.level;
  levelRange.textContent = band.title;
  lessonBand.textContent = `Level ${state.level}`;
  lessonTitle.textContent = band.title;
  lessonStatus.textContent = "Ready";
  renderPrompt(target, "");
  updateStats(target, "");
  renderKeyboard();
  renderLevelMap();
}

function updateStats(target, typed) {
  const stats = calculateStats(target, typed);
  const saved = state.progress[state.level];

  wpmStat.textContent = stats.wpm;
  accuracyStat.textContent = `${stats.accuracy}%`;
  progressStat.textContent = `${stats.progress}%`;
  bestStat.textContent = saved ? `${saved.bestAccuracy}%` : "0%";

  if (typed.length) lessonStatus.textContent = stats.progress >= 100 && stats.accuracy >= 92 ? "Complete" : "Active";
  if (stats.progress >= 100 && stats.accuracy >= 92) markComplete(stats);
}

function markComplete(stats = null) {
  const target = buildPrompt(state.level);
  const typed = typingInput.value;
  const finalStats = stats || calculateStats(target, typed || target);
  const previous = state.progress[state.level] || { bestAccuracy: 0, bestWpm: 0, completed: false };

  state.progress[state.level] = {
    completed: true,
    bestAccuracy: Math.max(previous.bestAccuracy, finalStats.accuracy),
    bestWpm: Math.max(previous.bestWpm, finalStats.wpm),
    completedAt: new Date().toISOString()
  };

  saveProgress();
  renderLevelMap();
  renderProgress();
  bestStat.textContent = `${state.progress[state.level].bestAccuracy}%`;
  lessonStatus.textContent = "Complete";
}

function renderLevelMap() {
  levelMap.innerHTML = Array.from({ length: 101 }, (_, level) => {
    const complete = state.progress[level]?.completed;
    const active = level === state.level;
    return `<button class="level-dot ${active ? "active" : ""} ${complete ? "complete" : ""}" type="button" data-level="${level}" aria-label="Level ${level}">${level}</button>`;
  }).join("");
}

function renderKeyboard() {
  const band = bandForLevel(state.level);
  const activeKeys = new Set(band.keys.replaceAll(" ", "").toLowerCase().split(""));

  keyboardView.innerHTML = keyboardRows.map((row) => `
    <div class="key-row">
      ${row.split("").map((key) => `<span class="key ${activeKeys.has(key) || band.keys === "all letters" || band.keys === "full keyboard" ? "active" : ""}">${key}</span>`).join("")}
    </div>
  `).join("");
}

function renderProgress() {
  const entries = Object.entries(state.progress)
    .filter(([, item]) => item.completed)
    .sort((a, b) => Number(b[0]) - Number(a[0]));

  completedCount.textContent = entries.length;
  progressMessage.textContent = entries.length
    ? `${Math.round((entries.length / 101) * 100)}% of the course completed.`
    : "No levels completed yet.";

  historyList.innerHTML = entries.slice(0, 8).map(([level, item]) => `
    <button class="history-item" type="button" data-level="${level}">
      <span>Level ${level}</span>
      <strong>${item.bestAccuracy}% accuracy</strong>
      <em>${item.bestWpm} WPM</em>
    </button>
  `).join("") || `<p class="empty-state">Completed levels will appear here.</p>`;
}

typingInput.addEventListener("input", () => {
  if (!state.startedAt) state.startedAt = Date.now();
  const target = buildPrompt(state.level);
  const typed = typingInput.value;
  renderPrompt(target, typed);
  updateStats(target, typed);
});

levelSlider.addEventListener("input", () => setLevel(levelSlider.value));
previousLevel.addEventListener("click", () => setLevel(state.level - 1));
nextLevel.addEventListener("click", () => setLevel(state.level + 1));
restartLesson.addEventListener("click", () => setLevel(state.level));
focusInput.addEventListener("click", () => typingInput.focus());
completeLevel.addEventListener("click", () => markComplete());

levelMap.addEventListener("click", (event) => {
  const button = event.target.closest("[data-level]");
  if (button) setLevel(button.dataset.level);
});

historyList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-level]");
  if (button) {
    setLevel(button.dataset.level);
    document.querySelector("#trainer").scrollIntoView({ behavior: "smooth" });
  }
});

menuToggle.addEventListener("click", () => {
  const isOpen = topNav.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

document.querySelectorAll(".top-nav a").forEach((link) => {
  link.addEventListener("click", () => {
    topNav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

setLevel(0);
renderProgress();
