import type { ButtonHTMLAttributes } from 'react';

// Chunky "3D" buttons: the darker bottom border collapses when pressed.
const variants = {
  primary: 'bg-violet-600 text-white border-violet-900 hover:bg-violet-500',
  secondary: 'bg-white text-violet-900 border-violet-200 hover:bg-violet-50',
  danger: 'bg-rose-100 text-rose-700 border-rose-300 hover:bg-rose-200',
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof variants };

export default function Button({ variant = 'primary', className = '', ...props }: Props) {
  return (
    <button
      {...props}
      className={`cursor-pointer rounded-2xl border-0 border-b-4 border-solid px-6 py-3 text-lg font-bold transition active:translate-y-0.5 active:border-b-0 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
    />
  );
}
