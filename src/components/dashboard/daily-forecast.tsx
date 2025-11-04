'use client';

import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { getWeatherInfo } from "@/lib/weather";
import { DailyForecastData } from "@/lib/types";
import { format, parseISO } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Droplet, ArrowDown, ArrowUp } from "lucide-react";

type DailyForecastProps = {
  data: DailyForecastData;
  isLoading: boolean;
};

type ProcessedDailyData = {
  date: string;
  day: string;
  icon: ReturnType<typeof getWeatherInfo>['icon'];
  description: string;
  tempMax: number;
  tempMin: number;
  precipitation: number;
};

export default function DailyForecast({ data, isLoading }: DailyForecastProps) {
  const processedData: ProcessedDailyData[] = [];

  if (data && data.time) {
    data.time.forEach((timeStr, i) => {
      const weatherInfo = getWeatherInfo(data.weather_code[i]);
      processedData.push({
        date: timeStr,
        day: i === 0 ? 'Today' : format(parseISO(timeStr), 'EEE'),
        icon: weatherInfo.icon,
        description: weatherInfo.description,
        tempMax: data.temperature_2m_max[i],
        tempMin: data.temperature_2m_min[i],
        precipitation: data.precipitation_probability_max[i],
      });
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Calendar className="h-5 w-5 text-foreground" />
        <h3 className="text-lg font-semibold text-foreground">14-Day Forecast</h3>
      </div>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex w-max space-x-3 pb-4">
          {isLoading
            ? Array.from({ length: 14 }).map((_, i) => (
                <Card key={i} className="border-border/50 bg-card/50 w-32">
                  <CardContent className="flex flex-col items-center justify-center p-3 space-y-1">
                    <Skeleton className="h-5 w-10" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-4 w-10" />
                  </CardContent>
                </Card>
              ))
            : processedData.map((day) => (
                <Card key={day.date} className="border-border/50 bg-card/50 w-32 shrink-0">
                  <CardContent className="flex flex-col items-center justify-center p-3 space-y-1">
                    <div className="text-sm font-medium text-muted-foreground">{day.day}</div>
                    <day.icon className="h-8 w-8 text-primary" />
                    <div className="text-xs text-muted-foreground truncate w-full text-center" title={day.description}>
                      {day.description}
                    </div>
                    <div className="flex items-center gap-2 text-base font-bold">
                      <div className="flex items-center" title="Max Temp">
                        <ArrowUp className="h-3 w-3" />
                        {day.tempMax.toFixed(0)}°
                      </div>
                      <div className="flex items-center text-muted-foreground" title="Min Temp">
                        <ArrowDown className="h-3 w-3" />
                        {day.tempMin.toFixed(0)}°
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Droplet className="h-3 w-3 text-blue-400" />
                      {day.precipitation}%
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