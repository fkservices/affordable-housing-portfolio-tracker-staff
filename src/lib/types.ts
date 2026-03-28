// ---------------------------------------------------------------------------
// Affordable Housing Portfolio Tracker – shared TypeScript types
// ---------------------------------------------------------------------------

/** Status a property can hold. */
export type PropertyStatus =
  | 'active'
  | 'expiring-soon'
  | 'under-review'
  | 'non-compliant'
  | 'expired';

/** Core property record stored in Firestore. */
export interface Property {
  id: string;
  name: string;
  address: string;
  parcelPIN: string;
  councilDistrict: number;
  developerId: string;
  developerName: string;
  projectType: string;
  totalUnits: number;
  affordableUnits: number;
  amiTierTarget: number;
  fundingSource: string;
  awardYear: number;
  affordabilityStartDate: string;
  affordabilityEndDate: string;
  status: PropertyStatus;
  milestones: {
    pod?: string;
    coc?: string;
    co?: string;
  };
  legistarMatterId?: string;
  legistarUrl?: string;
  staffNotes?: string;
  dataset_provenance?: string;
  bedroomCounts: Record<string, number>;
  committedRents: Record<string, number>;
}

/** Developer / project sponsor. */
export interface Developer {
  id: string;
  name: string;
  contactInfo: {
    email: string;
    phone: string;
    address: string;
  };
}

/** Alert type taxonomy. */
export type AlertType =
  | 'expiration'
  | 'overdue-report'
  | 'rent-drift'
  | 'milestone-delay'
  | 'tax-delinquency'
  | 'income-non-compliance'
  | 'ownership-change'
  | 'documentation-gap';

/** Severity levels used by the risk engine and alerts. */
export type Severity = 'red' | 'amber';

/** An actionable alert surfaced by the risk engine. */
export interface Alert {
  id: string;
  propertyId: string;
  propertyName: string;
  type: AlertType;
  severity: Severity;
  message: string;
  createdDate: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedDate?: string;
  note?: string;
}

/** Outcome of a compliance event. */
export type ComplianceOutcome = 'pass' | 'fail' | 'pending' | 'in-progress';

/** A single compliance check / inspection event. */
export interface ComplianceEvent {
  id: string;
  propertyId: string;
  date: string;
  eventType: string;
  outcome: ComplianceOutcome;
  reviewer: string;
  notes: string;
}

/** HUD Fair Market Rent data for a given year / MSA. */
export interface HudFmr {
  year: number;
  msa: string;
  medianIncome: number;
  limits: Record<
    string,
    {
      fmr: number;
      ami30: number;
      ami50: number;
      ami60: number;
      ami80: number;
    }
  >;
}

/** A note added by staff to a property. */
export interface StaffNote {
  id: string;
  propertyId: string;
  text: string;
  authorEmail: string;
  createdAt: string;
}

/** A single risk flag produced by the risk engine. */
export interface RiskFlag {
  type: AlertType;
  severity: Severity;
  message: string;
}

/** Overall risk assessment for a property. */
export interface RiskResult {
  status: PropertyStatus;
  flags: RiskFlag[];
}
