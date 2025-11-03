'use client';

import { useState, useEffect, useContext } from 'react';
import { Thermometer, Droplets, Gauge, AlertTriangle, type LucideIcon } from 'lucide-react';
import { getIndoorData } from '@/lib/api';
import DataCard from './data-card';
import type { IndoorData } from '@/lib/types';
import { format } from 'date-fns';
import { SettingsContext } from '@/contexts/settings-context';

export default function IndoorDataGrid() {
  const { settings, isLoaded } = useContext(SettingsContext);
  const [data, setData] = useState<IndoorData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    let isMounted = true;
    let timerId: NodeJS.Timeout;

    const fetchData = async () => {
      if (!data) {
        setIsLoading(true);
      }
      try {
        const result = await getIndoorData();
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
          if (settings.indoor > 0) {
            timerId = setTimeout(fetchData, settings.indoor * 1000);
          }
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      clearTimeout(timerId);
    };
  }, [isLoaded, settings.indoor]);

  const indoorMetrics: {
    title: string;
    icon: LucideIcon;
    key: keyof IndoorData;
    unit: string;
    description?: (data: IndoorData) => string;
    getClassName: (data: IndoorData) => string;
  }[] = [
    { 
      title: 'Temperature', 
      icon: Thermometer, 
      key: 'temperature', 
      unit: '°C',
      getClassName: (d) => {
        if (d.temperature > 32 || d.temperature < 18) return 'text-destructive';
        if (d.temperature > 30 || d.temperature < 20) return 'text-yellow-400';
        return 'text-green-500';
      }
    },
    { 
      title: 'Humidity', 
      icon: Droplets, 
      key: 'humidity', 
      unit: '%',
      getClassName: (d) => {
        if (d.humidity > 80 || d.humidity < 30) return 'text-destructive';
        if (d.humidity > 70 || d.humidity < 40) return 'text-yellow-400';
        return 'text-green-500';
      }
    },
    { 
      title: 'Pressure', 
      icon: Gauge, 
      key: 'pressure', 
      unit: 'hPa',
      getClassName: () => ''
    },
    {
      title: 'Gas',
      icon: AlertTriangle,
      key: 'gas',
      unit: '',
      description: (d) => `Air Quality: ${d.air_quality}`,
      getClassName: (d) => {
        if (d.air_quality === 'Poor') return 'text-destructive';
        if (d.air_quality === 'Moderate') return 'text-yellow-400';
        return 'text-green-500';
      }
    },
  ];

  const getMetricValue = (metricKey: keyof IndoorData) => {
    if (!data) return undefined;
    const value = data[metricKey];
    if (typeof value === 'number') {
        if (metricKey === 'gas') {
            return value.toFixed(0);
        }
        return value.toFixed(2);
    }
    return value;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Indoor</h2>
          <p className="text-xs text-muted-foreground">Source: ESP8266 + BME280 + MQ135 + Blynk API</p>
        </div>
        {lastUpdated && !isLoading && !error && (
            <p className="text-xs text-muted-foreground shrink-0 pl-2">
                Updated: {format(lastUpdated, 'HH:mm:ss')}
            </p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {indoorMetrics.map((metric) => (
          <DataCard
            key={metric.key}
            title={metric.title}
            icon={<metric.icon className="h-4 w-4" />}
            value={getMetricValue(metric.key)}
            unit={metric.unit}
            description={data && metric.description ? metric.description(data) : undefined}
            isLoading={isLoading}
            error={error}
            valueClassName={data ? metric.getClassName(data) : ''}
          />
        ))}
      </div>
    </div>
  );
}