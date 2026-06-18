export default function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-[20px] border border-zinc-800 bg-zinc-900 p-6">{children}</div>;
}
