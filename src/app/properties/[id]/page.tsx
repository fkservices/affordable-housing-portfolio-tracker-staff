'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PrintIcon from '@mui/icons-material/Print';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import StatusPill from '@/components/StatusPill';
import MilestoneTracker from '@/components/MilestoneTracker';
import ComplianceTimeline from '@/components/ComplianceTimeline';
import { formatDate, formatCurrency, daysUntil } from '@/utils/formatters';
import type { Property, ComplianceEvent, HudFmr, RiskFlag, Alert, Severity } from '@/lib/types';

import propertiesData from '@/data/properties.json';
import complianceData from '@/data/compliance_events.json';
import hudFmrData from '@/data/hud_fmr.json';
import alertsData from '@/data/alerts.json';

const properties = propertiesData as Property[];
const complianceEvents = complianceData as ComplianceEvent[];
const hudFmr = hudFmrData as HudFmr;
const alerts = alertsData as Alert[];

// ---------------------------------------------------------------------------
// AMI key mapping
// ---------------------------------------------------------------------------
function amiKey(amiTier: number): string {
  return `ami${amiTier}` as string;
}

// ---------------------------------------------------------------------------
// Build risk flags from alerts for a given property
// ---------------------------------------------------------------------------
function getRiskFlags(propertyId: string): RiskFlag[] {
  return alerts
    .filter((a) => a.propertyId === propertyId)
    .map((a) => ({
      type: a.type,
      severity: a.severity,
      message: a.message,
    }));
}

// ---------------------------------------------------------------------------
// Severity colour mapping for risk chips
// ---------------------------------------------------------------------------
const SEVERITY_BG: Record<Severity, string> = {
  red: '#AA222A',
  amber: '#F5821E',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function PropertyDetailPage() {
  const params = useParams<{ id: string }>();
  const property = properties.find((p) => p.id === params.id);

  const [noteText, setNoteText] = useState('');
  const [localNotes, setLocalNotes] = useState<string[]>([]);

  // Compliance events for this property
  const propertyEvents = useMemo(
    () => complianceEvents.filter((e) => e.propertyId === params.id),
    [params.id],
  );

  // Risk flags
  const riskFlags = useMemo(() => (property ? getRiskFlags(property.id) : []), [property]);

  // ---- 404 ----
  if (!property) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Property Not Found
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          No property exists with ID &ldquo;{params.id}&rdquo;.
        </Typography>
        <Button component={Link} href="/properties" variant="contained" startIcon={<ArrowBackIcon />}>
          Back to Properties
        </Button>
      </Box>
    );
  }

  // ---- Derived values ----
  const endDate = new Date(property.affordabilityEndDate);
  const startDate = new Date(property.affordabilityStartDate);
  const totalYears = Math.round(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365),
  );
  const daysRemaining = daysUntil(property.affordabilityEndDate);
  const yearsRemaining = Math.max(0, Math.round(daysRemaining / 365));

  // Bedrooms present in property data
  const bedroomSizes = Object.keys(property.bedroomCounts);

  // AMI limit key for this property
  const amiField = amiKey(property.amiTierTarget);

  // ---- Handlers ----
  const handleAddNote = () => {
    if (!noteText.trim()) return;
    // In a real app this would persist to Firestore
    console.log('New staff note:', { propertyId: property.id, text: noteText.trim() });
    setLocalNotes((prev) => [...prev, noteText.trim()]);
    setNoteText('');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: 3, maxWidth: 1200, mx: 'auto' }}>
      {/* Back button */}
      <Button
        component={Link}
        href="/properties"
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 2 }}
        className="no-print"
      >
        Back to Properties
      </Button>

      {/* ----------------------------------------------------------------- */}
      {/* Header                                                            */}
      {/* ----------------------------------------------------------------- */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, mb: 1 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {property.name}
        </Typography>
        <StatusPill status={property.status} />
      </Box>
      <Typography variant="body1" color="text.secondary">
        {property.developerName}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {property.address} &middot; Council District {property.councilDistrict}
      </Typography>

      {/* Action buttons */}
      <Box sx={{ display: 'flex', gap: 1, mt: 2, mb: 3, flexWrap: 'wrap' }} className="no-print">
        <Button variant="outlined" size="small" startIcon={<PrintIcon />} onClick={handlePrint}>
          Print to PDF
        </Button>
        {property.legistarUrl && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<OpenInNewIcon />}
            href={property.legistarUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            View in Legistar
          </Button>
        )}
      </Box>

      {property.legistarUrl && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>
          Legistar link opens in a new tab. Data shown here may differ from Legistar records.
        </Typography>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* Summary Card                                                       */}
      {/* ----------------------------------------------------------------- */}
      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Project Summary
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, sm: 4, md: 3 }}>
              <Typography variant="caption" color="text.secondary">
                Project Type
              </Typography>
              <Typography variant="body1" sx={{ textTransform: 'capitalize', fontWeight: 500 }}>
                {property.projectType.replace(/-/g, ' ')}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 4, md: 3 }}>
              <Typography variant="caption" color="text.secondary">
                Total Units
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {property.totalUnits}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 4, md: 3 }}>
              <Typography variant="caption" color="text.secondary">
                Affordable Units
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {property.affordableUnits}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 4, md: 3 }}>
              <Typography variant="caption" color="text.secondary">
                AMI Target
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {property.amiTierTarget}%
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 4, md: 3 }}>
              <Typography variant="caption" color="text.secondary">
                Funding Source
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {property.fundingSource}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 4, md: 3 }}>
              <Typography variant="caption" color="text.secondary">
                Award Year
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {property.awardYear}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 4, md: 3 }}>
              <Typography variant="caption" color="text.secondary">
                Affordability Period
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {totalYears} years ({formatDate(property.affordabilityStartDate)} &ndash;{' '}
                {formatDate(property.affordabilityEndDate)})
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 4, md: 3 }}>
              <Typography variant="caption" color="text.secondary">
                Years Remaining
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 600,
                  color: yearsRemaining <= 5 ? 'error.main' : yearsRemaining <= 10 ? 'warning.main' : 'success.main',
                }}
              >
                {yearsRemaining} years ({daysRemaining.toLocaleString()} days)
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* ----------------------------------------------------------------- */}
      {/* Milestone Tracker                                                   */}
      {/* ----------------------------------------------------------------- */}
      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Milestones
          </Typography>
          <MilestoneTracker milestones={property.milestones} />
        </CardContent>
      </Card>

      {/* ----------------------------------------------------------------- */}
      {/* HUD FMR Comparison Table                                            */}
      {/* ----------------------------------------------------------------- */}
      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            HUD FMR Comparison
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
            {hudFmr.msa} &middot; FY {hudFmr.year} &middot; Median Income:{' '}
            {formatCurrency(hudFmr.medianIncome)}
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Bedroom Size</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">
                    FMR Amount
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">
                    AMI-{property.amiTierTarget} Limit
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">
                    Committed Rent
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">
                    Delta
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bedroomSizes
                  .filter((br) => hudFmr.limits[br])
                  .map((br) => {
                    const fmrLimits = hudFmr.limits[br];
                    const amiLimit = (fmrLimits as Record<string, number>)[amiField] ?? 0;
                    const committedRent = property.committedRents[br] ?? 0;
                    const delta = committedRent - amiLimit;
                    const isOver = delta > 0;

                    return (
                      <TableRow key={br}>
                        <TableCell>{br}</TableCell>
                        <TableCell align="right">{formatCurrency(fmrLimits.fmr)}</TableCell>
                        <TableCell align="right">{formatCurrency(amiLimit)}</TableCell>
                        <TableCell align="right">{formatCurrency(committedRent)}</TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            fontWeight: 600,
                            color: isOver ? '#AA222A' : '#22c55e',
                          }}
                        >
                          {isOver ? '+' : ''}
                          {formatCurrency(delta)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* ----------------------------------------------------------------- */}
      {/* Compliance History                                                  */}
      {/* ----------------------------------------------------------------- */}
      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Compliance History
          </Typography>
          {propertyEvents.length > 0 ? (
            <ComplianceTimeline events={propertyEvents} />
          ) : (
            <Typography color="text.secondary">No compliance events recorded.</Typography>
          )}
        </CardContent>
      </Card>

      {/* ----------------------------------------------------------------- */}
      {/* Staff Notes                                                         */}
      {/* ----------------------------------------------------------------- */}
      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Staff Notes
          </Typography>

          {property.staffNotes && (
            <Paper variant="outlined" sx={{ p: 2, mb: 2, backgroundColor: 'grey.50' }}>
              <Typography variant="body2">{property.staffNotes}</Typography>
            </Paper>
          )}

          {localNotes.map((note, idx) => (
            <Paper key={idx} variant="outlined" sx={{ p: 2, mb: 2, backgroundColor: 'grey.50' }}>
              <Typography variant="body2">{note}</Typography>
              <Typography variant="caption" color="text.secondary">
                Just now
              </Typography>
            </Paper>
          ))}

          <Box className="no-print" sx={{ mt: 1 }}>
            <TextField
              multiline
              minRows={3}
              fullWidth
              placeholder="Add a staff note..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              sx={{ mb: 1 }}
            />
            <Button variant="contained" size="small" onClick={handleAddNote} disabled={!noteText.trim()}>
              Add Note
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* ----------------------------------------------------------------- */}
      {/* Risk Flags                                                          */}
      {/* ----------------------------------------------------------------- */}
      {riskFlags.length > 0 && (
        <Card variant="outlined" sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Risk Flags
            </Typography>
            {riskFlags.map((flag, idx) => (
              <Paper key={idx} variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Chip
                    label={flag.severity.toUpperCase()}
                    size="small"
                    sx={{
                      backgroundColor: SEVERITY_BG[flag.severity],
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '0.7rem',
                    }}
                  />
                  <Typography variant="subtitle2" sx={{ textTransform: 'capitalize' }}>
                    {flag.type.replace(/-/g, ' ')}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {flag.message}
                </Typography>
              </Paper>
            ))}
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
