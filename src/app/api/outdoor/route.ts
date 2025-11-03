import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  if (!lat || !lon) {
    return NextResponse.json({ error: 'Latitude and longitude are required' }, { status: 400 });
  }

  const weatherURL = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,surface_pressure,pressure_msl,wind_speed_10m,wind_direction_10m,uv_index&hourly=temperature_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=7`;
  const airQualityURL = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=european_aqi`;
  const elevationURL = `https://api.open-meteo.com/v1/elevation?latitude=${lat}&longitude=${lon}`;

  try {
    const [weatherResponse, airQualityResponse, elevationResponse] = await Promise.all([
      fetch(weatherURL, { next: { revalidate: 300 } }),
      fetch(airQualityURL, { next: { revalidate: 300 } }),
      fetch(elevationURL, { next: { revalidate: 86400 } })
    ]);

    if (!weatherResponse.ok) throw new Error('Failed to fetch outdoor weather data');
    if (!airQualityResponse.ok) throw new Error('Failed to fetch air quality data');
    if (!elevationResponse.ok) throw new Error('Failed to fetch elevation data');

    const weatherData = await weatherResponse.json();
    const airQualityData = await airQualityResponse.json();
    const elevationData = await elevationResponse.json();

    const combinedData = {
      ...weatherData,
      current: {
        ...weatherData.current,
        ...airQualityData.current,
      },
      elevation: elevationData.elevation[0],
    };

    return NextResponse.json(combinedData);

  } catch (error) {
    console.error('Critical error fetching from Open-Meteo proxy:', (error as Error).message);
    return NextResponse.json({ error: (error as Error).message || 'Internal Server Error' }, { status: 500 });
  }
}