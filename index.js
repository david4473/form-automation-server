const http = require("http");
const { PORT } = require("./src/config");
const { processUsers, SERVICE_AREAS } = require("./src/formAutomation");
const { readJsonBody, sendJson } = require("./src/http");
const { normalizeUsers } = require("./src/users");

function setCorsHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

const server = http.createServer(async (req, res) => {
  setCorsHeaders(res);

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === "GET" && req.url === "/") {
    sendJson(res, 200, {
      ok: true,
      name: "forms-automation-server",
      routes: ["/health", "/submit"],
    });
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
      const historyEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: new Date().toISOString(),
      };

      sendJson(res, 200, {
        ok: true,
        totalUsers: users.length,
        totalExpectedSubmissions: users.length * SERVICE_AREAS.length,
        results,
        historyEntry,
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
  console.log(`Automation server listening on http://localhost:${PORT}`);
});
