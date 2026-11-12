"use strict";

/* ===================== CONFIG ===================== */
// Set to false when your real backend is ready. This also hides the demo buttons.
const DEMO_MODE = true;

const API = { login: "/api/auth/login" }; // POST { email, password, role }

// Where each role lands after sign-in. Adjust to match your folders.
const ROUTES = {
  patient: "../patient-profile/index.html",
  doctor: "../doctor-dashboard/index.html",
  admin: "../admin-dashboard/index.html",
};

// Demo only. Real credentials must NEVER be shipped in front-end code.
const DEMO_ACCOUNTS = {
  patient: { email: "patient@demo.com", password: "Patient@123" },
  doctor: { email: "doctor@demo.com", password: "Doctor@123" },
  admin: { email: "admin@demo.com", password: "Admin@123" },
};

const GENERIC_ERROR = "Incorrect email or password."; // never reveal which one was wrong
const MAX_ATTEMPTS = 5;
const LOCK_SECONDS = 30;

/* ===================== ELEMENTS & STATE ===================== */
const $ = (sel) => document.querySelector(sel);
const form = $("#loginForm");
const emailEl = $("#email");
const passwordEl = $("#password");
const submitBtn = $("#submitBtn");
const alertEl = $("#formAlert");
const roleButtons = [...document.querySelectorAll(".role")];

let role = "patient";
let failures = 0;
let locked = false;

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const submitLabel = () => `Sign in to ${cap(role)} Dashboard`;

/* ===================== ROLE PICKER ===================== */
function setRole(next) {
  role = next;
  roleButtons.forEach((btn) => {
    const active = btn.dataset.role === role;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-pressed", active);
  });
  if (!locked) submitBtn.textContent = submitLabel();
  hideAlert();
}
roleButtons.forEach((btn) => btn.addEventListener("click", () => setRole(btn.dataset.role)));

/* ===================== UI HELPERS ===================== */
function showFieldError(name, message) {
  const input = document.getElementById(name);
  $(`[data-error-for="${name}"]`).textContent = message;
  input.classList.toggle("invalid", Boolean(message));
  input.setAttribute("aria-invalid", message ? "true" : "false");
}
function showAlert(message) { alertEl.textContent = message; alertEl.hidden = false; }
function hideAlert() { alertEl.hidden = true; alertEl.textContent = ""; }

$("#togglePw").addEventListener("click", (e) => {
  const show = passwordEl.type === "password";
  passwordEl.type = show ? "text" : "password";
  e.currentTarget.setAttribute("aria-label", show ? "Hide password" : "Show password");
});

[emailEl, passwordEl].forEach((el) =>
  el.addEventListener("input", () => {
    showFieldError(el.id, "");
    hideAlert();
  })
);

/* ===================== VALIDATION ===================== */
// Login only checks "is it filled in and shaped like an email".
// Password rules belong on registration, not here.
function validate() {
  const email = emailEl.value.trim();
  let ok = true;

  if (!email) { showFieldError("email", "Enter your email address."); ok = false; }
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { showFieldError("email", "Enter a valid email address."); ok = false; }

  if (!passwordEl.value) { showFieldError("password", "Enter your password."); ok = false; }

  if (!ok) (emailEl.classList.contains("invalid") ? emailEl : passwordEl).focus();
  return ok;
}

/* ===================== LOGIN CALL ===================== */
async function login(email, password) {
  if (DEMO_MODE) {
    await wait(700);
    const acc = DEMO_ACCOUNTS[role];
    if (!acc || acc.email !== email.toLowerCase() || acc.password !== password) throw new Error(GENERIC_ERROR);
    return { role };
  }

  const res = await fetch(API.login, {
    method: "POST",
    credentials: "include", // the server sets an httpOnly session cookie
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, role }),
  });
  const data = await res.json().catch(() => ({}));

  if (res.status === 429) throw new Error("Too many attempts. Please try again later.");
  if (res.status === 401 || res.status === 403) throw new Error(GENERIC_ERROR);
  if (!res.ok) throw new Error(data.message || "Something went wrong. Please try again.");
  return data; // expected: { role: "patient" | "doctor" | "admin" }
}

// Only allow redirects to pages on this site (stops open-redirect phishing links).
function safeNext() {
  const next = new URLSearchParams(location.search).get("next");
  return next && next.startsWith("/") && !next.startsWith("//") && !next.includes("\\") ? next : null;
}

/* ===================== LOCKOUT (UX only) ===================== */
function lockFor(seconds) {
  locked = true;
  submitBtn.disabled = true;
  let left = seconds;
  const tick = () => {
    if (left <= 0) {
      locked = false;
      failures = 0;
      submitBtn.disabled = false;
      submitBtn.textContent = submitLabel();
      hideAlert();
      return;
    }
    submitBtn.textContent = `Try again in ${left}s`;
    left -= 1;
    setTimeout(tick, 1000);
  };
  tick();
}

/* ===================== SUBMIT ===================== */
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (locked) return;
  hideAlert();
  if (!validate()) return;

  submitBtn.disabled = true;
  submitBtn.textContent = "Signing in…";

  try {
    const result = await login(emailEl.value.trim(), passwordEl.value);
    // Trust the role the SERVER confirms, not the button the user clicked.
    const confirmedRole = ROUTES[result.role] ? result.role : role;
    submitBtn.textContent = "Redirecting…";
    window.location.assign(safeNext() || ROUTES[confirmedRole]);
  } catch (err) {
    failures += 1;
    passwordEl.value = "";
    showAlert(err.message);
    if (failures >= MAX_ATTEMPTS) {
      showAlert(`Too many failed attempts. Please wait ${LOCK_SECONDS} seconds.`);
      lockFor(LOCK_SECONDS);
    } else {
      submitBtn.disabled = false;
      submitBtn.textContent = submitLabel();
      passwordEl.focus();
    }
  }
});

/* ===================== DEMO ACCESS ===================== */
const demoSection = $("#demoSection");
if (!DEMO_MODE) {
  demoSection.hidden = true;
} else {
  document.querySelectorAll("[data-demo]").forEach((btn) =>
    btn.addEventListener("click", () => {
      const r = btn.dataset.demo;
      setRole(r);
      emailEl.value = DEMO_ACCOUNTS[r].email;
      passwordEl.value = DEMO_ACCOUNTS[r].password;
      form.requestSubmit();
    })
  );
}