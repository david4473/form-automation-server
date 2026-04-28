const fs = require("fs/promises");
const path = require("path");

const HISTORY_FILE = path.join(__dirname, "..", "data", "history.json");

async function ensureHistoryFile() {
  try {
    await fs.access(HISTORY_FILE);
  } catch {
    await fs.mkdir(path.dirname(HISTORY_FILE), { recursive: true });
    await fs.writeFile(HISTORY_FILE, "[]", "utf8");
  }
}

async function readHistory() {
  await ensureHistoryFile();
  const raw = await fs.readFile(HISTORY_FILE, "utf8");

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeHistory(entries) {
  await ensureHistoryFile();
  await fs.writeFile(HISTORY_FILE, JSON.stringify(entries, null, 2), "utf8");
}

async function addHistoryGroup(users, results) {
  const entries = await readHistory();
  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    users,
    results,
  };

  entries.unshift(entry);
  await writeHistory(entries.slice(0, 25));
  return entry;
}

module.exports = {
  addHistoryGroup,
  readHistory,
};
