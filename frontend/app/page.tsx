"use client";

import { useState } from "react";
import { BatchForm } from "./components/BatchForm";
import { HistorySection } from "./components/HistorySection";
import { LoadingPanel } from "./components/LoadingPanel";
import { ResultPanel } from "./components/ResultPanel";
import {
  createEmptyUser,
  HISTORY_LIMIT,
  readStoredHistory,
  toHistoryUsers,
  writeStoredHistory,
} from "./misc/history";
import type { HistoryEntry, HistoryUser, User } from "./misc/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

export default function Home() {
  const [users, setUsers] = useState<User[]>([createEmptyUser()]);
  const [history, setHistory] = useState<HistoryEntry[]>(readStoredHistory);
  const [isLoading, setIsLoading] = useState(false);
  const [resultText, setResultText] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [historyError, setHistoryError] = useState("");

  function updateUser(index: number, field: keyof User, value: string) {
    setUsers((currentUsers) =>
      currentUsers.map((user, userIndex) =>
        userIndex === index ? { ...user, [field]: value } : user,
      ),
    );
  }

  function addUser() {
    setUsers((currentUsers) => [...currentUsers, createEmptyUser()]);
  }

  function removeUser(index: number) {
    setUsers((currentUsers) => {
      if (currentUsers.length === 1) {
        return currentUsers;
      }

      return currentUsers.filter((_, userIndex) => userIndex !== index);
    });
  }

  async function submitUsers(usersToSubmit: HistoryUser[]) {
    setIsLoading(true);
    setShowResult(false);
    setHistoryError("");

    try {
      const response = await fetch(`${API_BASE_URL}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ users: usersToSubmit }),
      });

      const payload = await response.json();

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Submission failed");
      }

      const historyEntry: HistoryEntry = {
        id:
          typeof payload.historyEntry?.id === "string"
            ? payload.historyEntry.id
            : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt:
          typeof payload.historyEntry?.createdAt === "string"
            ? payload.historyEntry.createdAt
            : new Date().toISOString(),
        users: usersToSubmit,
        results: Array.isArray(payload.results) ? payload.results : [],
      };
      setHistory((currentHistory) => {
        const nextHistory = [historyEntry, ...currentHistory].slice(
          0,
          HISTORY_LIMIT,
        );
        writeStoredHistory(nextHistory);
        return nextHistory;
      });
      setResultText(JSON.stringify(payload, null, 2));
      setShowResult(true);
    } catch (error) {
      setResultText(
        error instanceof Error ? error.message : "Submission failed",
      );
      setShowResult(true);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitUsers(toHistoryUsers(users));
  }

  return (
    <main className="mx-auto flex w-[min(1100px,calc(100%-32px))] flex-col gap-6 py-8 pb-16 sm:w-[min(1100px,calc(100%-40px))]">
      <BatchForm
        users={users}
        isLoading={isLoading}
        onAddUser={addUser}
        onRemoveUser={removeUser}
        onUpdateUser={updateUser}
        onSubmit={handleSubmit}
      />

      {isLoading ? <LoadingPanel /> : null}
      {showResult ? <ResultPanel resultText={resultText} /> : null}

      <HistorySection
        history={history}
        historyError={historyError}
        isLoading={isLoading}
        onResubmit={submitUsers}
      />
    </main>
  );
}
