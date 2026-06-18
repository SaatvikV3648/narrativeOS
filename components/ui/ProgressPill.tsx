export default function ProgressPill({ label }: { label: string }) {
  return (
    <span className="inline-flex rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">
      {label}
    </span>
  );
}
