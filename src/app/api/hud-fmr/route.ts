import { NextRequest, NextResponse } from 'next/server';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const year = searchParams.get('year') ?? '2024';

    const token = process.env.NEXT_PUBLIC_HUD_API_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: 'HUD API token is not configured. Set NEXT_PUBLIC_HUD_API_TOKEN in your environment.' },
        { status: 500, headers: CORS_HEADERS },
      );
    }

    const hudUrl = `https://www.huduser.gov/hudapi/public/fmr/data/METRO51760M51760?year=${encodeURIComponent(year)}`;

    const response = await fetch(hudUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `HUD API returned ${response.status}: ${errorText}` },
        { status: response.status, headers: CORS_HEADERS },
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { headers: CORS_HEADERS });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json(
      { error: message },
      { status: 500, headers: CORS_HEADERS },
    );
  }
}
