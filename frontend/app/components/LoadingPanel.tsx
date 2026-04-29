export function LoadingPanel() {
  return (
    <section
      className="flex items-center gap-5 rounded-[28px] border border-[#dbcdb8] bg-[#fffdf8] p-6 shadow-[0_18px_40px_rgba(50,35,15,0.08)]"
      aria-live="polite"
    >
      <div className="h-11 w-11 animate-spin rounded-full border-4 border-[#1d6b5726] border-t-[#1d6b57]" />
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#1d6b57]">
          In Progress
        </p>
        <h2 className="text-2xl font-semibold text-[#1f1a14]">
          Playwright is filling the Microsoft Form
        </h2>
        <p className="mt-2 text-sm text-[#6f6455]">
          Please keep this page open while the automation completes.
        </p>
      </div>
    </section>
  );
}
