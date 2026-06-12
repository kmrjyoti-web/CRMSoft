"use client";

/**
 * CountryStateCitySelect — thin wrapper around AddressFields (country+state+city only).
 * Kept for backward compatibility with existing usages.
 */

import { AddressFields } from "@/components/common/AddressFields";

interface CountryStateCitySelectProps {
  country?: string;
  countryCode?: string;
  state?: string;
  stateCode?: string;
  city?: string;
  onChange: (geo: { country: string; countryCode: string; state: string; stateCode: string; city: string }) => void;
}

export function CountryStateCitySelect({
  countryCode: propCountryCode,
  stateCode: propStateCode,
  city: propCity,
  onChange,
}: CountryStateCitySelectProps) {
  return (
    <AddressFields
      countryCode={propCountryCode ?? "IN"}
      stateCode={propStateCode ?? ""}
      city={propCity ?? ""}
      columns={3}
      onChange={(patch) => {
        onChange({
          country: patch.country ?? "",
          countryCode: patch.countryCode ?? propCountryCode ?? "IN",
          state: patch.state ?? "",
          stateCode: patch.stateCode ?? propStateCode ?? "",
          city: patch.city ?? propCity ?? "",
        });
      }}
    />
  );
}
