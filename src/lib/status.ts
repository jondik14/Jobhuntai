/**
 * Status System for Job Application Pipeline
 * Unified status colors, labels, and configurations
 */

export type JobStatus = 
  | 'new' 
  | 'applied' 
  | 'interview' 
  | 'offer' 
  | 'rejected' 
  | 'archived' 
  | 'saved' 
  | 'wishlist'
  | 'follow-up';

export interface StatusConfig {
  label: string;
  variant: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  dot?: boolean;
}

export const STATUS_CONFIG: Record<JobStatus, StatusConfig> = {
  new: {
    label: 'New',
    variant: 'default',
    dot: true,
  },
  applied: {
    label: 'Applied',
    variant: 'primary',
    dot: true,
  },
  interview: {
    label: 'Interview',
    variant: 'info',
    dot: true,
  },
  offer: {
    label: 'Offer',
    variant: 'success',
    dot: true,
  },
  rejected: {
    label: 'Rejected',
    variant: 'danger',
  },
  archived: {
    label: 'Archived',
    variant: 'default',
  },
  saved: {
    label: 'Saved',
    variant: 'warning',
    dot: true,
  },
  wishlist: {
    label: 'Wishlist',
    variant: 'info',
  },
  'follow-up': {
    label: 'Follow-up',
    variant: 'warning',
    dot: true,
  },
};

export function getStatusLabel(status: JobStatus): string {
  return STATUS_CONFIG[status]?.label || status;
}

export function getStatusVariant(status: JobStatus): StatusConfig['variant'] {
  return STATUS_CONFIG[status]?.variant || 'default';
}

export function getStatusConfig(status: JobStatus): StatusConfig {
  return STATUS_CONFIG[status] || STATUS_CONFIG.new;
}
