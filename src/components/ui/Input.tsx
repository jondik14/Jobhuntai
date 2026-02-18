import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    error,
    leftIcon,
    rightIcon,
    className = '',
    ...props 
  }, ref) => {
    const baseStyles = `
      w-full
      h-10
      px-4
      text-sm
      bg-[var(--color-surface-default)]
      border
      rounded-lg
      text-[var(--color-text-primary)]
      placeholder:text-[var(--color-text-muted)]
      transition-all
      duration-150
      focus:outline-none
      focus:border-[var(--color-border-focus)]
      focus:ring-2
      focus:ring-[var(--color-primary-200)]
      disabled:bg-[var(--color-surface-subtle)]
      disabled:cursor-not-allowed
      disabled:opacity-50
    `.replace(/\s+/g, ' ').trim();
    
    const errorStyles = error 
      ? 'border-[var(--color-danger-500)] focus:border-[var(--color-danger-500)] focus:ring-[var(--color-danger-200)]' 
      : 'border-[var(--color-border-default)] hover:border-[var(--color-border-strong)]';
    
    const iconPadding = leftIcon ? 'pl-10' : '';
    const rightIconPadding = rightIcon ? 'pr-10' : '';
    
    return (
      <div className="relative w-full">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          className={`${baseStyles} ${errorStyles} ${iconPadding} ${rightIconPadding} ${className}`}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
            {rightIcon}
          </div>
        )}
        {error && (
          <p className="mt-1.5 text-sm text-[var(--color-danger-600)]">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// TextArea component
interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ error, className = '', ...props }, ref) => {
    const baseStyles = `
      w-full
      min-h-[100px]
      px-4
      py-3
      text-sm
      bg-[var(--color-surface-default)]
      border
      rounded-lg
      text-[var(--color-text-primary)]
      placeholder:text-[var(--color-text-muted)]
      resize-y
      transition-all
      duration-150
      focus:outline-none
      focus:border-[var(--color-border-focus)]
      focus:ring-2
      focus:ring-[var(--color-primary-200)]
      disabled:bg-[var(--color-surface-subtle)]
      disabled:cursor-not-allowed
      disabled:opacity-50
    `.replace(/\s+/g, ' ').trim();
    
    const errorStyles = error 
      ? 'border-[var(--color-danger-500)] focus:border-[var(--color-danger-500)] focus:ring-[var(--color-danger-200)]' 
      : 'border-[var(--color-border-default)] hover:border-[var(--color-border-strong)]';
    
    return (
      <div className="w-full">
        <textarea
          ref={ref}
          className={`${baseStyles} ${errorStyles} ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-[var(--color-danger-600)]">{error}</p>
        )}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';
