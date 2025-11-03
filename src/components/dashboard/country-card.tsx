'use client';

import { useState, useEffect, useContext, useCallback } from 'react';
import { getCountryData } from '@/lib/api';
import { Skeleton } from '../ui/skeleton';
import { AlertCircle, Globe, RefreshCw } from 'lucide-react';
import type { CountryData } from '@/lib/types';
import { SettingsContext } from '@/contexts/settings-context';
import { useLocation } from '@/contexts/location-context';
import { Button } from '../ui/button';
import { format } from 'date-fns';

export default function CountryCard() {
  const { settings, isLoaded } = useContext(SettingsContext);
  const { location } = useLocation();
  const [data, setData] = useState<CountryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    if (!location.countryCode) return;
    setIsLoading(true);
    try {
      const result = await getCountryData(location.countryCode);
      setData(result);
      setLastUpdated(new Date());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('An unknown error occurred'));
    } finally {
      setIsLoading(false);
    }
  }, [location.countryCode]);

  useEffect(() => {
    if (!isLoaded || !location.countryCode) return;

    let isMounted = true;
    let timerId: NodeJS.Timeout;

    const runFetch = async () => {
      await fetchData();
      if (isMounted && settings.country > 0) {
        timerId = setTimeout(runFetch, settings.country * 1000);
      }
    };

    runFetch();

    return () => {
      isMounted = false;
      clearTimeout(timerId);
    };
  }, [isLoaded, settings.country, fetchData, location.countryCode]);
  
  const StatItem = ({ label, value }: { label: string; value: string | number | undefined }) => (
    <div className="flex-1 min-w-[100px]">
      <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
      <div className="text-xl font-semibold text-foreground truncate">
        {value ? (typeof value === 'number' ? value.toLocaleString('en-US') : value) : <Skeleton className="h-6 w-24" />}
      </div>
    </div>
  );

  return (
    <div className="space-y-4 text-center">
      <div className="flex items-center justify-center gap-2">
        <Globe className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-semibold text-primary">Country Data</h2>
        {settings.country === 0 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchData}
            disabled={isLoading}
            className="h-7 w-7 text-muted-foreground transition-all hover:text-accent"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        )}
      </div>

      {error ? (
        <div className="flex items-center justify-center text-sm text-destructive">
          <AlertCircle className="mr-2 h-4 w-4" />
          <span>{error?.message || 'Error'}</span>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <span className="text-sm text-muted-foreground">Country</span>
            <div className="flex items-center justify-center gap-2">
              {isLoading ? (
                <Skeleton className="h-6 w-8" />
              ) : (
                data?.flag && <img src={data.flag} alt={data.name} className="h-6 w-auto border border-border/50" />
              )}
              <div className="text-3xl font-bold text-foreground">
                {data ? data.name : <Skeleton className="h-8 w-40" />}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col space-y-3 pt-2">
            <StatItem label="Population" value={data?.population} />
            <StatItem label="Capital" value={data?.capital} />
            <StatItem label="Region" value={data?.region} />
          </div>

          <p className="text-xs text-muted-foreground pt-1">
            Source: restcountries.com
            {lastUpdated && ` | Updated: ${format(lastUpdated, 'HH:mm:ss')}`}
          </p>
        </div>
      )}
    </div>
  );
}