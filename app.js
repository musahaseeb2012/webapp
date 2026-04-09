/* =====================================================
   PIN Lookup — app.js
   ===================================================== */

// ── Data ─────────────────────────────────────────────

const COMMON_4 = [
  { pin: "1234", pattern: "Sequential" },
  { pin: "1111", pattern: "Repeating" },
  { pin: "0000", pattern: "Repeating" },
  { pin: "1212", pattern: "Alternating" },
  { pin: "7777", pattern: "Repeating" },
  { pin: "1004", pattern: "Year-like" },
  { pin: "2000", pattern: "Year-like" },
  { pin: "4444", pattern: "Repeating" },
  { pin: "2222", pattern: "Repeating" },
  { pin: "6969", pattern: "Keyboard pattern" },
  { pin: "9999", pattern: "Repeating" },
  { pin: "3333", pattern: "Repeating" },
  { pin: "5555", pattern: "Repeating" },
  { pin: "6666", pattern: "Repeating" },
  { pin: "1122", pattern: "Pair repeat" },
  { pin: "1313", pattern: "Alternating" },
  { pin: "8888", pattern: "Repeating" },
  { pin: "4321", pattern: "Reverse seq." },
  { pin: "2001", pattern: "Year-like" },
  { pin: "1010", pattern: "Alternating" },
];

const COMMON_6 = [
  { pin: "123456", pattern: "Sequential" },
  { pin: "111111", pattern: "Repeating" },
  { pin: "000000", pattern: "Repeating" },
  { pin: "123123", pattern: "Double seq." },
  { pin: "121212", pattern: "Alternating" },
  { pin: "112233", pattern: "Pair seq." },
  { pin: "654321", pattern: "Reverse seq." },
  { pin: "666666", pattern: "Repeating" },
  { pin: "222222", pattern: "Repeating" },
  { pin: "333333", pattern: "Repeating" },
  { pin: "999999", pattern: "Repeating" },
  { pin: "444444", pattern: "Repeating" },
  { pin: "555555", pattern: "Repeating" },
  { pin: "777777", pattern: "Repeating" },
  { pin: "888888", pattern: "Repeating" },
  { pin: "123321", pattern: "Palindrome" },
  { pin: "101010", pattern: "Alternating" },
  { pin: "102030", pattern: "Arithmetic" },
  { pin: "131313", pattern: "Alternating" },
  { pin: "159753", pattern: "Keypad diagonal" },
];

// Build fast lookup sets
const COMMON_4_SET = new Set(COMMON_4.map(d => d.pin));
const COMMON_6_SET = new Set(COMMON_6.map(d => d.pin));

// ── DOM refs ──────────────────────────────────────────

const form       = document.getElementById("lookup-form");
const pinInput   = document.getElementById("pin-input");
const errEl      = document.getElementById("form-error");
const resultEl   = document.getElementById("result-panel");
const tab4       = document.getElementById("tab-4");
const tab6       = document.getElementById("tab-6");
const panel4     = document.getElementById("panel-4");
const panel6     = document.getElementById("panel-6");
const genBtn     = document.getElementById("gen-btn");
const genResult  = document.getElementById("gen-result");

// ── Table rendering ───────────────────────────────────

function riskBadge(rank) {
  if (rank <= 5)  return '<span class="badge badge--high" aria-label="Very high risk">Very High</span>';
  if (rank <= 12) return '<span class="badge badge--high" aria-label="High risk">High</span>';
  return '<span class="badge badge--medium" aria-label="Medium risk">Medium</span>';
}

function buildTable(bodyId, data) {
  const tbody = document.getElementById(bodyId);
  tbody.innerHTML = data.map((d, i) => `
    <tr>
      <td>${i + 1}</td>
      <td class="pin-cell">${d.pin}</td>
      <td>${d.pattern}</td>
      <td>${riskBadge(i + 1)}</td>
    </tr>
  `).join("");
}

buildTable("table-4-body", COMMON_4);
buildTable("table-6-body", COMMON_6);

// ── Tabs ──────────────────────────────────────────────

function activateTab(tabEl, panelEl, otherTabEl, otherPanelEl) {
  tabEl.setAttribute("aria-selected", "true");
  tabEl.classList.add("tab--active");
  tabEl.removeAttribute("tabindex");
  panelEl.hidden = false;

  otherTabEl.setAttribute("aria-selected", "false");
  otherTabEl.classList.remove("tab--active");
  otherTabEl.setAttribute("tabindex", "-1");
  otherPanelEl.hidden = true;
}

tab4.addEventListener("click", () => activateTab(tab4, panel4, tab6, panel6));
tab6.addEventListener("click", () => activateTab(tab6, panel6, tab4, panel4));

// Arrow-key keyboard navigation for tabs (ARIA pattern)
[tab4, tab6].forEach((tab, idx, arr) => {
  tab.addEventListener("keydown", (e) => {
    let next = null;
    if (e.key === "ArrowRight") next = arr[(idx + 1) % arr.length];
    if (e.key === "ArrowLeft")  next = arr[(idx - 1 + arr.length) % arr.length];
    if (next) { next.focus(); next.click(); }
  });
});

// ── Validation & lookup ───────────────────────────────

function clearError() {
  errEl.hidden = true;
  errEl.textContent = "";
  pinInput.removeAttribute("aria-invalid");
}

function showError(msg) {
  errEl.textContent = msg;
  errEl.hidden = false;
  pinInput.setAttribute("aria-invalid", "true");
  pinInput.focus();
}

function getRankLabel(pin, dataset) {
  const idx = dataset.findIndex(d => d.pin === pin);
  return idx === -1 ? null : idx + 1;
}

function showResult(pin) {
  const is4 = pin.length === 4;
  const dataset   = is4 ? COMMON_4 : COMMON_6;
  const commonSet = is4 ? COMMON_4_SET : COMMON_6_SET;
  const isCommon  = commonSet.has(pin);
  const rank      = isCommon ? getRankLabel(pin, dataset) : null;

  let cls, icon, title, body;

  if (isCommon) {
    const severity = rank <= 5 ? "Very high" : rank <= 12 ? "High" : "Medium";
    cls   = rank <= 12 ? "result--danger" : "result--warn";
    icon  = rank <= 12 ? "&#x26A0;" : "&#x26A0;";
    title = `${severity} risk — ranked #${rank} most common`;
    body  = `This PIN appears in the top ${COMMON_4.length} most commonly used ${pin.length}-digit PINs. ` +
            `It is highly vulnerable to guessing attacks. Choose a different PIN.`;
  } else {
    cls   = "result--ok";
    icon  = "&#x2713;";
    title = "Not in our common PIN list";
    body  = `This PIN was not found in our list of the top ${dataset.length} most common ` +
            `${pin.length}-digit PINs. That said, always avoid patterns like birth years, ` +
            `repeating digits, or simple sequences.`;
  }

  resultEl.className = `result-panel ${cls}`;
  resultEl.innerHTML = `
    <div class="result-title">
      <span class="result-icon" aria-hidden="true">${icon}</span>
      ${escHtml(title)}
    </div>
    <span class="result-pin" aria-label="PIN: ${pin.split("").join(" ")}">${escHtml(pin)}</span>
    <p class="result-body">${escHtml(body)}</p>
  `;
  resultEl.hidden = false;
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  clearError();
  resultEl.hidden = true;

  const val = pinInput.value.trim();

  if (!/^\d+$/.test(val) || (val.length !== 4 && val.length !== 6)) {
    showError("Please enter exactly 4 or 6 digits (numbers only).");
    return;
  }

  showResult(val);
});

// Only allow numeric input
pinInput.addEventListener("input", () => {
  pinInput.value = pinInput.value.replace(/\D/g, "").slice(0, 6);
});

// ── Generator ─────────────────────────────────────────

function cryptoRandInt(max) {
  // Unbiased random integer in [0, max) using crypto
  const buf = new Uint32Array(1);
  const limit = Math.floor(0x100000000 / max) * max;
  let val;
  do { crypto.getRandomValues(buf); val = buf[0]; } while (val >= limit);
  return val % max;
}

function generatePin(length) {
  let pin;
  const commonSet = length === 4 ? COMMON_4_SET : COMMON_6_SET;
  const max = Math.pow(10, length);
  do {
    let n = cryptoRandInt(max);
    pin = String(n).padStart(length, "0");
  } while (commonSet.has(pin));
  return pin;
}

genBtn.addEventListener("click", () => {
  const length = parseInt(
    document.querySelector('input[name="gen-length"]:checked').value,
    10
  );
  const pin = generatePin(length);
  // Space digits for readability
  genResult.textContent = pin.split("").join(" ");
  genResult.setAttribute("aria-label", `Generated PIN: ${pin.split("").join(", ")}`);
});

// ── Helpers ───────────────────────────────────────────

function escHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
