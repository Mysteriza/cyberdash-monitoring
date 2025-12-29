'use client';

import { useState, useEffect, useContext } from 'react';
import { Thermometer, Droplets, Wind, Gauge, Sun, CloudRain, Cloud, ArrowDown, Mountain, Leaf, type LucideIcon } from 'lucide-react';
import { getOutdoorData } from '@/lib/api';
import DataCard from './data-card';
import { format } from 'date-fns';
import { getWeatherInfo } from '@/lib/weather';
import { Card, CardContent } from '@/components/ui/card';
import { getAirQualityInfo } from '@/lib/air-quality';
import { Skeleton } from '@/components/ui/skeleton';
import { useLocation } from '@/contexts/location-context';
import { SettingsContext } from '@/contexts/settings-context';
import type { OutdoorData } from '@/lib/types';
import { degreesToCompass } from '@/lib/utils';
import { Separator } from '../ui/separator';
import HourlyForecast from './hourly-forecast';
import DailyForecast from './daily-forecast';
import LocationSearch from './location-search';

type OutdoorMetric = {
  title: string;
  icon: LucideIcon;
  key: keyof OutdoorData | keyof OutdoorData['current'];
  unit: string;
  value: (data: OutdoorData) => string | undefined;
  description?: (data: OutdoorData) => string | undefined;
  getClassName: (data: OutdoorData) => string;
};

export default function OutdoorDataGrid() {
  const { location } = useLocation();
  const { settings, isLoaded } = useContext(SettingsContext);
  const [data, setData] = useState<OutdoorData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    if (!isLoaded || !location) return;

    let isMounted = true;
    let timerId: NodeJS.Timeout;

    const fetchData = async () => {
      if (!data) {
        setIsLoading(true);
      }
      try {
        const result = await getOutdoorData(location);
        if (isMounted) {
          setData(result);
          setLastUpdated(new Date());
          setError(null);
        }
      } catch (e) {
        if (isMounted) {
          setError(e instanceof Error ? e : new Error('An unknown error occurred'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          if (settings.outdoor > 0) {
            timerId = setTimeout(fetchData, settings.outdoor * 1000);
          }
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      clearTimeout(timerId);
    };
  }, [isLoaded, settings.outdoor, location]);

  const currentData = data?.current;
  const weatherInfo = currentData ? getWeatherInfo(currentData.weather_code) : null;
  const airQualityInfo = currentData ? getAirQualityInfo(currentData.european_aqi) : null;
  
  const getTempClassName = (temp: number) => {
    if (temp > 30 || temp < 17) return 'text-destructive';
    if (temp > 27 || temp < 20) return 'text-yellow-400';
    return 'text-green-500';
  };
  
  const mainTempClassName = currentData ? getTempClassName(currentData.temperature_2m) : '';

  const topMetrics: OutdoorMetric[] = [
    { 
      title: 'Humidity', 
      icon: Droplets, 
      key: 'relative_humidity_2m', 
      unit: '%',
      value: (d) => d.current.relative_humidity_2m?.toFixed(2),
      getClassName: (d) => {
        if (d.current.relative_humidity_2m > 80 || d.current.relative_humidity_2m < 30) return 'text-destructive';
        if (d.current.relative_humidity_2m > 60 || d.current.relative_humidity_2m < 40) return 'text-yellow-400';
        return 'text-green-500';
      }
    },
    { 
      title: 'Wind', 
      icon: Wind, 
      key: 'wind_speed_10m', 
      unit: 'km/h',
      value: (d) => d.current.wind_speed_10m?.toFixed(2),
      description: (d) => degreesToCompass(d.current.wind_direction_10m),
      getClassName: (d) => {
        if (d.current.wind_speed_10m > 30) return 'text-destructive';
        if (d.current.wind_speed_10m > 20) return 'text-yellow-400';
        return 'text-green-500';
      }
    },
    { 
      title: 'Altitude', 
      icon: Mountain, 
      key: 'elevation', 
      unit: 'm',
      value: (d) => d.elevation?.toFixed(2),
      getClassName: () => ''
    },
    { 
      title: 'Surface Pressure', 
      icon: ArrowDown, 
      key: 'surface_pressure', 
      unit: 'hPa',
      value: (d) => d.current.surface_pressure?.toFixed(2),
      getClassName: () => ''
    },
    { 
      title: 'Sea-Level Pressure', 
      icon: Gauge, 
      key: 'pressure_msl', 
      unit: 'hPa',
      value: (d) => d.current.pressure_msl?.toFixed(2),
      getClassName: () => ''
    },
    { 
      title: 'Precipitation', 
      icon: CloudRain, 
      key: 'precipitation', 
      unit: 'mm',
      value: (d) => d.current.precipitation?.toFixed(2),
      description: (d) => {
        const probability = d.hourly?.precipitation_probability?.[0];
        return probability != null ? `Rain Probability: ${probability}%` : undefined;
      },
      getClassName: (d) => d.current.precipitation > 0 ? 'text-yellow-400' : ''
    },
  ];
  
  const bottomMetrics: OutdoorMetric[] = [
    { 
      title: 'UV Index', 
      icon: Sun, 
      key: 'uv_index',
      unit: '',
      value: (d) => d.current.uv_index?.toFixed(2), 
      description: (d) => d.current.uv_index != null ? (d.current.uv_index > 8 ? 'Very High' : d.current.uv_index > 5 ? 'High' : d.current.uv_index > 2 ? 'Moderate' : 'Low') : 'N/A', 
      getClassName: (d) => d.current.uv_index != null ? (d.current.uv_index > 8 ? 'text-destructive' : d.current.uv_index > 5 ? 'text-yellow-400' : 'text-green-500') : '' 
    },
    { 
      title: 'Air Quality', 
      icon: Leaf, 
      key: 'european_aqi',
      unit: '',
      value: (d) => d.current.european_aqi?.toFixed(0),
      description: (d) => getAirQualityInfo(d.current.european_aqi).level, 
      getClassName: (d) => getAirQualityInfo(d.current.european_aqi).className
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-foreground">Outdoor - {location.name}</h2>
            <div className="flex items-center gap-4">
              <p className="text-xs text-muted-foreground">Source: Open-Meteo API</p>
              {lastUpdated && !isLoading && !error && (
                <p className="text-xs text-muted-foreground">
                  Updated: {format(lastUpdated, 'HH:mm:ss')}
                </p>
              )}
            </div>
          </div>
          <LocationSearch />
        </div>
        
        <Card className="mt-3 border-border/50 bg-primary/20 text-foreground p-4 backdrop-blur-sm">
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                      {isLoading ? (
                        <Skeleton className="w-12 h-12 rounded-md" />
                      ) : error ? (
                        <Cloud className="w-12 h-12 text-destructive" />
                      ) : (
                        weatherInfo?.icon ? <weatherInfo.icon className="w-12 h-12 text-primary" /> : <Cloud className="w-12 h-12 text-primary" />
                      )}
                      <div>
                          {isLoading ? (
                            <>
                              <Skeleton className="h-10 w-32" />
                              <Skeleton className="h-5 w-24 mt-1" />
                            </>
                          ) : error ? (
                            <p className="text-2xl font-bold text-destructive">Error</p>
                          ) : (
                            <>
                              <p className={`text-4xl font-bold text-foreground ${mainTempClassName}`}>
                                {currentData?.temperature_2m?.toFixed(2)}°C
                              </p>
                              <p className="text-base text-muted-foreground">{weatherInfo?.description || 'N/A'}</p>
                            </>
                          )}
                      </div>
                  </div>
                  {!isLoading && !error && currentData && (
                    <p className="text-sm text-muted-foreground mt-2 sm:mt-0">Feels Like: {currentData?.apparent_temperature?.toFixed(2)}°C</p>
                  )}
              </div>
            </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 mt-3">
          {topMetrics.map((metric) => (
            <DataCard
              key={metric.key}
              title={metric.title}
              icon={<metric.icon className="h-4 w-4" />}
              value={data ? metric.value(data) : undefined}
              unit={metric.unit}
              description={data ? metric.description?.(data) : undefined}
              isLoading={isLoading}
              error={error}
              valueClassName={data ? metric.getClassName(data) : ''}
            />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mt-3">
            {bottomMetrics.map(metric => (
                <DataCard
                    key={metric.key}
                    title={metric.title}
                    icon={<metric.icon className="h-4 w-4" />}
                    value={data ? metric.value(data) : undefined}
                    unit={metric.unit}
                    description={data ? metric.description?.(data) : undefined}
                    isLoading={isLoading}
                    error={error}
                    valueClassName={data ? metric.getClassName(data) : ''}
                />
            ))}
        </div>
      </div>

      {data?.hourly && (
        <>
          <Separator className="bg-border/50" />
          <HourlyForecast data={data.hourly} isLoading={isLoading} />
        </>
      )}

      {data?.daily && (
        <>
          <Separator className="bg-border/50" />
          <DailyForecast data={data.daily} isLoading={isLoading} />
        </>
      )}
    </div>
  );
}