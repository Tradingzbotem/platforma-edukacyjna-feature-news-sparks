export default function ExamTrackProgress({ percent }: { percent: number }) {
  const p = Math.min(100, Math.max(0, percent));
  return (
    <div className="shrink-0 text-right">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        Realizacja programu
      </div>
      <div className="mt-2 w-52 max-w-full h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-slate-200/90 to-white"
          style={{ width: `${p}%` }}
        />
      </div>
      <div className="mt-1.5 text-xs tabular-nums text-slate-400">{p}% ścieżki</div>
    </div>
  );
}
