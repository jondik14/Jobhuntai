import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ 
    padding = 'md', 
    shadow = 'sm',
    hover = false,
    children,
    className = '',
    ...props 
  }, ref) => {
    const paddings = {
      none: 'p-0',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };
    
    const shadows = {
      none: '',
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg',
    };
    
    const hoverStyles = hover 
      ? 'cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-[var(--color-border-focus)]' 
      : '';
    
    const combinedClassName = `
      bg-[var(--color-surface-default)] 
      border border-[var(--color-border-default)] 
      rounded-xl 
      ${paddings[padding]} 
      ${shadows[shadow]} 
      ${hoverStyles} 
      ${className}
    `.trim();
    
    return (
      <div ref={ref} className={combinedClassName} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Card subcomponents
export const CardHeader = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`mb-4 ${className}`}>{children}</div>
);

export const CardTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-lg font-semibold text-[var(--color-text-primary)] ${className}`}>{children}</h3>
);

export const CardDescription = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <p className={`text-sm text-[var(--color-text-secondary)] mt-1 ${className}`}>{children}</p>
);

export const CardContent = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={className}>{children}</div>
);

export const CardFooter = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`mt-4 pt-4 border-t border-[var(--color-border-subtle)] ${className}`}>{children}</div>
);
