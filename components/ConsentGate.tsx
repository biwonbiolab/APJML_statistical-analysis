"use client";

import { CONSENT } from "@/lib/survey-config";
import SingleChoice from "./SingleChoice";

interface Props {
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
}

export default function ConsentGate({ value, onChange, invalid }: Props) {
  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900">{CONSENT.heading}</h1>

      <div className="mt-4 space-y-3">
        {CONSENT.rows.map(([label, text]) => (
          <div key={label} className="rounded-xl bg-slate-50 p-3.5">
            <div className="text-sm font-semibold text-brand-dark">{label}</div>
            <p className="mt-1 text-[14.5px] leading-relaxed text-slate-700">
              {text}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <SingleChoice
          code={CONSENT.question.code}
          text={CONSENT.question.text}
          options={CONSENT.question.options}
          value={value}
          onChange={onChange}
          invalid={invalid}
        />
      </div>
    </div>
  );
}
