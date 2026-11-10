import { useId, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function Input({ label, error, className, id, ...rest }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;

  return (
    <div className='space-y-1.5'>
      <label
        htmlFor={inputId}
        className='block text-sm font-medium text-ink-700'
      >
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          'block w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-ink-900 shadow-sm transition-colors',
          'placeholder:text-ink-400 disabled:cursor-not-allowed disabled:bg-ink-100',
          error
            ? 'border-red-400 focus-visible:outline-red-500'
            : 'border-ink-300 hover:border-ink-400',
          className
        )}
        {...rest}
      />
      {error && (
        <p id={errorId} role='alert' className='text-sm text-red-600'>
          {error}
        </p>
      )}
    </div>
  );
}
