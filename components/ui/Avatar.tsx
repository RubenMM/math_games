import { avatarFor } from '@/lib/avatar';

export default function Avatar({ name, className = 'text-2xl' }: { name: string; className?: string }) {
  return (
    <span aria-hidden className={className}>
      {avatarFor(name)}
    </span>
  );
}
