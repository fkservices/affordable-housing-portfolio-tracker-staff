'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import SearchIcon from '@mui/icons-material/Search';
import DescriptionIcon from '@mui/icons-material/Description';
import GavelIcon from '@mui/icons-material/Gavel';
import EventIcon from '@mui/icons-material/Event';
import type { ComplianceEvent, ComplianceOutcome } from '@/lib/types';
import StatusPill from './StatusPill';

interface ComplianceTimelineProps {
  events: ComplianceEvent[];
}

const EVENT_ICONS: Record<string, React.ReactNode> = {
  inspection: <SearchIcon fontSize="small" />,
  audit: <AssignmentTurnedInIcon fontSize="small" />,
  report: <DescriptionIcon fontSize="small" />,
  hearing: <GavelIcon fontSize="small" />,
};

function outcomeToSeverity(outcome: ComplianceOutcome): 'green' | 'red' | 'amber' | 'grey' {
  switch (outcome) {
    case 'pass':
      return 'green';
    case 'fail':
      return 'red';
    case 'in-progress':
      return 'amber';
    case 'pending':
    default:
      return 'grey';
  }
}

export default function ComplianceTimeline({ events }: ComplianceTimelineProps) {
  const sorted = [...events].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <Box sx={{ position: 'relative', pl: 4 }}>
      {/* Vertical line */}
      <Box
        sx={{
          position: 'absolute',
          left: 14,
          top: 0,
          bottom: 0,
          width: 2,
          backgroundColor: 'divider',
        }}
      />

      {sorted.map((event) => (
        <Box key={event.id} sx={{ position: 'relative', mb: 3 }}>
          {/* Dot */}
          <Box
            sx={{
              position: 'absolute',
              left: -26,
              top: 8,
              width: 28,
              height: 28,
              borderRadius: '50%',
              backgroundColor: 'background.paper',
              border: '2px solid',
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {EVENT_ICONS[event.eventType.toLowerCase()] ?? <EventIcon fontSize="small" />}
          </Box>

          <Paper variant="outlined" sx={{ p: 2, ml: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                {new Date(event.date).toLocaleDateString()}
              </Typography>
              <Typography variant="subtitle2" sx={{ textTransform: 'capitalize' }}>
                {event.eventType}
              </Typography>
              <StatusPill severity={outcomeToSeverity(event.outcome)} />
            </Box>
            {event.notes && (
              <Typography variant="body2" color="text.secondary">
                {event.notes}
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary">
              Reviewer: {event.reviewer}
            </Typography>
          </Paper>
        </Box>
      ))}
    </Box>
  );
}
