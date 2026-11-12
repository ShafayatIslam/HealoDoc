"use strict";

/* ===================== CONFIG ===================== */
// Set to false when your real backend is ready.
const DEMO_MODE = true;
const DEMO_OTP = "1234"; // demo only. The real OTP must be generated and checked on the server.

const API = {
  sendOtp: "/api/patients/send-otp",
  register: "/api/patients/register",
};

const OTP_COOLDOWN_SECONDS = 30;
const MAX_PHOTO_MB = 2;
const NID_LENGTHS = [10, 13, 17]; // Bangladesh NID formats. Change for your country.

/* ===================== ELEMENTS ===================== */
const form = document.getElementById("registerForm");
const submitBtn = document.getElementById("submitBtn");
const statusEl = document.getElementById("formStatus");
const sendOtpBtn = document.getElementById("sendOtp");
const otpHint = document.getElementById("otpHint");
const photoInput = document.getElementById("photo");
const avatar = document.getElementById("avatar");
const avatarDefault = avatar.innerHTML;

const f = (id) => document.getElementById(id);
let otpSent = false;

/* ===================== VALIDATORS ===================== */
// Each returns an error message string, or "" when the value is fine.
const validators = {
  fullName: (v) =>
    v.length < 3 ? "Enter your full name (at least 3 characters)." :
    !/^[A-Za-z\u0980-\u09FF .'-]+$/.test(v) ? "Use letters only in your name." : "",

  username: (v) =>
    !/^[a-zA-Z0-9_]{4,20}$/.test(v) ? "4–20 characters: letters, numbers, underscore." : "",

  email: (v) =>
    !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? "Enter a valid email address." : "",

  password: (v) =>
    v.length < 8 ? "Use at least 8 characters." :
    !/[A-Z]/.test(v) || !/[a-z]/.test(v) || !/\d/.test(v)
      ? "Include an uppercase letter, a lowercase letter and a number." : "",

  confirmPassword: (v) =>
    v !== f("password").value ? "Passwords do not match." : "",

  phone: (v) => {
    const digits = v.replace(/\D/g, "");
    return !/^\+?[\d\s()-]+$/.test(v) || digits.length < 10 || digits.length > 15
      ? "Enter a valid phone number (10–15 digits)." : "";
  },

  dob: (v) => {
    if (!v) return "Select your date of birth.";
    const d = new Date(v);
    const now = new Date();
    if (d > now) return "Date of birth cannot be in the future.";
    if (now.getFullYear() - d.getFullYear() > 120) return "Enter a valid date of birth.";
    return "";
  },

  nid: (v) =>
    !/^\d+$/.test(v) ? "NID must contain digits only." :
    !NID_LENGTHS.includes(v.length) ? `NID must be ${NID_LENGTHS.join(", ")} digits.` : "",

  otp: (v) =>
    !otpSent ? "Send an OTP to your phone first." :
    !/^\d{4}$/.test(v) ? "Enter the 4-digit code." : "",
};

/* ===================== HELPERS ===================== */
function showError(name, message) {
  const input = f(name);
  const el = document.querySelector(`[data-error-for="${name}"]`);
  if (el) el.textContent = message;
  if (input) {
    input.classList.toggle("invalid", Boolean(message));
    input.classList.toggle("valid", !message && input.value.trim() !== "");
    input.setAttribute("aria-invalid", message ? "true" : "false");
  }
}

function validateField(name) {
  const value = f(name).value.trim();
  // Do not trim passwords: spaces can be intentional.
  const raw = name === "password" || name === "confirmPassword" ? f(name).value : value;
  const message = validators[name](raw);
  showError(name, message);
  return !message;
}

function setStatus(message, type) {
  statusEl.textContent = message;
  statusEl.className = "form-status" + (type ? " " + type : "");
}

async function postJSON(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Something went wrong. Try again.");
  return data;
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/* ===================== LIVE VALIDATION ===================== */
Object.keys(validators).forEach((name) => {
  const input = f(name);
  input.addEventListener("blur", () => validateField(name));
  input.addEventListener("input", () => {
    if (input.classList.contains("invalid")) validateField(name);
    if (name === "password" && f("confirmPassword").value) validateField("confirmPassword");
  });
});

// Keep digit-only fields clean while typing.
f("otp").addEventListener("input", (e) => (e.target.value = e.target.value.replace(/\D/g, "")));
f("nid").addEventListener("input", (e) => (e.target.value = e.target.value.replace(/\D/g, "")));

/* ===================== PASSWORD VISIBILITY ===================== */
document.querySelectorAll(".eye").forEach((btn) => {
  btn.addEventListener("click", () => {
    const input = f(btn.dataset.toggle);
    const show = input.type === "password";
    input.type = show ? "text" : "password";
    btn.setAttribute("aria-label", show ? "Hide password" : "Show password");
  });
});

/* ===================== PROFILE PHOTO ===================== */
photoInput.addEventListener("change", () => {
  const file = photoInput.files[0];
  const errEl = document.querySelector('[data-error-for="photo"]');
  errEl.textContent = "";

  if (!file) { avatar.innerHTML = avatarDefault; return; }

  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
    errEl.textContent = "Use a PNG, JPG or WebP image.";
    photoInput.value = "";
    return;
  }
  if (file.size > MAX_PHOTO_MB * 1024 * 1024) {
    errEl.textContent = `Image must be under ${MAX_PHOTO_MB} MB.`;
    photoInput.value = "";
    return;
  }

  const img = document.createElement("img");
  img.alt = "Profile preview";
  img.src = URL.createObjectURL(file);
  img.onload = () => URL.revokeObjectURL(img.src);
  avatar.replaceChildren(img);
});

/* ===================== OTP ===================== */
sendOtpBtn.addEventListener("click", async () => {
  if (!validateField("phone")) { f("phone").focus(); return; }

  sendOtpBtn.disabled = true;
  otpHint.textContent = "Sending code…";

  try {
    if (DEMO_MODE) {
      await wait(600);
    } else {
      await postJSON(API.sendOtp, { phone: f("phone").value.trim() });
    }
    otpSent = true;
    showError("otp", "");
    otpHint.textContent = DEMO_MODE
      ? `Demo mode: use code ${DEMO_OTP}.`
      : "Code sent. Check your messages.";
    startCooldown(OTP_COOLDOWN_SECONDS);
    f("otp").focus();
  } catch (err) {
    otpHint.textContent = "";
    showError("otp", err.message);
    sendOtpBtn.disabled = false;
  }
});

function startCooldown(seconds) {
  let left = seconds;
  const tick = () => {
    if (left <= 0) {
      sendOtpBtn.disabled = false;
      sendOtpBtn.textContent = "Resend OTP";
      return;
    }
    sendOtpBtn.textContent = `Resend in ${left}s`;
    left -= 1;
    setTimeout(tick, 1000);
  };
  tick();
}

// If the phone number changes after an OTP was sent, the old code is no longer valid.
f("phone").addEventListener("input", () => {
  if (otpSent) {
    otpSent = false;
    f("otp").value = "";
    otpHint.textContent = "Phone number changed. Send a new OTP.";
  }
});

/* ===================== SUBMIT ===================== */
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  setStatus("", "");

  const results = Object.keys(validators).map((name) => [name, validateField(name)]);
  const firstBad = results.find(([, ok]) => !ok);
  if (firstBad) {
    f(firstBad[0]).focus();
    setStatus("Fix the highlighted fields and try again.", "fail");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Creating account…";

  try {
    // Use FormData so the profile photo uploads with the other fields.
    const data = new FormData();
    ["fullName", "username", "email", "password", "phone", "dob", "nid", "otp"].forEach((n) =>
      data.append(n, n === "password" ? f(n).value : f(n).value.trim())
    );
    if (photoInput.files[0]) data.append("photo", photoInput.files[0]);

    if (DEMO_MODE) {
      await wait(900);
      if (f("otp").value !== DEMO_OTP) throw new Error("Incorrect OTP.");
    } else {
      const res = await fetch(API.register, { method: "POST", body: data });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message || "Registration failed.");
    }

    setStatus("Account created. Redirecting to sign in…", "ok");
    form.reset();
    avatar.innerHTML = avatarDefault;
    otpSent = false;
    setTimeout(() => (window.location.href = "login.html"), 1500);
  } catch (err) {
    setStatus(err.message, "fail");
    submitBtn.disabled = false;
    submitBtn.textContent = "Create Patient Account";
  }
});