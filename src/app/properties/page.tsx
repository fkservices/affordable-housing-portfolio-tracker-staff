'use client';

import { Suspense, useMemo, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

import StatusPill from '@/components/StatusPill';
import FilterBar from '@/components/FilterBar';
import { exportCsv } from '@/utils/csvExport';
import { formatDate } from '@/utils/formatters';
import type { Property, PropertyStatus } from '@/lib/types';

import propertiesData from '@/data/properties.json';

const properties = propertiesData as Property[];

// ---------------------------------------------------------------------------
// Column definitions for table & CSV
// ---------------------------------------------------------------------------
interface ColumnDef {
  key: string;
  header: string;
  sortable?: boolean;
}

const COLUMNS: ColumnDef[] = [
  { key: 'status', header: 'Status', sortable: true },
  { key: 'name', header: 'Property Name', sortable: true },
  { key: 'developerName', header: 'Developer', sortable: true },
  { key: 'projectType', header: 'Project Type', sortable: true },
  { key: 'affordableUnits', header: 'Affordable Units', sortable: true },
  { key: 'amiTierTarget', header: 'AMI Target', sortable: true },
  { key: 'councilDistrict', header: 'Council District', sortable: true },
  { key: 'affordabilityEndDate', header: 'Affordability End Date', sortable: true },
];

const CSV_COLUMNS = COLUMNS.map((c) => ({ key: c.key, header: c.header }));

// ---------------------------------------------------------------------------
// Build filter definitions from data
// ---------------------------------------------------------------------------
const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'expiring-soon', label: 'Expiring Soon' },
  { value: 'under-review', label: 'Under Review' },
  { value: 'non-compliant', label: 'Non-Compliant' },
  { value: 'expired', label: 'Expired' },
];

const AMI_OPTIONS = [30, 50, 60, 80].map((v) => ({
  value: String(v),
  label: `${v}% AMI`,
}));

const uniqueDevelopers = Array.from(new Set(properties.map((p) => p.developerName))).sort();
const DEVELOPER_OPTIONS = uniqueDevelopers.map((d) => ({ value: d, label: d }));

const DISTRICT_OPTIONS = Array.from({ length: 9 }, (_, i) => ({
  value: String(i + 1),
  label: `District ${i + 1}`,
}));

const uniqueProjectTypes = Array.from(new Set(properties.map((p) => p.projectType))).sort();
const PROJECT_TYPE_OPTIONS = uniqueProjectTypes.map((t) => ({
  value: t,
  label: t.charAt(0).toUpperCase() + t.slice(1).replace(/-/g, ' '),
}));

const FILTER_DEFS = [
  { key: 'status', label: 'Status', options: STATUS_OPTIONS },
  { key: 'ami', label: 'AMI Tier', options: AMI_OPTIONS },
  { key: 'developer', label: 'Developer', options: DEVELOPER_OPTIONS },
  { key: 'district', label: 'Council District', options: DISTRICT_OPTIONS },
  { key: 'projectType', label: 'Project Type', options: PROJECT_TYPE_OPTIONS },
];

// ---------------------------------------------------------------------------
// Sort helper
// ---------------------------------------------------------------------------
type SortDir = 'asc' | 'desc';

const STATUS_SORT_ORDER: Record<string, number> = {
  'non-compliant': 0,
  'expiring-soon': 1,
  'under-review': 2,
  active: 3,
  expired: 4,
};

function sortRows(rows: Property[], key: string, dir: SortDir): Property[] {
  return [...rows].sort((a, b) => {
    const aVal = (a as unknown as Record<string, unknown>)[key];
    const bVal = (b as unknown as Record<string, unknown>)[key];
    let cmp = 0;
    if (key === 'status') {
      cmp = (STATUS_SORT_ORDER[String(aVal)] ?? 99) - (STATUS_SORT_ORDER[String(bVal)] ?? 99);
    } else if (typeof aVal === 'number' && typeof bVal === 'number') {
      cmp = aVal - bVal;
    } else {
      cmp = String(aVal ?? '').localeCompare(String(bVal ?? ''));
    }
    return dir === 'asc' ? cmp : -cmp;
  });
}

// ---------------------------------------------------------------------------
// Inner component (needs useSearchParams inside Suspense)
// ---------------------------------------------------------------------------
function PropertiesListInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Initialise filters from URL search params
  const [filters, setFilters] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    FILTER_DEFS.forEach((f) => {
      const v = searchParams.get(f.key);
      if (v) init[f.key] = v;
    });
    return init;
  });

  const [search, setSearch] = useState<string>(searchParams.get('q') ?? '');
  const [sortKey, setSortKey] = useState<string>(searchParams.get('sort') ?? 'name');
  const [sortDir, setSortDir] = useState<SortDir>((searchParams.get('order') as SortDir) ?? 'asc');

  // Update URL when filters change
  const updateUrl = useCallback(
    (newFilters: Record<string, string>, newSearch: string) => {
      const params = new URLSearchParams();
      Object.entries(newFilters).forEach(([k, v]) => {
        if (v) params.set(k, v);
      });
      if (newSearch) params.set('q', newSearch);
      const qs = params.toString();
      router.replace(qs ? `?${qs}` : '/properties', { scroll: false });
    },
    [router],
  );

  const handleFilterChange = useCallback(
    (key: string, value: string) => {
      setFilters((prev) => {
        const next = { ...prev, [key]: value };
        updateUrl(next, search);
        return next;
      });
    },
    [search, updateUrl],
  );

  const handleSearch = useCallback(
    (q: string) => {
      setSearch(q);
      updateUrl(filters, q);
    },
    [filters, updateUrl],
  );

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  // Filter + search + sort
  const filteredRows = useMemo(() => {
    let rows = properties;

    if (filters.status) {
      rows = rows.filter((p) => p.status === filters.status);
    }
    if (filters.ami) {
      rows = rows.filter((p) => String(p.amiTierTarget) === filters.ami);
    }
    if (filters.developer) {
      rows = rows.filter((p) => p.developerName === filters.developer);
    }
    if (filters.district) {
      rows = rows.filter((p) => String(p.councilDistrict) === filters.district);
    }
    if (filters.projectType) {
      rows = rows.filter((p) => p.projectType === filters.projectType);
    }
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.developerName.toLowerCase().includes(q),
      );
    }

    return sortRows(rows, sortKey, sortDir);
  }, [filters, search, sortKey, sortDir]);

  const handleExport = () => {
    const data = filteredRows.map((p) => ({
      status: p.status,
      name: p.name,
      developerName: p.developerName,
      projectType: p.projectType,
      affordableUnits: p.affordableUnits,
      amiTierTarget: `${p.amiTierTarget}%`,
      councilDistrict: String(p.councilDistrict),
      affordabilityEndDate: formatDate(p.affordabilityEndDate),
    }));
    exportCsv(data, CSV_COLUMNS, 'properties_export.csv');
  };

  // ------ Mobile card view ------
  if (isMobile) {
    return (
      <Box sx={{ px: 2, py: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
          Properties
        </Typography>

        <FilterBar
          filters={FILTER_DEFS}
          onFilterChange={handleFilterChange}
          currentFilters={filters}
          onSearch={handleSearch}
        />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {filteredRows.length} properties
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<FileDownloadIcon />}
            onClick={handleExport}
          >
            Export CSV
          </Button>
        </Box>

        {filteredRows.map((p) => (
          <Card key={p.id} variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Link href={`/properties/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    {p.name}
                  </Typography>
                </Link>
                <StatusPill status={p.status} />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                {p.developerName}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                <Chip label={p.projectType} size="small" variant="outlined" />
                <Chip label={`${p.affordableUnits} affordable units`} size="small" variant="outlined" />
                <Chip label={`${p.amiTierTarget}% AMI`} size="small" variant="outlined" />
                <Chip label={`District ${p.councilDistrict}`} size="small" variant="outlined" />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Affordability ends: {formatDate(p.affordabilityEndDate)}
              </Typography>
            </CardContent>
          </Card>
        ))}

        {filteredRows.length === 0 && (
          <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
            No properties match the current filters.
          </Typography>
        )}
      </Box>
    );
  }

  // ------ Desktop table view ------
  return (
    <Box sx={{ px: 3, py: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
        Properties
      </Typography>

      <FilterBar
        filters={FILTER_DEFS}
        onFilterChange={handleFilterChange}
        currentFilters={filters}
        onSearch={handleSearch}
      />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {filteredRows.length} properties
        </Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<FileDownloadIcon />}
          onClick={handleExport}
        >
          Export Filtered Results
        </Button>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              {COLUMNS.map((col) => (
                <TableCell key={col.key} sx={{ fontWeight: 700 }}>
                  {col.sortable ? (
                    <TableSortLabel
                      active={sortKey === col.key}
                      direction={sortKey === col.key ? sortDir : 'asc'}
                      onClick={() => handleSort(col.key)}
                    >
                      {col.header}
                    </TableSortLabel>
                  ) : (
                    col.header
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRows.map((p) => (
              <TableRow key={p.id} hover>
                <TableCell>
                  <StatusPill status={p.status} />
                </TableCell>
                <TableCell>
                  <Link
                    href={`/properties/${p.id}`}
                    style={{ textDecoration: 'none', color: '#1e40af', fontWeight: 600 }}
                  >
                    {p.name}
                  </Link>
                </TableCell>
                <TableCell>{p.developerName}</TableCell>
                <TableCell sx={{ textTransform: 'capitalize' }}>
                  {p.projectType.replace(/-/g, ' ')}
                </TableCell>
                <TableCell align="right">{p.affordableUnits}</TableCell>
                <TableCell>{p.amiTierTarget}%</TableCell>
                <TableCell>{p.councilDistrict}</TableCell>
                <TableCell>{formatDate(p.affordabilityEndDate)}</TableCell>
              </TableRow>
            ))}
            {filteredRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={COLUMNS.length} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    No properties match the current filters.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Page wrapper with Suspense boundary (required for useSearchParams)
// ---------------------------------------------------------------------------
export default function PropertiesPage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ p: 4 }}>
          <Typography color="text.secondary">Loading properties...</Typography>
        </Box>
      }
    >
      <PropertiesListInner />
    </Suspense>
  );
}
