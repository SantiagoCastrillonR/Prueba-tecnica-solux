import { cn } from '@/lib/cn';

interface SpinnerProps {
  className?: string;
  label?: string;
}

export function Spinner({ className, label = 'Cargando' }: SpinnerProps) {
  return (
    <svg
      role='status'
      aria-label={label}
      viewBox='0 0 24 24'
      fill='none'
      className={cn('size-5 animate-spin', className)}
    >
      <circle
        cx='12'
        cy='12'
        r='9'
        stroke='currentColor'
        strokeWidth='3'
        className='opacity-25'
      />
      <path
        d='M21 12a9 9 0 0 0-9-9'
        stroke='currentColor'
        strokeWidth='3'
        strokeLinecap='round'
      />
    </svg>
  );
}
