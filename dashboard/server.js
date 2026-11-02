const { spawn } = require("node:child_process");
const { createServer } = require("node:http");
const { readFile } = require("node:fs/promises");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");
const port = Number(process.env.PORT ?? 4173);
const allowedProjects = new Set(["chromium", "webkit", "firefox"]);
const runHistory = [];
let activeRunId = null;
let activeChild = null;

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be an integer between 1 and 65535");
}

function sendJson(response, status, value) {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  response.end(JSON.stringify(value));
}

function isLoopback(address) {
  return address === "127.0.0.1" || address === "::1" || address === "::ffff:127.0.0.1";
}

function isLocalHostHeader(hostHeader) {
  return hostHeader === `127.0.0.1:${port}` || hostHeader === `localhost:${port}`;
}

function validateOrigin(request) {
  const origin = request.headers.origin;
  return (
    origin === undefined ||
    origin === `http://127.0.0.1:${port}` ||
    origin === `http://localhost:${port}`
  );
}

function validateBaseUrl(value) {
  if (typeof value !== "string" || value.length > 2048) {
    return null;
  }

  try {
    const url = new URL(value);
    if (
      !["http:", "https:"].includes(url.protocol) ||
      !url.hostname ||
      url.username ||
      url.password ||
      url.search ||
      url.hash
    ) {
      return null;
    }

    return url.href.replace(/\/$/, "");
  } catch {
    return null;
  }
}

function isDemoTarget(baseUrl) {
  const url = new URL(baseUrl);
  return (
    url.protocol === "http:" &&
    url.hostname === "127.0.0.1" &&
    url.port === String(port) &&
    url.pathname.replace(/\/$/, "") === "/demo-site"
  );
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 8192) {
        reject(new Error("Request body is too large"));
        request.destroy();
      }
    });
    request.on("end", () => {
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("Request body must be valid JSON"));
      }
    });
    request.on("error", reject);
  });
}

function addOutput(run, chunk) {
  run.logs.push(
    ...chunk
      .toString("utf8")
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => line.slice(0, 2000)),
  );
  if (run.logs.length > 400) {
    run.logs.splice(0, run.logs.length - 400);
  }
}

function publicRun(run) {
  return {
    id: run.id,
    project: run.project,
    baseUrl: run.baseUrl,
    demoMode: run.demoMode,
    status: run.status,
    startedAt: run.startedAt,
    finishedAt: run.finishedAt,
    exitCode: run.exitCode,
    logs: run.logs,
  };
}

function startRun(baseUrl, project) {
  const demoMode = isDemoTarget(baseUrl);
  const run = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    project,
    baseUrl,
    demoMode,
    status: "running",
    startedAt: new Date().toISOString(),
    finishedAt: null,
    exitCode: null,
    logs: [],
  };
  runHistory.unshift(run);
  runHistory.splice(20);
  activeRunId = run.id;

  const cliPath = require.resolve("@playwright/test/cli");
  const child = spawn(
    process.execPath,
    [cliPath, "test", "--project", project, "--reporter=line"],
    {
      cwd: projectRoot,
      env: {
        ...process.env,
        BASE_URL: demoMode ? `http://127.0.0.1:${port}` : baseUrl,
        WEBGUARD_DEMO: demoMode ? "1" : "",
        PLAYWRIGHT_INCLUDE_FIREFOX: project === "firefox" ? "1" : "",
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  activeChild = child;

  child.stdout.on("data", (chunk) => addOutput(run, chunk));
  child.stderr.on("data", (chunk) => addOutput(run, chunk));
  child.on("error", (error) => {
    addOutput(run, `Failed to start Playwright: ${error.message}`);
    run.status = "failed";
    run.finishedAt = new Date().toISOString();
    activeRunId = null;
    activeChild = null;
  });
  child.on("close", (code) => {
    run.exitCode = code;
    run.status = code === 0 ? "passed" : "failed";
    run.finishedAt = new Date().toISOString();
    activeRunId = null;
    activeChild = null;
  });

  return run;
}

async function handleRequest(request, response) {
  if (
    !isLoopback(request.socket.remoteAddress) ||
    !isLocalHostHeader(request.headers.host ?? "")
  ) {
    sendJson(response, 403, { error: "The dashboard is available only on this computer." });
    return;
  }

  const requestUrl = new URL(request.url ?? "/", `http://127.0.0.1:${port}`);
  if (request.method === "GET" && requestUrl.pathname === "/api/runs") {
    sendJson(response, 200, {
      activeRunId,
      runs: runHistory.map(publicRun),
    });
    return;
  }

  if (request.method === "GET" && requestUrl.pathname.startsWith("/api/runs/")) {
    const run = runHistory.find((item) => item.id === requestUrl.pathname.slice("/api/runs/".length));
    if (!run) {
      sendJson(response, 404, { error: "Run not found." });
      return;
    }
    sendJson(response, 200, publicRun(run));
    return;
  }

  if (request.method === "POST" && requestUrl.pathname === "/api/runs") {
    if (!validateOrigin(request)) {
      sendJson(response, 403, { error: "Request origin was not accepted." });
      return;
    }

    let payload;
    try {
      payload = await readJsonBody(request);
    } catch (error) {
      if (!response.destroyed) {
        sendJson(response, 400, { error: error.message });
      }
      return;
    }

    const baseUrl = validateBaseUrl(payload?.baseUrl);
    if (!baseUrl) {
      sendJson(response, 400, {
        error: "Enter a valid http or https URL without credentials, query parameters, or a fragment.",
      });
      return;
    }
    if (!allowedProjects.has(payload?.project)) {
      sendJson(response, 400, { error: "Choose Chromium, WebKit, or Firefox." });
      return;
    }
    if (activeRunId) {
      sendJson(response, 409, { error: "A test run is already in progress." });
      return;
    }

    sendJson(response, 202, publicRun(startRun(baseUrl, payload.project)));
    return;
  }

  if (request.method === "GET") {
    const files = {
      "/": ["index.html", "text/html; charset=utf-8"],
      "/demo-site": ["demo-site.html", "text/html; charset=utf-8"],
      "/styles.css": ["styles.css", "text/css; charset=utf-8"],
      "/demo-site.css": ["demo-site.css", "text/css; charset=utf-8"],
      "/app.js": ["app.js", "text/javascript; charset=utf-8"],
    };
    const file = files[requestUrl.pathname];
    if (file) {
      try {
        const content = await readFile(path.join(__dirname, file[0]));
        response.writeHead(200, {
          "content-type": file[1],
          "cache-control": "no-store",
          "x-content-type-options": "nosniff",
          "content-security-policy": "default-src 'self'; style-src 'self'; script-src 'self'; connect-src 'self'; img-src 'self' data:",
          "referrer-policy": "no-referrer",
        });
        response.end(content);
      } catch (error) {
        console.error("Failed to serve dashboard asset:", error);
        sendJson(response, 500, { error: "Could not load the dashboard." });
      }
      return;
    }
  }

  sendJson(response, 404, { error: "Not found." });
}

const server = createServer((request, response) => {
  handleRequest(request, response).catch((error) => {
    console.error("Dashboard request failed:", error);
    if (!response.headersSent) {
      sendJson(response, 500, { error: "The dashboard could not process the request." });
    } else {
      response.destroy();
    }
  });
});

server.listen(port, "127.0.0.1", () => {
  console.log(`WebGuard dashboard is ready at http://127.0.0.1:${port}`);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    activeChild?.kill("SIGTERM");
    server.close(() => process.exit(0));
  });
}
