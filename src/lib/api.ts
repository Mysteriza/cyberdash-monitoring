import { IndoorData, OutdoorData, CryptoData, CurrencyData, Location, CountryData, ServiceStatusData } from './types';

export const getIndoorData = async (): Promise<IndoorData> => {
  const response = await fetch('/api/indoor');
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch indoor data');
  }
  const data = await response.json();

  if (data.error) {
    throw new Error(data.error);
  }

  const gasKohms = data.v5 ? data.v5 / 1024 : 0;
  let air_quality: 'Good' | 'Moderate' | 'Poor' = 'Good';
  if (gasKohms > 10) air_quality = 'Poor';
  else if (gasKohms > 5) air_quality = 'Moderate';

  return {
    temperature: data.v0 || 0,
    humidity: data.v1 || 0,
    pressure: data.v8 || 0,
    gas: data.v5 || 0,
    air_quality: air_quality,
    last_updated_blynk: data.v4 || '',
    isOnline: data.isOnline || false
  };
};

export const getOutdoorData = async (location: Location): Promise<OutdoorData> => {
  const response = await fetch(`/api/outdoor?lat=${location.lat}&lon=${location.lon}`);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch outdoor data');
  }

  return response.json();
};

export const getCurrencyData = async (): Promise<CurrencyData> => {
  const response = await fetch('/api/currency');
  const data = await response.json();

  if (!response.ok || data.result === 'error' || data.error) {
    throw new Error(data.error || data['error-type'] || 'Failed to fetch currency data');
  }
  return data;
};

export const getCryptoData = async (currencyCode: string): Promise<CryptoData> => {
  const [cryptoResponse, currencyData] = await Promise.all([
    fetch('/api/coinmarketcap'),
    getCurrencyData()
  ]);

  const cryptoResult = await cryptoResponse.json();

  if (!cryptoResponse.ok || cryptoResult.error) {
     throw new Error(cryptoResult.error || 'Failed to fetch crypto data');
  }
  
  const quote = cryptoResult.data?.['1']?.quote;
  const usdPrice = quote?.USD?.price;
  const percent_change_24h = quote?.USD?.percent_change_24h;

  if (usdPrice === undefined || percent_change_24h === undefined) {
    throw new Error('Invalid crypto data format from API (USD)');
  }

  let localRate = currencyData.conversion_rates?.[currencyCode];
  let effectiveCurrencyCode = currencyCode;

  if (localRate === undefined) {
    localRate = currencyData.conversion_rates?.['IDR'];
    effectiveCurrencyCode = 'IDR';
    if (localRate === undefined) {
      throw new Error('Failed to get conversion rate for USD to IDR');
    }
  }
  
  const localPrice = usdPrice * localRate;

  return {
    bitcoin: {
      usd: usdPrice,
      local: localPrice,
      localCode: effectiveCurrencyCode,
      percent_change_24h: percent_change_24h,
    }
  };
};

export const getServiceStatusData = async (): Promise<ServiceStatusData[]> => {
  const response = await fetch('/api/status');
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch service status data');
  }
  return response.json();
};

export const getCountryData = async (code: string): Promise<CountryData> => {
  const response = await fetch(`/api/country?code=${code}`);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch country data');
  }
  return response.json();
};