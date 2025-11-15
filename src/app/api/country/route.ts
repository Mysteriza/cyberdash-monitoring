import { NextResponse, type NextRequest } from 'next/server';

const RESTCOUNTRIES_API = 'https://restcountries.com/v3.1/alpha/';

// Data statistik berdasarkan UN World Population Prospects 2024
// Referensi: https://www.worldometers.info/world-population/
const WORLD_POPULATION_2025 = 8231613070; // 1 Juli 2025
const YEARLY_BIRTHS_2025 = 130800000; // Estimasi kelahiran per tahun 2025
const YEARLY_DEATHS_2025 = 61200000; // Estimasi kematian per tahun 2025

// Hitung rate per detik
const BIRTHS_PER_SECOND = YEARLY_BIRTHS_2025 / (365.25 * 24 * 60 * 60);
const DEATHS_PER_SECOND = YEARLY_DEATHS_2025 / (365.25 * 24 * 60 * 60);
const GROWTH_PER_SECOND = BIRTHS_PER_SECOND - DEATHS_PER_SECOND;

// Tanggal referensi: 1 Juli 2025 00:00:00 UTC
const REFERENCE_DATE = new Date('2025-07-01T00:00:00Z').getTime();

function calculateWorldPopulation() {
  const now = Date.now();
  const secondsSinceReference = (now - REFERENCE_DATE) / 1000;
  
  // Hitung populasi saat ini
  const currentPopulation = Math.floor(WORLD_POPULATION_2025 + (GROWTH_PER_SECOND * secondsSinceReference));
  
  // Hitung jumlah hari sejak awal tahun 2025
  const startOfYear = new Date('2025-01-01T00:00:00Z').getTime();
  const secondsSinceYearStart = (now - startOfYear) / 1000;
  
  // Hitung statistik hari ini (sejak 00:00 UTC hari ini)
  const startOfToday = new Date();
  startOfToday.setUTCHours(0, 0, 0, 0);
  const secondsSinceTodayStart = (now - startOfToday.getTime()) / 1000;
  
  return {
    current: currentPopulation,
    today: {
      births: Math.floor(BIRTHS_PER_SECOND * secondsSinceTodayStart),
      deaths: Math.floor(DEATHS_PER_SECOND * secondsSinceTodayStart),
      growth: Math.floor(GROWTH_PER_SECOND * secondsSinceTodayStart),
    },
    thisYear: {
      births: Math.floor(BIRTHS_PER_SECOND * secondsSinceYearStart),
      deaths: Math.floor(DEATHS_PER_SECOND * secondsSinceYearStart),
      growth: Math.floor(GROWTH_PER_SECOND * secondsSinceYearStart),
    },
    rates: {
      birthsPerSecond: BIRTHS_PER_SECOND,
      deathsPerSecond: DEATHS_PER_SECOND,
      growthPerSecond: GROWTH_PER_SECOND,
    }
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'Country code is required' }, { status: 400 });
  }

  try {
    const response = await fetch(`${RESTCOUNTRIES_API}${code}`, {
      next: { revalidate: 86400 } // Cache 1 hari
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    if (!data || data.length === 0) {
        throw new Error('Country not found');
    }

    const country = data[0];
    const worldPopulation = calculateWorldPopulation();

    const countryData = {
        name: country.name?.common || 'Unknown',
        flag: country.flags?.svg || '',
        population: country.population || 0,
        capital: country.capital?.[0] || 'N/A',
        region: country.region || 'N/A',
        worldPopulation: worldPopulation
    }

    return NextResponse.json(countryData);
  } catch (error) {
    console.error('Error fetching country data:', error);
    return NextResponse.json({ error: (error as Error).message || 'Internal Server Error' }, { status: 500 });
  }
}