"use client";

interface Props {
  code: string;
  text: string;
  options: string[];
  value: string; // comma-joined selected labels
  exclusiveValues?: string[];
  onChange: (value: string) => void;
  invalid?: boolean;
}

export default function MultiChoice({
  code,
  text,
  options,
  value,
  exclusiveValues = [],
  onChange,
  invalid,
}: Props) {
  const selected = value ? value.split(",").map((v) => v.trim()).filter(Boolean) : [];

  function toggle(opt: string) {
    let next: string[];
    const isExclusive = exclusiveValues.includes(opt);
    if (selected.includes(opt)) {
      next = selected.filter((s) => s !== opt);
    } else if (isExclusive) {
      // selecting an exclusive option clears everything else
      next = [opt];
    } else {
      // selecting a normal option clears any exclusive options
      next = [...selected.filter((s) => !exclusiveValues.includes(s)), opt];
    }
    // preserve original option order
    const ordered = options.filter((o) => next.includes(o));
    onChange(ordered.join(","));
  }

  return (
    <fieldset
      className={`rounded-xl border p-4 ${
        invalid ? "border-red-400 bg-red-50" : "border-slate-200 bg-white"
      }`}
    >
      <legend className="field-label mb-3 px-1 font-medium">{text}</legend>
      <div className="flex flex-col gap-2">
        {options.map((opt) => {
          const isSel = selected.includes(opt);
          return (
            <label
              key={opt}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-[15px] transition-colors ${
                isSel
                  ? "border-brand bg-brand-light font-medium text-brand-dark"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <input
                type="checkbox"
                name={`${code}_${opt}`}
                checked={isSel}
                onChange={() => toggle(opt)}
                className="h-4 w-4 accent-[#22497a]"
              />
              <span>{opt}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
