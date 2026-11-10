import { BRAND } from '@/lib/brand';
import { cn } from '@/lib/cn';

interface LogoProps {
  className?: string;
  tone?: 'dark' | 'light';
  tagline?: boolean;
}

export function Logo({
  className,
  tone = 'light',
  tagline = false,
}: LogoProps) {
  return (
    <span
      aria-label={BRAND.product}
      className={cn('inline-flex flex-col leading-none', className)}
    >
      <span
        aria-hidden='true'
        className='inline-flex items-baseline gap-[0.3em] font-extrabold tracking-tight lowercase'
      >
        <span className={tone === 'dark' ? 'text-white' : 'text-ink-950'}>
          {BRAND.name}
        </span>
        <span className='text-brand-500'>chat</span>
      </span>
      {tagline && (
        <span
          aria-hidden='true'
          className={cn(
            'mt-[0.35em] text-[0.34em] font-medium tracking-[0.32em] lowercase',
            tone === 'dark' ? 'text-ink-300' : 'text-ink-500'
          )}
        >
          {BRAND.tagline}
        </span>
      )}
    </span>
  );
}
