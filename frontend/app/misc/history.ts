import type { HistoryEntry, HistoryUser, User } from "./types";

export const HISTORY_STORAGE_KEY = "forms-automation-history";
export const HISTORY_LIMIT = 25;

export function createEmptyUser(): User {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: "",
    phone: "",
  };
}

export function formatSentAt(value: string) {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

export function readStoredHistory(): HistoryEntry[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeStoredHistory(history: HistoryEntry[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    HISTORY_STORAGE_KEY,
    JSON.stringify(history.slice(0, HISTORY_LIMIT)),
  );
}

export function toHistoryUsers(users: User[]): HistoryUser[] {
  return users.map((user) => ({
    name: user.name,
    phone: user.phone,
  }));
}
