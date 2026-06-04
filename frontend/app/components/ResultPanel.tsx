import type {
  SubmissionProgressItem,
  SubmissionStatus,
} from "../misc/types";

type ResultPanelProps = {
  items: SubmissionProgressItem[];
};

function StatusIcon({ status }: { status: SubmissionStatus }) {
  if (status === "success") {
    return (
      <svg
        className="h-5 w-5"
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M16.25 5.75 8.5 13.5 4.75 9.75"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (status === "error") {
    return (
      <svg
        className="h-5 w-5"
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="m5.5 5.5 9 9m0-9-9 9"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (status === "submitting") {
    return (
      <span
        className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        aria-hidden="true"
      />
    );
  }

  return <span className="h-2.5 w-2.5 rounded-full bg-current" />;
}

function getStatusStyles(status: SubmissionStatus) {
  if (status === "success") {
    return "border-[#1d6b5733] bg-[#edf8f2] text-[#1d6b57]";
  }

  if (status === "error") {
    return "border-[#b4231833] bg-[#fff0ee] text-[#b42318]";
  }

  if (status === "submitting") {
    return "border-[#1d6b5733] bg-[#f8f4ea] text-[#1d6b57]";
  }

  return "border-[#dbcdb8] bg-[#fffaf0] text-[#6f6455]";
}

function getStatusText(item: SubmissionProgressItem) {
  if (item.status === "success") {
    return `${item.name}'s review submitted`;
  }

  if (item.status === "error") {
    return `${item.name}'s review failed`;
  }

  if (item.status === "submitting") {
    return `Submitting ${item.name}'s review`;
  }

  return `${item.name}'s review is waiting`;
}

export function ResultPanel({ items }: ResultPanelProps) {
  const submittedCount = items.filter((item) => item.status === "success").length;
  const failedCount = items.filter((item) => item.status === "error").length;
  const isComplete = items.every(
    (item) => item.status === "success" || item.status === "error",
  );

  return (
    <section
      className="rounded-[28px] border border-[#dbcdb8] bg-[#fffdf8] p-6 shadow-[0_18px_40px_rgba(50,35,15,0.08)]"
      aria-live="polite"
    >
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#1d6b57]">
            Latest Run
          </p>
          <h2 className="text-3xl font-semibold text-[#1f1a14]">
            Submission progress
          </h2>
        </div>
        <p className="text-sm text-[#6f6455]">
          {submittedCount} submitted
          {failedCount ? `, ${failedCount} failed` : ""}
          {!isComplete ? ` of ${items.length}` : ""}
        </p>
      </div>

      <ol className="grid gap-3">
        {items.map((item) => (
          <li
            className={`flex items-start gap-4 rounded-3xl border p-4 ${getStatusStyles(
              item.status,
            )}`}
            key={item.id}
          >
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/80">
              <StatusIcon status={item.status} />
            </span>
            <span className="min-w-0">
              <strong className="block text-base font-semibold">
                {getStatusText(item)}
              </strong>
              {item.message ? (
                <span className="mt-1 block text-sm opacity-80">
                  {item.message}
                </span>
              ) : null}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
