export default function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="w-full" aria-hidden={false} aria-label={`진행률 ${percent}%`}>
      <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
        <div
          className="h-full bg-brand transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
