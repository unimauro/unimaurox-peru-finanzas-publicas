export function SkeletonCard() {
  return (
    <div className="card animate-pulse">
      <div className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-700" />
      <div className="mt-3 h-7 w-32 rounded bg-slate-200 dark:bg-slate-700" />
      <div className="mt-2 h-3 w-20 rounded bg-slate-200 dark:bg-slate-700" />
    </div>
  );
}

export function SkeletonChart({ altura = 320 }) {
  return (
    <div className="card animate-pulse">
      <div className="h-4 w-40 rounded bg-slate-200 dark:bg-slate-700" />
      <div
        className="mt-4 rounded bg-slate-100 dark:bg-slate-800"
        style={{ height: altura }}
      />
    </div>
  );
}
