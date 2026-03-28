'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import StatusPill from '@/components/StatusPill';
import { formatDate } from '@/utils/formatters';
import type { Alert, Severity } from '@/lib/types';

import rawAlerts from '@/data/alerts.json';
const alerts = rawAlerts as Alert[];

const SEVERITY_ORDER: Record<Severity, number> = { red: 0, amber: 1 };

function formatAlertType(type: string): string {
  return type
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

interface AcknowledgedState {
  note: string;
  date: string;
}

export default function AlertsPage() {
  const [acknowledgedMap, setAcknowledgedMap] = useState<
    Record<string, AcknowledgedState>
  >(() => {
    const initial: Record<string, AcknowledgedState> = {};
    for (const a of alerts) {
      if (a.acknowledged) {
        initial[a.id] = { note: a.note ?? '', date: a.acknowledgedDate ?? '' };
      }
    }
    return initial;
  });

  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});
  const [tab, setTab] = useState(0);

  const sorted = useMemo(() => {
    return [...alerts].sort((a, b) => {
      const sevDiff = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
      if (sevDiff !== 0) return sevDiff;
      return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
    });
  }, []);

  const activeAlerts = sorted.filter((a) => !acknowledgedMap[a.id]);
  const acknowledgedAlerts = sorted.filter((a) => !!acknowledgedMap[a.id]);

  const displayed =
    tab === 0 ? activeAlerts : tab === 1 ? acknowledgedAlerts : sorted;

  const handleAcknowledge = (alertId: string) => {
    setAcknowledgedMap((prev) => ({
      ...prev,
      [alertId]: {
        note: noteInputs[alertId] ?? '',
        date: new Date().toISOString(),
      },
    }));
    setNoteInputs((prev) => {
      const next = { ...prev };
      delete next[alertId];
      return next;
    });
  };

  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Alerts
      </Typography>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ mb: 3 }}
      >
        <Tab
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              Active
              <Chip label={activeAlerts.length} size="small" color="error" />
            </Box>
          }
        />
        <Tab
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              Acknowledged
              <Chip label={acknowledgedAlerts.length} size="small" color="default" />
            </Box>
          }
        />
        <Tab
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              All
              <Chip label={sorted.length} size="small" color="primary" />
            </Box>
          }
        />
      </Tabs>

      {displayed.length === 0 && (
        <Typography color="text.secondary" sx={{ mt: 4, textAlign: 'center' }}>
          No alerts in this view.
        </Typography>
      )}

      {displayed.map((alert) => {
        const isAcknowledged = !!acknowledgedMap[alert.id];

        return (
          <Card
            key={alert.id}
            variant="outlined"
            sx={{
              mb: 2,
              opacity: isAcknowledged ? 0.7 : 1,
              borderLeft: `4px solid ${alert.severity === 'red' ? '#AA222A' : '#F5821E'}`,
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <StatusPill severity={alert.severity} />
                <Chip label={formatAlertType(alert.type)} size="small" variant="outlined" />
                <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                  {formatDate(alert.createdDate)}
                </Typography>
              </Box>

              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                <Link
                  href={`/properties/${alert.propertyId}`}
                  style={{ color: '#1976d2', textDecoration: 'none' }}
                >
                  {alert.propertyName}
                </Link>
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {alert.message}
              </Typography>

              {isAcknowledged && acknowledgedMap[alert.id].note && (
                <Box
                  sx={{
                    mt: 1.5,
                    p: 1.5,
                    bgcolor: 'grey.50',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'grey.200',
                  }}
                >
                  <Typography variant="caption" fontWeight={600}>
                    Acknowledgement Note:
                  </Typography>
                  <Typography variant="body2">
                    {acknowledgedMap[alert.id].note}
                  </Typography>
                </Box>
              )}
            </CardContent>

            {!isAcknowledged && (
              <CardActions sx={{ px: 2, pb: 2, flexDirection: 'column', alignItems: 'stretch', gap: 1 }}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Optional note..."
                  value={noteInputs[alert.id] ?? ''}
                  onChange={(e) =>
                    setNoteInputs((prev) => ({ ...prev, [alert.id]: e.target.value }))
                  }
                />
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => handleAcknowledge(alert.id)}
                  sx={{ alignSelf: 'flex-end' }}
                >
                  Acknowledge
                </Button>
              </CardActions>
            )}
          </Card>
        );
      })}
    </Box>
  );
}
