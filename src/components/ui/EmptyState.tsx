import { Button } from './Button';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'ghost';
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      {icon && (
        <div className="w-24 h-24 rounded-3xl bg-[var(--color-surface-subtle)] flex items-center justify-center text-[var(--color-text-muted)] mb-6">
          {icon}
        </div>
      )}
      <h3 className="text-2xl font-bold text-[var(--color-text-primary)] mb-3">
        {title}
      </h3>
      {description && (
        <p className="text-[var(--color-text-secondary)] max-w-md mb-6">
          {description}
        </p>
      )}
      {action && (
        <Button
          variant={action.variant || 'primary'}
          onClick={action.onClick}
          size="lg"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
