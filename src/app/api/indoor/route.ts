import { NextResponse } from 'next/server';

export async function GET() {
  const BLYNK_API_URL = `https://blynk.cloud/external/api/get?token=${process.env.BLYNK_AUTH_TOKEN}&v0&v1&v5&v8`;

  try {
    const response = await fetch(BLYNK_API_URL, {
      next: { revalidate: 0 }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Blynk API error:', errorText);
      return NextResponse.json({ error: `API request failed with status ${response.status}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Critical error fetching from Blynk proxy:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}