import type { InputHTMLAttributes } from 'react';

type Props = InputHTMLAttributes<HTMLInputElement> & { label: string };

export default function Input({ label, className = '', ...props }: Props) {
  return (
    <label className="flex flex-col gap-1 text-left text-sm font-bold text-violet-700">
      {label}
      <input
        {...props}
        className={`rounded-2xl border-2 border-solid border-violet-200 bg-violet-50 px-4 py-3 text-xl font-semibold text-violet-950 outline-none focus:border-fuchsia-500 focus:bg-white ${className}`}
      />
    </label>
  );
}
