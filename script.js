// ===== 1. הגדרות ומשתמשים =====
// כדי לשנות שם - מחליפים את הטקסט בתוך המירכאות
const USERS = {
  omri: "עומרי",
  wife: "איליי"};

// מי המשתמש הפעיל (האפליקציה זוכרת מי השתמש אחרון)
let USER = localStorage.getItem("currentUser") || "omri";
let currentTab = "workout";

// ===== 2. רשימת התרגילים (ברירת המחדל של עומרי) =====
// min = מינימום חזרות, max = מקסימום חזרות, step = בכמה ק״ג להעלות
// null = אין מספר קבוע (כמה שיותר)
const DEFAULT_EXERCISES = {
  "מתח רחב":                  { min: null, max: 12, step: 2.5 },
  "מתח צר":                   { min: 10, max: 12, step: 2.5 },
  "חתירה בעמידה":             { min: 8,  max: 10, step: 2 },
  "פשיטות גב בכיסא רומי":     { min: 12, max: 15, step: 2 },
  "לחיצת חזה בשיפוע נייטרלי": { min: 10, max: 12, step: 2 },
  "לחיצת חזה בשיפוע חיובי":   { min: 10, max: 12, step: 2 },
  "לחיצת חזה בשיפוע שלילי":   { min: 10, max: 12, step: 2 },
  "פרפר בשיפוע נייטרלי":      { min: 10, max: 12, step: 1 },
  "שכיבות סמיכה":             { min: null, max: null, step: 0 },
  "לאנצים (לכל רגל)":         { min: 10, max: 12, step: 2 },
  "תאומים במדרגה":            { min: 15, max: 20, step: 2 },
  "לחיצת כתף":                { min: 8,  max: 10, step: 2 },
  "הרחקה לצדדים":             { min: 10, max: 12, step: 1 },
  "כתף אחורית על ספסל":       { min: 10, max: 12, step: 1 },
  "כפיפת מרפקים":             { min: 10, max: 12, step: 1 },
  "פטישים":                   { min: 10, max: 12, step: 1 },
  "לחיצה צרפתית":             { min: 10, max: 12, step: 1 },
  "משקולת מאחורי הראש":       { min: 10, max: 12, step: 1 }
};

// ===== 3. התוכנית (ברירת המחדל של עומרי) =====
const DEFAULT_PROGRAM = {
  A: ["מתח רחב", "לחיצת חזה בשיפוע נייטרלי", "חתירה בעמידה", "פרפר בשיפוע נייטרלי",
      "לאנצים (לכל רגל)", "לחיצת כתף", "הרחקה לצדדים", "תאומים במדרגה",
      "כפיפת מרפקים", "לחיצה צרפתית"],
  B: ["מתח צר", "לחיצת חזה בשיפוע חיובי", "פשיטות גב בכיסא רומי", "שכיבות סמיכה",
      "לאנצים (לכל רגל)", "הרחקה לצדדים", "כתף אחורית על ספסל", "תאומים במדרגה",
      "פטישים", "משקולת מאחורי הראש"],
  C: ["מתח רחב", "לחיצת חזה בשיפוע שלילי", "חתירה בעמידה", "שכיבות סמיכה",
      "לאנצים (לכל רגל)", "לחיצת כתף", "כתף אחורית על ספסל", "תאומים במדרגה",
      "כפיפת מרפקים", "לחיצה צרפתית"]
};

// ===== 4. שמירה וטעינה מהזיכרון של הדפדפן =====
function loadData() {
  return JSON.parse(localStorage.getItem("fitness_" + USER)) || { logs: {} };
}

function saveData(data) {
  localStorage.setItem("fitness_" + USER, JSON.stringify(data));
}

// התוכנית של המשתמש: אם נערכה - מהזיכרון, אחרת ברירת המחדל
function getProgram() {
  const data = loadData();
  if (data.program) return data.program;
  return USER === "omri" ? JSON.parse(JSON.stringify(DEFAULT_PROGRAM)) : {};
}

function getExercises() {
  const data = loadData();
  if (data.exercises) return data.exercises;
  return USER === "omri" ? JSON.parse(JSON.stringify(DEFAULT_EXERCISES)) : {};
}

function saveProgram(program, exList) {
  const data = loadData();
  data.program = program;
  data.exercises = exList;
  saveData(data);
}

function getLastLog(name) {
  const logs = loadData().logs[name];
  return logs ? logs[logs.length - 1] : null;
}

// ===== 5. ההמלצה לאימון הבא =====
function recommendation(ex, last) {
  if (!last) {
    if (ex.min) return "פעם ראשונה: התחל ב-" + ex.min + " חזרות בכל סט";
    return "פעם ראשונה: עשה כמה שיותר חזרות בכל סט";
  }

  const lastText = "בפעם הקודמת: " + last.weight + " ק״ג × " + last.reps.join(" / ");
  const total = last.reps.reduce((a, b) => a + b, 0);

  if (!ex.max) {
    return lastText + "<br>🎯 נסה לעבור " + total + " חזרות בסך הכול";
  }
  if (last.reps.every(r => r >= ex.max)) {
    return lastText + "<br>🔥 הגעת למקסימום! עלה ל-" + (last.weight + ex.step) +
           " ק״ג והתחל שוב מ-" + (ex.min || "כמה שיותר") + " חזרות";
  }
  if (last.difficulty >= 10) {
    return lastText + "<br>😮‍💨 היה קשה מאוד – חזור על אותו משקל ואותן חזרות";
  }
  return lastText + "<br>⬆️ אותו משקל, נסה להוסיף חזרה בכל סט (עד " + ex.max + ")";
}

function targetText(ex) {
  if (!ex.max) return "3 סטים × מקסימום חזרות";
  if (!ex.min) return "3 סטים × מקסימום (יעד " + ex.max + ")";
  return "3 סטים × " + ex.min + "–" + ex.max + " חזרות";
}

function suggestedWeight(ex, last) {
  if (!last) return "";
  if (ex.max && last.reps.every(r => r >= ex.max)) return last.weight + ex.step;
  return last.weight;
}

// ===== 6. הצגת התרגילים של אימון =====
function renderWorkout(letter) {
  const list = document.getElementById("exerciseList");
  list.innerHTML = "";

  const program = getProgram();
  const exList = getExercises();

  (program[letter] || []).forEach((name, i) => {
    const ex = exList[name] || { min: null, max: null, step: 2 };
    const last = getLastLog(name);

    const card = document.createElement("div");
    card.className = "exercise-card";
    card.innerHTML = `
      <h3>${i + 1}. ${name}</h3>
      <p class="target">${targetText(ex)}</p>
      <p class="tip">${recommendation(ex, last)}</p>
      <div class="sets">
        <input type="number" id="w${i}" placeholder="ק״ג" value="${suggestedWeight(ex, last)}">
        <input type="number" id="r${i}-0" placeholder="סט 1">
        <input type="number" id="r${i}-1" placeholder="סט 2">
        <input type="number" id="r${i}-2" placeholder="סט 3">
      </div>
      <input type="number" id="d${i}" min="1" max="10" placeholder="רמת קושי 1-10">
      <button onclick="saveExercise('${letter}', ${i})">שמור תרגיל</button>
      <p class="msg" id="m${i}"></p>
    `;
    list.appendChild(card);
  });
}

// ===== 7. שמירת תרגיל =====
// שמירת רישום אחד (משמש גם את התוכנית של עומרי וגם את האימון החופשי)
function addLog(name, weight, reps, difficulty) {
  const data = loadData();
  if (!data.logs[name]) data.logs[name] = [];
  data.logs[name].push({
    date: new Date().toLocaleDateString("he-IL"),
    time: Date.now(),
    weight: weight,
    reps: reps,
    difficulty: difficulty
  });
  saveData(data);
    startRest(getRestSeconds());   // מפעיל את טיימר המנוחה
}

function saveExercise(letter, i) {
  const name = getProgram()[letter][i];
  const weight = Number(document.getElementById("w" + i).value) || 0;
  const reps = [0, 1, 2].map(s => Number(document.getElementById("r" + i + "-" + s).value) || 0);
  const difficulty = Number(document.getElementById("d" + i).value) || 0;
  const msg = document.getElementById("m" + i);

  if (reps.every(r => r === 0)) {
    msg.textContent = "⚠️ צריך למלא חזרות לפחות בסט אחד";
    return;
  }

  addLog(name, weight, reps, difficulty);
  msg.textContent = "✅ נשמר!";
}

// ===== 8. מעבר בין הלשוניות =====
function showTab(id) {
  currentTab = id;
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  if (id === "history") renderHistory();
  if (id === "body") renderBody();
  if (id === "nutrition") showNutrition();
    if (id === "nutrition") renderMenu();
    if (id === "diary") showDiary();
  document.querySelectorAll(".menu button").forEach(b => {
    b.classList.toggle("active", b.dataset.tab === id);
  });
}

document.querySelectorAll(".menu button").forEach(b => {
  b.addEventListener("click", () => showTab(b.dataset.tab));
});

// ===== 9. בחירת אימון (A / B / C ...) =====
let currentWorkout = null;

function renderPicker() {
  const box = document.getElementById("workoutPicker");
  box.innerHTML = "";
  Object.keys(getProgram()).forEach(letter => {
    const b = document.createElement("button");
    b.className = "pick" + (letter === currentWorkout ? " active" : "");
    b.textContent = "אימון " + letter;
    b.addEventListener("click", () => {
      currentWorkout = letter;
      renderPicker();
      renderWorkout(letter);
    });
    box.appendChild(b);
  });
}

// ===== 10. היסטוריה והתקדמות =====
let historyCharts = [];   // הגרפים שמוצגים כרגע

function score(log) {
  const total = log.reps.reduce((a, b) => a + b, 0);
  return log.weight > 0 ? log.weight * total : total;
}

function logText(log) {
  return (log.weight > 0 ? log.weight + " ק״ג × " : "") + log.reps.join("/");
}

// אחוז שינוי בין שני ערכים
function pct(before, now) {
  return before > 0 ? Math.round((now - before) / before * 100) : 0;
}
function pctText(p) {
  return (p > 0 ? "+" : "") + p + "%";
}
function pctClass(p) {
  return p > 0 ? "up" : p < 0 ? "down" : "";
}

// תאריך קצר לגרף (24.11)
function shortDate(d) {
  return d.split(".").slice(0, 2).join(".");
}

function renderHistory() {
  const data = loadData();
  const box = document.getElementById("historyContent");
  const names = Object.keys(data.logs);

  historyCharts.forEach(c => c.destroy());
  historyCharts = [];

  if (names.length === 0) {
    box.innerHTML = "<p class='target'>עוד אין אימונים שמורים</p>";
    return;
  }

  const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
  let rows = "";
  let details = "";

  names.forEach((name, n) => {
    const logs = data.logs[name];
    const now = logs[logs.length - 1];
    const before = logs.filter(l => l.time && l.time <= twoWeeksAgo).pop() || logs[0];
    const twoWeeks = pct(score(before), score(now));

    rows += `<tr>
      <td>${name}</td>
      <td>${logText(before)}</td>
      <td>${logText(now)}</td>
      <td class="${pctClass(twoWeeks)}">${pctText(twoWeeks)}</td>
    </tr>`;

    // אחוזים: מההתחלה ומהפעם הקודמת + שיא
    const fromStart = pct(score(logs[0]), score(now));
    const prev = logs.length > 1 ? logs[logs.length - 2] : null;
    const fromPrev = prev ? pct(score(prev), score(now)) : 0;
    const maxWeight = Math.max(...logs.map(l => l.weight));
    const best = maxWeight > 0
      ? maxWeight + " ק״ג"
      : Math.max(...logs.map(l => l.reps.reduce((a, b) => a + b, 0))) + " חזרות";

    // כל שורה מקבלת כפתור מחיקה. החדשה ביותר מופיעה למעלה
    let logRows = "";
    logs.forEach((l, index) => {
      logRows = `<tr>
        <td>${l.date}</td>
        <td>${l.weight}</td>
        <td>${l.reps.join("/")}</td>
        <td>${l.difficulty || "-"}</td>
        <td><button class="del" onclick="deleteLog('${name}', ${index})">🗑</button></td>
      </tr>` + logRows;
    });

    details += `<details data-ex="${n}">
      <summary>${name}</summary>
      <div class="progress-row">
        <div class="progress-pill">מההתחלה<b class="${pctClass(fromStart)}">${pctText(fromStart)}</b></div>
        <div class="progress-pill">מהפעם הקודמת<b class="${pctClass(fromPrev)}">${prev ? pctText(fromPrev) : "-"}</b></div>
        <div class="progress-pill">שיא<b>${best}</b></div>
      </div>
      <canvas class="ex-chart"></canvas>
      <table>
        <tr><th>תאריך</th><th>ק״ג</th><th>חזרות</th><th>קושי</th><th></th></tr>
        ${logRows}
      </table>
    </details>`;
  });

  box.innerHTML = `
    <h3>סיכום התקדמות</h3>
    <div class="table-wrap">
      <table>
        <tr><th>תרגיל</th><th>לפני שבועיים</th><th>עכשיו</th><th>התקדמות</th></tr>
        ${rows}
      </table>
    </div>
    <p class="target">* ההתקדמות מחושבת לפי משקל × סך החזרות. אם עוד לא עברו שבועיים, מוצג האימון הראשון.</p>
    <h3>היסטוריה מלאה</h3>
    ${details}
  `;

  // הגרף של כל תרגיל נבנה רק כשפותחים אותו
  box.querySelectorAll("details[data-ex]").forEach(d => {
    d.addEventListener("toggle", () => {
      if (d.open && !d.dataset.drawn) {
        d.dataset.drawn = "1";
        drawExerciseChart(d.querySelector("canvas"), data.logs[names[d.dataset.ex]]);
      }
    });
  });
}

// גרף התקדמות של תרגיל
function drawExerciseChart(canvas, logs) {
  const base = score(logs[0]);
  const chart = new Chart(canvas, {
    type: "line",
    data: {
      labels: logs.map(l => shortDate(l.date)),
      datasets: [{
        data: logs.map(l => score(l)),
        borderColor: "#4ade80",
        backgroundColor: "rgba(74, 222, 128, 0.15)",
        fill: true,
        tension: 0.3,
        pointRadius: 4
      }]
    },
    options: {
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            // בלחיצה על נקודה: משקל × חזרות + אחוז מההתחלה
            label: ctx => {
              const l = logs[ctx.dataIndex];
              return logText(l) + " (" + pctText(pct(base, score(l))) + ")";
            }
          }
        }
      },
      scales: {
        x: { ticks: { color: "#9ca3af" } },
        y: { ticks: { color: "#9ca3af" } }
      }
    }
  });
  historyCharts.push(chart);
}

// מחיקת רישום של תרגיל
function deleteLog(name, index) {
  if (!confirm("למחוק את הרישום הזה?")) return;
  const data = loadData();
  data.logs[name].splice(index, 1);
  if (data.logs[name].length === 0) delete data.logs[name];
  saveData(data);
  renderHistory();
}

// ===== 11. משקל גוף =====
// התאריך של היום בפורמט שהשדה מבין (2026-11-23)
function todayISO() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

// תאריך יפה לתצוגה (23/11/2026)
function niceDate(iso) {
  return iso.split("-").reverse().join("/");
}

document.getElementById("bodyDate").value = todayISO();

document.getElementById("saveBody").addEventListener("click", () => {
  const date = document.getElementById("bodyDate").value;
  const weight = Number(document.getElementById("bodyWeight").value);
  const msg = document.getElementById("bodyMsg");

  if (!date || !weight) {
    msg.textContent = "⚠️ צריך למלא תאריך ומשקל";
    return;
  }

  const data = loadData();
  if (!data.body) data.body = [];
  data.body = data.body.filter(b => b.date !== date); // שקילה אחת ליום - החדשה מחליפה
  data.body.push({ date: date, weight: weight });
  data.body.sort((a, b) => a.date.localeCompare(b.date));
  saveData(data);

  msg.textContent = "✅ נשמר!";
  document.getElementById("bodyWeight").value = "";
  document.getElementById("bodyDate").value = todayISO();
  renderBody();
});

let bodyChart = null;

function renderBody() {
  const body = loadData().body || [];
  const stats = document.getElementById("bodyStats");
  const list = document.getElementById("bodyHistory");

  if (bodyChart) {
    bodyChart.destroy();
    bodyChart = null;
  }

  if (body.length === 0) {
    stats.innerHTML = "<p class='target'>עוד אין שקילות</p>";
    list.innerHTML = "";
    return;
  }

  // נתונים וקצב
  const first = body[0];
  const last = body[body.length - 1];
  const days = (new Date(last.date) - new Date(first.date)) / 86400000;
  const change = last.weight - first.weight;

  let rate = "<p class='target'>הקצב יוצג אחרי שבוע של שקילות</p>";
  if (days >= 7) {
    const perMonth = change / days * 30;
    const perWeekPct = change / first.weight / days * 7 * 100;
    rate = `<p>קצב: <b>${perMonth > 0 ? "+" : ""}${perMonth.toFixed(2)} ק״ג לחודש</b>
            (${perWeekPct > 0 ? "+" : ""}${perWeekPct.toFixed(2)}% בשבוע)</p>`;
  }

  stats.innerHTML = `
    <p>משקל נוכחי: <b>${last.weight} ק״ג</b></p>
    <p>שינוי מההתחלה: ${change > 0 ? "+" : ""}${change.toFixed(1)} ק״ג</p>
    ${rate}
  `;

  // גרף
  bodyChart = new Chart(document.getElementById("bodyChart"), {
    type: "line",
    data: {
      labels: body.map(b => niceDate(b.date).slice(0, 5)),
      datasets: [{
        data: body.map(b => b.weight),
        borderColor: "#4ade80",
        backgroundColor: "rgba(74, 222, 128, 0.15)",
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: "#9ca3af" } },
        y: { ticks: { color: "#9ca3af" } }
      }
    }
  });

  // רשימת שקילות עם מחיקה
  list.innerHTML = "";
  body.slice().reverse().forEach(b => {
    list.innerHTML += `<li>
      <span>${niceDate(b.date)}</span>
      <span>${b.weight} ק״ג</span>
      <button class="del" onclick="deleteBody('${b.date}')">🗑</button>
    </li>`;
  });
}

function deleteBody(date) {
  if (!confirm("למחוק את השקילה הזאת?")) return;
  const data = loadData();
  data.body = data.body.filter(b => b.date !== date);
  saveData(data);
  renderBody();
}

// ===== 12. תזונה =====
const nutritionFields = ["sex", "age", "height", "nWeight", "activity", "goal"];

// כשנכנסים ללשונית: ממלאים את מה ששמרת, והמשקל נלקח מהשקילה האחרונה
function showNutrition() {
  const data = loadData();
  const p = data.profile;
  if (p) {
    nutritionFields.forEach(f => {
      if (p[f]) document.getElementById(f).value = p[f];
    });
  }
  else {
    // משתמש חדש - מנקים את השדות
    ["age", "height", "nWeight"].forEach(f => document.getElementById(f).value = "");
    document.getElementById("calResult").innerHTML = "";
  }
  const body = data.body || [];
  if (body.length > 0) {
    document.getElementById("nWeight").value = body[body.length - 1].weight;
  }
  if (p) calculateNutrition();
}

document.getElementById("calcBtn").addEventListener("click", calculateNutrition);

function calculateNutrition() {
  const p = {};
  nutritionFields.forEach(f => p[f] = document.getElementById(f).value);

  const age = Number(p.age);
  const height = Number(p.height);
  const weight = Number(p.nWeight);
  const activity = Number(p.activity);
  const box = document.getElementById("calResult");

  if (!age || !height || !weight) {
    box.innerHTML = "<p class='msg'>⚠️ צריך למלא גיל, גובה ומשקל</p>";
    return;
  }

  // שומרים את התשובות לשאלון
  const data = loadData();
  data.profile = p;
  saveData(data);

  // BMI
  const bmi = weight / Math.pow(height / 100, 2);
  let bmiText = "השמנה";
  if (bmi < 18.5) bmiText = "תת משקל";
  else if (bmi < 25) bmiText = "תקין";
  else if (bmi < 30) bmiText = "עודף משקל";

  // BMR - נוסחת Mifflin-St Jeor
  const bmr = 10 * weight + 6.25 * height - 5 * age + (p.sex === "male" ? 5 : -161);

  // קלוריות נטרליות (שמירה על המשקל)
  const tdee = bmr * activity;

  // 1 ק״ג במשקל הגוף ≈ 7,700 קלוריות
  let change, target, processText, protein, fat;

  if (p.goal === "bulk") {
    const minSurplus = 0.5 * 7700 / 30;   // 0.5 ק״ג בחודש
    const maxSurplus = 1.5 * 7700 / 30;   // 1.5 ק״ג בחודש
    change = 1 * 7700 / 30;               // אמצע הטווח: 1 ק״ג בחודש
    target = tdee + change;
    processText = `
      <p>💪 <b>מסה</b>: עודף קלורי של <b>${Math.round(minSurplus)}–${Math.round(maxSurplus)}</b> קלוריות ביום
      (עלייה של 0.5–1.5 ק״ג בחודש)</p>
      <p>מומלץ להתחיל באמצע: <b>+${Math.round(change)}</b> קלוריות ביום (כ-1 ק״ג בחודש)</p>`;
    protein = 2 * weight;
    fat = 1 * weight;
  } else {
    change = weight * 0.005 * 7700 / 7;   // 0.5% ממשקל הגוף בשבוע
    target = tdee - change;
    processText = `
      <p>🔥 <b>חיטוב</b>: גירעון קלורי של <b>${Math.round(change)}</b> קלוריות ביום</p>
      <p>ירידה של 0.5% ממשקל הגוף בשבוע (כ-${(weight * 0.005).toFixed(2)} ק״ג)</p>`;
    protein = 2.2 * weight;
    fat = 0.8 * weight;
  }

  // פחמימות = מה שנשאר (חלבון ופחמימה 4 קל׳ לגרם, שומן 9)
  const carbs = (target - protein * 4 - fat * 9) / 4;

  box.innerHTML = `
    <div class="result-box">
      <p>BMI: <b>${bmi.toFixed(1)}</b> (${bmiText})</p>
      <p class="target">* BMI לא מבדיל בין שריר לשומן, ולכן הוא רק מידע כללי</p>
      <p>BMR (מנוחה מלאה): <b>${Math.round(bmr)}</b> קלוריות</p>
      <p>קלוריות נטרליות (שמירה על המשקל): <b>${Math.round(tdee)}</b></p>
    </div>

    <div class="result-box">
      ${processText}
      <p>היעד היומי שלך:</p>
      <p class="big">${Math.round(target)} קלוריות</p>
      <div class="macros">
        <div class="macro"><b>${Math.round(protein)} ג׳</b><br>חלבון</div>
        <div class="macro"><b>${Math.round(carbs)} ג׳</b><br>פחמימה</div>
        <div class="macro"><b>${Math.round(fat)} ג׳</b><br>שומן</div>
      </div>
    </div>

    ${rateCheck(p.goal)}
  `;
}

// בדיקה: האם הקצב האמיתי מהשקילות מתאים ליעד
function rateCheck(goal) {
  const body = loadData().body || [];
  if (body.length < 2) return "";

  const first = body[0];
  const last = body[body.length - 1];
  const days = (new Date(last.date) - new Date(first.date)) / 86400000;

  if (days < 14) {
    return "<div class='result-box'><p class='target'>אחרי שבועיים של שקילות האפליקציה תבדוק אם הקצב שלך מתאים ליעד</p></div>";
  }

  const change = last.weight - first.weight;
  const perMonth = change / days * 30;
  const perWeekPct = change / first.weight / days * 7 * 100;
  let advice;

  if (goal === "bulk") {
    if (perMonth < 0.5) advice = "🐢 עולה לאט מדי – הוסף 100–150 קלוריות ביום";
    else if (perMonth > 1.5) advice = "🚀 עולה מהר מדי – הורד 100–150 קלוריות ביום";
    else advice = "✅ הקצב מצוין, תמשיך ככה";
    return `<div class="result-box"><p>הקצב שלך בפועל: <b>${perMonth > 0 ? "+" : ""}${perMonth.toFixed(2)} ק״ג לחודש</b></p><p>${advice}</p></div>`;
  }

  if (perWeekPct > -0.3) advice = "🐢 יורד לאט מדי – הורד 100–200 קלוריות ביום";
  else if (perWeekPct < -0.8) advice = "🚀 יורד מהר מדי – הוסף 100–200 קלוריות ביום";
  else advice = "✅ הקצב מצוין, תמשיך ככה";
  return `<div class="result-box"><p>הקצב שלך בפועל: <b>${perWeekPct.toFixed(2)}% בשבוע</b></p><p>${advice}</p></div>`;
}

// ===== 13. אימון חופשי (למשתמש בלי תוכנית קבועה) =====
function renderFreeWorkout() {
  const data = loadData();

  // השלמה אוטומטית של שמות תרגילים שכבר נשמרו
  const datalist = document.getElementById("freeNames");
  datalist.innerHTML = "";
  Object.keys(data.logs).forEach(name => {
    datalist.innerHTML += `<option value="${name}">`;
  });

  // מה נשמר היום
  const today = new Date().toLocaleDateString("he-IL");
  const list = document.getElementById("freeToday");
  list.innerHTML = "";
  Object.keys(data.logs).forEach(name => {
    data.logs[name].filter(l => l.date === today).forEach(l => {
      list.innerHTML += `<li><b>${name}</b>: ${logText(l)}</li>`;
    });
  });
  if (list.innerHTML === "") list.innerHTML = "<li class='target'>עוד לא נשמרו תרגילים היום</li>";
}

// כשמקלידים שם תרגיל - מציגים מה היה בפעם הקודמת
document.getElementById("freeName").addEventListener("input", () => {
  const name = document.getElementById("freeName").value.trim();
  const last = getLastLog(name);
  const tip = document.getElementById("freeTip");
  if (last) {
    tip.innerHTML = recommendation({ min: null, max: null }, last);
    document.getElementById("freeW").value = last.weight;
  } else {
    tip.innerHTML = "";
  }
});

document.getElementById("freeSave").addEventListener("click", () => {
  const name = document.getElementById("freeName").value.trim();
  const weight = Number(document.getElementById("freeW").value) || 0;
  const reps = [0, 1, 2].map(s => Number(document.getElementById("freeR" + s).value) || 0);
  const difficulty = Number(document.getElementById("freeD").value) || 0;
  const msg = document.getElementById("freeMsg");

  if (!name) {
    msg.textContent = "⚠️ צריך לכתוב שם תרגיל";
    return;
  }
  if (reps.every(r => r === 0)) {
    msg.textContent = "⚠️ צריך למלא חזרות לפחות בסט אחד";
    return;
  }

  addLog(name, weight, reps, difficulty);
  msg.textContent = "✅ נשמר!";

  // מנקים את הטופס לתרגיל הבא
  ["freeName", "freeW", "freeR0", "freeR1", "freeR2", "freeD"].forEach(id => {
    document.getElementById(id).value = "";
  });
  document.getElementById("freeTip").innerHTML = "";
  renderFreeWorkout();
});

// ===== 14. החלפת משתמש =====
function renderUserSwitch() {
  const box = document.getElementById("userSwitch");
  box.innerHTML = "";
  Object.keys(USERS).forEach(id => {
    const b = document.createElement("button");
    b.textContent = USERS[id];
    if (id === USER) b.classList.add("active");
    b.addEventListener("click", () => switchUser(id));
    box.appendChild(b);
  });
}

// מי שיש לו תוכנית - רואה אותה. מי שאין - אימון חופשי
function setupWorkoutTab() {
  const hasProgram = Object.keys(getProgram()).length > 0;
  document.getElementById("programWorkout").style.display = hasProgram ? "block" : "none";
  document.getElementById("freeWorkout").style.display = hasProgram ? "none" : "block";
  document.getElementById("exerciseList").innerHTML = "";
  document.getElementById("editProgramBtn").textContent = hasProgram ? "✏️ עריכת תוכנית" : "✏️ בניית תוכנית קבועה";
  currentWorkout = null;
  renderPicker();
  closeEditor();
  if (!hasProgram) renderFreeWorkout();
}

function switchUser(id) {
  USER = id;
  localStorage.setItem("currentUser", id);
  renderUserSwitch();
  setupWorkoutTab();
  showTab(currentTab);
}
// ===== 16. מאגר המזונות (ערכים ל-100 גרם) =====
// group: protein / carb / fat / veg   kashrut: meat = בשרי, dairy = חלבי, parve = פרווה
// kcal = קלוריות, p = חלבון, c = פחמימה, f = שומן (בגרמים, ל-100 גרם)
// hint = טיפ שמופיע כשבוחרים את המזון
const foods100 = [
  // --- חלבון ---
  { name: "חזה עוף (מבושל)",       group: "protein", kashrut: "meat",  kcal: 165, p: 31,  c: 0,   f: 3.6 },
  { name: "פרגיות (מבושלות)",      group: "protein", kashrut: "meat",  kcal: 200, p: 27,  c: 0,   f: 10 },
  { name: "בשר אדום טחון (מבושל)", group: "protein", kashrut: "meat",  kcal: 250, p: 26,  c: 0,   f: 15 },
  { name: "טונה במים (מסוננת)",    group: "protein", kashrut: "parve", kcal: 116, p: 26,  c: 0,   f: 1 },
  { name: "ביצה",                  group: "protein", kashrut: "parve", kcal: 143, p: 12.6, c: 0.7, f: 9.5, hint: "ביצה אחת ≈ 50 גרם" },
  { name: "קוטג׳ 5%",              group: "protein", kashrut: "dairy", kcal: 97,  p: 11,  c: 3,   f: 5,   hint: "גביע ≈ 250 גרם" },
  { name: "בולגרית 5%",            group: "protein", kashrut: "dairy", kcal: 110, p: 16,  c: 1,   f: 5 },
  { name: "יוגורט חלבון",          group: "protein", kashrut: "dairy", kcal: 60,  p: 10,  c: 3.5, f: 0.7, hint: "גביע ≈ 200 גרם. כדאי לבדוק בתווית" },
  { name: "משקה חלבון",            group: "protein", kashrut: "dairy", kcal: 46,  p: 7,   c: 3,   f: 0.6, hint: "בקבוק ≈ 350 מ״ל. כדאי לבדוק בתווית" },

  // --- פחמימה ---
  { name: "אורז לבן (מבושל)",      group: "carb",    kashrut: "parve", kcal: 130, p: 2.7, c: 28,  f: 0.3 },
  { name: "פסטה (מבושלת)",         group: "carb",    kashrut: "parve", kcal: 158, p: 5.8, c: 31,  f: 0.9 },
  { name: "תפוח אדמה (מבושל)",     group: "carb",    kashrut: "parve", kcal: 87,  p: 1.9, c: 20,  f: 0.1 },
  { name: "פיתה",                  group: "carb",    kashrut: "parve", kcal: 270, p: 9,   c: 55,  f: 1.2, hint: "פיתה ≈ 100 גרם" },
  { name: "פיתה כוסמין",           group: "carb",    kashrut: "parve", kcal: 250, p: 10,  c: 47,  f: 2,   hint: "פיתה ≈ 90 גרם" },
  { name: "לחם",                   group: "carb",    kashrut: "parve", kcal: 250, p: 8.5, c: 47,  f: 3,   hint: "פרוסה ≈ 30 גרם" },

  // --- שומן ---
  { name: "טחינה גולמית",          group: "fat",     kashrut: "parve", kcal: 640, p: 18,  c: 10,  f: 57,  hint: "כף ≈ 15 גרם" },
  { name: "אבוקדו",                group: "fat",     kashrut: "parve", kcal: 160, p: 2,   c: 8.5, f: 15 },
  { name: "שמן זית",               group: "fat",     kashrut: "parve", kcal: 884, p: 0,   c: 0,   f: 100, hint: "כף ≈ 13 גרם, כפית ≈ 5 גרם" },
  { name: "אגוזי מלך",             group: "fat",     kashrut: "parve", kcal: 654, p: 15,  c: 14,  f: 65 },

  // --- ירקות ---
  { name: "סלט ירקות",             group: "veg",     kashrut: "parve", kcal: 20,  p: 1,   c: 4,   f: 0.2 }
];

const groupNames = {
  protein: "🍗 חלבון",
  carb: "🍚 פחמימה",
  fat: "🥑 שומן",
  veg: "🥗 ירקות",
  custom: "⭐ מזונות שהוספתם"
};
const kashrutLabels = { meat: "🥩", dairy: "🥛", parve: "" };

// מזונות שהוספתם בעצמכם (משותפים לכל המשתמשים)
function loadCustomFoods() {
  return JSON.parse(localStorage.getItem("fitness_custom_foods")) || [];
}

function allFoods() {
  return foods100.concat(loadCustomFoods());
}

function findFood(name) {
  return allFoods().find(f => f.name === name);
}

// הצגת המאגר בלשונית התזונה
function renderFoods() {
  const box = document.getElementById("foodList");
  const list = allFoods();
  let html = "";

  Object.keys(groupNames).forEach(g => {
    const items = list.filter(f => f.group === g);
    if (items.length === 0) return;
    let rows = "";
    items.forEach(f => {
      rows += `<tr>
        <td>${f.name} ${kashrutLabels[f.kashrut] || ""}</td>
        <td>${f.kcal}</td>
        <td>${f.p}</td>
        <td>${f.c}</td>
        <td>${f.f}</td>
      </tr>`;
    });

    html += `<details>
      <summary>${groupNames[g]}</summary>
      <div class="table-wrap">
        <table>
          <tr><th>מזון</th><th>קל׳</th><th>חלבון</th><th>פחמ׳</th><th>שומן</th></tr>
          ${rows}
        </table>
      </div>
    </details>`;
  });

  box.innerHTML = html +
    "<p class='target'>🥩 בשרי · 🥛 חלבי<br>* הערכים הם הערכה. במוצרים ארוזים כדאי לבדוק בתווית.</p>";
}

// ===== 17. יומן אכילה =====
const MEALS = ["בוקר", "ביניים", "לפני אימון", "ערב (כולל אחרי אימון)"];

// היעדים היומיים לפי השאלון בלשונית התזונה
function getTargets() {
  const data = loadData();
  const p = data.profile;
  if (!p) return null;

  const body = data.body || [];
  const weight = body.length ? body[body.length - 1].weight : Number(p.nWeight);
  const bmr = 10 * weight + 6.25 * Number(p.height) - 5 * Number(p.age) + (p.sex === "male" ? 5 : -161);
  const tdee = bmr * Number(p.activity);

  let kcal, protein, fat;
  if (p.goal === "bulk") {
    kcal = tdee + 7700 / 30;
    protein = 2 * weight;
    fat = 1 * weight;
  } else {
    kcal = tdee - weight * 0.005 * 7700 / 7;
    protein = 2.2 * weight;
    fat = 0.8 * weight;
  }
  const carbs = (kcal - protein * 4 - fat * 9) / 4;
  return { kcal: kcal, p: protein, c: carbs, f: fat };
}

// חישוב ערכים לפי גרמים
function calcFood(food, grams) {
  const k = grams / 100;
  return { kcal: food.kcal * k, p: food.p * k, c: food.c * k, f: food.f * k };
}

// היום ביומן (אם אין - יוצרים)
function getDay(data, date) {
  if (!data.diary) data.diary = {};
  if (!data.diary[date]) data.diary[date] = { cheat: false, items: [] };
  return data.diary[date];
}

// פס התקדמות
function bar(label, eaten, target, unit) {
  const pct = target > 0 ? Math.min(100, eaten / target * 100) : 0;
  const left = Math.round(target - eaten);
  const over = left < 0;
  return `<div class="bar-row">
    <div class="bar-top"><span>${label}</span><span>${Math.round(eaten)} / ${Math.round(target)} ${unit}</span></div>
    <div class="bar"><div class="bar-fill ${over ? "over" : ""}" style="width: ${pct}%"></div></div>
    <div class="bar-left">${over ? "חריגה של " + (-left) : "נשאר " + left} ${unit}</div>
  </div>`;
}

// כשנכנסים ללשונית היומן
function showDiary() {
  const dateInput = document.getElementById("diaryDate");
  if (!dateInput.value) dateInput.value = todayISO();

  const select = document.getElementById("diaryMeal");
  if (select.options.length === 0) {
    MEALS.forEach(m => select.innerHTML += `<option>${m}</option>`);
  }

  const datalist = document.getElementById("foodNames");
  datalist.innerHTML = "";
  allFoods().forEach(f => datalist.innerHTML += `<option value="${f.name}">`);

  renderDiary();
}
function renderDiary() {
  const date = document.getElementById("diaryDate").value;
  const data = loadData();
  const day = (data.diary && data.diary[date]) || { cheat: false, items: [] };
  const favs = data.favorites || [];
  document.getElementById("cheatDay").checked = day.cheat;

  // סיכום היום
  const total = { kcal: 0, p: 0, c: 0, f: 0 };
  day.items.forEach(i => {
    total.kcal += i.kcal;
    total.p += i.p;
    total.c += i.c;
    total.f += i.f;
  });

  const bars = document.getElementById("diaryBars");
  const target = getTargets();
  if (day.cheat) {
    bars.innerHTML = "<div class='result-box'><p>🍔 יום צ׳יט – תהנה! היום לא נספר.</p></div>";
  } else if (!target) {
    bars.innerHTML = "<div class='result-box'><p class='target'>כדי לראות יעדים, מלא קודם את השאלון בלשונית 🍽️ תזונה</p></div>";
  } else {
    bars.innerHTML = `<div class="result-box">
      ${bar("קלוריות", total.kcal, target.kcal, "קל׳")}
      ${bar("חלבון", total.p, target.p, "ג׳")}
      ${bar("פחמימה", total.c, target.c, "ג׳")}
      ${bar("שומן", total.f, target.f, "ג׳")}
    </div>`;
  }

  // הארוחות
  let html = "";
  MEALS.forEach((meal, mealIndex) => {
    const items = day.items
      .map((item, index) => ({ item: item, index: index }))
      .filter(x => x.item.meal === meal);
    const mealKcal = items.reduce((sum, x) => sum + x.item.kcal, 0);

    let rows = "";
    items.forEach(x => {
      const isFav = favs.some(f => f.name === x.item.name);
      rows += `<li>
        <span>${x.item.name} · ${x.item.grams} ג׳</span>
        <span>${Math.round(x.item.kcal)} קל׳</span>
        <span>
          <button class="del" onclick="toggleFav(${x.index})">${isFav ? "⭐" : "☆"}</button>
          <button class="del" onclick="deleteDiaryItem(${x.index})">🗑</button>
        </span>
      </li>`;
    });

    html += `<div class="meal-box">
      <div class="meal-head">
        <b>${meal}</b>
        <span>${Math.round(mealKcal)} קל׳ <button class="copy-btn" onclick="copyMeal(${mealIndex})">📋 מאתמול</button></span>
      </div>
      <ul>${rows || "<li class='target'>ריק</li>"}</ul>
    </div>`;
  });
  document.getElementById("diaryMeals").innerHTML = html;

  renderQuick();
}

// תצוגה מקדימה בזמן ההקלדה
function previewFood() {
  const food = findFood(document.getElementById("diaryFood").value.trim());
  const grams = Number(document.getElementById("diaryGrams").value);
  const box = document.getElementById("diaryPreview");

  if (!food) {
    box.innerHTML = "";
    return;
  }
  if (!grams) {
    box.innerHTML = `ל-100 גרם: ${food.kcal} קל׳ · חלבון ${food.p} · פחמימה ${food.c} · שומן ${food.f}` +
      (food.hint ? "<br>💡 " + food.hint : "");
    return;
  }
  const v = calcFood(food, grams);
  box.innerHTML = `${grams} גרם = <b>${Math.round(v.kcal)} קלוריות</b> · חלבון ${v.p.toFixed(1)} · פחמימה ${v.c.toFixed(1)} · שומן ${v.f.toFixed(1)}`;
}

document.getElementById("diaryFood").addEventListener("input", previewFood);
document.getElementById("diaryGrams").addEventListener("input", previewFood);
document.getElementById("diaryDate").addEventListener("change", renderDiary);

// הוספה ליומן
document.getElementById("diaryAdd").addEventListener("click", () => {
  const food = findFood(document.getElementById("diaryFood").value.trim());
  const grams = Number(document.getElementById("diaryGrams").value);
  const msg = document.getElementById("diaryMsg");

  if (!food) {
    msg.textContent = "⚠️ בחר מזון מהרשימה (או הוסף מזון חדש למטה)";
    return;
  }
  if (!grams) {
    msg.textContent = "⚠️ צריך לכתוב כמות בגרמים";
    return;
  }

  const date = document.getElementById("diaryDate").value;
  const meal = document.getElementById("diaryMeal").value;
  const data = loadData();
  const day = getDay(data, date);
  const v = calcFood(food, grams);
  day.items.push({ meal: meal, name: food.name, grams: grams, kcal: v.kcal, p: v.p, c: v.c, f: v.f });
  saveData(data);

  document.getElementById("diaryFood").value = "";
  document.getElementById("diaryGrams").value = "";
  document.getElementById("diaryPreview").innerHTML = "";
  msg.textContent = "✅ נוסף ליומן";
  renderDiary();
});

// מחיקה מהיומן
function deleteDiaryItem(index) {
  if (!confirm("למחוק את הפריט?")) return;
  const date = document.getElementById("diaryDate").value;
  const data = loadData();
  data.diary[date].items.splice(index, 1);
  saveData(data);
  renderDiary();
}

// יום צ׳יט
document.getElementById("cheatDay").addEventListener("change", () => {
  const date = document.getElementById("diaryDate").value;
  const data = loadData();
  const day = getDay(data, date);
  day.cheat = document.getElementById("cheatDay").checked;
  saveData(data);
  renderDiary();
});

// הוספת מזון חדש למאגר
document.getElementById("newFoodSave").addEventListener("click", () => {
  const name = document.getElementById("newFoodName").value.trim();
  const kcal = Number(document.getElementById("newKcal").value);
  const msg = document.getElementById("newFoodMsg");

  if (!name || !kcal) {
    msg.textContent = "⚠️ צריך לפחות שם וקלוריות";
    return;
  }
  if (findFood(name)) {
    msg.textContent = "⚠️ כבר יש מזון בשם הזה";
    return;
  }

  const custom = loadCustomFoods();
  custom.push({
    name: name,
    group: "custom",
    kashrut: "parve",
    kcal: kcal,
    p: Number(document.getElementById("newP").value) || 0,
    c: Number(document.getElementById("newC").value) || 0,
    f: Number(document.getElementById("newF").value) || 0,
    barcode: document.getElementById("newBarcode").value || null
  });
  localStorage.setItem("fitness_custom_foods", JSON.stringify(custom));

  ["newFoodName", "newKcal", "newP", "newC", "newF", "newBarcode"].forEach(id => {
    document.getElementById(id).value = "";
  });
  msg.textContent = "✅ נשמר! עכשיו אפשר לחפש אותו למעלה";
  showDiary();
  renderFoods();
});// ===== 18. סריקת ברקוד =====
let scanner = null;

document.getElementById("scanBtn").addEventListener("click", () => {
  if (scanner) {
    stopScanner();
  } else {
    startScanner();
  }
});

function startScanner() {
  const msg = document.getElementById("scanMsg");
  msg.textContent = "כוון את המצלמה לברקוד...";
  document.getElementById("scanBtn").textContent = "✖ סגור מצלמה";

  scanner = new Html5Qrcode("reader", {
    formatsToSupport: [
      Html5QrcodeSupportedFormats.EAN_13,
      Html5QrcodeSupportedFormats.EAN_8,
      Html5QrcodeSupportedFormats.UPC_A,
      Html5QrcodeSupportedFormats.UPC_E
    ]
  });

  scanner.start(
    { facingMode: "environment" },          // המצלמה האחורית
    { fps: 10, qrbox: { width: 250, height: 120 } },
    code => {                               // נמצא ברקוד
      stopScanner();
      handleBarcode(code);
    },
    () => {}                                // עדיין מחפש - לא עושים כלום
  ).catch(() => {
    msg.textContent = "⚠️ אין גישה למצלמה. צריך לאשר גישה למצלמה";
    scanner = null;
    document.getElementById("scanBtn").textContent = "📷 סרוק ברקוד";
  });
}

function stopScanner() {
  if (scanner) {
    const s = scanner;
    scanner = null;
    try {
      s.stop().then(() => s.clear()).catch(() => {});
    } catch (e) {}
  }
  document.getElementById("scanBtn").textContent = "📷 סרוק ברקוד";
}

function round1(x) {
  return Math.round(Number(x) * 10) / 10;
}

// בוחר מזון בשדה החיפוש ועובר לשדה הגרמים
function selectFood(name) {
  document.getElementById("diaryFood").value = name;
  previewFood();
  document.getElementById("diaryGrams").focus();
}

async function handleBarcode(code) {
  const msg = document.getElementById("scanMsg");

  // 1. המוצר כבר שמור אצלנו?
  const saved = loadCustomFoods().find(f => f.barcode === code);
  if (saved) {
    selectFood(saved.name);
    msg.textContent = "✅ " + saved.name;
    return;
  }

  // 2. חיפוש במאגר העולמי Open Food Facts
  msg.textContent = "🔍 מחפש את המוצר...";
  try {
    const url = "https://world.openfoodfacts.org/api/v2/product/" + code +
                ".json?fields=product_name,product_name_he,brands,nutriments";
    const res = await fetch(url);
    const json = await res.json();
    const p = json.product;
    const n = p && p.nutriments;

    if (json.status === 1 && n && n["energy-kcal_100g"] !== undefined) {
      let name = p.product_name_he || p.product_name || ("מוצר " + code);
      if (p.brands) name += " - " + p.brands.split(",")[0];
      if (findFood(name)) name += " (" + code.slice(-4) + ")";

      const custom = loadCustomFoods();
      custom.push({
        name: name,
        group: "custom",
        kashrut: "parve",
        barcode: code,
        kcal: round1(n["energy-kcal_100g"]),
        p: round1(n.proteins_100g || 0),
        c: round1(n.carbohydrates_100g || 0),
        f: round1(n.fat_100g || 0)
      });
      localStorage.setItem("fitness_custom_foods", JSON.stringify(custom));

      showDiary();
      renderFoods();
      selectFood(name);
      msg.textContent = "✅ נמצא: " + name + " – כדאי לבדוק שהערכים תואמים לתווית";
      return;
    }
  } catch (e) {
    // אין אינטרנט או שהמאגר לא זמין - ממשיכים להזנה ידנית
  }

  // 3. לא נמצא - פותחים הזנה ידנית עם הברקוד
  msg.textContent = "😕 המוצר לא נמצא. הקלד את הערכים מהתווית פעם אחת, ובפעם הבאה הסריקה תזהה אותו";
  document.getElementById("newBarcode").value = code;
  document.getElementById("newFoodBox").open = true;
  document.getElementById("newFoodName").focus();
}
// ===== 19. גיבוי ושחזור =====
document.getElementById("backupBtn").addEventListener("click", async () => {
  // אוספים את כל הנתונים של האפליקציה (של כל המשתמשים)
  const backup = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith("fitness_")) backup[key] = localStorage.getItem(key);
  }

  const fileName = "fitness-backup-" + todayISO() + ".json";
  const file = new File([JSON.stringify(backup)], fileName, { type: "application/json" });
  const msg = document.getElementById("backupMsg");

  // באייפון: נפתח חלון שיתוף (שמירה בקבצים, וואטסאפ, מייל...)
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: "גיבוי מעקב אימונים" });
      msg.textContent = "✅ הגיבוי נשמר";
    } catch (e) {
      msg.textContent = "";   // סגרת את החלון בלי לשמור
    }
    return;
  }

  // במחשב: הורדה רגילה
  const link = document.createElement("a");
  link.href = URL.createObjectURL(file);
  link.download = fileName;
  link.click();
  msg.textContent = "✅ הגיבוי ירד לתיקיית ההורדות";
});

document.getElementById("restoreFile").addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;
  const msg = document.getElementById("backupMsg");
  const reader = new FileReader();

  reader.onload = () => {
    try {
      const backup = JSON.parse(reader.result);
      const keys = Object.keys(backup).filter(k => k.startsWith("fitness_"));
      if (keys.length === 0) {
        msg.textContent = "⚠️ זה לא קובץ גיבוי של האפליקציה";
        return;
      }
      if (!confirm("השחזור יחליף את הנתונים שיש עכשיו במכשיר. להמשיך?")) return;
      keys.forEach(k => localStorage.setItem(k, backup[k]));
      location.reload();   // טוענים מחדש עם הנתונים המשוחזרים
    } catch (err) {
      msg.textContent = "⚠️ לא הצלחתי לקרוא את הקובץ";
    }
  };

  reader.readAsText(file);
  e.target.value = "";
});
// ===== 20. הוספה מהירה, מועדפים והעתקה מאתמול =====

// תאריך לפני/אחרי מספר ימים (למשל אתמול = -1)
function shiftDate(iso, days) {
  const d = new Date(iso + "T12:00:00");
  d.setDate(d.getDate() + days);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

// המזונות האחרונים שהוזנו (בלי כפילויות, עד 8)
function getRecent(data) {
  const dates = Object.keys(data.diary || {}).sort().reverse();
  const seen = {};
  const list = [];
  dates.forEach(d => {
    data.diary[d].items.slice().reverse().forEach(it => {
      if (!seen[it.name] && list.length < 8) {
        seen[it.name] = true;
        list.push({ name: it.name, grams: it.grams });
      }
    });
  });
  return list;
}

// הכפתורים של ההוספה המהירה
function renderQuick() {
  const data = loadData();
  const favs = data.favorites || [];
  const recent = getRecent(data).filter(r => !favs.some(f => f.name === r.name));
  const box = document.getElementById("quickFoods");

  let chips = "";
  favs.forEach(f => chips += chip(f, true));
  recent.forEach(r => chips += chip(r, false));

  box.innerHTML = chips
    ? "<p class='target'>⚡ לחיצה אחת = הוספה לארוחה שנבחרה</p><div class='chips'>" + chips + "</div>"
    : "";
}

function chip(item, isFav) {
  const safeName = item.name.replace(/"/g, "&quot;");
  return `<button class="chip" data-name="${safeName}" data-grams="${item.grams}">
    ${isFav ? "⭐ " : ""}${item.name} · ${item.grams} ג׳
  </button>`;
}

// לחיצה על כפתור מהיר - מוסיף ישר ליומן
document.getElementById("quickFoods").addEventListener("click", e => {
  const btn = e.target.closest(".chip");
  if (!btn) return;
  quickAdd(btn.dataset.name, Number(btn.dataset.grams));
});

function quickAdd(name, grams) {
  const msg = document.getElementById("diaryMsg");
  const food = findFood(name);
  if (!food) {
    msg.textContent = "⚠️ המזון הזה כבר לא קיים במאגר";
    return;
  }
  const date = document.getElementById("diaryDate").value;
  const meal = document.getElementById("diaryMeal").value;
  const data = loadData();
  const day = getDay(data, date);
  const v = calcFood(food, grams);
  day.items.push({ meal: meal, name: food.name, grams: grams, kcal: v.kcal, p: v.p, c: v.c, f: v.f });
  saveData(data);
  msg.textContent = "✅ " + food.name + " נוסף ל" + meal;
  renderDiary();
}

// הוספה/הסרה ממועדפים
function toggleFav(index) {
  const date = document.getElementById("diaryDate").value;
  const data = loadData();
  const item = data.diary[date].items[index];
  if (!data.favorites) data.favorites = [];

  const exists = data.favorites.some(f => f.name === item.name);
  if (exists) {
    data.favorites = data.favorites.filter(f => f.name !== item.name);
  } else {
    data.favorites.push({ name: item.name, grams: item.grams });
  }
  saveData(data);
  renderDiary();
}

// העתקת ארוחה מאתמול
function copyMeal(mealIndex) {
  const meal = MEALS[mealIndex];
  const date = document.getElementById("diaryDate").value;
  const yesterday = shiftDate(date, -1);
  const data = loadData();
  const msg = document.getElementById("diaryMsg");

  const old = (data.diary && data.diary[yesterday]) ? data.diary[yesterday].items : [];
  const toCopy = old.filter(it => it.meal === meal);
  if (toCopy.length === 0) {
    msg.textContent = "⚠️ אתמול לא נרשם כלום ב" + meal;
    return;
  }

  const day = getDay(data, date);
  toCopy.forEach(it => day.items.push(Object.assign({}, it)));
  saveData(data);
  msg.textContent = "✅ הועתקו " + toCopy.length + " פריטים מאתמול";
  renderDiary();
}
// ===== 21. תפריט גמיש =====
// איזה חלק מהיעד היומי הולך לכל ארוחה (בוקר, ביניים, לפני אימון, ערב)
// יותר פחמימות סביב האימון, פחות שומן לפני האימון
const MEAL_SHARE = {
  protein: [0.25, 0.20, 0.25, 0.30],
  carb:    [0.20, 0.15, 0.30, 0.35],
  fat:     [0.30, 0.25, 0.15, 0.30]
};
const MENU_GROUPS = { protein: "🍗", carb: "🍚", fat: "🥑" };
const VEG_GRAMS = 150;   // סלט ירקות בכל ארוחה

// אילו מזונות מותרים בארוחה (בשרי / חלבי + פרווה)
function menuOptions(group, type) {
  return foods100.filter(f => f.group === group && (f.kashrut === "parve" || f.kashrut === type));
}

function randomItem(list) {
  return list[Math.floor(Math.random() * list.length)];
}

// בחירה אקראית של מאכלים לארוחה
function randomPicks(type) {
  return {
    protein: randomItem(menuOptions("protein", type)).name,
    carb: randomItem(menuOptions("carb", type)).name,
    fat: randomItem(menuOptions("fat", type)).name
  };
}

// התפריט השמור (אם אין - יוצרים חדש)
function getMenu(data) {
  if (!data.menu) {
    const types = ["dairy", "dairy", "meat", "meat"];
    data.menu = { types: types, picks: types.map(t => randomPicks(t)) };
  }
  return data.menu;
}

function round5(x) {
  return Math.max(0, Math.round(x / 5) * 5);
}

// חישוב הכמויות של ארוחה אחת
function buildMeal(mealIndex, target, type, picks) {
  const P = target.p * MEAL_SHARE.protein[mealIndex];
  const C = target.c * MEAL_SHARE.carb[mealIndex];
  const F = target.f * MEAL_SHARE.fat[mealIndex];

  const veg = findFood("סלט ירקות");
  const pf = findFood(picks.protein);
  const cf = findFood(picks.carb);
  const ff = findFood(picks.fat);

  // מחשבים כמה סבבים: כל סבב מתחשב גם במה ששאר המאכלים כבר נותנים
  let gP = 0, gC = 0, gF = 0;
  for (let i = 0; i < 6; i++) {
    gC = Math.max(0, (C - (pf.c * gP + ff.c * gF + veg.c * VEG_GRAMS) / 100) / (cf.c / 100));
    gP = Math.max(0, (P - (cf.p * gC + ff.p * gF + veg.p * VEG_GRAMS) / 100) / (pf.p / 100));
    gF = Math.max(0, (F - (pf.f * gP + cf.f * gC + veg.f * VEG_GRAMS) / 100) / (ff.f / 100));
  }
  gP = round5(gP);
  gC = round5(gC);
  gF = round5(gF);

  return [
    { group: "protein", food: pf, grams: gP },
    { group: "carb", food: cf, grams: gC },
    { group: "fat", food: ff, grams: gF },
    { group: "veg", food: veg, grams: VEG_GRAMS }
  ];
}

function renderMenu() {
  const box = document.getElementById("menuBox");
  const target = getTargets();
  if (!target) {
    box.innerHTML = "<p class='target'>מלא קודם את השאלון ולחץ חשב</p>";
    return;
  }

  const data = loadData();
  const menu = getMenu(data);
  saveData(data);

  const dayTotal = { kcal: 0, p: 0, c: 0, f: 0 };
  let html = "";

  MEALS.forEach((meal, mi) => {
    const type = menu.types[mi];
    const items = buildMeal(mi, target, type, menu.picks[mi]);
    const mealTotal = { kcal: 0, p: 0, c: 0, f: 0 };

    let rows = "";
    items.forEach(it => {
      const v = calcFood(it.food, it.grams);
      ["kcal", "p", "c", "f"].forEach(k => {
        mealTotal[k] += v[k];
        dayTotal[k] += v[k];
      });
      if (it.grams === 0) return;
      const swap = it.group === "veg"
        ? ""
        : `<button class="del" onclick="swapFood(${mi}, '${it.group}')">🔄</button>`;
      rows += `<li>
        <span>${MENU_GROUPS[it.group] || "🥗"} ${it.food.name} · <b>${it.grams} ג׳</b></span>
        <span>${Math.round(v.kcal)} קל׳</span>
        <span>${swap}</span>
      </li>`;
    });

    html += `<div class="meal-box">
      <div class="meal-head">
        <b>${meal}</b>
        <button class="copy-btn" onclick="toggleMealType(${mi})">${type === "meat" ? "🥩 בשרי" : "🥛 חלבי"}</button>
      </div>
      <ul>${rows}</ul>
      <p class="target">${Math.round(mealTotal.kcal)} קל׳ · חלבון ${Math.round(mealTotal.p)} · פחמימה ${Math.round(mealTotal.c)} · שומן ${Math.round(mealTotal.f)}</p>
      <button class="copy-btn" onclick="menuToDiary(${mi})">➕ הוסף ליומן של היום</button>
    </div>`;
  });

  box.innerHTML = `<div class="result-box">
      <p>סה״כ בתפריט: <b>${Math.round(dayTotal.kcal)}</b> מתוך ${Math.round(target.kcal)} קל׳</p>
      <p class="target">חלבון ${Math.round(dayTotal.p)}/${Math.round(target.p)} · פחמימה ${Math.round(dayTotal.c)}/${Math.round(target.c)} · שומן ${Math.round(dayTotal.f)}/${Math.round(target.f)}</p>
    </div>` + html;
}

// 🔄 החלפת מאכל באחר מאותה קבוצה
function swapFood(mealIndex, group) {
  const data = loadData();
  const menu = getMenu(data);
  const list = menuOptions(group, menu.types[mealIndex]);
  const current = list.findIndex(f => f.name === menu.picks[mealIndex][group]);
  menu.picks[mealIndex][group] = list[(current + 1) % list.length].name;
  saveData(data);
  renderMenu();
}

// 🥛/🥩 החלפת סוג הארוחה
function toggleMealType(mealIndex) {
  const data = loadData();
  const menu = getMenu(data);
  const type = menu.types[mealIndex] === "meat" ? "dairy" : "meat";
  menu.types[mealIndex] = type;

  // אם מאכל כבר לא מתאים לסוג החדש - מחליפים אותו
  ["protein", "carb", "fat"].forEach(g => {
    const list = menuOptions(g, type);
    if (!list.some(f => f.name === menu.picks[mealIndex][g])) {
      menu.picks[mealIndex][g] = list[0].name;
    }
  });
  saveData(data);
  renderMenu();
}

// 🎲 תפריט חדש
document.getElementById("newMenuBtn").addEventListener("click", () => {
  const data = loadData();
  const menu = getMenu(data);
  menu.picks = menu.types.map(t => randomPicks(t));
  saveData(data);
  renderMenu();
});

// אחרי לחיצה על "חשב" - מעדכנים גם את התפריט
document.getElementById("calcBtn").addEventListener("click", renderMenu);

// ➕ הוספת ארוחה מהתפריט ליומן של היום
function menuToDiary(mealIndex) {
  const target = getTargets();
  if (!target) return;
  const data = loadData();
  const menu = getMenu(data);
  const items = buildMeal(mealIndex, target, menu.types[mealIndex], menu.picks[mealIndex]);
  const day = getDay(data, todayISO());

  items.filter(it => it.grams > 0).forEach(it => {
    const v = calcFood(it.food, it.grams);
    day.items.push({
      meal: MEALS[mealIndex], name: it.food.name, grams: it.grams,
      kcal: v.kcal, p: v.p, c: v.c, f: v.f
    });
  });
  saveData(data);
  alertMsg("✅ " + MEALS[mealIndex] + " נוספה ליומן של היום");
}

function alertMsg(text) {
  document.getElementById("menuMsg").textContent = text;
}
// ===== 22. טיימר מנוחה =====
const REST_OPTIONS = [60, 90, 120, 180];   // אפשרויות בשניות
let restEnd = 0;
let restInterval = null;
let audioCtx = null;

function getRestSeconds() {
  return Number(localStorage.getItem("fitness_rest")) || 90;
}

function timeText(sec) {
  return Math.floor(sec / 60) + ":" + String(sec % 60).padStart(2, "0");
}

// כפתורי בחירת זמן המנוחה בלשונית האימון
function renderRestPicker() {
  const box = document.getElementById("restPicker");
  box.innerHTML = "⏱️";
  REST_OPTIONS.forEach(sec => {
    const b = document.createElement("button");
    b.className = "rest-btn" + (sec === getRestSeconds() ? " active" : "");
    b.textContent = timeText(sec);
    b.addEventListener("click", () => {
      localStorage.setItem("fitness_rest", sec);
      renderRestPicker();
      startRest(sec);
    });
    box.appendChild(b);
  });
}

// באייפון צריך "להפעיל" את הצליל בלחיצה של המשתמש
function unlockAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === "suspended") audioCtx.resume();
}

// צפצוף: 3 ביפים
function beep() {
  if (!audioCtx) return;
  [0, 0.4, 0.8].forEach(t => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.frequency.value = 880;
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    const start = audioCtx.currentTime + t;
    gain.gain.setValueAtTime(0.4, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.3);
    osc.start(start);
    osc.stop(start + 0.3);
  });
}

function startRest(seconds) {
  unlockAudio();
  restEnd = Date.now() + seconds * 1000;
  document.getElementById("restTimer").classList.add("show");
  clearInterval(restInterval);
  restInterval = setInterval(tickRest, 250);
  tickRest();
}

function tickRest() {
  const left = Math.max(0, Math.round((restEnd - Date.now()) / 1000));
  document.getElementById("restTime").textContent = timeText(left);

  if (left === 0) {
    clearInterval(restInterval);
    restInterval = null;
    beep();
    document.getElementById("restTime").textContent = "💪 סט הבא!";
    setTimeout(() => {
      if (!restInterval) document.getElementById("restTimer").classList.remove("show");
    }, 4000);
  }
}

// הוספה/הורדה של 15 שניות
function addRest(sec) {
  if (!restInterval) return;
  restEnd += sec * 1000;
  tickRest();
}

function stopRest() {
  clearInterval(restInterval);
  restInterval = null;
  document.getElementById("restTimer").classList.remove("show");
}

// ===== 23. עריכת התוכנית מתוך האפליקציה =====
let editWorkout = null;
let editorOpen = false;

document.getElementById("editProgramBtn").addEventListener("click", () => {
  if (editorOpen) {
    setupWorkoutTab();   // סוגר את העריכה ומרענן את האימונים
  } else {
    openEditor();
  }
});

function openEditor() {
  editorOpen = true;
  editWorkout = Object.keys(getProgram())[0] || null;
  document.getElementById("editProgramBtn").textContent = "✅ סיום עריכה";
  renderEditor();
}

function closeEditor() {
  editorOpen = false;
  document.getElementById("programEditor").innerHTML = "";
}

function renderEditor() {
  const box = document.getElementById("programEditor");
  const program = getProgram();
  const exList = getExercises();

  // לשוניות האימונים + כפתור אימון חדש
  let tabs = "";
  Object.keys(program).forEach(k => {
    tabs += `<button class="pick ${k === editWorkout ? "active" : ""}" onclick="selectEditWorkout('${k}')">${k}</button>`;
  });
  tabs += `<button class="pick" onclick="addWorkout()">➕ אימון</button>`;

  // רשימת התרגילים באימון שנבחר
  let list = "";
  if (editWorkout) {
    program[editWorkout].forEach((name, i) => {
      list += `<li>
        <span><b>${i + 1}. ${name}</b><br><small class="target">${targetText(exList[name] || {})}</small></span>
        <span>
          <button class="del" onclick="moveExercise(${i}, -1)">⬆️</button>
          <button class="del" onclick="moveExercise(${i}, 1)">⬇️</button>
          <button class="del" onclick="removeExercise(${i})">🗑</button>
        </span>
      </li>`;
    });
  }

  let options = "";
  Object.keys(exList).forEach(n => options += `<option value="${n}">`);

  const reset = USER === "omri"
    ? `<button class="danger" onclick="resetProgram()">↩️ חזרה לתוכנית המקורית</button>`
    : "";

  if (!editWorkout) {
    box.innerHTML = `<div class="workout-picker">${tabs}</div>
      <p class="target">לחץ ➕ אימון כדי ליצור אימון ראשון</p>${reset}`;
    return;
  }

  box.innerHTML = `
    <div class="workout-picker">${tabs}</div>
    <ul class="edit-list">${list || "<li class='target'>אין עדיין תרגילים באימון הזה</li>"}</ul>

    <h3 class="sub">➕ הוספת תרגיל לאימון ${editWorkout}</h3>
    <input type="text" id="newExName" list="exNames" placeholder="שם התרגיל">
    <datalist id="exNames">${options}</datalist>
    <div class="sets">
      <input type="number" id="newExMin" placeholder="מינ׳ חזרות">
      <input type="number" id="newExMax" placeholder="מקס׳ חזרות">
      <input type="number" id="newExStep" step="0.5" placeholder="עלייה בק״ג">
    </div>
    <p class="target">מינימום ריק = "כמה שיותר עד היעד". שניהם ריקים = מקסימום חזרות בלי יעד.<br>
    בחירת תרגיל קיים מהרשימה ממלאת את הנתונים שלו, ואפשר לשנות אותם.</p>
    <button onclick="addExercise()">שמור תרגיל באימון</button>
    <p class="msg" id="editMsg"></p>

    <button class="danger" onclick="deleteWorkout()">🗑 מחק את אימון ${editWorkout}</button>
    ${reset}
  `;

  // בחירת תרגיל קיים - ממלאים את הנתונים שלו
  document.getElementById("newExName").addEventListener("input", () => {
    const ex = exList[document.getElementById("newExName").value.trim()];
    if (!ex) return;
    document.getElementById("newExMin").value = ex.min || "";
    document.getElementById("newExMax").value = ex.max || "";
    document.getElementById("newExStep").value = ex.step || "";
  });
}

function selectEditWorkout(k) {
  editWorkout = k;
  renderEditor();
}

function addWorkout() {
  const program = getProgram();
  const exList = getExercises();
  const next = "ABCDEFGH".split("").find(l => !program[l]);
  if (!next) return;
  program[next] = [];
  saveProgram(program, exList);
  editWorkout = next;
  renderEditor();
}

function deleteWorkout() {
  if (!confirm("למחוק את אימון " + editWorkout + "? (ההיסטוריה של התרגילים נשמרת)")) return;
  const program = getProgram();
  const exList = getExercises();
  delete program[editWorkout];
  saveProgram(program, exList);
  editWorkout = Object.keys(program)[0] || null;
  renderEditor();
}

function moveExercise(i, dir) {
  const program = getProgram();
  const exList = getExercises();
  const list = program[editWorkout];
  const j = i + dir;
  if (j < 0 || j >= list.length) return;
  const temp = list[i];
  list[i] = list[j];
  list[j] = temp;
  saveProgram(program, exList);
  renderEditor();
}

function removeExercise(i) {
  const program = getProgram();
  const exList = getExercises();
  program[editWorkout].splice(i, 1);
  saveProgram(program, exList);
  renderEditor();
}

function addExercise() {
  const name = document.getElementById("newExName").value.trim();
  const min = Number(document.getElementById("newExMin").value) || null;
  const max = Number(document.getElementById("newExMax").value) || null;
  const step = Number(document.getElementById("newExStep").value) || 2;
  const msg = document.getElementById("editMsg");

  if (!name) {
    msg.textContent = "⚠️ צריך לכתוב שם תרגיל";
    return;
  }
  if (min && max && min > max) {
    msg.textContent = "⚠️ המינימום גדול מהמקסימום";
    return;
  }

  const program = getProgram();
  const exList = getExercises();
  exList[name] = { min: min, max: max, step: step };
  if (!program[editWorkout].includes(name)) program[editWorkout].push(name);
  saveProgram(program, exList);
  renderEditor();
  document.getElementById("editMsg").textContent = "✅ " + name + " נשמר באימון " + editWorkout;
}

function resetProgram() {
  if (!confirm("לחזור לתוכנית המקורית? השינויים בתוכנית יימחקו (ההיסטוריה נשמרת)")) return;
  const data = loadData();
  delete data.program;
  delete data.exercises;
  saveData(data);
  editWorkout = Object.keys(getProgram())[0];
  renderEditor();
}

// ===== 15. הפעלה כשהאפליקציה נפתחת =====
renderUserSwitch();
setupWorkoutTab();
renderFoods();
renderRestPicker();
showTab("workout");