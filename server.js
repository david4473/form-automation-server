const http = require("http");
const ejs = require("ejs");
const fs = require("fs/promises");
const path = require("path");
const { PORT } = require("./src/config");
const { processUsers, SERVICE_AREAS } = require("./src/formAutomation");
const { addHistoryGroup, readHistory } = require("./src/historyStore");
const { readJsonBody, sendJson } = require("./src/http");
const { normalizeUsers } = require("./src/users");

const INDEX_VIEW = path.join(__dirname, "views", "index.ejs");
const PUBLIC_DIR = path.join(__dirname, "public");

function getContentType(filePath) {
  if (filePath.endsWith(".css")) {
    return "text/css; charset=utf-8";
  }

  if (filePath.endsWith(".js")) {
    return "application/javascript; charset=utf-8";
  }

  return "text/plain; charset=utf-8";
}

async function renderHomePage(res) {
  const history = await readHistory();
  const html = await ejs.renderFile(INDEX_VIEW, { history });

  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(html);
}

async function serveStaticAsset(req, res) {
  const relativePath = req.url.replace(/^\/public\//, "");
  const filePath = path.join(PUBLIC_DIR, relativePath);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    sendJson(res, 403, { ok: false, error: "Forbidden" });
    return;
  }

  try {
    const content = await fs.readFile(filePath);
    res.writeHead(200, { "Content-Type": getContentType(filePath) });
    res.end(content);
  } catch {
    sendJson(res, 404, { ok: false, error: "Asset not found" });
  }
}

const server = http.createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/") {
    await renderHomePage(res);
    return;
  }

  if (req.method === "GET" && req.url.startsWith("/public/")) {
    await serveStaticAsset(req, res);
    return;
  }

  if (req.method === "GET" && req.url === "/health") {
    sendJson(res, 200, { ok: true, status: "healthy" });
    return;
  }

  if (req.method === "POST" && req.url === "/submit") {
    try {
      const payload = await readJsonBody(req);
      const users = normalizeUsers(payload);
      const results = await processUsers(users);
      const historyEntry = await addHistoryGroup(users, results);
      const history = await readHistory();

      sendJson(res, 200, {
        ok: true,
        totalUsers: users.length,
        totalExpectedSubmissions: users.length * SERVICE_AREAS.length,
        results,
        historyEntry,
        history,
      });
    } catch (error) {
      sendJson(res, 400, {
        ok: false,
        error: error.message,
      });
    }
    return;
  }

  sendJson(res, 404, {
    ok: false,
    error: "Route not found",
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
