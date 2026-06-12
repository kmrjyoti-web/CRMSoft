"use client";

/**
 * AddressFields — Cascading Country → State → City → Pincode
 *
 * Uses the `country-state-city` package for client-side data (no API needed).
 * Pincode auto-fill for Indian 6-digit pincodes via postalpincode.in.
 *
 * Usage (direct state pattern):
 *   <AddressFields
 *     countryCode={form.countryCode}  // ISO code e.g. "IN"
 *     stateCode={form.stateCode}      // ISO state code e.g. "MH"
 *     city={form.city}
 *     pincode={form.pincode}
 *     onChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
 *   />
 *
 * The `patch` object may contain: countryCode, country, stateCode, state, city, pincode, gstStateCode
 */

import { useState, useEffect, useMemo } from "react";
import { Country, State, City } from "country-state-city";

import { SelectInput, Input, Icon } from "@/components/ui";

// ---------------------------------------------------------------------------
// GST state code helper (inline — avoids extra import)
// ---------------------------------------------------------------------------

const GST_ISO_MAP: Record<string, string> = {
  JK: "01", HP: "02", PB: "03", CH: "04", UT: "05", HR: "06",
  DL: "07", RJ: "08", UP: "09", BR: "10", SK: "11", AR: "12",
  NL: "13", MN: "14", MZ: "15", TR: "16", ML: "17", AS: "18",
  WB: "19", JH: "20", OR: "21", CT: "22", MP: "23", GJ: "24",
  DD: "26", DN: "26", MH: "27", KA: "29", GA: "30", LA: "02",
  KL: "32", TN: "33", PY: "34", AN: "35", TS: "36", AP: "37",
  LD: "31",
};

function gstCode(isoCode: string): string {
  return GST_ISO_MAP[isoCode] ?? "";
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface AddressPatch {
  countryCode?: string;
  country?: string;
  stateCode?: string;
  state?: string;
  city?: string;
  pincode?: string;
  gstStateCode?: string;
}

export interface AddressFieldsProps {
  /** ISO country code (e.g. "IN") */
  countryCode?: string;
  /** ISO state code (e.g. "MH") */
  stateCode?: string;
  city?: string;
  pincode?: string;
  /** Called with partial patch whenever any field changes */
  onChange: (patch: AddressPatch) => void;
  /** Show country selector (default: true) */
  showCountry?: boolean;
  /** Number of columns for the grid (default: 2) */
  columns?: 2 | 3 | 4;
  /** Default country code when none provided (default: "IN") */
  defaultCountry?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AddressFields({
  countryCode: propCountryCode,
  stateCode: propStateCode,
  city: propCity,
  pincode: propPincode,
  onChange,
  showCountry = true,
  columns = 2,
  defaultCountry = "IN",
}: AddressFieldsProps) {
  const [countryCode, setCountryCode] = useState(propCountryCode ?? defaultCountry);
  const [stateCode, setStateCode] = useState(propStateCode ?? "");
  const [city, setCity] = useState(propCity ?? "");
  const [pincode, setPincode] = useState(propPincode ?? "");
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeError, setPincodeError] = useState("");

  // Sync from parent
  useEffect(() => { if (propCountryCode !== undefined) setCountryCode(propCountryCode || defaultCountry); }, [propCountryCode, defaultCountry]);
  useEffect(() => { if (propStateCode !== undefined) setStateCode(propStateCode ?? ""); }, [propStateCode]);
  useEffect(() => { if (propCity !== undefined) setCity(propCity ?? ""); }, [propCity]);
  useEffect(() => { if (propPincode !== undefined) setPincode(propPincode ?? ""); }, [propPincode]);

  // Options
  const countryOptions = useMemo(() =>
    Country.getAllCountries().map((c) => ({
      label: `${c.flag ?? ""} ${c.name}`.trim(),
      value: c.isoCode,
    })),
  []);

  const stateOptions = useMemo(() =>
    State.getStatesOfCountry(countryCode).map((s) => ({
      label: s.name,
      value: s.isoCode,
    })),
  [countryCode]);

  const cityOptions = useMemo(() => {
    const list = City.getCitiesOfState(countryCode, stateCode);
    return list.map((c) => ({ label: c.name, value: c.name }));
  }, [countryCode, stateCode]);

  // Validate pincode per country
  function validatePincode(pin: string, cc: string): string {
    if (!pin) return "";
    if (cc === "IN") {
      return /^\d{6}$/.test(pin) ? "" : "Indian pincode must be exactly 6 digits";
    }
    if (cc === "US") {
      return /^\d{5}(-\d{4})?$/.test(pin) ? "" : "US ZIP code must be 5 digits (or 5+4)";
    }
    if (cc === "GB") {
      return /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i.test(pin) ? "" : "Enter a valid UK postcode";
    }
    if (cc === "CA") {
      return /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i.test(pin) ? "" : "Canadian postal code format: A1B 2C3";
    }
    // Generic: 3–10 alphanumeric chars
    return /^[A-Z0-9\s\-]{3,10}$/i.test(pin) ? "" : "Postal code must be 3–10 characters";
  }

  // Pincode auto-lookup for Indian 6-digit pincodes
  async function handlePincodeBlur() {
    const pin = pincode.trim();
    const err = validatePincode(pin, countryCode);
    setPincodeError(err);
    if (err || !pin) return;
    if (pin === propPincode) return;
    onChange({ pincode: pin });
    if (countryCode === "IN" && /^\d{6}$/.test(pin)) {
      setPincodeLoading(true);
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
        const json = await res.json();
        if (json?.[0]?.Status === "Success") {
          const po = json[0].PostOffice?.[0];
          if (po) {
            const autoState = State.getStatesOfCountry("IN").find(
              (s) => s.name.toLowerCase() === po.State?.toLowerCase()
            );
            const newStateCode = autoState?.isoCode ?? stateCode;
            onChange({
              pincode: pin,
              city: po.District || po.Name,
              state: po.State,
              stateCode: newStateCode,
              gstStateCode: gstCode(newStateCode),
            });
            setStateCode(newStateCode);
            setCity(po.District || po.Name);
          }
        }
      } catch {
        // silently ignore lookup failures
      } finally {
        setPincodeLoading(false);
      }
    }
  }

  function handleCountryChange(val: string | number | boolean | null) {
    const cc = String(val ?? "");
    setCountryCode(cc);
    setStateCode("");
    setCity("");
    setPincodeError("");
    const countryName = Country.getCountryByCode(cc)?.name ?? cc;
    onChange({ countryCode: cc, country: countryName, stateCode: "", state: "", city: "" });
  }

  function handleStateChange(val: string | number | boolean | null) {
    const sc = String(val ?? "");
    setStateCode(sc);
    setCity("");
    const stateName = State.getStateByCodeAndCountry(sc, countryCode)?.name ?? sc;
    onChange({ stateCode: sc, state: stateName, gstStateCode: gstCode(sc), city: "" });
  }

  function handleCityChange(val: string | number | boolean | null) {
    const c = String(val ?? "");
    setCity(c);
    onChange({ city: c });
  }

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: 16,
  };

  return (
    <div style={gridStyle}>
      {showCountry && (
        <SelectInput
          label="Country"
          leftIcon={<Icon name="globe" size={16} />}
          value={countryCode}
          options={countryOptions}
          onChange={handleCountryChange}
        />
      )}

      <SelectInput
        label="State"
        leftIcon={<Icon name="map" size={16} />}
        value={stateCode}
        options={stateOptions}
        onChange={handleStateChange}
        disabled={!countryCode}
      />

      {cityOptions.length > 0 ? (
        <SelectInput
          label="City"
          leftIcon={<Icon name="building-2" size={16} />}
          value={city}
          options={[{ label: "— Select City —", value: "" }, ...cityOptions]}
          onChange={handleCityChange}
          disabled={!stateCode}
        />
      ) : (
        <Input
          label="City"
          leftIcon={<Icon name="building-2" size={16} />}
          value={city}
          onChange={(v) => { setCity(v); onChange({ city: v }); }}
        />
      )}

      <div>
        <Input
          label={`Pincode${pincodeLoading ? " ↻" : ""}`}
          leftIcon={<Icon name="hash" size={16} />}
          value={pincode}
          onChange={(v) => { setPincode(v); if (pincodeError) setPincodeError(""); }}
          onBlur={handlePincodeBlur}
          placeholder={
            countryCode === "IN" ? "6-digit pincode" :
            countryCode === "US" ? "5-digit ZIP" :
            "Postal code"
          }
          error={!!pincodeError}
        />
        {pincodeError ? (
          <div style={{ fontSize: 11, color: "#ef4444", marginTop: 3 }}>
            {pincodeError}
          </div>
        ) : countryCode === "IN" ? (
          <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 3 }}>
            Auto-fills city &amp; state for Indian pincodes
          </div>
        ) : null}
      </div>
    </div>
  );
}
