type AirQualityInfo = {
  level: string;
  className: string;
};

export function getAirQualityInfo(aqi: number | undefined): AirQualityInfo {
  if (aqi === undefined) return { level: 'Unknown', className: '' };
  if (aqi <= 20) return { level: 'Good', className: 'text-green-500' };
  if (aqi <= 40) return { level: 'Fair', className: 'text-yellow-400' };
  if (aqi <= 60) return { level: 'Moderate', className: 'text-yellow-400' };
  if (aqi <= 80) return { level: 'Poor', className: 'text-destructive' };
  if (aqi <= 100) return { level: 'Very Poor', className: 'text-destructive' };
  return { level: 'Extremely Poor', className: 'text-destructive' };
}