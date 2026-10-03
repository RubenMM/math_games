import type { HTMLAttributes } from 'react';

export default function Card({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={`rounded-2xl bg-white p-6 text-slate-800 shadow-xl ${className}`} />;
}
