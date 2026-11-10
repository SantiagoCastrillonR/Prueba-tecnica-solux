import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface AlertProps {
  children: ReactNode;
  className?: string;
}

export function Alert({ children, className }: AlertProps) {
  return (
    <div
      role='alert'
      className={cn(
        'rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700',
        className
      )}
    >
      {children}
    </div>
  );
}
