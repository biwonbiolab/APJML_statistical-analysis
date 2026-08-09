"use client";

interface Props {
  code: string;
  text?: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
  // horizontal layout for short binary-style options (yes/no)
  horizontal?: boolean;
}

export default function SingleChoice({
  code,
  text,
  options,
  value,
  onChange,
  invalid,
  horizontal,
}: Props) {
  return (
    <fieldset
      className={`rounded-xl border p-4 ${
        invalid ? "border-red-400 bg-red-50" : "border-slate-200 bg-white"
      }`}
    >
      {text && (
        <legend className="field-label mb-3 px-1 font-medium">{text}</legend>
      )}
      <div className={horizontal ? "flex gap-3" : "flex flex-col gap-2"}>
        {options.map((opt) => {
          const selected = value === opt;
          return (
            <label
              key={opt}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-[15px] transition-colors ${
                horizontal ? "flex-1 justify-center text-center" : ""
              } ${
                selected
                  ? "border-brand bg-brand-light font-medium text-brand-dark"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <input
                type="radio"
                name={code}
                value={opt}
                checked={selected}
                onChange={() => onChange(opt)}
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
