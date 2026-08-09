"use client";

interface Props {
  code: string;
  text: string;
  anchors: [string, string];
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
}

const POINTS = ["1", "2", "3", "4", "5", "6", "7"];

export default function LikertItem({
  code,
  text,
  anchors,
  value,
  onChange,
  invalid,
}: Props) {
  return (
    <fieldset
      className={`rounded-xl border p-4 ${
        invalid ? "border-red-400 bg-red-50" : "border-slate-200 bg-white"
      }`}
    >
      <legend className="field-label mb-3 px-1 font-medium">{text}</legend>

      <div className="flex items-stretch justify-between gap-1">
        {POINTS.map((p) => {
          const selected = value === p;
          return (
            <label
              key={p}
              className={`flex flex-1 cursor-pointer flex-col items-center gap-1 rounded-lg border py-2 text-sm transition-colors ${
                selected
                  ? "border-brand bg-brand text-white font-semibold"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <input
                type="radio"
                name={code}
                value={p}
                checked={selected}
                onChange={() => onChange(p)}
                className="sr-only"
              />
              <span>{p}</span>
            </label>
          );
        })}
      </div>

      <div className="mt-2 flex justify-between px-1 text-xs text-slate-500">
        <span>1 = {anchors[0]}</span>
        <span>7 = {anchors[1]}</span>
      </div>
    </fieldset>
  );
}
