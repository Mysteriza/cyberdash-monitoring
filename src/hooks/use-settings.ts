'use client';

import { useState, useEffect, useCallback } from 'react';
import { type Settings, type SettingsCategory } from '@/lib/types';

const SETTINGS_KEY = 'cyberdash-settings';

const DEFAULT_SETTINGS: Settings = {
  indoor: 30,
  outdoor: 300,
  currency: 3600,
  crypto: 300,
  services: 60,
  country: 86400,
};

export function useSettings() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    let storedSettings: Settings = DEFAULT_SETTINGS;
    try {
      const storedSettingsJSON = localStorage.getItem(SETTINGS_KEY);
      if (storedSettingsJSON) {
        storedSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(storedSettingsJSON) };
      }
    } catch (error) {
      console.error('Failed to load settings from localStorage', error);
    }
    setSettings(storedSettings);
    setIsLoaded(true);
  }, []);

  const updateSetting = useCallback((category: SettingsCategory, value: number) => {
    setSettings((prev) => {
      const newSettings = { ...prev, [category]: value };
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
      } catch (error) {
        console.error('Failed to save settings to localStorage', error);
      }
      return newSettings;
    });
  }, []);

  return { settings, updateSetting, isLoaded };
}