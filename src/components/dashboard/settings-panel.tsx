'use client';

import { useContext } from 'react';
import { Settings, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { SettingsContext } from '@/contexts/settings-context';
import type { SettingsCategory } from '@/lib/types';
import { Separator } from '../ui/separator';

const intervalOptions = {
  indoor: [
    { value: 10, label: '10 seconds' },
    { value: 15, label: '15 seconds' },
    { value: 30, label: '30 seconds' },
    { value: 60, label: '1 minute' },
  ],
  outdoor: [
    { value: 60, label: '1 minute' },
    { value: 300, label: '5 minutes' },
    { value: 600, label: '10 minutes' },
    { value: 1800, label: '30 minutes' },
  ],
  currency: [
    { value: 0, label: 'On Click' },
    { value: 1800, label: '30 minutes' },
    { value: 3600, label: '1 hour' },
    { value: 10800, label: '3 hours' },
  ],
  crypto: [
    { value: 0, label: 'On Click' },
    { value: 300, label: '5 minutes' },
    { value: 600, label: '10 minutes' },
    { value: 1800, label: '30 minutes' },
  ],
  services: [
    { value: 60, label: '1 minute' },
    { value: 300, label: '5 minutes' },
    { value: 600, label: '10 minutes' },
    { value: 1800, label: '30 minutes' },
  ],
  country: [
    { value: 0, label: 'On Click' },
    { value: 3600, label: '1 Hour' },
    { value: 86400, label: '1 Day' },
  ],
};

export default function SettingsPanel() {
  const { settings, updateSetting, isLoaded } = useContext(SettingsContext);

  if (!isLoaded) {
    return null;
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground transition-all hover:text-accent"
        >
          <SlidersHorizontal className="h-5 w-5" />
          <span className="sr-only">Open Settings</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[350px] border-accent/50 bg-background/80 text-foreground backdrop-blur-xl">
        <SheetHeader>
          <SheetTitle className="text-accent">
            <Settings className="mr-2 inline-block h-5 w-5" />
            Settings
          </SheetTitle>
          <SheetDescription>
            Adjust the refresh intervals for the dashboard data.
          </SheetDescription>
        </SheetHeader>
        <Separator className="my-4 bg-border/50" />
        <div className="space-y-6 py-4">
          {(Object.keys(settings) as SettingsCategory[]).map((category) => (
            <div key={category} className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor={`interval-${category}`} className="capitalize text-right">
                {category}
              </Label>
              <Select
                value={String(settings[category])}
                onValueChange={(value) =>
                  updateSetting(category, Number(value))
                }
              >
                <SelectTrigger id={`interval-${category}`} className="col-span-2">
                  <SelectValue placeholder="Select interval" />
                </SelectTrigger>
                <SelectContent>
                  {intervalOptions[category].map((option) => (
                    <SelectItem key={option.value} value={String(option.value)}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}