'use client';

import { useState, useEffect, useContext } from 'react';
import { Thermometer, Droplets, Gauge, AlertTriangle, type LucideIcon } from 'lucide-react';
import { getIndoorData } from '@/lib/api';
import DataCard from './data-card';
import type { IndoorData } from '@/lib/types';
import { SettingsContext } from '@/contexts/settings-context';

export default function IndoorDataGrid() {
  const { settings, isLoaded } = useContext(SettingsContext);
  const [data, setData] = useState<IndoorData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

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
    // Exclude boolean and string values from metric display
    if (typeof value === 'boolean' || typeof value === 'string') {
        return undefined;
    }
    return value;
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold text-foreground">Indoor</h2>
          {!isLoading && !error && data && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium" style={{
              backgroundColor: data.isOnline ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: data.isOnline ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'
            }}>
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${data.isOnline ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${data.isOnline ? 'bg-green-500' : 'bg-red-500'}`}></span>
              </span>
              <span>{data.isOnline ? 'Online' : 'Offline'}</span>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Source: ESP8266 + BME280 + MQ135 + Blynk API</p>
          {data?.last_updated_blynk && !isLoading && !error && (
            <p className="text-xs text-muted-foreground">
              Updated: {data.last_updated_blynk}
            </p>
          )}
        </div>
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