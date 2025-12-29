import { NextResponse } from 'next/server';

export async function GET() {
  const EXCHANGERATE_API_URL = `https://v6.exchangerate-api.com/v6/${process.env.EXCHANGERATE_APP_ID}/latest/USD`;

  try {
    const response = await fetch(EXCHANGERATE_API_URL, {
      next: { revalidate: 3600 }
    });
    
    const data = await response.json();

    if (!response.ok || data.result === 'error') {
      const errorMessage = data['error-type'] || `API request failed with status ${response.status}`;
      return NextResponse.json({ error: errorMessage }, { status: response.status || 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Critical error fetching from ExchangeRate proxy:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}