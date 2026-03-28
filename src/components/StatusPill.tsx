'use client';

import Chip from '@mui/material/Chip';
import type { PropertyStatus } from '@/lib/types';

type SeverityColor = 'red' | 'amber' | 'green' | 'grey';

interface StatusPillProps {
  status?: PropertyStatus;
  severity?: SeverityColor;
}

const STATUS_COLOR_MAP: Record<PropertyStatus, string> = {
  active: '#22c55e',
  'expiring-soon': '#f59e0b',
  'under-review': '#f59e0b',
  'non-compliant': '#ef4444',
  expired: '#9ca3af',
};

const SEVERITY_COLOR_MAP: Record<SeverityColor, string> = {
  green: '#22c55e',
  amber: '#f59e0b',
  red: '#ef4444',
  grey: '#9ca3af',
};

function toTitleCase(str: string): string {
  return str
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function StatusPill({ status, severity }: StatusPillProps) {
  const label = status ?? severity ?? 'active';
  const bgColor = status
    ? STATUS_COLOR_MAP[status]
    : severity
      ? SEVERITY_COLOR_MAP[severity]
      : STATUS_COLOR_MAP.active;

  return (
    <Chip
      label={toTitleCase(label)}
      size="small"
      sx={{
        backgroundColor: bgColor,
        color: '#fff',
        fontWeight: 600,
        fontSize: '0.75rem',
      }}
    />
  );
}
