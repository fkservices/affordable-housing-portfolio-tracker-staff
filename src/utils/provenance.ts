// ---------------------------------------------------------------------------
// Dataset provenance helpers
// ---------------------------------------------------------------------------
import type { Property } from '../lib/types';

/** Human-readable labels for each provenance value. */
export const PROVENANCE_LABELS: Record<string, string> = {
  synthetic: 'Synthetic / demo data',
  legistar: 'Legistar legislative records',
  hud: 'HUD public data',
  manual: 'Manually entered',
  imported: 'Bulk import',
} as const;

/** Check whether any property in the array has synthetic provenance. */
export function hasSyntheticData(properties: Property[]): boolean {
  return properties.some((p) => p.dataset_provenance === 'synthetic');
}

/** Return a user-friendly label for a provenance value. */
export function getProvenanceLabel(provenance: string | undefined): string {
  if (!provenance) return 'Unknown';
  return PROVENANCE_LABELS[provenance] ?? provenance;
}
