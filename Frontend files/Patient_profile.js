"use strict";

/* ===================== CONFIG ===================== */
// Set to false when your real backend is ready.
const DEMO_MODE = true;

const API = {
  getProfile: "/api/patients/me",            // GET
  updateProfile: "/api/patients/me",         // PATCH  { fullName, username }
  changePassword: "/api/patients/me/password", // POST { currentPassword, newPassword }
  logout: "/api/auth/logout",                // POST
};

const LOGIN_PAGE = "login.html";

// Demo data only. In production this comes from GET /api/patients/me.
const DEMO_PROFILE = {
  fullName: "Safayet Islam",
  username: "safayet",
  email: "sicseuiu@gmail.com",
  dob: "2006-04-12",
  nid: "1234567890",
  photo: "",                 // URL of the profile picture, or "" to show initials
  verified: true,
  memberSince: "January 2025",
  totalAppointments: 4,
  unreadNotifications: 2,
};

/* ===================== STATE & HELPERS ===================== */
let profile = null;

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(url, method, body) {
  const res = await fetch(url, {
    method,
    credentials: "include", // sends the httpOnly session cookie
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) { window.location.href = LOGIN_PAGE; throw new Error("Session expired."); }
  if (!res.ok) throw new Error(data.message || "Something went wrong. Try again.");
  return data;
}

let toastTimer;
function toast(message, type = "ok") {
  const el = $("#toast");
  el.textContent = message;
  el.className = "toast" + (type === "fail" ? " fail" : "");
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (el.hidden = true), 3200);
}

/* ===================== RENDER ===================== */
function initials(name) {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";
}

function renderAvatars() {
  $$("[data-avatar]").forEach((el) => {
    if (profile.photo) {
      const img = document.createElement("img");
      img.src = profile.photo;
      img.alt = profile.fullName;
      img.onerror = () => (el.textContent = initials(profile.fullName));
      el.replaceChildren(img);
    } else {
      el.textContent = initials(profile.fullName);
    }
  });
}

function render() {
  // textContent (not innerHTML) keeps user data from injecting HTML.
  $$("[data-bind]").forEach((el) => (el.textContent = profile[el.dataset.bind] ?? ""));
  renderAvatars();
  fillForm();

  ["verifiedBadge", "verifiedRow"].forEach((id) => {
    const el = document.getElementById(id);
    el.textContent = profile.verified ? "Verified" : "Not verified";
    el.className = "badge " + (profile.verified ? "badge-green" : "badge-amber");
  });

  const unread = profile.unreadNotifications || 0;
  $("#navCount").textContent = unread;
  $("#navCount").hidden = unread === 0;
  $("#bellDot").hidden = unread === 0;
  document.title = `My Profile | ${profile.fullName}`;
}

function fillForm() {
  const form = $("#personalForm");
  ["fullName", "username", "dob", "nid"].forEach((name) => (form.elements[name].value = profile[name] ?? ""));
}

/* ===================== TABS ===================== */
const TABS = ["personal", "account", "security"];

function showTab(name, { focus = false, updateHash = true } = {}) {
  if (!TABS.includes(name)) name = "personal";
  TABS.forEach((t) => {
    const selected = t === name;
    const tab = $(`#tab-${t}`);
    tab.setAttribute("aria-selected", selected);
    tab.tabIndex = selected ? 0 : -1;
    $(`#panel-${t}`).hidden = !selected;
    if (selected && focus) tab.focus();
  });
  if (updateHash) history.replaceState(null, "", "#" + name);
}

$$(".tabs [role=tab]").forEach((tab) => {
  tab.addEventListener("click", () => showTab(tab.id.replace("tab-", "")));
  tab.addEventListener("keydown", (e) => {
    const i = TABS.indexOf(tab.id.replace("tab-", ""));
    if (e.key === "ArrowRight") showTab(TABS[(i + 1) % TABS.length], { focus: true });
    if (e.key === "ArrowLeft") showTab(TABS[(i + TABS.length - 1) % TABS.length], { focus: true });
  });
});
window.addEventListener("hashchange", () => showTab(location.hash.slice(1), { updateHash: false }));

/* ===================== EDIT MODE ===================== */
const forms = {
  personalForm: { actions: "#personalActions", fields: ["fullName", "username"] },
  securityForm: { actions: "#securityActions", fields: ["currentPassword", "newPassword", "confirmNewPassword"] },
};

function setEditing(formId, editing) {
  const cfg = forms[formId];
  const form = document.getElementById(formId);
  cfg.fields.forEach((id) => (document.getElementById(id).disabled = !editing));
  $(cfg.actions).hidden = !editing;
  $(`[data-edit="${formId}"]`).setAttribute("aria-pressed", editing);
  if (formId === "personalForm") $("#lockedHint").hidden = !editing;

  if (!editing) {
    $$(".error", form).forEach((el) => (el.textContent = ""));
    $$("input", form).forEach((el) => el.classList.remove("invalid"));
    if (formId === "personalForm") fillForm();
    if (formId === "securityForm") {
      form.reset();
      $$("input[type=text]", form).forEach((el) => (el.type = "password")); // re-hide after "show"
    }
  } else {
    document.getElementById(cfg.fields[0]).focus();
  }
}

$$("[data-edit]").forEach((btn) =>
  btn.addEventListener("click", () => {
    const id = btn.dataset.edit;
    setEditing(id, btn.getAttribute("aria-pressed") !== "true");
  })
);
$$("[data-cancel]").forEach((btn) => btn.addEventListener("click", () => setEditing(btn.dataset.cancel, false)));

/* ===================== VALIDATION ===================== */
function showError(name, message) {
  const input = document.getElementById(name);
  const el = $(`[data-error-for="${name}"]`);
  if (el) el.textContent = message;
  input.classList.toggle("invalid", Boolean(message));
  input.setAttribute("aria-invalid", message ? "true" : "false");
}

const validators = {
  fullName: (v) =>
    v.length < 3 ? "Enter your full name (at least 3 characters)." :
    !/^[A-Za-z\u0980-\u09FF .'-]+$/.test(v) ? "Use letters only in your name." : "",

  username: (v) =>
    !/^[a-zA-Z0-9_]{4,20}$/.test(v) ? "4–20 characters: letters, numbers, underscore." : "",

  currentPassword: (v) => (!v ? "Enter your current password." : ""),

  newPassword: (v) =>
    v.length < 8 ? "Use at least 8 characters." :
    !/[A-Z]/.test(v) || !/[a-z]/.test(v) || !/\d/.test(v)
      ? "Include an uppercase letter, a lowercase letter and a number." :
    v === $("#currentPassword").value ? "New password must be different from the current one." : "",

  confirmNewPassword: (v) => (v !== $("#newPassword").value ? "Passwords do not match." : ""),
};

function validate(name) {
  const input = document.getElementById(name);
  // Never trim passwords, since spaces can be intentional.
  const value = input.type === "password" || name.toLowerCase().includes("password") ? input.value : input.value.trim();
  const message = validators[name](value);
  showError(name, message);
  return !message;
}

Object.keys(validators).forEach((name) => {
  const input = document.getElementById(name);
  input.addEventListener("blur", () => !input.disabled && validate(name));
  input.addEventListener("input", () => {
    if (input.classList.contains("invalid")) validate(name);
    if (name === "newPassword" && $("#confirmNewPassword").value) validate("confirmNewPassword");
  });
});

/* ===================== SAVE: PERSONAL INFO ===================== */
$("#personalForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  if ($("#personalActions").hidden) return; // pressing Enter while not editing

  const bad = forms.personalForm.fields.find((n) => !validate(n));
  if (bad) { document.getElementById(bad).focus(); return; }

  const payload = {
    fullName: $("#fullName").value.trim(),
    username: $("#username").value.trim(),
  };
  const btn = $("#personalForm .btn-primary");
  btn.disabled = true;
  btn.textContent = "Saving…";

  try {
    if (DEMO_MODE) await wait(600);
    else Object.assign(profile, await api(API.updateProfile, "PATCH", payload)); // server returns the saved profile

    if (DEMO_MODE) Object.assign(profile, payload);
    render();
    setEditing("personalForm", false);
    toast("Profile updated.");
  } catch (err) {
    // Typical case: "Username already taken". Show it under the field.
    showError("username", err.message);
    toast(err.message, "fail");
  } finally {
    btn.disabled = false;
    btn.textContent = "Save changes";
  }
});

/* ===================== SAVE: PASSWORD ===================== */
$("#securityForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  if ($("#securityActions").hidden) return;

  const bad = forms.securityForm.fields.find((n) => !validate(n));
  if (bad) { document.getElementById(bad).focus(); return; }

  const btn = $("#securityForm .btn-primary");
  btn.disabled = true;
  btn.textContent = "Updating…";

  try {
    if (DEMO_MODE) {
      await wait(700);
    } else {
      await api(API.changePassword, "POST", {
        currentPassword: $("#currentPassword").value,
        newPassword: $("#newPassword").value,
      });
    }
    setEditing("securityForm", false);
    toast("Password updated.");
  } catch (err) {
    showError("currentPassword", err.message); // most common failure: wrong current password
    toast(err.message, "fail");
  } finally {
    btn.disabled = false;
    btn.textContent = "Update password";
  }
});

/* ===================== PASSWORD VISIBILITY ===================== */
$$(".eye").forEach((btn) =>
  btn.addEventListener("click", () => {
    const input = document.getElementById(btn.dataset.toggle);
    const show = input.type === "password";
    input.type = show ? "text" : "password";
    btn.setAttribute("aria-label", show ? "Hide password" : "Show password");
  })
);

/* ===================== MOBILE SIDEBAR ===================== */
const sidebar = $("#sidebar");
const scrim = $("#scrim");
const menuBtn = $("#menuBtn");

function toggleMenu(open) {
  sidebar.classList.toggle("open", open);
  scrim.hidden = !open;
  menuBtn.setAttribute("aria-expanded", open);
}
menuBtn.addEventListener("click", () => toggleMenu(!sidebar.classList.contains("open")));
scrim.addEventListener("click", () => toggleMenu(false));
document.addEventListener("keydown", (e) => e.key === "Escape" && toggleMenu(false));
$("#sidebar .mini-profile").addEventListener("click", () => toggleMenu(false));

/* ===================== LOGOUT ===================== */
$("#logoutBtn").addEventListener("click", async () => {
  if (!confirm("Log out of your account?")) return;
  try {
    if (!DEMO_MODE) await api(API.logout, "POST");
  } finally {
    window.location.href = LOGIN_PAGE;
  }
});

/* ===================== INIT ===================== */
(async function init() {
  try {
    profile = DEMO_MODE ? { ...DEMO_PROFILE } : await api(API.getProfile, "GET");
    render();
    showTab(location.hash.slice(1), { updateHash: false });
  } catch (err) {
    $$("[data-bind]").forEach((el) => (el.textContent = ""));
    toast(err.message, "fail");
  }
})();