import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.length < 2) {
    return NextResponse.json({ error: 'Search query must be at least 2 characters' }, { status: 400 });
  }

  const safeQuery = encodeURIComponent(query.trim());
  const GEOCODING_API_URL = `https://geocoding-api.open-meteo.com/v1/search?name=${safeQuery}&count=5&language=en&format=json`;

  try {
    const response = await fetch(GEOCODING_API_URL, {
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      throw new Error(`Geocoding API failed with status ${response.status}`);
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return NextResponse.json({ results: [] });
    }

    const results = data.results.map((item: {
      id: number;
      name: string;
      latitude: number;
      longitude: number;
      country: string;
      country_code: string;
      admin1?: string;
    }) => ({
      id: item.id,
      name: item.name,
      latitude: item.latitude,
      longitude: item.longitude,
      country: item.country,
      countryCode: item.country_code,
      admin1: item.admin1 || ''
    }));

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error fetching geocoding data:', error);
    return NextResponse.json({ error: 'Failed to search locations' }, { status: 500 });
  }
}
