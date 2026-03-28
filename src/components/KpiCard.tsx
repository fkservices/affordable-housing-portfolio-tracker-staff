'use client';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: string;
  onClick?: () => void;
}

const trendIcon: Record<string, React.ReactNode> = {
  up: <TrendingUpIcon sx={{ color: '#22c55e' }} />,
  down: <TrendingDownIcon sx={{ color: '#AA222A' }} />,
  neutral: <TrendingFlatIcon sx={{ color: '#8D8D8D' }} />,
};

export default function KpiCard({ title, value, subtitle, trend, color, onClick }: KpiCardProps) {
  return (
    <Card
      sx={{
        borderLeft: color ? `4px solid ${color}` : undefined,
        height: '100%',
        ...(onClick && { cursor: 'pointer', '&:hover': { boxShadow: 4 } }),
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h4" component="div" sx={{ fontWeight: 700 }}>
            {value}
          </Typography>
          {trend && trendIcon[trend]}
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
