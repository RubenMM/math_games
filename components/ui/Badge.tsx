export default function Badge({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">{children}</span>;
}
