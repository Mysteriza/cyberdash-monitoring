'use client';

import { useState, useEffect, useContext, useCallback } from 'react';
import { getCryptoData } from '@/lib/api';
import { Skeleton } from '../ui/skeleton';
import { AlertCircle, Bitcoin, RefreshCw, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { format } from 'date-fns';
import { SettingsContext } from '@/contexts/settings-context';
import type { CryptoData } from '@/lib/types';
import { Button } from '../ui/button';
import { useLocation } from '@/contexts/location-context';

export default function CryptoCard() {
  const { settings, isLoaded } = useContext(SettingsContext);
  const { location } = useLocation();
  const [data, setData] = useState<CryptoData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const currencyCode = location.currencyCode || 'IDR';

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getCryptoData(currencyCode);
      setData(result);
      setLastUpdated(new Date());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('An unknown error occurred'));
    } finally {
      setIsLoading(false);
    }
  }, [currencyCode]);

  useEffect(() => {
    if (!isLoaded) return;

    let isMounted = true;
    let timerId: NodeJS.Timeout;

    const runFetch = async () => {
      await fetchData();
      if (isMounted && settings.crypto > 0) {
        timerId = setTimeout(runFetch, settings.crypto * 1000);
      }
    };

    runFetch();

    return () => {
      isMounted = false;
      clearTimeout(timerId);
    };
  }, [isLoaded, settings.crypto, fetchData]);

  const change = data?.bitcoin.percent_change_24h ?? 0;
  const isPositive = change > 0;
  const localPrice = data?.bitcoin.local;
  const localCode = data?.bitcoin.localCode;

  return (
    <div className="space-y-4 text-center">
      <div className="flex items-center justify-center gap-2">
        <Bitcoin className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-semibold text-primary">Bitcoin</h2>
        {settings.crypto === 0 && (
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
        <div className="space-y-4">
          <div className="flex flex-col items-center space-y-2">
            <Skeleton className="h-5 w-1/4" />
            <Skeleton className="h-6 w-3/4" />
          </div>
          <div className="flex flex-col items-center space-y-2">
            <Skeleton className="h-5 w-1/4" />
            <Skeleton className="h-6 w-1/2" />
          </div>
          <Skeleton className="h-4 w-1/2 mx-auto" />
        </div>
      ) : error ? (
        <div className="flex items-center justify-center text-sm text-destructive">
          <AlertCircle className="mr-2 h-4 w-4" />
          <span>{error?.message || 'Error fetching price'}</span>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <span className="text-sm text-muted-foreground">USD</span>
            <p className="text-2xl font-semibold text-foreground">
              {data?.bitcoin.usd.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }) ?? 'N/A'}
            </p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">{localCode}</span>
            <p className="text-2xl font-semibold text-foreground">
              {localPrice?.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }) ?? 'N/A'}
            </p>
            <div className={`flex items-center justify-center text-xs ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
              <span>{change.toFixed(2)}% (24h)</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground pt-1">
            {lastUpdated ? `Updated: ${format(lastUpdated, 'HH:mm:ss')}` : ''}
          </p>
        </div>
      )}
    </div>
  );
}