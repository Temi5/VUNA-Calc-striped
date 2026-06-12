// ===============================
// VUNA CALCULATOR - UI WIRING
// ===============================

let LAST_RESULT = 0;
let currentExpression = "";

// ------------------------------
// Theme Toggle
// ------------------------------
function toggleTheme() {
  const body = document.body;
  const btn = document.getElementById("theme-toggle");

  body.classList.toggle("dark-mode");

  if (body.classList.contains("dark-mode")) {
    btn.innerHTML = "☀️";
    btn.title = "Switch to light mode";
    localStorage.setItem("theme", "dark");
  } else {
    btn.innerHTML = "🌙";
    btn.title = "Switch to dark mode";
    localStorage.setItem("theme", "light");
  }
}

globalThis.addEventListener("DOMContentLoaded", function () {
  const theme = localStorage.getItem("theme");
  const body = document.body;
  const btn = document.getElementById("theme-toggle");

  if (btn) {
    if (theme === "dark") {
      body.classList.add("dark-mode");
      btn.innerHTML = "☀️";
      btn.title = "Switch to light mode";
    } else {
      btn.innerHTML = "🌙";
      btn.title = "Switch to dark mode";
    }
  }

  const sigfigSelect = document.getElementById("sigfig-select");
  if (sigfigSelect) {
    sigfigSelect.addEventListener("change", applySignificantFigures);
  }
});

// ------------------------------
// Basic Input
// ------------------------------
function appendToResult(value) {
  currentExpression += value.toString();
  updateResult();
}

function bracketToResult(value) {
  currentExpression += value;
  updateResult();
}

function backspace() {
  currentExpression = currentExpression.slice(0, -1);
  updateResult();
}

function operatorToResult(value) {
  currentExpression += value;
  updateResult();
}

function clearResult() {
  currentExpression = "";
  const sigfigSelect = document.getElementById("sigfig-select");
  if (sigfigSelect) sigfigSelect.value = "full";
  updateResult();
}

function percentToResult() {
  if (currentExpression === "") return;

  const match = /^(.*)([+\-*/])([\d.]+)$/.exec(currentExpression);

  if (match === null) {
    const num = Number.parseFloat(currentExpression);
    if (Number.isNaN(num)) return;
    currentExpression = (num / 100).toString();
  } else {
    const prefix = match[1];
    const operator = match[2];
    const lastNum = Number.parseFloat(match[3]);

    if (prefix === "") {
      currentExpression = (lastNum / 100).toString();
      updateResult();
      return;
    }

    let base;
    try {
      base = evaluateExpression(prefix);
    } catch (error) {
      console.error('Percentage expression evaluation failed:', error);
      base = Number.parseFloat(prefix);
    }

    if (Number.isNaN(base)) {
      currentExpression = (lastNum / 100).toString();
    } else {
      const percentValue = base * (lastNum / 100);
      currentExpression = prefix + operator + percentValue.toString();
    }
  }

  updateResult();
}

// ------------------------------
// Significant Figures Feature
// ------------------------------
function applySignificantFigures() {
  const select = document.getElementById("sigfig-select");
  const display = document.getElementById("result");

  if (select === null || display === null) return;

  const mode = select.value;
  const currentVal = Number.parseFloat(display.value);

  if (Number.isNaN(currentVal) || mode === "full") return;

  const sigFigs = Number.parseInt(mode, 10);
  try {
    const rounded = toSignificantFigures(currentVal, sigFigs);
    const formatted = Number.parseFloat(rounded.toPrecision(12));
    display.value = formatted;
    currentExpression = String(formatted);
    LAST_RESULT = formatted;
  } catch (error) {
    console.error('Significant figures calculation failed:', error);
  }
}

// ------------------------------
// Calculate
// ------------------------------
function calculateResult() {
  if (currentExpression === "") return;

  const display = document.getElementById("result");

  let expr = currentExpression;
  if (typeof LAST_RESULT === 'number' && Number.isFinite(LAST_RESULT)) {
    expr = expr.replace(/\bans\b/gi, LAST_RESULT.toString());
  }

  let result;
  try {
    result = evaluateExpression(expr);
  } catch (error) {
    console.error('Calculation failed:', error);
    result = "Error";
  }

  if (result === "Error" || typeof result !== 'number' || Number.isNaN(result) || !Number.isFinite(result)) {
    display.value = "Error";
    currentExpression = "";
    return;
  }

  result = Number.parseFloat(result.toPrecision(12));
  LAST_RESULT = result;

  display.value = result;
  currentExpression = String(result);

  const sigfigSelect = document.getElementById("sigfig-select");
  if (sigfigSelect && sigfigSelect.value !== "full") {
    applySignificantFigures();
  }
}

function updateResult() {
  const display = document.getElementById("result");
  if (display) {
    display.value = currentExpression || "0";
  }
}

// ------------------------------
// Keyboard Support
// ------------------------------
document.addEventListener("keydown", function (e) {
  const key = e.key;

  if (/\d/.test(key) || key === ".") {
    appendToResult(key);
  } else if (key === "+" || key === "-" || key === "*" || key === "/") {
    operatorToResult(key);
  } else if (key === "^") {
    operatorToResult("^");
  } else if (key === "(" || key === ")") {
    bracketToResult(key);
  } else if (key === "Enter" || key === "=") {
    e.preventDefault();
    calculateResult();
  } else if (key === "Backspace") {
    backspace();
  } else if (key === "Escape") {
    clearResult();
  } else if (key === "%") {
    percentToResult();
  }
});