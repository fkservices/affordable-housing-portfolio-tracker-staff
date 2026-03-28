'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutSegment[];
  size?: number;
  onSegmentClick?: (label: string) => void;
}

export default function DonutChart({ data, size = 200, onSegmentClick }: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) return null;

  const radius = 70;
  const strokeWidth = 30;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  // Build segments with cumulative offsets
  let accumulated = 0;
  const segments = data.map((segment) => {
    const fraction = segment.value / total;
    const dashLength = fraction * circumference;
    const dashGap = circumference - dashLength;
    const offset = -accumulated * circumference + circumference * 0.25; // rotate -90deg start
    accumulated += fraction;
    return { ...segment, dashLength, dashGap, offset };
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <Box sx={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {segments.map((seg) => (
            <circle
              key={seg.label}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${seg.dashLength} ${seg.dashGap}`}
              strokeDashoffset={seg.offset}
              style={{ cursor: onSegmentClick ? 'pointer' : 'default' }}
              onClick={() => onSegmentClick?.(seg.label)}
            />
          ))}
        </svg>
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {total}
          </Typography>
        </Box>
      </Box>

      {/* Legend */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
        {data.map((seg) => (
          <Box key={seg.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: seg.color,
                flexShrink: 0,
              }}
            />
            <Typography variant="caption">
              {seg.label} ({seg.value})
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
