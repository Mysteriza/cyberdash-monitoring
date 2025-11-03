export interface IndoorData {
  temperature: number;
  humidity: number;
  pressure: number;
  gas: number;
  air_quality: 'Good' | 'Moderate' | 'Poor';
}

export type WeatherCode = 0 | 1 | 2 | 3 | 45 | 48 | 51 | 53 | 55 | 56 | 57 | 61 | 63 | 65 | 66 | 67 | 71 | 73 | 75 | 77 | 80 | 81 | 82 | 85 | 86 | 95 | 96 | 99;

export interface HourlyForecastData {
  time: string[];
  temperature_2m: number[];
  precipitation_probability: number[];
  weather_code: WeatherCode[];
}

export interface DailyForecastData {
  time: string[];
  weather_code: WeatherCode[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_probability_max: number[];
}

export interface OutdoorData {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    precipitation: number;
    weather_code: WeatherCode;
    surface_pressure: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    pressure_msl: number;
    uv_index: number;
    european_aqi: number;
  };
  hourly: HourlyForecastData;
  daily: DailyForecastData;
  elevation: number;
}


export interface CryptoData {
  bitcoin: {
    usd: number;
    local: number;
    localCode: string;
    percent_change_24h: number;
  };
}

export interface CurrencyData {
  base_code: string;
  conversion_rates: {
    [key: string]: number;
  };
}

export type ServiceStatus = 'operational' | 'degraded' | 'partial_outage' | 'major_outage' | 'unknown';

export interface ServiceStatusData {
  name: string;
  status: ServiceStatus;
  url: string;
}

export interface CountryData {
  name: string;
  flag: string;
  population: number;
  capital: string;
  region: string;
}

export type Settings = {
  indoor: number;
  outdoor: number;
  currency: number;
  crypto: number;
  services: number;
  country: number;
};

export type SettingsCategory = keyof Settings;

export interface Location {
  lat: number;
  lon: number;
  name: string;
  countryCode: string;
  currencyCode: string;
}