import React from 'react';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
type BadgeSize = 'sm' | 'md';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ 
    variant = 'default', 
    size = 'md',
    dot = false,
    children,
    className = '',
    ...props 
  }, ref) => {
    const baseStyles = 'inline-flex items-center gap-1.5 font-medium rounded-full border';
    
    const variants = {
      default: 'bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)] border-[var(--color-border-default)]',
      primary: 'bg-[var(--color-primary-50)] text-[var(--color-primary-700)] border-[var(--color-primary-200)]',
      success: 'bg-[var(--color-success-50)] text-[var(--color-success-600)] border-[var(--color-success-100)]',
      warning: 'bg-[var(--color-warning-50)] text-[var(--color-warning-600)] border-[var(--color-warning-100)]',
      danger: 'bg-[var(--color-danger-50)] text-[var(--color-danger-600)] border-[var(--color-danger-100)]',
      info: 'bg-[var(--color-info-50)] text-[var(--color-info-600)] border-[var(--color-info-100)]',
    };
    
    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-sm',
    };
    
    const dotColors = {
      default: 'bg-[var(--color-text-muted)]',
      primary: 'bg-[var(--color-primary-500)]',
      success: 'bg-[var(--color-success-500)]',
      warning: 'bg-[var(--color-warning-500)]',
      danger: 'bg-[var(--color-danger-500)]',
      info: 'bg-[var(--color-info-500)]',
    };
    
    const combinedClassName = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;
    
    return (
      <span ref={ref} className={combinedClassName} {...props}>
        {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
