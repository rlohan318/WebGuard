const runButton = document.querySelector("#run-button");
const targetInput = document.querySelector("#target-url");
const formError = document.querySelector("#form-error");
const runList = document.querySelector("#run-list");
const activityEmpty = document.querySelector("#activity-empty");
const toast = document.querySelector("#toast");
const demoTargetButton = document.querySelector("#demo-target-button");
const browserOptions = [...document.querySelectorAll(".browser-option")];

let runs = [];
let openRunId = null;
let refreshTimer = null;
let toastTimer = null;

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3200);
}

function formatTime(value) {
  if (!value) return "Just now";
  return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

function statusIcon(status) {
  if (status === "passed") {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>';
  }
  if (status === "failed") {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8v5m0 4h.01"/><path d="M10.3 3.9 2.6 17.2A2 2 0 0 0 4.3 20h15.4a2 2 0 0 0 1.7-2.8L13.7 3.9a2 2 0 0 0-3.4 0Z"/></svg>';
  }
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>';
}

function renderRuns() {
  const passed = runs.filter((run) => run.status === "passed").length;
  const failed = runs.filter((run) => run.status === "failed").length;
  document.querySelector("#stat-total").textContent = String(runs.length);
  document.querySelector("#stat-passed").textContent = String(passed);
  document.querySelector("#stat-failed").textContent = String(failed);
  document.querySelector("#nav-run-count").textContent = String(runs.length);

  activityEmpty.hidden = runs.length > 0;
  runList.hidden = runs.length === 0;
  runList.innerHTML = runs.map((run) => {
    const expanded = run.id === openRunId;
    const statusLabel = run.status === "running" ? "Running" : run.status === "passed" ? "Passed" : "Failed";
    const logLines = run.logs.length
      ? run.logs.map((line) => escapeHtml(line)).join("\n")
      : "Waiting for Playwright output...";
    return `
      <div class="run-row ${expanded ? "selected" : ""}" data-run-id="${escapeHtml(run.id)}" role="button" tabindex="0" aria-expanded="${expanded}">
        <span class="run-status-icon ${escapeHtml(run.status)}">${statusIcon(run.status)}</span>
        <span class="run-summary">
          <strong>${escapeHtml(run.project)} ${run.demoMode ? "built-in fault demo" : "homepage smoke test"}</strong>
          <span>${escapeHtml(run.baseUrl)} · ${escapeHtml(formatTime(run.startedAt))}</span>
        </span>
        <span class="run-state ${escapeHtml(run.status)}"><span class="status-dot ${run.status === "passed" ? "dot-green" : run.status === "failed" ? "dot-amber" : ""}"></span>${statusLabel}</span>
        <span class="run-time">${escapeHtml(formatTime(run.finishedAt || run.startedAt))}</span>
        <svg class="run-chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="${expanded ? "m6 15 6-6 6 6" : "m9 18 6-6-6-6"}"/></svg>
      </div>
      <div class="run-details ${expanded ? "open" : ""}" data-run-details="${escapeHtml(run.id)}"><pre class="${run.logs.length ? "" : "log-empty"}">${logLines}</pre></div>
    `;
  }).join("");

  const active = runs.some((run) => run.status === "running");
  runButton.disabled = active;
  runButton.querySelector("span").textContent = active ? "Test running..." : "Run smoke test";
  runButton.querySelector(".button-play").innerHTML = active
    ? '<path d="M7 5h3v14H7zM14 5h3v14h-3z"/>'
    : '<path d="m8 5 11 7-11 7z"/>';
  runButton.setAttribute("aria-label", active ? "A test is currently running" : "Run homepage smoke test");
}

async function refreshRuns() {
  try {
    const response = await fetch("/api/runs", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Could not load run history.");
    runs = data.runs;
    if (data.activeRunId) {
      openRunId = data.activeRunId;
    }
    renderRuns();
    if (data.activeRunId) {
      if (!refreshTimer) {
        refreshTimer = setInterval(refreshRuns, 1000);
      }
    } else if (refreshTimer) {
      clearInterval(refreshTimer);
      refreshTimer = null;
    }
  } catch (error) {
    showToast(error.message || "Could not connect to the local test runner.");
  }
}

async function startRun() {
  formError.hidden = true;
  const baseUrl = targetInput.value.trim();
  const project = document.querySelector('input[name="project"]:checked')?.value;

  try {
    const response = await fetch("/api/runs", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ baseUrl, project }),
    });
    const result = await response.json();
    if (!response.ok) {
      if (response.status === 400) {
        formError.textContent = result.error;
        formError.hidden = false;
        targetInput.focus();
        return;
      }
      throw new Error(result.error || "Unable to start the test run.");
    }
    openRunId = result.id;
    await refreshRuns();
    if (!refreshTimer) {
      refreshTimer = setInterval(refreshRuns, 1000);
    }
  } catch (error) {
    showToast(error.message || "Could not connect to the local test runner.");
  }
}

runButton.addEventListener("click", startRun);
document.querySelector("#refresh-button").addEventListener("click", refreshRuns);
targetInput.addEventListener("input", () => {
  formError.hidden = true;
  demoTargetButton.classList.remove("active");
});

demoTargetButton.addEventListener("click", () => {
  targetInput.value = `${window.location.origin}/demo-site`;
  demoTargetButton.classList.add("active");
  formError.hidden = true;
});

document.querySelector("#run-list").addEventListener("click", (event) => {
  const row = event.target.closest("[data-run-id]");
  if (!row) return;
  openRunId = openRunId === row.dataset.runId ? null : row.dataset.runId;
  renderRuns();
});
document.querySelector("#run-list").addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const row = event.target.closest("[data-run-id]");
  if (!row) return;
  event.preventDefault();
  openRunId = openRunId === row.dataset.runId ? null : row.dataset.runId;
  renderRuns();
});

browserOptions.forEach((option) => {
  option.addEventListener("change", () => {
    browserOptions.forEach((item) => item.classList.toggle("selected", item.querySelector("input").checked));
  });
});

refreshRuns();
