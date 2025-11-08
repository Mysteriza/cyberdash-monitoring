import { NextResponse } from 'next/server';

export async function GET() {
  const BLYNK_API_URL = `https://blynk.cloud/external/api/get?token=${process.env.BLYNK_AUTH_TOKEN}&v0&v1&v4&v5&v8`;
  const BLYNK_STATUS_URL = `https://blynk.cloud/external/api/isHardwareConnected?token=${process.env.BLYNK_AUTH_TOKEN}`;

  try {
    // Fetch data dan status secara parallel
    const [dataResponse, statusResponse] = await Promise.all([
      fetch(BLYNK_API_URL, { next: { revalidate: 0 } }),
      fetch(BLYNK_STATUS_URL, { next: { revalidate: 0 } })
    ]);

    if (!dataResponse.ok) {
      const errorText = await dataResponse.text();
      console.error('Blynk API error:', errorText);
      return NextResponse.json({ error: `API request failed with status ${dataResponse.status}` }, { status: dataResponse.status });
    }

    const data = await dataResponse.json();
    
    // Get device connection status
    let isOnline = false;
    if (statusResponse.ok) {
      isOnline = await statusResponse.json();
    }

    return NextResponse.json({ ...data, isOnline });
  } catch (error) {
    console.error('Critical error fetching from Blynk proxy:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}