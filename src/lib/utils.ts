/**
 * Utility functions
 */

/**
 * Strip HTML tags from string
 */
export function stripHtml(html: string): string {
  if (!html) return '';
  const tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

/**
 * Truncate text to max length
 */
export function truncate(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Format date to relative time (e.g., "2 days ago")
 */
export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

/**
 * Format date to locale string
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format time (e.g., "2:30 PM")
 */
export function formatTime(dateString: string): string {
  if (!dateString) return 'Never';
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Generate unique ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

/**
 * Group array by key
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const groupKey = String(item[key]);
    return {
      ...groups,
      [groupKey]: [...(groups[groupKey] || []), item],
    };
  }, {} as Record<string, T[]>);
}

/**
 * Get timezone from location string
 */
export function getTimezoneFromLocation(location: string): number {
  const loc = location.toLowerCase();
  
  // Australia
  if (loc.includes('sydney') || loc.includes('melbourne') || loc.includes('brisbane') || loc.includes('canberra')) return 11;
  if (loc.includes('adelaide')) return 10.5;
  if (loc.includes('perth')) return 8;
  if (loc.includes('darwin')) return 9.5;
  if (loc.includes('australia')) return 10;
  
  // Asia
  if (loc.includes('singapore') || loc.includes('hong kong') || loc.includes('taipei') || loc.includes('manila') || loc.includes('kuala lumpur')) return 8;
  if (loc.includes('tokyo') || loc.includes('osaka') || loc.includes('seoul')) return 9;
  if (loc.includes('bangkok') || loc.includes('ho chi minh') || loc.includes('hanoi') || loc.includes('jakarta')) return 7;
  if (loc.includes('bangalore') || loc.includes('mumbai') || loc.includes('delhi') || loc.includes('india')) return 5.5;
  
  // NZ
  if (loc.includes('auckland') || loc.includes('wellington') || loc.includes('new zealand')) return 13;
  
  // US
  if (loc.includes('san francisco') || loc.includes('los angeles') || loc.includes('seattle') || loc.includes('california')) return -8;
  if (loc.includes('new york') || loc.includes('boston') || loc.includes('miami') || loc.includes('east')) return -5;
  if (loc.includes('chicago') || loc.includes('austin') || loc.includes('dallas')) return -6;
  if (loc.includes('denver') || loc.includes('phoenix') || loc.includes('mountain')) return -7;
  
  // Europe
  if (loc.includes('london') || loc.includes('uk') || loc.includes('ireland')) return 0;
  if (loc.includes('paris') || loc.includes('berlin') || loc.includes('amsterdam')) return 1;
  
  // Canada
  if (loc.includes('vancouver')) return -8;
  if (loc.includes('toronto') || loc.includes('montreal')) return -5;
  
  if (loc.includes('remote')) return 0;
  return 0;
}

/**
 * Get region code from location
 */
export function getRegionFromLocation(location: string): string[] {
  const loc = location.toLowerCase();
  const regions: string[] = [];
  
  const regionMap: Record<string, string[]> = {
    'AU': ['australia', 'sydney', 'melbourne', 'brisbane', 'perth', 'adelaide'],
    'NZ': ['new zealand', 'auckland', 'wellington'],
    'SG': ['singapore'],
    'JP': ['japan', 'tokyo', 'osaka'],
    'HK': ['hong kong'],
    'US': ['united states', 'usa', 'america', 'san francisco', 'new york', 'los angeles'],
    'GB': ['united kingdom', 'uk', 'london'],
    'CA': ['canada', 'toronto', 'vancouver'],
  };
  
  Object.entries(regionMap).forEach(([code, keywords]) => {
    if (keywords.some(k => loc.includes(k))) {
      regions.push(code);
    }
  });
  
  if (loc.includes('remote')) {
    regions.push('REMOTE');
  }
  
  return regions.length > 0 ? regions : ['REMOTE'];
}
