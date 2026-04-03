const screens = Array.from(document.querySelectorAll(".screen"));

const startBtn = document.getElementById("startBtn");
const noticeModal = document.getElementById("noticeModal");
const agreeCheck = document.getElementById("agreeCheck");
const cancelNoticeBtn = document.getElementById("cancelNoticeBtn");
const confirmNoticeBtn = document.getElementById("confirmNoticeBtn");
const dailyLimitBanner = document.getElementById("dailyLimitBanner");
const dailyLimitText = document.getElementById("dailyLimitText");

const backToWelcomeBtn = document.getElementById("backToWelcomeBtn");
const analyzeBtn = document.getElementById("analyzeBtn");
const saveBtn = document.getElementById("saveBtn");
const shareBtn = document.getElementById("shareBtn");
const unlockShareBtn = document.getElementById("unlockShareBtn");
const resultGate = document.getElementById("resultGate");
const resultCard = document.querySelector(".result-card");
const resultActions = document.querySelector(".result-actions");

const uploadArea = document.getElementById("uploadArea");
const uploadGuide = document.getElementById("uploadGuide");
const photoInput = document.getElementById("photoInput");
const preview = document.getElementById("preview");
const analyzePreview = document.getElementById("analyzePreview");
const analyzePlaceholder = document.getElementById("analyzePlaceholder");
const userName = document.getElementById("userName");

const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");
const phaseItems = Array.from(document.querySelectorAll(".phase-track li"));

const resultName = document.getElementById("resultName");
const scoreNode = document.getElementById("score");
const scoreCircle = document.querySelector(".score-circle");
const rankNode = document.getElementById("rank");
const typeNode = document.getElementById("type");
const commentNode = document.getElementById("comment");
const tagsNode = document.getElementById("tags");
const cleanVal = document.getElementById("cleanVal");
const impactVal = document.getElementById("impactVal");
const balanceVal = document.getElementById("balanceVal");
const cleanBar = document.getElementById("cleanBar");
const impactBar = document.getElementById("impactBar");
const balanceBar = document.getElementById("balanceBar");
const timestampNode = document.getElementById("timestamp");

const DAILY_LIMIT_KEY = "charmscope_last_diagnosis_date";
const DAILY_LIMIT_ENABLED = false;

let progressTimer = null;
let analyzing = false;
let currentScreen = "welcome";
let currentResult = null;
let pendingResult = null;
let resultUnlocked = false;

const resultPatterns = [
  {
    type: "シャイン・グロウタイプ",
    comment:
      "多幸感のある明るい雰囲気が魅力。ツヤ感メイクや自然光ショットで可愛さが引き立ちます。",
    tags: ["多幸感", "ツヤ感", "映え"],
  },
  {
    type: "クール・モードタイプ",
    comment:
      "視線の強さと輪郭のキレが魅力。モード系ファッションとの相性が高いタイプです。",
    tags: ["存在感", "クール", "洗練"],
  },
  {
    type: "ナチュラル・チャームタイプ",
    comment:
      "自然体で親しみやすい印象が魅力。柔らかい表情の写真で特に好印象が出やすいです。",
    tags: ["親近感", "自然体", "好感度"],
  },
  {
    type: "バランス・プレミアタイプ",
    comment:
      "全体バランスが安定しやすく、どの角度でもまとまりやすいのが強みのタイプです。",
    tags: ["調和", "安定感", "万能"],
  },
  {
    type: "エッジ・シグネチャータイプ",
    comment:
      "印象強度が高く、写真で記憶に残りやすいタイプ。コントラスト強めの演出が映えます。",
    tags: ["印象強め", "個性", "記憶に残る"],
  },
  {
    type: "ピュア・ソフトタイプ",
    comment:
      "ふんわり柔らかい空気感が魅力。淡色コーデや優しい表情と相性が良いタイプです。",
    tags: ["ふんわり", "ナチュラル", "愛され感"],
  },
  {
    type: "アーバン・クリーンタイプ",
    comment:
      "都会的で清潔感のある印象が強み。シンプルな写真でも完成度が出やすいです。",
    tags: ["清潔感", "都会的", "スマート"],
  },
  {
    type: "グレース・エレガントタイプ",
    comment:
      "上品でレディな雰囲気が魅力。きれいめメイクや洗練コーデで印象がさらに伸びます。",
    tags: ["上品", "きれいめ", "レディ感"],
  },
  {
    type: "アクティブ・フレッシュタイプ",
    comment:
      "元気さとフレッシュさが出やすいタイプ。明るいシーンで印象が強まります。",
    tags: ["フレッシュ", "元気", "明るい"],
  },
  {
    type: "ミスティ・ニュアンスタイプ",
    comment:
      "繊細で雰囲気のある印象が特徴。やわらかい色味の写真で魅力が引き立ちます。",
    tags: ["繊細", "雰囲気", "透明感"],
  },
  {
    type: "リッチ・ラグジュタイプ",
    comment:
      "華やかさと存在感が高く、強めの演出にも負けにくいタイプです。",
    tags: ["華やか", "高級感", "存在感"],
  },
  {
    type: "クール・インテリタイプ",
    comment:
      "知的でシャープな印象が出やすいタイプ。直線的な構図で魅力が際立ちます。",
    tags: ["知的", "クール", "シャープ"],
  },
  {
    type: "スウィート・フレンドタイプ",
    comment:
      "やさしく親しみやすい可愛さが強み。笑顔ショットで好感度がぐっと上がるタイプです。",
    tags: ["好感度", "やさしい", "可愛い"],
  },
  {
    type: "モード・コントラストタイプ",
    comment:
      "メリハリのある印象で、強いライティングでも埋もれにくいタイプです。",
    tags: ["メリハリ", "モード", "強い印象"],
  },
  {
    type: "クラシック・バランスタイプ",
    comment:
      "全体のまとまりがよく、幅広いスタイルに適応しやすい安定型タイプです。",
    tags: ["安定感", "バランス", "万能"],
  },
  {
    type: "ドリーミー・ライトタイプ",
    comment:
      "軽やかで優しい印象が特徴。明るい背景でナチュラルな魅力が強まります。",
    tags: ["軽やか", "優しい", "透明感"],
  },
  {
    type: "ボールド・インパクトタイプ",
    comment:
      "一目で印象に残る力強さが魅力。個性を前面に出した写真で映えるタイプです。",
    tags: ["力強い", "個性派", "印象深い"],
  },
];

const phaseScriptTexts = [
  "入力データを初期化しています...",
  "顔領域を検出しています...",
  "特徴マップを作成しています...",
  "推定モデルを実行しています...",
  "スコアを最終補正しています...",
  "診断レポートを生成しています...",
];
let phaseScripts = phaseScriptTexts.map((text, index) => ({
  text,
  limit: index === phaseScriptTexts.length - 1 ? 100 : Math.round(((index + 1) / phaseScriptTexts.length) * 100),
}));

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom(list) {
  return list[randomInt(0, list.length - 1)];
}

function shuffle(list) {
  const copied = [...list];
  for (let i = copied.length - 1; i > 0; i -= 1) {
    const j = randomInt(0, i);
    [copied[i], copied[j]] = [copied[j], copied[i]];
  }
  return copied;
}

function buildRandomPhaseScripts() {
  const texts = shuffle(phaseScriptTexts);
  const scripts = [];
  let cursor = 0;

  for (let i = 0; i < texts.length; i += 1) {
    if (i === texts.length - 1) {
      scripts.push({ limit: 100, text: texts[i] });
      break;
    }
    const remainCount = texts.length - i - 1;
    const minNext = cursor + 8;
    const maxNext = 100 - remainCount * 8;
    const next = randomInt(minNext, maxNext);
    scripts.push({ limit: next, text: texts[i] });
    cursor = next;
  }

  return scripts;
}

function easeOutCubic(value) {
  return 1 - (1 - value) ** 3;
}

function animateNumber(from, to, duration, onUpdate) {
  const startedAt = performance.now();

  function step(now) {
    const elapsed = now - startedAt;
    const progress = Math.min(1, elapsed / duration);
    const eased = easeOutCubic(progress);
    const current = Math.round(from + (to - from) * eased);
    onUpdate(current);
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

function nowString() {
  return new Date().toLocaleString("ja-JP", { hour12: false });
}

function rankFromScore(score) {
  if (score >= 76) return "RANK S";
  if (score >= 68) return "RANK A";
  if (score >= 58) return "RANK B";
  return "RANK C";
}

function getTodayKey() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getNextResetText() {
  const next = new Date();
  next.setHours(24, 0, 0, 0);
  return `${next.getMonth() + 1}/${next.getDate()} 0:00`;
}

function getStoredDate() {
  try {
    return localStorage.getItem(DAILY_LIMIT_KEY);
  } catch (_error) {
    return null;
  }
}

function setStoredDate(value) {
  if (!DAILY_LIMIT_ENABLED) return;
  try {
    localStorage.setItem(DAILY_LIMIT_KEY, value);
  } catch (_error) {
    // ignore storage errors
  }
}

function isDailyLocked() {
  if (!DAILY_LIMIT_ENABLED) return false;
  return getStoredDate() === getTodayKey();
}

function updateDailyLimitUI() {
  const locked = isDailyLocked();
  dailyLimitBanner.classList.toggle("locked", locked);
  startBtn.classList.toggle("locked", locked);
  startBtn.disabled = locked;

  if (locked) {
    startBtn.textContent = "本日は診断済み";
    dailyLimitText.textContent = `本日の診断は完了しています。次回は ${getNextResetText()} 以降に利用できます。`;
  } else {
    startBtn.textContent = "今すぐ診断する";
    dailyLimitText.textContent = DAILY_LIMIT_ENABLED
      ? "この診断は1日1回までです（本日あと1回）。"
      : "この診断は1日1回までの制度です（現在は試験段階のため制限は停止中）。";
  }
}

function setScreen(name) {
  currentScreen = name;
  screens.forEach((screen) => {
    screen.classList.toggle("active", screen.dataset.screen === name);
  });
}

function openNoticeModal() {
  if (isDailyLocked()) {
    updateDailyLimitUI();
    return;
  }
  noticeModal.hidden = false;
  document.body.classList.add("modal-open");
  agreeCheck.checked = false;
  confirmNoticeBtn.disabled = true;
}

function closeNoticeModal() {
  noticeModal.hidden = true;
  document.body.classList.remove("modal-open");
}

function validateInput() {
  const hasPhoto = !preview.hidden && Boolean(preview.src);
  const hasName = userName.value.trim().length > 0;
  analyzeBtn.disabled = !(hasPhoto && hasName);
}

function updatePreview(file) {
  if (!file || !file.type.startsWith("image/")) return;
  const reader = new FileReader();
  reader.onload = () => {
    const src = String(reader.result);
    preview.src = src;
    preview.hidden = false;
    uploadGuide.hidden = true;
    analyzePreview.src = src;
    analyzePreview.hidden = false;
    analyzePlaceholder.hidden = true;
    validateInput();
  };
  reader.readAsDataURL(file);
}

function resetPhases() {
  phaseItems.forEach((li) => {
    li.classList.remove("current");
    li.classList.remove("done");
  });
}

function markPhase(progress) {
  const activeIndex = Math.min(
    phaseItems.length - 1,
    phaseScripts.findIndex((item) => progress <= item.limit)
  );

  phaseItems.forEach((li, index) => {
    li.classList.toggle("current", index === activeIndex);
    li.classList.toggle("done", index < activeIndex);
  });
  const script = phaseScripts[Math.max(0, activeIndex)];
  progressText.textContent = script.text;
}

function randomResult(name) {
  const pattern = pickRandom(resultPatterns);
  const score = randomInt(48, 83);
  const clean = randomInt(42, 98);
  const impact = randomInt(40, 98);
  const balance = randomInt(43, 97);

  return {
    name,
    score,
    rank: rankFromScore(score),
    type: pattern.type,
    comment: pattern.comment,
    tags: [...pattern.tags],
    clean,
    impact,
    balance,
    time: nowString(),
  };
}

function renderResult(result) {
  resultName.textContent = result.name;
  scoreNode.textContent = "0";
  if (scoreCircle) {
    scoreCircle.style.setProperty("--score-progress", "0");
  }
  rankNode.textContent = result.rank;
  typeNode.textContent = result.type;
  commentNode.textContent = result.comment;
  timestampNode.textContent = result.time;

  cleanVal.textContent = "0";
  impactVal.textContent = "0";
  balanceVal.textContent = "0";

  cleanBar.style.width = "0%";
  impactBar.style.width = "0%";
  balanceBar.style.width = "0%";

  animateNumber(0, result.score, 860, (value) => {
    scoreNode.textContent = String(value);
    if (scoreCircle) {
      scoreCircle.style.setProperty("--score-progress", String(value));
    }
  });

  animateNumber(0, result.clean, 920, (value) => {
    cleanVal.textContent = String(value);
    cleanBar.style.width = `${value}%`;
  });

  animateNumber(0, result.impact, 980, (value) => {
    impactVal.textContent = String(value);
    impactBar.style.width = `${value}%`;
  });

  animateNumber(0, result.balance, 1040, (value) => {
    balanceVal.textContent = String(value);
    balanceBar.style.width = `${value}%`;
  });

  tagsNode.innerHTML = "";
  result.tags.forEach((tag) => {
    const li = document.createElement("li");
    li.textContent = tag;
    tagsNode.appendChild(li);
  });
}

function setupResultGate() {
  resultUnlocked = false;
  if (resultGate) resultGate.hidden = false;
  if (resultCard) resultCard.hidden = true;
  if (resultActions) resultActions.hidden = true;
}

function revealResult() {
  if (!pendingResult || resultUnlocked) return;
  resultUnlocked = true;
  if (resultGate) resultGate.hidden = true;
  if (resultCard) resultCard.hidden = false;
  if (resultActions) resultActions.hidden = false;

  if (resultCard) resultCard.classList.remove("reveal");
  if (resultActions) resultActions.classList.remove("reveal");

  renderResult(pendingResult);

  requestAnimationFrame(() => {
    if (resultCard) resultCard.classList.add("reveal");
    if (resultActions) resultActions.classList.add("reveal");
  });
}

function runAnalysis() {
  if (isDailyLocked()) {
    setScreen("welcome");
    updateDailyLimitUI();
    return;
  }
  if (analyzing) return;
  const name = userName.value.trim();
  if (!name || preview.hidden) return;

  setScreen("analyze");
  analyzing = true;
  clearTimeout(progressTimer);
  resetPhases();
  phaseScripts = buildRandomPhaseScripts();
  progressFill.style.width = "1%";
  progressText.textContent = "初期化しています...";

  const minDuration = randomInt(14000, 24000);
  const maxDuration = minDuration + randomInt(7000, 13000);
  const startedAt = Date.now();
  let progress = 0;
  let finalized = false;

  function tick() {
    if (!analyzing) return;
    const elapsed = Date.now() - startedAt;
    const hardFinish = elapsed >= maxDuration;
    const canSoftFinish = elapsed >= minDuration && progress >= 97 && Math.random() < 0.34;

    if (hardFinish || canSoftFinish) {
      progress = 100;
    } else {
      let step = randomInt(1, 6);
      if (progress >= 86) step = randomInt(0, 3);
      if (elapsed > 3500 && Math.random() < 0.17) step = randomInt(0, 2);
      if (elapsed > 9000 && Math.random() < 0.12) step = 0;
      progress = Math.min(99, progress + step);
    }

    const displayProgress = Math.min(100, Math.floor(progress));
    progressFill.style.width = `${displayProgress}%`;
    markPhase(displayProgress);

    if (displayProgress >= 100 && !finalized) {
      finalized = true;
      clearTimeout(progressTimer);
      setStoredDate(getTodayKey());
      updateDailyLimitUI();
      pendingResult = randomResult(name);
      currentResult = pendingResult;
      setTimeout(() => {
        setupResultGate();
        setScreen("result");
        analyzing = false;
      }, 740);
      return;
    }

    progressTimer = setTimeout(tick, randomInt(70, 230));
  }

  tick();
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image load failed"));
    img.src = src;
  });
}

function canvasToBlob(canvas, type = "image/png", quality = 1) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("blob create failed"));
    }, type, quality);
  });
}

async function saveResult() {
  if (!currentResult) return;
  saveBtn.disabled = true;
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1350;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bg = ctx.createLinearGradient(0, 0, 1080, 1350);
    bg.addColorStop(0, "#fbefe7");
    bg.addColorStop(0.55, "#f6edf7");
    bg.addColorStop(1, "#ece8fb");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#e4d7f0";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(70, 70, 940, 1210, 40);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#2f2545";
    ctx.font = "700 58px 'M PLUS Rounded 1c'";
    ctx.fillText("CHARM SCOPE", 120, 160);
    ctx.font = "500 36px 'M PLUS Rounded 1c'";
    ctx.fillStyle = "#6b6188";
    ctx.fillText("顔タイプ診断結果", 120, 210);

    if (preview.src) {
      try {
        const photo = await loadImage(preview.src);
        const photoX = 120;
        const photoY = 255;
        const photoW = 340;
        const photoH = 340;
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(photoX, photoY, photoW, photoH, 24);
        ctx.clip();
        ctx.drawImage(photo, photoX, photoY, photoW, photoH);
        ctx.restore();
      } catch (_e) {
        // ignore photo draw failure
      }
    }

    ctx.fillStyle = "#3d315f";
    ctx.font = "700 44px 'M PLUS Rounded 1c'";
    ctx.fillText(`${currentResult.name} さん`, 500, 320);
    ctx.font = "700 70px 'M PLUS Rounded 1c'";
    ctx.fillStyle = "#c65a89";
    ctx.fillText(`偏差値 ${currentResult.score}`, 500, 400);
    ctx.font = "700 46px 'M PLUS Rounded 1c'";
    ctx.fillStyle = "#3d315f";
    ctx.fillText(currentResult.rank, 500, 470);
    ctx.font = "700 42px 'M PLUS Rounded 1c'";
    ctx.fillText(currentResult.type, 120, 675);

    ctx.fillStyle = "#625985";
    ctx.font = "500 30px 'M PLUS Rounded 1c'";
    const comment = currentResult.comment;
    const lines = [];
    let line = "";
    for (const char of comment) {
      const test = line + char;
      if (ctx.measureText(test).width > 820) {
        lines.push(line);
        line = char;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    lines.slice(0, 3).forEach((l, i) => ctx.fillText(l, 120, 735 + i * 44));

    const bars = [
      ["清潔感", currentResult.clean, 900],
      ["印象強度", currentResult.impact, 980],
      ["バランス", currentResult.balance, 1060],
    ];
    ctx.font = "600 28px 'M PLUS Rounded 1c'";
    bars.forEach(([label, value, y]) => {
      ctx.fillStyle = "#6e638f";
      ctx.fillText(`${label} ${value}`, 120, y);
      ctx.fillStyle = "#ece2fa";
      ctx.fillRect(320, y - 24, 560, 18);
      const gw = Math.round((560 * Number(value)) / 100);
      const grad = ctx.createLinearGradient(320, 0, 880, 0);
      grad.addColorStop(0, "#7eb8b7");
      grad.addColorStop(1, "#8b95dd");
      ctx.fillStyle = grad;
      ctx.fillRect(320, y - 24, gw, 18);
    });

    ctx.fillStyle = "#8e84af";
    ctx.font = "500 24px 'M PLUS Rounded 1c'";
    ctx.fillText(`生成時刻: ${currentResult.time}`, 120, 1170);

    const safeName = currentResult.name.replace(/[\\/:*?\"<>|]/g, "_");
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `charmscope_${safeName}_${stamp}.png`;
    const blob = await canvasToBlob(canvas, "image/png");
    const file = new File([blob], fileName, { type: "image/png" });

    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: "Charm Scope 診断結果",
        text: "診断結果画像を保存・共有できます。",
        files: [file],
      });
      saveBtn.textContent = "共有シートを開きました";
    } else {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      saveBtn.textContent = "画像を保存しました";
    }
  } catch (_error) {
    saveBtn.textContent = "保存に失敗";
  } finally {
    setTimeout(() => {
      saveBtn.textContent = "結果を画像で保存";
      saveBtn.disabled = false;
    }, 1400);
  }
}

async function shareSite() {
  const title = "Charm Scope | 顔タイプ診断アプリ";
  const text = "顔タイプ診断を試してみて。スマホで簡単に遊べるよ。";
  const url = window.location.href;
  let shared = false;

  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
      shared = true;
    } catch (_error) {
      // canceled or unsupported payload
    }
  }

  if (!shared) {
    try {
      await navigator.clipboard.writeText(url);
      shared = true;
      shareBtn.textContent = "URLをコピーしました";
      if (unlockShareBtn) unlockShareBtn.textContent = "URLをコピーしました";
      setTimeout(() => {
        shareBtn.textContent = "サイトをシェア";
        if (unlockShareBtn) unlockShareBtn.textContent = "共有して結果を表示";
      }, 1200);
    } catch (_error) {
      shareBtn.textContent = "共有に失敗";
      if (unlockShareBtn) unlockShareBtn.textContent = "共有に失敗";
      setTimeout(() => {
        shareBtn.textContent = "サイトをシェア";
        if (unlockShareBtn) unlockShareBtn.textContent = "共有して結果を表示";
      }, 1200);
      return;
    }
  }

  if (shared) {
    revealResult();
    if (unlockShareBtn) unlockShareBtn.textContent = "結果を表示しました";
  }
}

startBtn.addEventListener("click", openNoticeModal);
cancelNoticeBtn.addEventListener("click", closeNoticeModal);
noticeModal.addEventListener("click", (event) => {
  if (event.target === noticeModal) closeNoticeModal();
});

agreeCheck.addEventListener("change", () => {
  confirmNoticeBtn.disabled = !agreeCheck.checked;
});

confirmNoticeBtn.addEventListener("click", () => {
  closeNoticeModal();
  if (isDailyLocked()) {
    updateDailyLimitUI();
    return;
  }
  setScreen("photo");
});

backToWelcomeBtn.addEventListener("click", () => {
  setScreen("welcome");
});

photoInput.addEventListener("change", (event) => {
  updatePreview(event.target.files?.[0]);
});

["dragenter", "dragover"].forEach((name) => {
  uploadArea.addEventListener(name, (event) => {
    event.preventDefault();
    uploadArea.classList.add("dragging");
  });
});

["dragleave", "drop"].forEach((name) => {
  uploadArea.addEventListener(name, (event) => {
    event.preventDefault();
    uploadArea.classList.remove("dragging");
  });
});

uploadArea.addEventListener("drop", (event) => {
  updatePreview(event.dataTransfer?.files?.[0]);
});

userName.addEventListener("input", validateInput);
analyzeBtn.addEventListener("click", runAnalysis);
saveBtn.addEventListener("click", saveResult);
shareBtn.addEventListener("click", shareSite);
if (unlockShareBtn) unlockShareBtn.addEventListener("click", shareSite);

setScreen("welcome");
validateInput();
updateDailyLimitUI();
