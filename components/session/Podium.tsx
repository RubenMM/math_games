import type { LeaderRow } from '@/lib/games/race';

const SLOTS = [
  { place: 2, height: 'h-24', medal: '🥈', color: 'bg-slate-200' },
  { place: 1, height: 'h-36', medal: '🥇', color: 'bg-amber-200' },
  { place: 3, height: 'h-16', medal: '🥉', color: 'bg-orange-200' },
];

/** Top three, classic 2-1-3 layout. */
export default function Podium({ rows }: { rows: LeaderRow[] }) {
  return (
    <div className="flex items-end justify-center gap-3">
      {SLOTS.map(({ place, height, medal, color }) => {
        const row = rows[place - 1];
        if (!row) return <div key={place} className="w-28 sm:w-40" />;
        return (
          <div key={place} className="flex w-28 flex-col items-center sm:w-40">
            <span className="text-3xl">{medal}</span>
            <span className="max-w-full truncate text-lg font-bold">{row.name}</span>
            <span className="mb-2 text-sm tabular-nums text-slate-500">{row.points.toLocaleString()}</span>
            <div className={`${height} ${color} flex w-full items-start justify-center rounded-t-lg pt-2 text-2xl font-extrabold text-slate-700`}>
              {place}
            </div>
          </div>
        );
      })}
    </div>
  );
}
