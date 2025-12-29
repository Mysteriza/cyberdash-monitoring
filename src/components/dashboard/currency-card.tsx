'use client';

import { useState, useEffect, useContext, useCallback } from 'react';
import { getCurrencyData } from '@/lib/api';
import { Skeleton } from '../ui/skeleton';
import { AlertCircle, Landmark, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { SettingsContext } from '@/contexts/settings-context';
import type { CurrencyData } from '@/lib/types';
import { Button } from '../ui/button';
import { useLocation } from '@/contexts/location-context';


export default function CurrencyCard() {
  const { settings, isLoaded } = useContext(SettingsContext);
  const { location } = useLocation();
  const [data, setData] = useState<CurrencyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const currencyCode = location.currencyCode || 'IDR';
  const rate = data?.conversion_rates?.[currencyCode];

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getCurrencyData();
      setData(result);
      setLastUpdated(new Date());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('An unknown error occurred'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    let isMounted = true;
    let timerId: NodeJS.Timeout;

    const runFetch = async () => {
      await fetchData();
      if (isMounted && settings.currency > 0) {
        timerId = setTimeout(runFetch, settings.currency * 1000);
      }
    };
    
    runFetch();

    return () => {
      isMounted = false;
      clearTimeout(timerId);
    };
  }, [isLoaded, settings.currency, fetchData]);


  return (
     <div className="space-y-4 text-center">
      <div className="flex items-center justify-center gap-2">
        <Landmark className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-semibold text-primary">Currency</h2>
        {settings.currency === 0 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fetchData()}
            disabled={isLoading}
            className="h-7 w-7 text-muted-foreground transition-all hover:text-accent"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        )}
      </div>

      {isLoading && !data ? (
        <div className="flex flex-col items-center space-y-2">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2 mt-1" />
        </div>
      ) : error ? (
        <div className="flex items-center justify-center text-sm text-destructive">
          <AlertCircle className="mr-2 h-4 w-4" />
          <span>{error?.message || 'Error fetching rate'}</span>
        </div>
      ) : (
        <div className="space-y-2">
          <div>
            <span className="text-sm text-muted-foreground">USD to {currencyCode}</span>
            <p className="text-2xl font-semibold text-foreground">
              {rate?.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }) ?? 'N/A'}
            </p>
          </div>
           <p className="text-xs text-muted-foreground pt-1">
            {lastUpdated ? `Updated: ${format(lastUpdated, 'HH:mm:ss')}` : ''}
          </p>
        </div>
      )}
    </div>
  );
}