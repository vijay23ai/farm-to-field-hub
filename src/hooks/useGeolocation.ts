import { useState, useCallback } from "react";

export interface LocationData {
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  country: string;
  loading: boolean;
  error: string | null;
}

const initialState: LocationData = {
  latitude: 0,
  longitude: 0,
  city: "",
  state: "",
  country: "",
  loading: false,
  error: null,
};

export const useGeolocation = () => {
  const [location, setLocation] = useState<LocationData>(initialState);

  const getLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setLocation(prev => ({ ...prev, error: "Geolocation not supported" }));
      return;
    }

    setLocation(prev => ({ ...prev, loading: true, error: null }));

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes cache
        });
      });

      const { latitude, longitude } = position.coords;

      // Reverse geocoding using OpenStreetMap Nominatim (free)
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
          { headers: { "Accept-Language": "en" } }
        );
        const data = await response.json();
        
        const address = data.address || {};
        setLocation({
          latitude,
          longitude,
          city: address.city || address.town || address.village || address.county || "",
          state: address.state || "",
          country: address.country || "",
          loading: false,
          error: null,
        });
      } catch {
        // If reverse geocoding fails, still return coordinates
        setLocation({
          latitude,
          longitude,
          city: "",
          state: "",
          country: "",
          loading: false,
          error: null,
        });
      }
    } catch (err) {
      const error = err as GeolocationPositionError;
      let message = "Failed to get location";
      if (error.code === 1) message = "Location access denied";
      if (error.code === 2) message = "Location unavailable";
      if (error.code === 3) message = "Location request timed out";
      
      setLocation(prev => ({ ...prev, loading: false, error: message }));
    }
  }, []);

  const resetLocation = useCallback(() => {
    setLocation(initialState);
  }, []);

  return { location, getLocation, resetLocation };
};
