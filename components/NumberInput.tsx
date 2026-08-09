"use client";

import type { Question } from "@/lib/types";

interface Props {
  question: Question;
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
}

// Stored value is always the raw integer as a string (no separators).
export default function NumberInput({ question, value, onChange, invalid }: Props) {
  const cfg = question.number ?? {};
  const display =
    cfg.thousandSep && value !== ""
      ? Number(value).toLocaleString("ko-KR")
      : value;

  function handle(raw: string) {
    // keep digits only
    const digits = raw.replace(/[^\d]/g, "");
    onChange(digits);
  }

  return (
    <fieldset
      className={`rounded-xl border p-4 ${
        invalid ? "border-red-400 bg-red-50" : "border-slate-200 bg-white"
      }`}
    >
      <legend className="field-label mb-3 px-1 font-medium">
        {question.text}
      </legend>
      <div className="flex items-center gap-2">
        <input
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={display}
          placeholder={cfg.placeholder}
          onChange={(e) => handle(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-[16px] outline-none focus:border-brand"
        />
        {cfg.unit && (
          <span className="shrink-0 text-slate-600">{cfg.unit}</span>
        )}
      </div>
    </fieldset>
  );
}
