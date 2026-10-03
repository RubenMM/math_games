import Badge from '@/components/ui/Badge';
import type { LeaderRow } from '@/lib/games/race';

export default function Leaderboard({ rows, onRemove }: { rows: LeaderRow[]; onRemove?: (row: LeaderRow) => void }) {
  if (rows.length === 0) return <p className="text-slate-500">No scores yet.</p>;

  return (
    <table className="w-full border-collapse text-left text-lg">
      <thead>
        <tr className="border-b-2 border-slate-100 text-sm text-slate-500">
          <th className="w-12 py-2">#</th>
          <th>Name</th>
          <th>Stage</th>
          <th className="text-right">Points</th>
          {onRemove && <th className="w-10" />}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={row.id} className={`border-b border-slate-100 ${i === 0 ? 'bg-amber-50 font-bold' : ''}`}>
            <td className="py-3 text-slate-400">{i + 1}</td>
            <td>{row.name}</td>
            <td>
              Stage {row.stage} {row.finished && <Badge>Done</Badge>}
            </td>
            <td className="text-right tabular-nums">{row.points.toLocaleString()}</td>
            {onRemove && (
              <td className="text-right">
                <button
                  aria-label={`Remove ${row.name}`}
                  onClick={() => onRemove(row)}
                  className="h-7 w-7 cursor-pointer rounded-full border-0 bg-transparent text-slate-400 hover:bg-red-100 hover:text-red-600"
                >
                  ×
                </button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
