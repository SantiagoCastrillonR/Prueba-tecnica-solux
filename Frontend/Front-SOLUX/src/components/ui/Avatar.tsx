import { cn } from '@/lib/cn';
import { initials } from '@/lib/format';

const COLORS = [
  'bg-brand-700',
  'bg-ink-800',
  'bg-brand-800',
  'bg-ink-600',
  'bg-brand-900',
  'bg-ink-950',
];

const colorFor = (name: string): string => {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return COLORS[Math.abs(hash) % COLORS.length] ?? COLORS[0]!;
};

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: 'size-8 text-xs',
  md: 'size-11 text-sm',
  lg: 'size-14 text-base',
};

export function Avatar({ name, size = 'md', className }: AvatarProps) {
  return (
    <span
      aria-hidden='true'
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white',
        colorFor(name),
        sizes[size],
        className
      )}
    >
      {initials(name)}
    </span>
  );
}
