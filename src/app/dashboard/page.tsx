'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Link from 'next/link';
import DownloadIcon from '@mui/icons-material/Download';

import KpiCard from '@/components/KpiCard';
import DonutChart from '@/components/DonutChart';
import StatusPill from '@/components/StatusPill';
import { exportCsv } from '@/utils/csvExport';
import { formatDate, daysUntil } from '@/utils/formatters';
import type { Property, Alert, PropertyStatus } from '@/lib/types';
import propertiesData from '@/data/properties.json';
import alertsData from '@/data/alerts.json';

const STATUS_COLORS: Record<PropertyStatus, string> = {
  active: '#22c55e',
  'expiring-soon': '#f59e0b',
  'under-review': '#f59e0b',
  'non-compliant': '#ef4444',
  expired: '#9ca3af',
};

export default function DashboardPage() {
  const router = useRouter();
  const properties = propertiesData as unknown as Property[];
  const alerts = alertsData as unknown as Alert[];

  // --- KPI calculations ---
  const totalProperties = properties.length;

  const activeAffordableUnits = useMemo(
    () =>
      properties
        .filter((p) => p.status !== 'expired')
        .reduce((sum, p) => sum + p.affordableUnits, 0),
    [properties],
  );

  const complianceRate = useMemo(() => {
    const activeCount = properties.filter((p) => p.status === 'active').length;
    return totalProperties > 0
      ? `${((activeCount / totalProperties) * 100).toFixed(1)}%`
      : '0%';
  }, [properties, totalProperties]);

  const propertiesAtRisk = useMemo(
    () => alerts.filter((a) => !a.acknowledged).length,
    [alerts],
  );

  // --- Donut chart data ---
  const statusCounts = useMemo(() => {
    const counts: Record<PropertyStatus, number> = {
      active: 0,
      'expiring-soon': 0,
      'under-review': 0,
      'non-compliant': 0,
      expired: 0,
    };
    properties.forEach((p) => {
      counts[p.status] = (counts[p.status] || 0) + 1;
    });
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([label, value]) => ({
        label,
        value,
        color: STATUS_COLORS[label as PropertyStatus],
      }));
  }, [properties]);

  const handleSegmentClick = (label: string) => {
    router.push(`/properties?status=${label}`);
  };

  // --- Top 5 alerts ---
  const topAlerts = useMemo(
    () =>
      [...alerts]
        .sort(
          (a, b) =>
            new Date(b.createdDate).getTime() -
            new Date(a.createdDate).getTime(),
        )
        .slice(0, 5),
    [alerts],
  );

  // --- Upcoming deadlines ---
  const upcomingDeadlines = useMemo(() => {
    return properties
      .filter((p) => p.status !== 'expired')
      .map((p) => ({
        id: p.id,
        name: p.name,
        endDate: p.affordabilityEndDate,
        daysLeft: daysUntil(p.affordabilityEndDate),
        status: p.status,
      }))
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 8);
  }, [properties]);

  // --- CSV Export ---
  const handleExport = () => {
    const columns = [
      { key: 'id', header: 'ID' },
      { key: 'name', header: 'Property Name' },
      { key: 'address', header: 'Address' },
      { key: 'status', header: 'Status' },
      { key: 'totalUnits', header: 'Total Units' },
      { key: 'affordableUnits', header: 'Affordable Units' },
      { key: 'amiTierTarget', header: 'AMI Tier (%)' },
      { key: 'fundingSource', header: 'Funding Source' },
      { key: 'affordabilityStartDate', header: 'Start Date' },
      { key: 'affordabilityEndDate', header: 'End Date' },
      { key: 'developerName', header: 'Developer' },
    ];
    exportCsv(
      properties as unknown as Record<string, unknown>[],
      columns,
      'portfolio_summary.csv',
    );
  };

  const getDeadlineColor = (days: number): string => {
    if (days < 0) return '#ef4444';
    if (days <= 365) return '#ef4444';
    if (days <= 1095) return '#f59e0b';
    return '#22c55e';
  };

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Dashboard
        </Typography>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleExport}
        >
          Export Portfolio Summary
        </Button>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            title="Total Properties"
            value={totalProperties}
            color="#1e40af"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            title="Active Affordable Units"
            value={activeAffordableUnits}
            color="#22c55e"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            title="Portfolio Compliance Rate"
            value={complianceRate}
            color="#7c3aed"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            title="Unacknowledged Alerts"
            value={propertiesAtRisk}
            color="#ef4444"
          />
        </Grid>
      </Grid>

      {/* Donut Chart + Alerts Feed */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Status Donut Chart */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, mb: 2 }}
              >
                Properties by Status
              </Typography>
              <DonutChart
                data={statusCounts}
                size={220}
                onSegmentClick={handleSegmentClick}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Alerts Feed */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Recent Alerts
                </Typography>
                <Button
                  component={Link}
                  href="/alerts"
                  size="small"
                >
                  View All
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {topAlerts.map((alert) => (
                  <Box
                    key={alert.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1.5,
                      p: 1.5,
                      borderRadius: 1,
                      backgroundColor: '#fafafa',
                      border: '1px solid #f0f0f0',
                    }}
                  >
                    <StatusPill severity={alert.severity} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        component={Link}
                        href={`/properties/${alert.propertyId}`}
                        variant="subtitle2"
                        sx={{
                          fontWeight: 600,
                          color: 'primary.main',
                          textDecoration: 'none',
                          '&:hover': { textDecoration: 'underline' },
                        }}
                      >
                        {alert.propertyName}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mt: 0.5,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {alert.message}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 0.5, display: 'block' }}
                      >
                        {formatDate(alert.createdDate)}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Upcoming Deadlines */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Upcoming Affordability Deadlines
          </Typography>
          <TableContainer component={Paper} elevation={0}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Property</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>End Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Days Remaining</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {upcomingDeadlines.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <Typography
                        component={Link}
                        href={`/properties/${row.id}`}
                        variant="body2"
                        sx={{
                          fontWeight: 500,
                          color: 'primary.main',
                          textDecoration: 'none',
                          '&:hover': { textDecoration: 'underline' },
                        }}
                      >
                        {row.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <StatusPill status={row.status} />
                    </TableCell>
                    <TableCell>{formatDate(row.endDate)}</TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: getDeadlineColor(row.daysLeft),
                        }}
                      >
                        {row.daysLeft < 0
                          ? `${Math.abs(row.daysLeft)} days overdue`
                          : `${row.daysLeft} days`}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}
