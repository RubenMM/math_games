export default function Badge({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-emerald-400 px-2.5 py-0.5 text-xs font-extrabold text-white">{children}</span>;
}
