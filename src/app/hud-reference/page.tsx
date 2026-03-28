'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import MuiLink from '@mui/material/Link';
import { formatCurrency } from '@/utils/formatters';
import { exportCsv } from '@/utils/csvExport';
import type { HudFmr } from '@/lib/types';

import rawFmr from '@/data/hud_fmr.json';
const fmrData = rawFmr as HudFmr;

const BEDROOM_LABELS: Record<string, string> = {
  '0BR': 'Studio (0BR)',
  '1BR': '1 Bedroom',
  '2BR': '2 Bedrooms',
  '3BR': '3 Bedrooms',
  '4BR': '4 Bedrooms',
};

const BEDROOM_ORDER = ['0BR', '1BR', '2BR', '3BR', '4BR'];

export default function HudReferencePage() {
  const [year, setYear] = useState(2024);

  const rows = BEDROOM_ORDER
    .filter((key) => key in fmrData.limits)
    .map((key) => ({
      bedroom: BEDROOM_LABELS[key] ?? key,
      fmr: fmrData.limits[key].fmr,
      ami30: fmrData.limits[key].ami30,
      ami50: fmrData.limits[key].ami50,
      ami60: fmrData.limits[key].ami60,
      ami80: fmrData.limits[key].ami80,
    }));

  const handleExport = () => {
    const csvRows = rows.map((r) => ({
      bedroom: r.bedroom,
      fmr: r.fmr,
      ami30: r.ami30,
      ami50: r.ami50,
      ami60: r.ami60,
      ami80: r.ami80,
    }));
    exportCsv(
      csvRows as unknown as Record<string, unknown>[],
      [
        { key: 'bedroom', header: 'Bedroom Size' },
        { key: 'fmr', header: 'FMR Amount ($)' },
        { key: 'ami30', header: '30% AMI Limit' },
        { key: 'ami50', header: '50% AMI Limit' },
        { key: 'ami60', header: '60% AMI Limit' },
        { key: 'ami80', header: '80% AMI Limit' },
      ],
      `hud_fmr_fy${year}.csv`,
    );
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="h4" fontWeight={700}>
          FY{fmrData.year} Fair Market Rents &mdash; {fmrData.msa}
        </Typography>
        <Select
          size="small"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          sx={{ minWidth: 120 }}
        >
          <MenuItem value={2024}>FY 2024</MenuItem>
          <MenuItem value={2025} disabled>
            FY 2025 (coming soon)
          </MenuItem>
        </Select>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
        Source:{' '}
        <MuiLink
          href="https://www.huduser.gov/portal/datasets/fmr.html"
          target="_blank"
          rel="noopener"
        >
          huduser.gov
        </MuiLink>
      </Typography>

      <Typography variant="body2" sx={{ mb: 3 }}>
        2024 Richmond MSA Median Income:{' '}
        <strong>{formatCurrency(fmrData.medianIncome)}</strong>
      </Typography>

      <Paper variant="outlined" sx={{ mb: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Bedroom Size</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">FMR Amount ($)</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">30% AMI Limit</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">50% AMI Limit</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">60% AMI Limit</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">80% AMI Limit</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.bedroom}>
                <TableCell>{row.bedroom}</TableCell>
                <TableCell align="right">{formatCurrency(row.fmr)}</TableCell>
                <TableCell align="right">{formatCurrency(row.ami30)}</TableCell>
                <TableCell align="right">{formatCurrency(row.ami50)}</TableCell>
                <TableCell align="right">{formatCurrency(row.ami60)}</TableCell>
                <TableCell align="right">{formatCurrency(row.ami80)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <Button variant="outlined" onClick={handleExport}>
          Export Table
        </Button>
      </Box>

      <Alert severity="info" variant="outlined">
        FMR values are MSA-level, not neighborhood-level. Use as reference only.
      </Alert>
    </Box>
  );
}
