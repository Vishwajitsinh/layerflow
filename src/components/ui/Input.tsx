import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-caption text-text-secondary font-medium">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'h-9 px-3 rounded-md bg-surface border border-border text-body text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-150',
            error && 'border-error focus:ring-error/50 focus:border-error',
            className
          )}
          {...props}
        />
        {error && (
          <span className="text-caption text-error">{error}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
