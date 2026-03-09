"use client";

import { useState, useEffect, useMemo } from "react";

import { SelectInput, Icon } from "@/components/ui";

import { useCountries } from "../hooks/useBusinessLocations";
import type { Country } from "../types/business-locations.types";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface CountryStateCitySelectProps {
  country?: string;
  state?: string;
  city?: string;
  onChange: (geo: { country: string; state: string; city: string }) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CountryStateCitySelect({
  country: propCountry,
  state: propState,
  city: propCity,
  onChange,
}: CountryStateCitySelectProps) {
  const { data: countriesData } = useCountries();

  const [selectedCountry, setSelectedCountry] = useState(propCountry ?? "");
  const [selectedState, setSelectedState] = useState(propState ?? "");
  const [selectedCity, setSelectedCity] = useState(propCity ?? "");

  // State / city data (managed locally for cascading)
  const [states, setStates] = useState<{ code: string; name: string }[]>([]);
  const [cities, setCities] = useState<{ name: string }[]>([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  // Sync props
  useEffect(() => {
    if (propCountry !== undefined) setSelectedCountry(propCountry);
  }, [propCountry]);
  useEffect(() => {
    if (propState !== undefined) setSelectedState(propState);
  }, [propState]);
  useEffect(() => {
    if (propCity !== undefined) setSelectedCity(propCity);
  }, [propCity]);

  // Country options
  const countryOptions = useMemo(() => {
    const raw = countriesData?.data ?? countriesData ?? [];
    const list = Array.isArray(raw) ? raw : [];
    return list.map((c: Country) => ({ label: c.name, value: c.code }));
  }, [countriesData]);

  // State options
  const stateOptions = useMemo(
    () => states.map((s) => ({ label: s.name, value: s.code })),
    [states]
  );

  // City options
  const cityOptions = useMemo(
    () => cities.map((c) => ({ label: c.name, value: c.name })),
    [cities]
  );

  // On country change, reset state/city and simulate loading states
  useEffect(() => {
    if (!selectedCountry) {
      setStates([]);
      setCities([]);
      return;
    }
    setLoadingStates(true);
    // Simulate fetching states for the country
    // In production, this would call a service endpoint
    const timer = setTimeout(() => {
      setStates([]);
      setLoadingStates(false);
    }, 100);
    setSelectedState("");
    setSelectedCity("");
    return () => clearTimeout(timer);
  }, [selectedCountry]);

  // On state change, reset city and simulate loading cities
  useEffect(() => {
    if (!selectedState) {
      setCities([]);
      return;
    }
    setLoadingCities(true);
    const timer = setTimeout(() => {
      setCities([]);
      setLoadingCities(false);
    }, 100);
    setSelectedCity("");
    return () => clearTimeout(timer);
  }, [selectedState]);

  // Notify parent of changes
  function handleCountryChange(value: string | number | boolean | null) {
    const val = String(value ?? "");
    setSelectedCountry(val);
    onChange({ country: val, state: "", city: "" });
  }

  function handleStateChange(value: string | number | boolean | null) {
    const val = String(value ?? "");
    setSelectedState(val);
    onChange({ country: selectedCountry, state: val, city: "" });
  }

  function handleCityChange(value: string | number | boolean | null) {
    const val = String(value ?? "");
    setSelectedCity(val);
    onChange({ country: selectedCountry, state: selectedState, city: val });
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
      {/* Country */}
      <SelectInput
        label="Country"
        leftIcon={<Icon name="globe" size={16} />}
        value={selectedCountry}
        onChange={handleCountryChange}
        options={countryOptions}
      />

      {/* State */}
      <SelectInput
        label="State"
        leftIcon={<Icon name="map" size={16} />}
        value={selectedState}
        onChange={handleStateChange}
        options={stateOptions}
        disabled={!selectedCountry || loadingStates}
      />

      {/* City */}
      <SelectInput
        label="City"
        leftIcon={<Icon name="building" size={16} />}
        value={selectedCity}
        onChange={handleCityChange}
        options={cityOptions}
        disabled={!selectedState || loadingCities}
      />
    </div>
  );
}
