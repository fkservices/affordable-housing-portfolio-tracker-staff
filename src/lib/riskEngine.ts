// ---------------------------------------------------------------------------
// Risk calculation engine
// ---------------------------------------------------------------------------
import type {
  Property,
  ComplianceEvent,
  HudFmr,
  RiskFlag,
  RiskResult,
  Alert,
  PropertyStatus,
} from './types';

// ── helpers ──────────────────────────────────────────────────────────────────

/** Days between two dates (positive = future). */
function daysBetween(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}

/** Days since a given date. */
function daysSince(dateStr: string): number {
  return daysBetween(new Date(dateStr), new Date());
}

/** Days remaining until a given date. */
function daysRemaining(dateStr: string): number {
  return daysBetween(new Date(), new Date(dateStr));
}

/** Months remaining until a given date. */
function monthsRemaining(dateStr: string): number {
  const now = new Date();
  const target = new Date(dateStr);
  return (
    (target.getFullYear() - now.getFullYear()) * 12 +
    (target.getMonth() - now.getMonth())
  );
}

// ── individual rule checks ───────────────────────────────────────────────────

function checkExpiration(property: Property): RiskFlag[] {
  const flags: RiskFlag[] = [];
  if (!property.affordabilityEndDate) return flags;

  const months = monthsRemaining(property.affordabilityEndDate);

  if (months < 12) {
    flags.push({
      type: 'expiration',
      severity: 'red',
      message: `Affordability period expires in ${months} months.`,
    });
  } else if (months < 36) {
    flags.push({
      type: 'expiration',
      severity: 'amber',
      message: `Affordability period expires in ${months} months.`,
    });
  }
  return flags;
}

function checkRentDrift(
  property: Property,
  hudFmr: HudFmr | null,
): RiskFlag[] {
  const flags: RiskFlag[] = [];
  if (!hudFmr || !property.committedRents) return flags;

  for (const [bedroom, committedRent] of Object.entries(
    property.committedRents,
  )) {
    const limit = hudFmr.limits[bedroom];
    if (!limit) continue;

    const ratio = committedRent / limit.fmr;

    if (ratio > 1) {
      flags.push({
        type: 'rent-drift',
        severity: 'red',
        message: `${bedroom}-BR committed rent ($${committedRent}) exceeds FMR ($${limit.fmr}) by ${((ratio - 1) * 100).toFixed(1)}%.`,
      });
    } else if (ratio > 0.95) {
      flags.push({
        type: 'rent-drift',
        severity: 'amber',
        message: `${bedroom}-BR committed rent ($${committedRent}) is at ${(ratio * 100).toFixed(1)}% of FMR ($${limit.fmr}).`,
      });
    }
  }
  return flags;
}

function checkIncomeNonCompliance(events: ComplianceEvent[]): RiskFlag[] {
  const flags: RiskFlag[] = [];
  const failures = events.filter(
    (e) => e.eventType === 'income-verification' && e.outcome === 'fail',
  );
  if (failures.length > 0) {
    flags.push({
      type: 'income-non-compliance',
      severity: 'red',
      message: `${failures.length} income verification failure(s) detected.`,
    });
  }
  return flags;
}

function checkMilestoneDelay(property: Property): RiskFlag[] {
  const flags: RiskFlag[] = [];
  const milestones = property.milestones ?? {};
  const labels: Record<string, string> = {
    pod: 'Proof of Design',
    coc: 'Certificate of Completion',
    co: 'Certificate of Occupancy',
  };

  for (const [key, dateStr] of Object.entries(milestones)) {
    if (!dateStr) continue;
    const overdue = daysSince(dateStr);
    if (overdue <= 0) continue; // not yet due

    if (overdue > 90) {
      flags.push({
        type: 'milestone-delay',
        severity: 'red',
        message: `${labels[key] ?? key} is ${overdue} days overdue.`,
      });
    } else if (overdue > 30) {
      flags.push({
        type: 'milestone-delay',
        severity: 'amber',
        message: `${labels[key] ?? key} is ${overdue} days overdue.`,
      });
    }
  }
  return flags;
}

function checkReportingGap(events: ComplianceEvent[]): RiskFlag[] {
  const flags: RiskFlag[] = [];
  if (events.length === 0) {
    flags.push({
      type: 'overdue-report',
      severity: 'red',
      message: 'No compliance events on record.',
    });
    return flags;
  }

  // events are assumed sorted descending by date
  const latestDate = events[0].date;
  const gap = daysSince(latestDate);

  if (gap > 60) {
    flags.push({
      type: 'overdue-report',
      severity: 'red',
      message: `Last compliance event was ${gap} days ago.`,
    });
  } else if (gap > 30) {
    flags.push({
      type: 'overdue-report',
      severity: 'amber',
      message: `Last compliance event was ${gap} days ago.`,
    });
  }
  return flags;
}

function checkTaxDelinquency(events: ComplianceEvent[]): RiskFlag[] {
  const flags: RiskFlag[] = [];
  const failures = events.filter(
    (e) => e.eventType === 'tax-status' && e.outcome === 'fail',
  );
  if (failures.length > 0) {
    flags.push({
      type: 'tax-delinquency',
      severity: 'red',
      message: 'Property has a tax delinquency on record.',
    });
  }
  return flags;
}

function checkOwnershipChange(events: ComplianceEvent[]): RiskFlag[] {
  const flags: RiskFlag[] = [];
  const changes = events.filter((e) => e.eventType === 'ownership-change');
  if (changes.length > 0) {
    flags.push({
      type: 'ownership-change',
      severity: 'amber',
      message: 'An ownership change has been recorded.',
    });
  }
  return flags;
}

function checkDocumentationGap(events: ComplianceEvent[]): RiskFlag[] {
  const flags: RiskFlag[] = [];
  if (events.length === 0) return flags;

  const passCount = events.filter((e) => e.outcome === 'pass').length;
  const completeness = passCount / events.length;

  if (completeness < 0.6) {
    flags.push({
      type: 'documentation-gap',
      severity: 'red',
      message: `Documentation completeness is ${(completeness * 100).toFixed(0)}% (below 60%).`,
    });
  } else if (completeness < 0.8) {
    flags.push({
      type: 'documentation-gap',
      severity: 'amber',
      message: `Documentation completeness is ${(completeness * 100).toFixed(0)}% (below 80%).`,
    });
  }
  return flags;
}

// ── public API ───────────────────────────────────────────────────────────────

/**
 * Evaluate all risk rules for a single property and return an aggregate
 * result with individual flags.
 */
export function calculatePropertyRisk(
  property: Property,
  complianceEvents: ComplianceEvent[],
  hudFmr: HudFmr | null,
): RiskResult {
  // Expired properties are always GREY status with no active flags.
  if (property.status === 'expired') {
    return { status: 'expired', flags: [] };
  }

  const flags: RiskFlag[] = [
    ...checkExpiration(property),
    ...checkRentDrift(property, hudFmr),
    ...checkIncomeNonCompliance(complianceEvents),
    ...checkMilestoneDelay(property),
    ...checkReportingGap(complianceEvents),
    ...checkTaxDelinquency(complianceEvents),
    ...checkOwnershipChange(complianceEvents),
    ...checkDocumentationGap(complianceEvents),
  ];

  // Derive overall status from worst severity.
  let status: PropertyStatus = 'active';
  if (flags.some((f) => f.severity === 'red')) {
    status = 'non-compliant';
  } else if (flags.some((f) => f.severity === 'amber')) {
    status = 'expiring-soon';
  }

  return { status, flags };
}

/**
 * Convert risk flags into Alert objects suitable for persisting to Firestore.
 */
export function generateAlerts(
  property: Property,
  riskResult: RiskResult,
): Omit<Alert, 'id'>[] {
  return riskResult.flags.map((flag) => ({
    propertyId: property.id,
    propertyName: property.name,
    type: flag.type,
    severity: flag.severity,
    message: flag.message,
    createdDate: new Date().toISOString(),
    acknowledged: false,
  }));
}
