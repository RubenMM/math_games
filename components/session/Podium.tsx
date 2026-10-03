import Avatar from '@/components/ui/Avatar';
import type { LeaderRow } from '@/lib/games/race';

const SLOTS = [
  { place: 2, height: 'h-24', medal: '🥈', color: 'bg-slate-300', delay: '0.3s' },
  { place: 1, height: 'h-36', medal: '🥇', color: 'bg-amber-300', delay: '0.6s' },
  { place: 3, height: 'h-16', medal: '🥉', color: 'bg-orange-300', delay: '0s' },
];

/** Top three, classic 2-1-3 layout; blocks rise one after another. */
export default function Podium({ rows }: { rows: LeaderRow[] }) {
  return (
    <div className="flex items-end justify-center gap-3">
      {SLOTS.map(({ place, height, medal, color, delay }) => {
        const row = rows[place - 1];
        if (!row) return <div key={place} className="w-28 sm:w-40" />;
        return (
          <div key={place} className="flex w-28 flex-col items-center sm:w-40">
            <span className="animate-[wiggle_1.2s_ease-in-out_infinite] text-4xl">{medal}</span>
            <Avatar name={row.name} className="text-4xl" />
            <span className="max-w-full truncate text-lg font-extrabold">{row.name}</span>
            <span className="mb-2 text-sm font-bold tabular-nums text-violet-500">{row.points.toLocaleString()}</span>
            <div
              style={{ animationDelay: delay }}
              className={`${height} ${color} flex w-full origin-bottom animate-[rise_0.6s_ease-out_backwards] items-start justify-center rounded-t-2xl pt-2 text-3xl font-extrabold text-white drop-shadow`}
            >
              {place}
            </div>
          </div>
        );
      })}
    </div>
  );
}
