import type { FormEvent } from "react";
import type { User } from "../misc/types";

type BatchFormProps = {
  users: User[];
  isLoading: boolean;
  soundEnabled: boolean;
  onAddUser: () => void;
  onRemoveUser: (index: number) => void;
  onUpdateUser: (index: number, field: keyof User, value: string) => void;
  onToggleSound: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void | Promise<void>;
};

export function BatchForm({
  users,
  isLoading,
  soundEnabled,
  onAddUser,
  onRemoveUser,
  onUpdateUser,
  onToggleSound,
  onSubmit,
}: BatchFormProps) {
  return (
    <section className="rounded-[28px] border border-[#dbcdb8] bg-[#fffdf8] p-6 shadow-[0_18px_40px_rgba(50,35,15,0.08)]">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#1d6b57]">
            New Batch
          </p>
          <h2 className="text-3xl leading-tight font-semibold text-[#1f1a14]">
            Add customer reviews
          </h2>
        </div>
        <div className="flex flex-col gap-3 sm:items-end">
          <p className="text-sm text-[#6f6455]">
            {users.length} customer(s) in this batch
          </p>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#dbcdb8] bg-[#fffaf0] px-4 py-2 text-sm font-medium text-[#1f1a14] transition hover:bg-[#f4ead9] disabled:cursor-not-allowed disabled:opacity-60"
            type="button"
            aria-pressed={soundEnabled}
            disabled={isLoading}
            onClick={onToggleSound}
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M3.75 7.5v5h3.5l4.25 3.25V4.25L7.25 7.5h-3.5Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              {soundEnabled ? (
                <path
                  d="M14 7a4 4 0 0 1 0 6m1.75-8.25a7 7 0 0 1 0 10.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="m14.25 7.25 3.5 3.5m0-3.5-3.5 3.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              )}
            </svg>
            {soundEnabled ? "Sound on" : "Sound off"}
          </button>
        </div>
      </div>

      <form className="grid gap-5" onSubmit={onSubmit}>
        <div className="grid gap-4">
          {users.map((user, index) => (
            <div
              className="relative grid gap-4 rounded-3xl border border-[#dbcdb8] bg-[#fffaf0] p-5 pt-6"
              key={user.id}
            >
              {index > 0 ? (
                <button
                  className="absolute top-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#6f645514] text-2xl leading-none text-[#6f6455] transition hover:bg-[#6f645524] disabled:opacity-45"
                  type="button"
                  aria-label={`Remove customer ${index + 1}`}
                  onClick={() => onRemoveUser(index)}
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              ) : null}

              <div className="flex items-center justify-between gap-3">
                <h3 className="text-xl font-semibold text-[#1f1a14]">
                  Customer {index + 1}
                </h3>
              </div>

              <label className="grid gap-1.5 text-sm text-[#6f6455]">
                <span>Name</span>
                <input
                  className="w-full rounded-2xl border border-[#dbcdb8] bg-white px-4 py-3 text-[#1f1a14] outline-none ring-0 transition focus:border-[#1d6b57] focus:outline-none focus:ring-4 focus:ring-[#1d6b573d]"
                  name={`name-${index}`}
                  type="text"
                  required
                  value={user.name}
                  onChange={(event) =>
                    onUpdateUser(index, "name", event.target.value)
                  }
                />
              </label>

              <label className="grid gap-1.5 text-sm text-[#6f6455]">
                <span>Phone</span>
                <input
                  className="w-full rounded-2xl border border-[#dbcdb8] bg-white px-4 py-3 text-[#1f1a14] outline-none ring-0 transition focus:border-[#1d6b57] focus:outline-none focus:ring-4 focus:ring-[#1d6b573d]"
                  name={`phone-${index}`}
                  type="text"
                  required
                  value={user.phone}
                  onChange={(event) =>
                    onUpdateUser(index, "phone", event.target.value)
                  }
                />
              </label>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <button
            className="min-w-[260px] rounded-full bg-[#ece3d2] px-5 py-3 text-sm font-medium text-[#1f1a14] transition hover:bg-[#e2d6c0] disabled:cursor-not-allowed disabled:opacity-60"
            type="button"
            disabled={isLoading}
            onClick={onAddUser}
          >
            Add another customer
          </button>
        </div>

        <div>
          <button
            className="rounded-full bg-[#1d6b57] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#175645] disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={isLoading}
          >
            Submit batch
          </button>
        </div>
      </form>
    </section>
  );
}
