// ===== 1. הגדרות =====
const USER = "omri";

// ===== 2. רשימת התרגילים =====
// min = מינימום חזרות, max = מקסימום חזרות, step = בכמה ק״ג להעלות
// null = אין מספר קבוע (כמה שיותר)
const exercises = {
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

// ===== 3. התוכנית: אילו תרגילים בכל אימון =====
const program = {
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

  program[letter].forEach((name, i) => {
    const ex = exercises[name];
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
function saveExercise(letter, i) {
  const name = program[letter][i];
  const weight = Number(document.getElementById("w" + i).value) || 0;
  const reps = [0, 1, 2].map(s => Number(document.getElementById("r" + i + "-" + s).value) || 0);
  const difficulty = Number(document.getElementById("d" + i).value) || 0;
  const msg = document.getElementById("m" + i);

  if (reps.every(r => r === 0)) {
    msg.textContent = "⚠️ צריך למלא חזרות לפחות בסט אחד";
    return;
  }

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

  msg.textContent = "✅ נשמר!";
}

// ===== 8. מעבר בין הלשוניות =====
function showTab(id) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  if (id === "history") renderHistory();
  if (id === "body") renderBody();
    if (id === "nutrition") showNutrition();
  document.querySelectorAll(".menu button").forEach(b => {
    b.classList.toggle("active", b.dataset.tab === id);
  });
}

document.querySelectorAll(".menu button").forEach(b => {
  b.addEventListener("click", () => showTab(b.dataset.tab));
});

// ===== 9. בחירת אימון A / B / C =====
document.querySelectorAll(".pick").forEach(b => {
  b.addEventListener("click", () => {
    document.querySelectorAll(".pick").forEach(p => p.classList.remove("active"));
    b.classList.add("active");
    renderWorkout(b.dataset.workout);
  });
});

// כשהאפליקציה נפתחת - מציגים את לשונית האימון
showTab("workout");

// ===== 10. היסטוריה והתקדמות =====
function score(log) {
  const total = log.reps.reduce((a, b) => a + b, 0);
  return log.weight > 0 ? log.weight * total : total;
}

function logText(log) {
  return (log.weight > 0 ? log.weight + " ק״ג × " : "") + log.reps.join("/");
}

function renderHistory() {
  const data = loadData();
  const box = document.getElementById("historyContent");
  const names = Object.keys(data.logs);

  if (names.length === 0) {
    box.innerHTML = "<p class='target'>עוד אין אימונים שמורים</p>";
    return;
  }

  const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
  let rows = "";
  let details = "";

  names.forEach(name => {
    const logs = data.logs[name];
    const now = logs[logs.length - 1];
    const before = logs.filter(l => l.time && l.time <= twoWeeksAgo).pop() || logs[0];

    const percent = score(before) > 0
      ? Math.round((score(now) - score(before)) / score(before) * 100)
      : 0;
    const color = percent > 0 ? "up" : percent < 0 ? "down" : "";

    rows += `<tr>
      <td>${name}</td>
      <td>${logText(before)}</td>
      <td>${logText(now)}</td>
      <td class="${color}">${percent > 0 ? "+" : ""}${percent}%</td>
    </tr>`;

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

    details += `<details>
      <summary>${name}</summary>
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