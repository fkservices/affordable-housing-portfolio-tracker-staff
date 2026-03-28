'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableSortLabel from '@mui/material/TableSortLabel';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import MuiLink from '@mui/material/Link';
import { exportCsv } from '@/utils/csvExport';
import type { Developer, Property } from '@/lib/types';

import rawDevelopers from '@/data/developers.json';
import rawProperties from '@/data/properties.json';

const developers = rawDevelopers as Developer[];
const properties = rawProperties as Property[];

interface DeveloperRow {
  id: string;
  name: string;
  propertyCount: number;
  totalAffordableUnits: number;
  complianceRate: number;
  contactEmail: string;
}

type SortKey = keyof DeveloperRow;
type SortDir = 'asc' | 'desc';

function buildRows(): DeveloperRow[] {
  return developers.map((dev) => {
    const devProps = properties.filter((p) => p.developerId === dev.id);
    const propertyCount = devProps.length;
    const totalAffordableUnits = devProps.reduce((sum, p) => sum + p.affordableUnits, 0);
    const activeCount = devProps.filter((p) => p.status === 'active').length;
    const complianceRate = propertyCount > 0 ? (activeCount / propertyCount) * 100 : 0;

    return {
      id: dev.id,
      name: dev.name,
      propertyCount,
      totalAffordableUnits,
      complianceRate,
      contactEmail: dev.contactInfo.email,
    };
  });
}

export default function DevelopersPage() {
  const router = useRouter();
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const rows = useMemo(() => buildRows(), []);

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      let cmp: number;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        cmp = aVal.localeCompare(bVal);
      } else {
        cmp = (aVal as number) - (bVal as number);
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [rows, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const handleExport = () => {
    exportCsv(
      sorted.map((r) => ({
        name: r.name,
        propertyCount: r.propertyCount,
        totalAffordableUnits: r.totalAffordableUnits,
        complianceRate: `${r.complianceRate.toFixed(1)}%`,
        contactEmail: r.contactEmail,
      })),
      [
        { key: 'name', header: 'Developer Name' },
        { key: 'propertyCount', header: 'Property Count' },
        { key: 'totalAffordableUnits', header: 'Total Affordable Units' },
        { key: 'complianceRate', header: 'Compliance Rate (%)' },
        { key: 'contactEmail', header: 'Contact Email' },
      ],
      'developer_summary.csv',
    );
  };

  const columns: { key: SortKey; label: string; align?: 'right' }[] = [
    { key: 'name', label: 'Developer Name' },
    { key: 'propertyCount', label: 'Property Count', align: 'right' },
    { key: 'totalAffordableUnits', label: 'Total Affordable Units', align: 'right' },
    { key: 'complianceRate', label: 'Compliance Rate (%)', align: 'right' },
    { key: 'contactEmail', label: 'Contact Email' },
  ];

  return (
    <Box sx={{ p: 3, maxWidth: 1100, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          Developers
        </Typography>
        <Button variant="outlined" onClick={handleExport}>
          Export CSV
        </Button>
      </Box>

      <Paper variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={col.key} align={col.align} sx={{ fontWeight: 700 }}>
                  <TableSortLabel
                    active={sortKey === col.key}
                    direction={sortKey === col.key ? sortDir : 'asc'}
                    onClick={() => handleSort(col.key)}
                  >
                    {col.label}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {sorted.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell>
                  <MuiLink
                    component="button"
                    variant="body2"
                    onClick={() => router.push(`/properties?developer=${row.id}`)}
                    sx={{ cursor: 'pointer', textAlign: 'left' }}
                  >
                    {row.name}
                  </MuiLink>
                </TableCell>
                <TableCell align="right">{row.propertyCount}</TableCell>
                <TableCell align="right">{row.totalAffordableUnits}</TableCell>
                <TableCell align="right">{row.complianceRate.toFixed(1)}%</TableCell>
                <TableCell>{row.contactEmail}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
