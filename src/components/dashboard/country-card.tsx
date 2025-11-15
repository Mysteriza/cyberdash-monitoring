'use client';

import { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { getCountryData } from '@/lib/api';
import { Skeleton } from '../ui/skeleton';
import { AlertCircle, Globe, RefreshCw, Users, TrendingUp } from 'lucide-react';
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
  
  // Live counters state
  const [liveCounters, setLiveCounters] = useState({
    current: 0,
    todayBirths: 0,
    todayDeaths: 0,
    todayGrowth: 0,
    yearBirths: 0,
    yearDeaths: 0,
    yearGrowth: 0,
  });
  
  const baseDataRef = useRef<CountryData | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const fetchData = useCallback(async () => {
    if (!location.countryCode) return;
    setIsLoading(true);
    try {
      const result = await getCountryData(location.countryCode);
      setData(result);
      baseDataRef.current = result;
      startTimeRef.current = Date.now();
      
      // Initialize live counters
      if (result.worldPopulation) {
        setLiveCounters({
          current: result.worldPopulation.current,
          todayBirths: result.worldPopulation.today.births,
          todayDeaths: result.worldPopulation.today.deaths,
          todayGrowth: result.worldPopulation.today.growth,
          yearBirths: result.worldPopulation.thisYear.births,
          yearDeaths: result.worldPopulation.thisYear.deaths,
          yearGrowth: result.worldPopulation.thisYear.growth,
        });
      }
      
      setLastUpdated(new Date());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('An unknown error occurred'));
    } finally {
      setIsLoading(false);
    }
  }, [location.countryCode]);

  // Update live counters every second
  useEffect(() => {
    if (!baseDataRef.current?.worldPopulation) return;

    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const wp = baseDataRef.current!.worldPopulation!;
      
      setLiveCounters({
        current: Math.floor(wp.current + (wp.rates.growthPerSecond * elapsed)),
        todayBirths: Math.floor(wp.today.births + (wp.rates.birthsPerSecond * elapsed)),
        todayDeaths: Math.floor(wp.today.deaths + (wp.rates.deathsPerSecond * elapsed)),
        todayGrowth: Math.floor(wp.today.growth + (wp.rates.growthPerSecond * elapsed)),
        yearBirths: Math.floor(wp.thisYear.births + (wp.rates.birthsPerSecond * elapsed)),
        yearDeaths: Math.floor(wp.thisYear.deaths + (wp.rates.deathsPerSecond * elapsed)),
        yearGrowth: Math.floor(wp.thisYear.growth + (wp.rates.growthPerSecond * elapsed)),
      });
    }, 100); // Update setiap 100ms untuk smooth animation

    return () => clearInterval(interval);
  }, [data]);

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

  const LiveCounter = ({ label, value, color = 'text-foreground' }: { label: string; value: number; color?: string }) => (
    <div className="flex items-center justify-between py-2 px-3 bg-accent/10 rounded-md border border-border/30">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className={`text-sm font-bold tabular-nums ${color}`}>
        {value.toLocaleString('en-US')}
      </span>
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
            <StatItem label="Country Population" value={data?.population} />
            <StatItem label="Capital" value={data?.capital} />
            <StatItem label="Region" value={data?.region} />
          </div>

          {/* World Population Live Counters */}
          {data?.worldPopulation && (
            <>
              <div className="pt-4 border-t border-border/50">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Users className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold text-primary">World Population</h3>
                </div>
                
                <div className="text-4xl font-bold text-foreground mb-4 tabular-nums animate-pulse">
                  {liveCounters.current.toLocaleString('en-US')}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-accent" />
                    <span className="text-sm font-semibold text-accent">Today</span>
                  </div>
                  <LiveCounter label="Births Today" value={liveCounters.todayBirths} color="text-green-500" />
                  <LiveCounter label="Deaths Today" value={liveCounters.todayDeaths} color="text-red-500" />
                  <LiveCounter label="Growth Today" value={liveCounters.todayGrowth} color="text-blue-500" />
                </div>

                <div className="space-y-2 mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-accent" />
                    <span className="text-sm font-semibold text-accent">This Year (2025)</span>
                  </div>
                  <LiveCounter label="Births This Year" value={liveCounters.yearBirths} color="text-green-500" />
                  <LiveCounter label="Deaths This Year" value={liveCounters.yearDeaths} color="text-red-500" />
                  <LiveCounter label="Growth This Year" value={liveCounters.yearGrowth} color="text-blue-500" />
                </div>
              </div>
            </>
          )}

          <p className="text-xs text-muted-foreground pt-1">
            Source: restcountries.com & UN Population Division
            {lastUpdated && ` | Updated: ${format(lastUpdated, 'HH:mm:ss')}`}
          </p>
        </div>
      )}
    </div>
  );
}