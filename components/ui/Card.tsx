import type { HTMLAttributes } from 'react';

export default function Card({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={`animate-[pop_0.4s_ease-out] rounded-3xl border-0 border-b-8 border-solid border-violet-900/25 bg-white p-6 text-violet-950 shadow-2xl ${className}`}
    />
  );
}
