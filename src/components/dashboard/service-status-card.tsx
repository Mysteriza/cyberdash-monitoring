'use client';

import { useState, useEffect, useContext, useCallback } from 'react';
import { getServiceStatusData } from '@/lib/api';
import { Skeleton } from '../ui/skeleton';
import { AlertCircle, RefreshCw, Server } from 'lucide-react';
import { SettingsContext } from '@/contexts/settings-context';
import type { ServiceStatusData, ServiceStatus } from '@/lib/types';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const statusConfig: Record<ServiceStatus, { text: string; className: string }> = {
  operational: { text: "Operational", className: "bg-green-500" },
  degraded: { text: "Degraded", className: "bg-yellow-400" },
  partial_outage: { text: "Partial Outage", className: "bg-orange-500" },
  major_outage: { text: "Major Outage", className: "bg-destructive" },
  unknown: { text: "Unknown", className: "bg-gray-500" },
};

export default function ServiceStatusCard() {
  const { settings, isLoaded } = useContext(SettingsContext);
  const [data, setData] = useState<ServiceStatusData[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getServiceStatusData();
      setData(result);
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
      if (isMounted && settings.services > 0) {
        timerId = setTimeout(runFetch, settings.services * 1000);
      }
    };

    runFetch();

    return () => {
      isMounted = false;
      clearTimeout(timerId);
    };
  }, [isLoaded, settings.services, fetchData]);

  return (
    <div className="space-y-4 text-center">
      <div className="flex items-center justify-center gap-2">
        <Server className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-semibold text-primary">AI & Dev Status</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={fetchData}
          disabled={isLoading}
          className="h-7 w-7 text-muted-foreground transition-all hover:text-accent"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {isLoading && !data ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-full" />
          ))}
        </div>
      ) : error ? (
        <div className="flex items-center justify-center text-sm text-destructive">
          <AlertCircle className="mr-2 h-4 w-4" />
          <span>{error?.message || 'Error fetching status'}</span>
        </div>
      ) : (
        <TooltipProvider>
          <div className="space-y-3">
            {data?.map((service) => {
              const config = statusConfig[service.status] || statusConfig.unknown;
              return (
                <Tooltip key={service.name} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <a
                      href={service.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between text-sm text-foreground transition-opacity hover:opacity-80"
                    >
                      <span>{service.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{config.text}</span>
                        <div className={cn("h-3 w-3 rounded-full shrink-0", config.className)} />
                      </div>
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Click to visit {service.name} status page</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>
      )}
    </div>
  );
}