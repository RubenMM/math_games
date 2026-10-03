import type { ButtonHTMLAttributes } from 'react';

const variants = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
  secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200',
  danger: 'bg-red-50 text-red-600 hover:bg-red-100',
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof variants };

export default function Button({ variant = 'primary', className = '', ...props }: Props) {
  return (
    <button
      {...props}
      className={`cursor-pointer rounded-lg border-0 px-5 py-3 text-base font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
    />
  );
}
