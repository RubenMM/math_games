'use client';

import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import { useI18n } from '@/lib/i18n/I18nProvider';
import type { LeaderRow } from '@/lib/games/race';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function Leaderboard({ rows, onRemove }: { rows: LeaderRow[]; onRemove?: (row: LeaderRow) => void }) {
  const { t } = useI18n();
  if (rows.length === 0) return <p className="text-violet-400">{t('board.empty')}</p>;

  return (
    <table className="w-full border-collapse text-left text-lg">
      <thead>
        <tr className="border-b-2 border-violet-100 text-sm text-violet-400">
          <th className="w-14 py-2">#</th>
          <th>{t('board.name')}</th>
          <th>{t('board.stage')}</th>
          <th className="text-right">{t('board.points')}</th>
          {onRemove && <th className="w-10" />}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr
            key={row.id}
            className={`border-b border-violet-50 [&>td]:align-middle ${i === 0 ? 'bg-amber-100 font-extrabold' : i < 3 ? 'bg-violet-50 font-bold' : ''}`}
          >
            <td className="py-3 text-2xl">{MEDALS[i] ?? <span className="text-base text-violet-300">{i + 1}</span>}</td>
            <td>
              <Avatar name={row.name} className="mr-2 text-2xl align-middle" />
              {row.name}
            </td>
            <td>
              {t('board.stageN', { stage: row.stage })} {row.finished && <Badge>{t('board.done')}</Badge>}
            </td>
            <td className="text-right tabular-nums">{row.points.toLocaleString()}</td>
            {onRemove && (
              <td className="text-right">
                <button
                  aria-label={t('host.remove', { name: row.name })}
                  onClick={() => onRemove(row)}
                  className="h-7 w-7 cursor-pointer rounded-full border-0 bg-transparent text-violet-300 hover:bg-rose-100 hover:text-rose-600"
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
