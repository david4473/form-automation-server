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
import type {
  HistoryEntry,
  HistoryUser,
  SubmissionProgressItem,
  User,
} from "./misc/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_FORM_URL || "http://localhost:10000";

type AutomationResult = {
  status?: string;
  error?: string;
};

export default function Home() {
  const [users, setUsers] = useState<User[]>([createEmptyUser()]);
  const [history, setHistory] = useState<HistoryEntry[]>(readStoredHistory);
  const [isLoading, setIsLoading] = useState(false);
  const [submissionProgress, setSubmissionProgress] = useState<
    SubmissionProgressItem[]
  >([]);
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
    setHistoryError("");
    setSubmissionProgress(
      usersToSubmit.map((user, index) => ({
        id: `${Date.now()}-${index}`,
        name: user.name,
        phone: user.phone,
        status: "pending",
      })),
    );

    try {
      const runResults: unknown[] = [];

      for (const [index, user] of usersToSubmit.entries()) {
        setSubmissionProgress((currentItems) =>
          currentItems.map((item, itemIndex) =>
            itemIndex === index
              ? { ...item, status: "submitting", message: undefined }
              : item,
          ),
        );

        try {
          const response = await fetch(`${API_BASE_URL}/submit`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ users: [user] }),
          });

          const payload = await response.json();

          if (!response.ok || !payload.ok) {
            throw new Error(payload.error || "Submission failed");
          }

          const results: AutomationResult[] = Array.isArray(payload.results)
            ? payload.results
            : [];
          runResults.push(...results);

          const failedResult = results.find(
            (result) => result.status !== "success",
          );

          if (failedResult) {
            const message =
              typeof failedResult.error === "string"
                ? failedResult.error
                : "One or more service areas failed";

            throw new Error(message);
          }

          setSubmissionProgress((currentItems) =>
            currentItems.map((item, itemIndex) =>
              itemIndex === index
                ? { ...item, status: "success", message: undefined }
                : item,
            ),
          );
        } catch (error) {
          setSubmissionProgress((currentItems) =>
            currentItems.map((item, itemIndex) =>
              itemIndex === index
                ? {
                    ...item,
                    status: "error",
                    message:
                      error instanceof Error
                        ? error.message
                        : "Submission failed",
                  }
                : item,
            ),
          );
        }
      }

      if (
        runResults.some(
          (result) =>
            typeof result === "object" &&
            result !== null &&
            "status" in result &&
            result.status === "success",
        )
      ) {
        const historyEntry: HistoryEntry = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          createdAt: new Date().toISOString(),
          users: usersToSubmit,
          results: runResults,
        };
        setHistory((currentHistory) => {
          const nextHistory = [historyEntry, ...currentHistory].slice(
            0,
            HISTORY_LIMIT,
          );
          writeStoredHistory(nextHistory);
          return nextHistory;
        });
      }
    } catch (error) {
      setHistoryError(
        error instanceof Error ? error.message : "Submission failed",
      );
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
      {submissionProgress.length ? (
        <ResultPanel items={submissionProgress} />
      ) : null}

      <HistorySection
        history={history}
        historyError={historyError}
        isLoading={isLoading}
        onResubmit={submitUsers}
      />
    </main>
  );
}
