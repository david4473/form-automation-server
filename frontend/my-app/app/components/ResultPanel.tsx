type ResultPanelProps = {
  resultText: string;
};

export function ResultPanel({ resultText }: ResultPanelProps) {
  return (
    <section
      className="rounded-[28px] border border-[#dbcdb8] bg-[#fffdf8] p-6 shadow-[0_18px_40px_rgba(50,35,15,0.08)]"
      aria-live="polite"
    >
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#1d6b57]">
        Latest Run
      </p>
      <h2 className="text-3xl font-semibold text-[#1f1a14]">
        Submission result
      </h2>
      <pre className="mt-4 max-h-[360px] overflow-auto rounded-3xl border border-[#dbcdb8] bg-[#f8f4ea] p-4 text-sm leading-6 whitespace-pre-wrap break-words text-[#1f1a14]">
        {resultText}
      </pre>
    </section>
  );
}
