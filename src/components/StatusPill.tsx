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
  'expiring-soon': '#F5821E',
  'under-review': '#F5821E',
  'non-compliant': '#AA222A',
  expired: '#8D8D8D',
};

const SEVERITY_COLOR_MAP: Record<SeverityColor, string> = {
  green: '#22c55e',
  amber: '#F5821E',
  red: '#AA222A',
  grey: '#8D8D8D',
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
