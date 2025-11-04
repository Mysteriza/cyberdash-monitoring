'use client';

import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { getWeatherInfo } from "@/lib/weather";
import { HourlyForecastData } from "@/lib/types";
import { format, parseISO } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Droplet } from "lucide-react";

type HourlyForecastProps = {
  data: HourlyForecastData;
  isLoading: boolean;
};

type ProcessedHourlyData = {
  time: string;
  icon: ReturnType<typeof getWeatherInfo>['icon'];
  description: string;
  temp: number;
  precipitation: number;
};

export default function HourlyForecast({ data, isLoading }: HourlyForecastProps) {
  const processedData: ProcessedHourlyData[] = [];

  if (data && data.time) {
    const now = new Date();
    const startIndex = data.time.findIndex(t => parseISO(t) > now);
    
    if (startIndex !== -1) {
      const forecastHours = data.time.slice(startIndex, startIndex + 24);
      
      forecastHours.forEach((timeStr, index) => {
        const i = startIndex + index;
        const weatherInfo = getWeatherInfo(data.weather_code[i]);
        processedData.push({
          time: format(parseISO(timeStr), 'HH:mm'),
          icon: weatherInfo.icon,
          description: weatherInfo.description,
          temp: data.temperature_2m[i],
          precipitation: data.precipitation_probability[i],
        });
      });
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-foreground" />
        <h3 className="text-lg font-semibold text-foreground">24-Hour Forecast</h3>
      </div>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex w-max space-x-3 pb-4">
          {isLoading
            ? Array.from({ length: 24 }).map((_, i) => (
                <Card key={i} className="border-border/50 bg-card/50 w-28">
                  <CardContent className="flex flex-col items-center justify-center p-3 space-y-1">
                    <Skeleton className="h-5 w-10" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-5 w-8" />
                    <Skeleton className="h-4 w-10" />
                  </CardContent>
                </Card>
              ))
            : processedData.map((hour) => (
                <Card key={hour.time} className="border-border/50 bg-card/50 w-28 shrink-0">
                  <CardContent className="flex flex-col items-center justify-center p-3 space-y-1">
                    <div className="text-sm font-medium text-muted-foreground">{hour.time}</div>
                    <hour.icon className="h-8 w-8 text-primary" />
                    <div className="text-xs text-muted-foreground truncate w-full text-center" title={hour.description}>
                      {hour.description}
                    </div>
                    <div className="text-xl font-bold">{hour.temp.toFixed(0)}°</div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Droplet className="h-3 w-3 text-blue-400" />
                      {hour.precipitation}%
                    </div>
                  </CardContent>
                </Card>
              ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}