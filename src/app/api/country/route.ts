import { NextResponse, type NextRequest } from 'next/server';

const API_URL = 'https://restcountries.com/v3.1/alpha/';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'Country code is required' }, { status: 400 });
  }

  try {
    const response = await fetch(`${API_URL}${code}`, {
      next: { revalidate: 86400 } // Cache 1 hari, data ini jarang berubah
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    if (!data || data.length === 0) {
        throw new Error('Country not found');
    }

    const country = data[0];
    const countryData = {
        name: country.name?.common || 'Unknown',
        flag: country.flags?.svg || '',
        population: country.population || 0,
        capital: country.capital?.[0] || 'N/A',
        region: country.region || 'N/A'
    }

    return NextResponse.json(countryData);
  } catch (error) {
    console.error('Error fetching from RestCountries proxy:', error);
    return NextResponse.json({ error: (error as Error).message || 'Internal Server Error' }, { status: 500 });
  }
}