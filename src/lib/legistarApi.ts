// ---------------------------------------------------------------------------
// Legistar API client for Richmond, VA
// ---------------------------------------------------------------------------

const BASE_URL = 'https://webapi.legistar.com/v1/richmondva';

export interface LegistarMatter {
  MatterId: number;
  MatterGuid: string;
  MatterFile: string;
  MatterName: string;
  MatterTitle: string;
  MatterTypeName: string;
  MatterStatusName: string;
  MatterIntroDate: string | null;
  MatterAgendaDate: string | null;
  MatterPassedDate: string | null;
  MatterEnactmentNumber: number | null;
  MatterEnactmentDate: string | null;
  MatterLastModifiedUtc: string;
}

export interface LegistarAttachment {
  MatterAttachmentId: number;
  MatterAttachmentName: string;
  MatterAttachmentHyperlink: string;
}

export interface LegistarSponsor {
  MatterSponsorName: string;
}

/**
 * Search Legistar Matters (ordinances / resolutions).
 */
export async function searchMatters(keyword: string, top = 20): Promise<LegistarMatter[]> {
  const filter = encodeURIComponent(`contains(MatterTitle,'${keyword}')`);
  const url = `${BASE_URL}/Matters?$filter=${filter}&$orderby=MatterLastModifiedUtc desc&$top=${top}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Legistar API error: ${res.status}`);
  return res.json();
}

/**
 * Get a single Matter by ID.
 */
export async function getMatter(matterId: number): Promise<LegistarMatter> {
  const res = await fetch(`${BASE_URL}/Matters/${matterId}`);
  if (!res.ok) throw new Error(`Legistar API error: ${res.status}`);
  return res.json();
}

/**
 * Get attachments for a Matter.
 */
export async function getMatterAttachments(matterId: number): Promise<LegistarAttachment[]> {
  const res = await fetch(`${BASE_URL}/Matters/${matterId}/Attachments`);
  if (!res.ok) return [];
  return res.json();
}

/**
 * Get sponsors for a Matter.
 */
export async function getMatterSponsors(matterId: number): Promise<LegistarSponsor[]> {
  const res = await fetch(`${BASE_URL}/Matters/${matterId}/Sponsors`);
  if (!res.ok) return [];
  return res.json();
}

/**
 * Build a deep link URL to the Legistar web UI for a given Matter.
 */
export function getLegistarDeepLink(matterId: number): string {
  return `https://richmondva.legistar.com/LegislationDetail.aspx?ID=${matterId}`;
}
