import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const COINMARKETCAP_API_URL = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?id=1&convert=USD`;

  const apiKey = process.env.COINMARKETCAP_API_KEY;

  if (!apiKey) {
    console.error('Critical: CoinMarketCap API Key not configured');
    return NextResponse.json({ error: 'CoinMarketCap API Key not configured' }, { status: 500 });
  }

  try {
    const response = await fetch(COINMARKETCAP_API_URL, {
      headers: {
        'X-CMC_PRO_API_KEY': apiKey,
        'Accept': 'application/json',
      },
      next: { revalidate: 300 }
    });

    const data = await response.json();

    if (!response.ok || (data.status && data.status.error_code !== 0)) {
      const statusCode = data?.status?.error_code;
      const errorMessage = data?.status?.error_message || `API request failed with status ${response.status}`;
      
      let status = 500;
      if (statusCode === 1001) status = 401;
      if (statusCode === 1002) status = 401;
      if (statusCode === 1006) status = 403;
      if (statusCode === 400) status = 400;
      
      return NextResponse.json({ error: errorMessage }, { status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Critical error fetching from CoinMarketCap proxy:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}