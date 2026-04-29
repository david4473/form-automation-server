import { formatSentAt } from "../misc/history";
import type { HistoryEntry, HistoryUser } from "../misc/types";

type HistorySectionProps = {
  history: HistoryEntry[];
  historyError: string;
  isLoading: boolean;
  onResubmit: (users: HistoryUser[]) => void | Promise<void>;
};

export function HistorySection({
  history,
  historyError,
  isLoading,
  onResubmit,
}: HistorySectionProps) {
  return (
    <section className="rounded-[28px] border border-[#dbcdb8] bg-[#fffdf8] p-6 shadow-[0_18px_40px_rgba(50,35,15,0.08)]">
      <div className="mb-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#1d6b57]">
          History
        </p>
        <h2 className="text-3xl font-semibold text-[#1f1a14]">
          Previously submitted groups
        </h2>
      </div>

      {historyError ? (
        <p className="text-sm text-[#6f6455]">{historyError}</p>
      ) : null}

      <div className="grid gap-4">
        {!history.length && !historyError ? (
          <p className="text-sm text-[#6f6455]">
            No groups have been submitted yet.
          </p>
        ) : null}

        {history.map((group, index) => (
          <article
            className="rounded-3xl border border-[#dbcdb8] bg-[#fffaf0] p-5"
            key={group.id}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-[#1f1a14]">
                  Group {history.length - index}
                </h3>
                <p className="mt-1 text-sm text-[#6f6455]">
                  Sent {formatSentAt(group.createdAt)}
                </p>
              </div>
              <button
                className="rounded-full bg-[#ece3d2] px-5 py-3 text-sm font-medium text-[#1f1a14] transition hover:bg-[#e2d6c0] disabled:cursor-not-allowed disabled:opacity-60"
                type="button"
                disabled={isLoading}
                onClick={() => onResubmit(group.users)}
              >
                Send again
              </button>
            </div>

            <ul className="mt-4 grid gap-3 pl-5 text-sm text-[#6f6455]">
              {group.users.map((user, userIndex) => (
                <li className="grid gap-0.5" key={`${group.id}-${userIndex}`}>
                  <strong className="text-[#1f1a14]">{user.name}</strong>
                  <span>{user.phone}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
