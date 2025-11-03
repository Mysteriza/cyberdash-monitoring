'use client';

import { createContext, type ReactNode, useMemo } from 'react';
import { useSettings } from '@/hooks/use-settings';
import type { Settings, SettingsCategory } from '@/lib/types';

interface SettingsContextType {
  settings: Settings;
  updateSetting: (category: SettingsCategory, value: number) => void;
  isLoaded: boolean;
}

export const SettingsContext = createContext<SettingsContextType>({
  settings: { indoor: 15, outdoor: 60, currency: 3600, crypto: 3600 },
  updateSetting: () => {},
  isLoaded: false,
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { settings, updateSetting, isLoaded } = useSettings();

  const contextValue = useMemo(() => ({
    settings,
    updateSetting,
    isLoaded
  }), [settings, updateSetting, isLoaded]);

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
}