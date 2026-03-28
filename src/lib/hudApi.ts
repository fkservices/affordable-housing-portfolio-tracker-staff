// ---------------------------------------------------------------------------
// HUD FMR API client – calls our Next.js proxy route
// ---------------------------------------------------------------------------

export interface HudApiResponse {
  data: {
    basicdata: {
      Efficiency: number;
      'One-Bedroom': number;
      'Two-Bedroom': number;
      'Three-Bedroom': number;
      'Four-Bedroom': number;
    };
    year: number;
    metroarea: string;
  };
}

/** Bedroom size factor map used for AMI-adjusted limit calculations. */
const BEDROOM_FACTORS: Record<string, number> = {
  '0BR': 0.7,
  '1BR': 0.75,
  '2BR': 0.9,
  '3BR': 1.04,
  '4BR': 1.16,
};

/** Map HUD API response keys to our internal bedroom labels. */
const HUD_KEY_MAP: Record<string, string> = {
  Efficiency: '0BR',
  'One-Bedroom': '1BR',
  'Two-Bedroom': '2BR',
  'Three-Bedroom': '3BR',
  'Four-Bedroom': '4BR',
};

/**
 * Fetch FMR data for a given year from the HUD API via our proxy route.
 */
export async function fetchHudFmr(year: number) {
  const res = await fetch(`/api/hud-fmr?year=${year}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `Failed to fetch HUD FMR data (${res.status})`);
  }
  const json: HudApiResponse = await res.json();
  return json;
}

/**
 * Transform HUD API response into our HudFmr format.
 * medianIncome defaults to $110,300 (Richmond MSA 2024) if not provided.
 */
export function transformHudResponse(
  apiResponse: HudApiResponse,
  medianIncome = 110300,
) {
  const { basicdata, year, metroarea } = apiResponse.data;
  const limits: Record<string, { fmr: number; ami30: number; ami50: number; ami60: number; ami80: number }> = {};

  for (const [hudKey, fmr] of Object.entries(basicdata)) {
    const br = HUD_KEY_MAP[hudKey];
    if (!br) continue;
    const factor = BEDROOM_FACTORS[br] ?? 1;

    limits[br] = {
      fmr,
      ami30: Math.round(medianIncome * 0.3 / 12 * 0.3 * factor),
      ami50: Math.round(medianIncome * 0.5 / 12 * 0.3 * factor),
      ami60: Math.round(medianIncome * 0.6 / 12 * 0.3 * factor),
      ami80: Math.round(medianIncome * 0.8 / 12 * 0.3 * factor),
    };
  }

  return {
    year,
    msa: metroarea,
    medianIncome,
    limits,
  };
}
