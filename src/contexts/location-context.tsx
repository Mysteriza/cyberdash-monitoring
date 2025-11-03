'use client';

import { createContext, useContext, useState, type ReactNode, useEffect } from 'react';
import type { Location } from '@/lib/types';

const DEFAULT_LOCATION: Location = { 
  lat: -6.898, 
  lon: 107.6349, 
  name: "Cikutra, Bandung", 
  countryCode: "ID",
  currencyCode: "IDR"
};

interface LocationContextType {
    location: Location;
    setLocation: (location: Location) => void;
}

const LocationContext = createContext<LocationContextType>({
    location: DEFAULT_LOCATION,
    setLocation: () => {},
});

const getReverseGeocode = async (lat: number, lon: number): Promise<{ name: string; countryCode: string; currencyCode: string }> => {
  try {
    const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
    if (!response.ok) {
      throw new Error('Failed to fetch location name');
    }
    const data = await response.json();
    
    const locality = data.locality || "Unknown Location";
    const city = data.city || data.principalSubdivision || "";
    const fullName = city && city !== locality ? `${locality}, ${city}` : locality;
    const countryCode = data.countryCode || "ID";
    const currencyCode = data.currency?.code || "IDR";

    return { name: fullName, countryCode: countryCode, currencyCode: currencyCode };

  } catch (error) {
    console.warn("Reverse geocoding error:", (error as Error).message);
    return { name: "My Location", countryCode: "ID", currencyCode: "IDR" };
  }
}

export function LocationProvider({ children }: { children: ReactNode }) {
    const [location, setLocation] = useState<Location>(DEFAULT_LOCATION);

    useEffect(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            const { name, countryCode, currencyCode } = await getReverseGeocode(latitude, longitude);
            setLocation({
              lat: latitude,
              lon: longitude,
              name: name,
              countryCode: countryCode,
              currencyCode: currencyCode
            });
          },
          (error) => {
            console.warn(`Geolocation error: ${error.message}. Using default location.`);
          }
        );
      }
    }, []);

    return (
        <LocationContext.Provider value={{ location, setLocation }}>
            {children}
        </LocationContext.Provider>
    )
}

export const useLocation = () => useContext(LocationContext);