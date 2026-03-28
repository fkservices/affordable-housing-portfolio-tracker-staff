// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------
import { statusColors } from '../lib/theme';
import type { PropertyStatus } from '../lib/types';

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const;

/** Format a date string or Date as "MMM DD, YYYY". */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return `${MONTHS[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')}, ${d.getFullYear()}`;
}

/** Format a number as US-dollar currency. */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/** Format a decimal as a percentage string (e.g. 0.875 -> "87.5%"). */
export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

/** Number of calendar days from now until the given date (negative = past). */
export function daysUntil(date: string | Date): number {
  const target = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  // Zero-out time components for a clean day-level diff.
  const msPerDay = 1000 * 60 * 60 * 24;
  const utcNow = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const utcTarget = Date.UTC(target.getFullYear(), target.getMonth(), target.getDate());
  return Math.round((utcTarget - utcNow) / msPerDay);
}

/** Human-readable relative time (e.g. "2 days ago", "in 3 months"). */
export function relativeTime(date: string | Date): string {
  const days = daysUntil(date);
  const absDays = Math.abs(days);

  const format = (value: number, unit: string): string => {
    const plural = value === 1 ? '' : 's';
    const label = `${value} ${unit}${plural}`;
    return days < 0 ? `${label} ago` : `in ${label}`;
  };

  if (absDays === 0) return 'today';
  if (absDays === 1) return days < 0 ? 'yesterday' : 'tomorrow';
  if (absDays < 30) return format(absDays, 'day');
  if (absDays < 365) return format(Math.round(absDays / 30), 'month');
  return format(Math.round(absDays / 365), 'year');
}

/** Map a property status to its semantic hex colour. */
export function getStatusColor(status: PropertyStatus): string {
  const map: Record<PropertyStatus, string> = {
    active: statusColors.green,
    'expiring-soon': statusColors.amber,
    'under-review': statusColors.amber,
    'non-compliant': statusColors.red,
    expired: statusColors.grey,
  };
  return map[status] ?? statusColors.grey;
}
