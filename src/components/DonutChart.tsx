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

function formatLabel(label: string): string {
  return label
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export default function DonutChart({ data, size = 280, onSegmentClick }: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) return null;

  const maxValue = Math.max(...data.map((d) => d.value));
  const minRadius = size * 0.1;
  const maxRadius = size * 0.19;

  // Pack bubbles in a simple layout
  const cx = size / 2;
  const cy = size / 2;
  const angleStep = (2 * Math.PI) / data.length;

  const bubbles = data.map((seg, i) => {
    const fraction = seg.value / maxValue;
    const r = minRadius + fraction * (maxRadius - minRadius);
    const orbitRadius = data.length === 1 ? 0 : size / 2 - maxRadius - 8;
    const angle = angleStep * i - Math.PI / 2;
    const x = cx + orbitRadius * Math.cos(angle);
    const y = cy + orbitRadius * Math.sin(angle);
    return { ...seg, r, x, y };
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <Box sx={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {bubbles.map((b) => (
            <g
              key={b.label}
              style={{ cursor: onSegmentClick ? 'pointer' : 'default' }}
              onClick={() => onSegmentClick?.(b.label)}
            >
              <circle
                cx={b.x}
                cy={b.y}
                r={b.r}
                fill={b.color}
                opacity={0.85}
              />
              <text
                x={b.x}
                y={b.y - b.r * 0.12}
                textAnchor="middle"
                dominantBaseline="central"
                fill="white"
                fontWeight="700"
                fontSize={b.r * 0.45}
              >
                {b.value}
              </text>
              <text
                x={b.x}
                y={b.y + b.r * 0.3}
                textAnchor="middle"
                dominantBaseline="central"
                fill="white"
                fontWeight="500"
                fontSize={b.r * 0.22}
              >
                {formatLabel(b.label)}
              </text>
            </g>
          ))}
        </svg>
      </Box>

      {/* Legend */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
        {data.map((seg) => (
          <Box
            key={seg.label}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              cursor: onSegmentClick ? 'pointer' : 'default',
            }}
            onClick={() => onSegmentClick?.(seg.label)}
          >
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
              {formatLabel(seg.label)} ({seg.value})
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
