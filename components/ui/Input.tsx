import type { InputHTMLAttributes } from 'react';

type Props = InputHTMLAttributes<HTMLInputElement> & { label: string };

export default function Input({ label, className = '', ...props }: Props) {
  return (
    <label className="flex flex-col gap-1 text-left text-sm font-medium text-slate-600">
      {label}
      <input
        {...props}
        className={`rounded-lg border-2 border-slate-200 px-3 py-2 text-lg text-slate-900 outline-none focus:border-indigo-500 ${className}`}
      />
    </label>
  );
}
