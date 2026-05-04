"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button, Badge, Icon, Modal, Input, SelectInput, Card, Toolbar, TextareaInput } from "@/components/ui";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import {
  useCompanyLocationTree,
  useLocationSummary,
  usePackageCountries,
  usePackageStates,
  usePackageCities,
  useAddCompanyCountry,
  useAddCompanyStates,
  useAddCompanyCities,
  useAddCompanyPincodes,
  useAddCompanyPincodeRange,
  useRemoveCompanyCountry,
  useRemoveCompanyState,
  useRemoveCompanyCity,
  useRemoveCompanyPincode,
  useUpdateCompanyCity,
  useUpdateCompanyState,
} from "../hooks/useBusinessLocations";
import type {
  CompanyCountry,
  CompanyState,
  CompanyCity,
  CompanyPincode,
  StateItemDto,
  CityItemDto,
  PincodeItemDto,
} from "../types/business-locations.types";

// ─── Country Flag Emoji ──────────────────────────────────────────────────────
function countryFlag(code: string): string {
  return code
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join("");
}

// ─── GST Badge ───────────────────────────────────────────────────────────────
function GstBadge({ code }: { code?: string | null }) {
  if (!code) return null;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "3px",
      background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe",
      borderRadius: "4px", padding: "1px 6px", fontSize: "11px", fontWeight: 600,
    }}>
      GST:{code}
    </span>
  );
}

// ─── Coverage Badge ───────────────────────────────────────────────────────────
function CoverageBadge({ type }: { type: string }) {
  const isAll = type === "ALL_CITIES" || type === "ALL_PINCODES";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "3px",
      background: isAll ? "#f0fdf4" : "#fef3c7", color: isAll ? "#16a34a" : "#92400e",
      border: `1px solid ${isAll ? "#bbf7d0" : "#fde68a"}`,
      borderRadius: "4px", padding: "1px 6px", fontSize: "11px",
    }}>
      {isAll ? "✓ All" : "Specific"}
    </span>
  );
}

// ─── HQ Badge ────────────────────────────────────────────────────────────────
function HqBadge() {
  return (
    <span style={{
      background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a",
      borderRadius: "4px", padding: "1px 6px", fontSize: "11px", fontWeight: 600,
    }}>
      ⭐ HQ
    </span>
  );
}

// ─── Row wrapper ─────────────────────────────────────────────────────────────
function Row({
  children, depth = 0, onClick,
}: { children: React.ReactNode; depth?: number; onClick?: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      style={{
        display: "flex", alignItems: "center", gap: "8px",
        padding: "8px 16px", paddingLeft: `${16 + depth * 24}px`,
        borderBottom: "1px solid #f3f4f6",
        background: hover ? "#f9fafb" : "transparent",
        transition: "background 0.1s", cursor: onClick ? "pointer" : "default",
        flexWrap: "wrap",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// ─── Delete button ───────────────────────────────────────────────────────────
function DelBtn({ onDelete, label }: { onDelete: () => void; label: string }) {
  return (
    <button
      title={`Remove ${label}`}
      onClick={(e) => { e.stopPropagation(); onDelete(); }}
      style={{
        background: "none", border: "none", cursor: "pointer",
        color: "#ef4444", padding: "2px 4px", borderRadius: "4px",
        display: "inline-flex", alignItems: "center",
      }}
    >
      <Icon name="trash-2" size={13} />
    </button>
  );
}

// ─── Add Country Modal ────────────────────────────────────────────────────────
function AddCountryModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: countriesData } = usePackageCountries();
  const addCountry = useAddCompanyCountry();
  const [selected, setSelected] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);

  const countries = useMemo(
    () => (countriesData?.data ?? []).map((c) => ({ label: `${countryFlag(c.code)} ${c.name} (${c.code})`, value: c.code })),
    [countriesData],
  );

  function handleSave() {
    if (!selected) return;
    addCountry.mutate({ countryCode: selected, isPrimary }, {
      onSuccess: () => { onClose(); setSelected(""); setIsPrimary(false); },
    });
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Operating Country">
      <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "8px 0" }}>
        <SelectInput
          label="Country"
          leftIcon={<Icon name="globe" size={16} />}
          options={countries}
          value={selected}
          onChange={(v) => setSelected(String(v ?? ""))}
        />
        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
          <input type="checkbox" checked={isPrimary} onChange={(e) => setIsPrimary(e.target.checked)} />
          <span style={{ fontSize: "14px" }}>Primary country (company HQ country)</span>
        </label>
        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} disabled={!selected || addCountry.isPending}>
            {addCountry.isPending ? "Adding..." : "Add Country"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Add States Modal ─────────────────────────────────────────────────────────
function AddStatesModal({
  open, onClose, country,
}: { open: boolean; onClose: () => void; country: CompanyCountry | null }) {
  const { data: statesData } = usePackageStates(country?.countryCode ?? "");
  const addStates = useAddCompanyStates();
  const [selections, setSelections] = useState<Record<string, StateItemDto>>({});
  const [search, setSearch] = useState("");

  const states = useMemo(
    () => (statesData?.data ?? []).filter((s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase()),
    ),
    [statesData, search],
  );

  const existingCodes = useMemo(
    () => new Set((country?.states ?? []).map((s) => s.stateCode)),
    [country],
  );

  function toggle(code: string, name: string, gst?: string) {
    setSelections((prev) => {
      const next = { ...prev };
      if (next[code]) {
        delete next[code];
      } else {
        next[code] = { stateCode: code, coverageType: "SPECIFIC", isHeadquarter: false };
      }
      return next;
    });
  }

  function handleSave() {
    if (!country || Object.keys(selections).length === 0) return;
    addStates.mutate(
      { countryId: country.id, dto: { states: Object.values(selections) } },
      { onSuccess: () => { onClose(); setSelections({}); } },
    );
  }

  return (
    <Modal open={open} onClose={onClose} title={`Add States to ${country?.countryName ?? ""}`} size="lg">
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <Input
          label="Search state..."
          leftIcon={<Icon name="search" size={16} />}
          value={search}
          onChange={setSearch}
        />

        <div style={{ maxHeight: "220px", overflowY: "auto", border: "1px solid #e5e7eb", borderRadius: "6px" }}>
          {states.map((s) => (
            <label
              key={s.code}
              style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "8px 12px", cursor: existingCodes.has(s.code) ? "not-allowed" : "pointer",
                borderBottom: "1px solid #f3f4f6",
                background: existingCodes.has(s.code) ? "#f9fafb" : "white",
                opacity: existingCodes.has(s.code) ? 0.5 : 1,
              }}
            >
              <input
                type="checkbox"
                checked={!!selections[s.code] || existingCodes.has(s.code)}
                disabled={existingCodes.has(s.code)}
                onChange={() => toggle(s.code, s.name, s.gstStateCode)}
              />
              <span style={{ flex: 1, fontSize: "14px" }}>{s.name} ({s.code})</span>
              {s.gstStateCode && <GstBadge code={s.gstStateCode} />}
            </label>
          ))}
          {states.length === 0 && (
            <div style={{ padding: "16px", textAlign: "center", color: "#9ca3af" }}>No states found</div>
          )}
        </div>

        {/* Per-state config */}
        {Object.entries(selections).map(([code, item]) => {
          const info = states.find((s) => s.code === code);
          return (
            <div key={code} style={{ background: "#f9fafb", borderRadius: "6px", padding: "10px 12px" }}>
              <div style={{ fontWeight: 500, marginBottom: "8px", fontSize: "14px" }}>
                {info?.name ?? code}
              </div>
              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
                <label style={{ display: "flex", gap: "4px", alignItems: "center", fontSize: "13px" }}>
                  <input
                    type="radio"
                    checked={item.coverageType === "ALL_CITIES"}
                    onChange={() => setSelections((p) => ({ ...p, [code]: { ...p[code], coverageType: "ALL_CITIES" } }))}
                  /> All Cities
                </label>
                <label style={{ display: "flex", gap: "4px", alignItems: "center", fontSize: "13px" }}>
                  <input
                    type="radio"
                    checked={item.coverageType === "SPECIFIC"}
                    onChange={() => setSelections((p) => ({ ...p, [code]: { ...p[code], coverageType: "SPECIFIC" } }))}
                  /> Specific Cities
                </label>
                <label style={{ display: "flex", gap: "4px", alignItems: "center", fontSize: "13px" }}>
                  <input
                    type="checkbox"
                    checked={!!item.isHeadquarter}
                    onChange={(e) => setSelections((p) => ({ ...p, [code]: { ...p[code], isHeadquarter: e.target.checked } }))}
                  /> HQ
                </label>
                <div style={{ width: "180px" }}>
                  <Input
                    label="State GSTIN (optional)"
                    value={item.stateGstin ?? ""}
                    onChange={(v) => setSelections((p) => ({ ...p, [code]: { ...p[code], stateGstin: v } }))}
                  />
                </div>
              </div>
            </div>
          );
        })}

        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={Object.keys(selections).length === 0 || addStates.isPending}
          >
            {addStates.isPending ? "Adding..." : `Add ${Object.keys(selections).length} State(s)`}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Add Cities Modal ─────────────────────────────────────────────────────────
function AddCitiesModal({
  open, onClose, state, countryCode,
}: { open: boolean; onClose: () => void; state: CompanyState | null; countryCode: string }) {
  const { data: citiesData } = usePackageCities(countryCode, state?.stateCode ?? "");
  const addCities = useAddCompanyCities();
  const [selections, setSelections] = useState<Record<string, CityItemDto>>({});
  const [search, setSearch] = useState("");
  const [customCity, setCustomCity] = useState("");

  const cities = useMemo(
    () => (citiesData?.data ?? []).filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase()),
    ),
    [citiesData, search],
  );

  const existingNames = useMemo(
    () => new Set((state?.cities ?? []).map((c) => c.cityName.toLowerCase())),
    [state],
  );

  function toggle(name: string) {
    setSelections((prev) => {
      const next = { ...prev };
      if (next[name]) {
        delete next[name];
      } else {
        next[name] = { cityName: name, coverageType: "ALL_PINCODES" };
      }
      return next;
    });
  }

  function addCustom() {
    const name = customCity.trim();
    if (!name) return;
    setSelections((prev) => ({
      ...prev,
      [name]: { cityName: name, coverageType: "ALL_PINCODES" },
    }));
    setCustomCity("");
  }

  function handleSave() {
    if (!state || Object.keys(selections).length === 0) return;
    addCities.mutate(
      { stateId: state.id, dto: { cities: Object.values(selections) } },
      { onSuccess: () => { onClose(); setSelections({}); } },
    );
  }

  return (
    <Modal open={open} onClose={onClose} title={`Add Cities to ${state?.stateName ?? ""}`} size="lg">
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <Input
          label="Search city..."
          leftIcon={<Icon name="search" size={16} />}
          value={search}
          onChange={setSearch}
        />

        <div style={{ maxHeight: "200px", overflowY: "auto", border: "1px solid #e5e7eb", borderRadius: "6px" }}>
          {cities.map((c) => (
            <label
              key={c.name}
              style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "7px 12px", cursor: existingNames.has(c.name.toLowerCase()) ? "not-allowed" : "pointer",
                borderBottom: "1px solid #f3f4f6",
                background: existingNames.has(c.name.toLowerCase()) ? "#f9fafb" : "white",
                opacity: existingNames.has(c.name.toLowerCase()) ? 0.5 : 1,
              }}
            >
              <input
                type="checkbox"
                checked={!!selections[c.name] || existingNames.has(c.name.toLowerCase())}
                disabled={existingNames.has(c.name.toLowerCase())}
                onChange={() => toggle(c.name)}
              />
              <span style={{ fontSize: "14px" }}>{c.name}</span>
            </label>
          ))}
          {cities.length === 0 && (
            <div style={{ padding: "12px", textAlign: "center", color: "#9ca3af" }}>No cities found</div>
          )}
        </div>

        {/* Custom city */}
        <div style={{ display: "flex", gap: "8px" }}>
          <div style={{ flex: 1 }}>
            <Input
              label="Add city manually..."
              leftIcon={<Icon name="plus" size={16} />}
              value={customCity}
              onChange={setCustomCity}
            />
          </div>
          <Button variant="outline" onClick={addCustom} disabled={!customCity.trim()}>Add</Button>
        </div>

        {/* Per-city config */}
        {Object.entries(selections).map(([name, item]) => (
          <div key={name} style={{ background: "#f9fafb", borderRadius: "6px", padding: "8px 12px", display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontWeight: 500, fontSize: "14px", minWidth: "120px" }}>{name}</span>
            <label style={{ display: "flex", gap: "4px", alignItems: "center", fontSize: "13px" }}>
              <input
                type="radio"
                checked={item.coverageType === "ALL_PINCODES"}
                onChange={() => setSelections((p) => ({ ...p, [name]: { ...p[name], coverageType: "ALL_PINCODES" } }))}
              /> All Pincodes
            </label>
            <label style={{ display: "flex", gap: "4px", alignItems: "center", fontSize: "13px" }}>
              <input
                type="radio"
                checked={item.coverageType === "SPECIFIC"}
                onChange={() => setSelections((p) => ({ ...p, [name]: { ...p[name], coverageType: "SPECIFIC" } }))}
              /> Specific Pincodes
            </label>
          </div>
        ))}

        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={Object.keys(selections).length === 0 || addCities.isPending}
          >
            {addCities.isPending ? "Adding..." : `Add ${Object.keys(selections).length} City(s)`}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Add Pincodes Modal ───────────────────────────────────────────────────────
function AddPincodesModal({
  open, onClose, city,
}: { open: boolean; onClose: () => void; city: CompanyCity | null }) {
  type Method = "individual" | "range" | "bulk";
  const [method, setMethod] = useState<Method>("individual");
  const [rows, setRows] = useState<PincodeItemDto[]>([{ pincode: "", areaName: "" }]);
  const [fromPin, setFromPin] = useState("");
  const [toPin, setToPin] = useState("");
  const [bulkText, setBulkText] = useState("");
  const addPincodes = useAddCompanyPincodes();
  const addRange = useAddCompanyPincodeRange();

  function handleSave() {
    if (!city) return;
    if (method === "individual") {
      const valid = rows.filter((r) => r.pincode.trim().length >= 4);
      if (!valid.length) return;
      addPincodes.mutate(
        { cityId: city.id, dto: { pincodes: valid.map((r) => ({ pincode: r.pincode.trim(), areaName: r.areaName?.trim() || undefined })) } },
        { onSuccess: () => { onClose(); setRows([{ pincode: "", areaName: "" }]); } },
      );
    } else if (method === "range") {
      if (!fromPin || !toPin) return;
      addRange.mutate(
        { cityId: city.id, dto: { fromPincode: fromPin.trim(), toPincode: toPin.trim() } },
        { onSuccess: () => { onClose(); setFromPin(""); setToPin(""); } },
      );
    } else {
      const pincodes = bulkText
        .split(/[\n,]+/)
        .map((p) => p.trim())
        .filter((p) => p.length >= 4)
        .map((p) => ({ pincode: p }));
      if (!pincodes.length) return;
      addPincodes.mutate(
        { cityId: city.id, dto: { pincodes } },
        { onSuccess: () => { onClose(); setBulkText(""); } },
      );
    }
  }

  const isPending = addPincodes.isPending || addRange.isPending;

  return (
    <Modal open={open} onClose={onClose} title={`Add Pincodes to ${city?.cityName ?? ""}`} size="lg">
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {/* Method selector */}
        <div style={{ display: "flex", gap: "12px" }}>
          {(["individual", "range", "bulk"] as Method[]).map((m) => (
            <label key={m} style={{ display: "flex", gap: "5px", alignItems: "center", fontSize: "13px", cursor: "pointer" }}>
              <input type="radio" checked={method === m} onChange={() => setMethod(m)} />
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </label>
          ))}
        </div>

        {/* Individual */}
        {method === "individual" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {rows.map((row, i) => (
              <div key={i} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <div style={{ width: "130px" }}>
                  <Input
                    label="Pincode"
                    value={row.pincode}
                    onChange={(v) => setRows((prev) => prev.map((r, j) => j === i ? { ...r, pincode: v } : r))}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <Input
                    label="Area name (optional)"
                    value={row.areaName ?? ""}
                    onChange={(v) => setRows((prev) => prev.map((r, j) => j === i ? { ...r, areaName: v } : r))}
                  />
                </div>
                {rows.length > 1 && (
                  <button
                    onClick={() => setRows((prev) => prev.filter((_, j) => j !== i))}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444" }}
                  >
                    <Icon name="x" size={14} />
                  </button>
                )}
              </div>
            ))}
            <Button variant="outline" onClick={() => setRows((prev) => [...prev, { pincode: "", areaName: "" }])}>
              <Icon name="plus" size={14} /> Add Row
            </Button>
          </div>
        )}

        {/* Range */}
        {method === "range" && (
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <div style={{ width: "140px" }}>
              <Input label="From Pincode" value={fromPin} onChange={setFromPin} />
            </div>
            <span style={{ color: "#6b7280" }}>to</span>
            <div style={{ width: "140px" }}>
              <Input label="To Pincode" value={toPin} onChange={setToPin} />
            </div>
            {fromPin && toPin && !isNaN(Number(fromPin)) && !isNaN(Number(toPin)) && (
              <span style={{ color: "#6b7280", fontSize: "13px" }}>
                → {Math.max(0, Number(toPin) - Number(fromPin) + 1)} pincodes
              </span>
            )}
          </div>
        )}

        {/* Bulk */}
        {method === "bulk" && (
          <div>
            <TextareaInput
              label="Pincodes (comma or newline separated)"
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder="411001, 411002, 411014&#10;411028"
              rows={4}
              style={{ fontFamily: "monospace" }}
            />
          </div>
        )}

        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} disabled={isPending}>
            {isPending ? "Adding..." : "Add Pincodes"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Pincode Row ─────────────────────────────────────────────────────────────
function PincodeRow({ pin, onDelete }: { pin: CompanyPincode; onDelete: () => void }) {
  return (
    <Row depth={4}>
      <span style={{ color: "#9ca3af", display: "inline-flex" }}><Icon name="map-pin" size={12} /></span>
      <span style={{ fontSize: "13px", fontWeight: 500, color: "#374151" }}>{pin.pincode}</span>
      {pin.areaName && (
        <span style={{ fontSize: "12px", color: "#6b7280" }}>({pin.areaName})</span>
      )}
      <div style={{ marginLeft: "auto" }}>
        <DelBtn onDelete={onDelete} label="pincode" />
      </div>
    </Row>
  );
}

// ─── City Row ─────────────────────────────────────────────────────────────────
function CityRow({
  city, onAddPincodes, onDelete, onToggleCoverage,
}: {
  city: CompanyCity;
  onAddPincodes: () => void;
  onDelete: () => void;
  onToggleCoverage: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasSpecific = city.coverageType === "SPECIFIC";
  const hasPins = city.pincodes.length > 0;
  const removePincode = useRemoveCompanyPincode();

  return (
    <>
      <Row depth={3}>
        <button
          onClick={() => setExpanded((p) => !p)}
          style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", display: "flex", alignItems: "center" }}
        >
          <Icon name={expanded ? "chevron-down" : "chevron-right"} size={14} />
        </button>
        <span style={{ color: "#8b5cf6", display: "inline-flex" }}><Icon name="building-2" size={14} /></span>
        <span style={{ fontSize: "13px", fontWeight: 500 }}>{city.cityName}</span>
        {city.district && <span style={{ fontSize: "12px", color: "#9ca3af" }}>({city.district})</span>}
        <CoverageBadge type={city.coverageType === "ALL_PINCODES" ? "ALL_PINCODES" : "SPECIFIC"} />
        <div style={{ marginLeft: "auto", display: "flex", gap: "4px", alignItems: "center" }}>
          <button
            title={hasSpecific ? "Switch to All Pincodes" : "Switch to Specific Pincodes"}
            onClick={(e) => { e.stopPropagation(); onToggleCoverage(); }}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", padding: "2px 4px" }}
          >
            <Icon name="refresh-cw" size={12} />
          </button>
          {hasSpecific && (
            <Button variant="ghost" onClick={(e: React.MouseEvent) => { e.stopPropagation(); onAddPincodes(); }}>
              <Icon name="plus" size={13} />
              <span style={{ fontSize: "11px" }}>Pincode</span>
            </Button>
          )}
          <DelBtn onDelete={onDelete} label="city" />
        </div>
      </Row>

      {expanded && hasSpecific && (
        <>
          {city.pincodes.map((pin) => (
            <PincodeRow
              key={pin.id}
              pin={pin}
              onDelete={() => removePincode.mutate(pin.id)}
            />
          ))}
          {city.pincodes.length === 0 && (
            <Row depth={4}>
              <span style={{ color: "#9ca3af", fontSize: "12px", fontStyle: "italic" }}>No pincodes added</span>
            </Row>
          )}
        </>
      )}
    </>
  );
}

// ─── State Row ────────────────────────────────────────────────────────────────
function StateRow({
  state, countryCode, onAddCities, onDelete,
}: {
  state: CompanyState;
  countryCode: string;
  onAddCities: () => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [addPincodesCity, setAddPincodesCity] = useState<CompanyCity | null>(null);
  const removeCity = useRemoveCompanyCity();
  const updateCity = useUpdateCompanyCity();

  return (
    <>
      <Row depth={2}>
        <button
          onClick={() => setExpanded((p) => !p)}
          style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", display: "flex", alignItems: "center" }}
        >
          <Icon name={expanded ? "chevron-down" : "chevron-right"} size={14} />
        </button>
        <span style={{ color: "#3b82f6", display: "inline-flex" }}><Icon name="map" size={14} /></span>
        <span style={{ fontSize: "13px", fontWeight: 600 }}>{state.stateName}</span>
        <span style={{ fontSize: "12px", color: "#9ca3af" }}>({state.stateCode})</span>
        <GstBadge code={state.gstStateCode} />
        {state.isHeadquarter && <HqBadge />}
        <CoverageBadge type={state.coverageType} />
        {state.stateGstin && (
          <span style={{ fontSize: "11px", color: "#6b7280" }}>GSTIN: {state.stateGstin}</span>
        )}
        <div style={{ marginLeft: "auto", display: "flex", gap: "4px", alignItems: "center" }}>
          {state.coverageType === "SPECIFIC" && (
            <Button variant="ghost" onClick={(e: React.MouseEvent) => { e.stopPropagation(); onAddCities(); }}>
              <Icon name="plus" size={13} />
              <span style={{ fontSize: "11px" }}>City</span>
            </Button>
          )}
          <DelBtn onDelete={onDelete} label="state" />
        </div>
      </Row>

      {expanded && state.coverageType === "SPECIFIC" && (
        <>
          {state.cities.map((city) => (
            <CityRow
              key={city.id}
              city={city}
              onAddPincodes={() => setAddPincodesCity(city)}
              onDelete={() => removeCity.mutate(city.id)}
              onToggleCoverage={() =>
                updateCity.mutate({
                  id: city.id,
                  data: { coverageType: city.coverageType === "ALL_PINCODES" ? "SPECIFIC" : "ALL_PINCODES" },
                })
              }
            />
          ))}
          {state.cities.length === 0 && (
            <Row depth={3}>
              <span style={{ color: "#9ca3af", fontSize: "12px", fontStyle: "italic" }}>No cities added yet</span>
              <Button variant="ghost" onClick={onAddCities}>
                <Icon name="plus" size={13} /> Add City
              </Button>
            </Row>
          )}
        </>
      )}
      {expanded && state.coverageType === "ALL_CITIES" && (
        <Row depth={3}>
          <span style={{ color: "#22c55e", display: "inline-flex" }}><Icon name="check-circle" size={13} /></span>
          <span style={{ fontSize: "12px", color: "#16a34a" }}>All cities covered</span>
        </Row>
      )}

      <AddPincodesModal
        open={!!addPincodesCity}
        onClose={() => setAddPincodesCity(null)}
        city={addPincodesCity}
      />
    </>
  );
}

// ─── Country Row ──────────────────────────────────────────────────────────────
function CountryRow({ country }: { country: CompanyCountry }) {
  const [expanded, setExpanded] = useState(true);
  const [addStateOpen, setAddStateOpen] = useState(false);
  const [addCitiesState, setAddCitiesState] = useState<CompanyState | null>(null);
  const removeCountry = useRemoveCompanyCountry();
  const removeState = useRemoveCompanyState();

  return (
    <>
      <div style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
        <Row>
          <button
            onClick={() => setExpanded((p) => !p)}
            style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", color: "#374151" }}
          >
            <Icon name={expanded ? "chevron-down" : "chevron-right"} size={16} />
          </button>
          <span style={{ fontSize: "20px" }}>{countryFlag(country.countryCode)}</span>
          <span style={{ fontWeight: 700, fontSize: "15px" }}>{country.countryName}</span>
          {country.isPrimary && (
            <Badge variant="primary">Primary</Badge>
          )}
          <span style={{ fontSize: "12px", color: "#6b7280" }}>
            {[country.currency && `${country.currency}`, country.phonecode && `+${country.phonecode?.replace("+", "")}`]
              .filter(Boolean).join(" · ")}
          </span>
          <div style={{ marginLeft: "auto", display: "flex", gap: "6px", alignItems: "center" }}>
            <Button variant="ghost" onClick={() => setAddStateOpen(true)}>
              <Icon name="plus" size={14} />
              <span style={{ fontSize: "12px" }}>Add State</span>
            </Button>
            <DelBtn onDelete={() => removeCountry.mutate(country.id)} label="country" />
          </div>
        </Row>
      </div>

      {expanded && (
        <>
          {country.states.map((state) => (
            <StateRow
              key={state.id}
              state={state}
              countryCode={country.countryCode}
              onAddCities={() => setAddCitiesState(state)}
              onDelete={() => removeState.mutate(state.id)}
            />
          ))}
          {country.states.length === 0 && (
            <Row depth={1}>
              <span style={{ color: "#9ca3af", fontSize: "13px", fontStyle: "italic" }}>No states added</span>
              <Button variant="ghost" onClick={() => setAddStateOpen(true)}>
                <Icon name="plus" size={13} /> Add State
              </Button>
            </Row>
          )}
        </>
      )}

      <AddStatesModal
        open={addStateOpen}
        onClose={() => setAddStateOpen(false)}
        country={country}
      />
      <AddCitiesModal
        open={!!addCitiesState}
        onClose={() => setAddCitiesState(null)}
        state={addCitiesState}
        countryCode={country.countryCode}
      />
    </>
  );
}

// ─── Summary Bar ─────────────────────────────────────────────────────────────
function SummaryBar({ countries, states, cities, pincodes }: {
  countries: number; states: number; cities: number; pincodes: number;
}) {
  const items = [
    { label: "Countries", value: countries, color: "#3b82f6" },
    { label: "States", value: states, color: "#8b5cf6" },
    { label: "Cities", value: cities, color: "#10b981" },
    { label: "Pincodes", value: pincodes, color: "#f59e0b" },
  ];
  return (
    <div style={{ display: "flex", gap: "16px", padding: "12px 16px", background: "#f8fafc", borderTop: "1px solid #e2e8f0", flexWrap: "wrap" }}>
      {items.map((item) => (
        <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontWeight: 700, fontSize: "16px", color: item.color }}>{item.value}</span>
          <span style={{ fontSize: "12px", color: "#6b7280" }}>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function CompanyLocationsTree() {
  const router = useRouter();
  const { data: treeData, isLoading } = useCompanyLocationTree();
  const { data: summaryData } = useLocationSummary();
  const [addCountryOpen, setAddCountryOpen] = useState(false);

  const tree: CompanyCountry[] = useMemo(() => {
    const raw = treeData?.data ?? treeData ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [treeData]);

  const summary = summaryData?.data ?? { countries: 0, states: 0, cities: 0, pincodes: 0 };

  if (isLoading) {
    return (
      <div style={{ padding: "40px", display: "flex", justifyContent: "center" }}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div>
      <Toolbar
        title="Operating Locations"
        titleIcon="map-pin"
        actions={[
          { id: "back", label: "Back", icon: "arrow-left", variant: "default" },
        ]}
        primaryAction={{ id: "add-country", label: "Add Country", icon: "plus", variant: "primary" }}
        onActionClick={(id) => {
          if (id === "back") router.push("/settings");
          if (id === "add-country") setAddCountryOpen(true);
        }}
        onPrimaryDropdownClick={() => setAddCountryOpen(true)}
      />
      <div style={{ padding: "24px" }}>

      {/* Tree */}
      <Card style={{ overflow: "hidden" }}>
        {tree.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center" }}>
            <span style={{ color: "#d1d5db", display: "inline-flex", marginBottom: "12px" }}><Icon name="map" size={40} /></span>
            <p style={{ color: "#6b7280", marginBottom: "16px" }}>
              No operating locations configured yet.
              <br />
              Add your first country to get started.
            </p>
            <Button variant="primary" onClick={() => setAddCountryOpen(true)}>
              <Icon name="plus" size={16} /> Add Country
            </Button>
          </div>
        ) : (
          <>
            {tree.map((country) => (
              <CountryRow key={country.id} country={country} />
            ))}
            <SummaryBar {...summary} />
          </>
        )}
      </Card>

      <AddCountryModal open={addCountryOpen} onClose={() => setAddCountryOpen(false)} />
      </div>
    </div>
  );
}
