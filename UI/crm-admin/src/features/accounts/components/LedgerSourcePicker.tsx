"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Icon } from "@/components/ui";
import { useSmartSearch, parsePattern } from "@/components/shared/SmartAutoComplete/useSmartSearch";
import type { SearchFilter } from "@/components/shared/SmartAutoComplete/types";

// ── Types ─────────────────────────────────────────────────────────────────

export type SourceEntityType = "contact" | "organization";

export interface SourceEntity {
  type: SourceEntityType;
  id: string;
  name: string;
  contactPerson: string;
  mobile: string;
  email: string;
  gstin: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  panNo: string;
  phoneOffice: string;
  _raw: any;
}

// ── Normalizers ───────────────────────────────────────────────────────────

function normalizeContact(c: any): SourceEntity {
  const name = c.name || `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim() || c.email || "—";
  return {
    type: "contact",
    id: c.id,
    name,
    contactPerson: name,
    mobile: c.phone ?? c.mobile ?? c.mobile1 ?? "",
    email: c.email ?? "",
    gstin: c.gstin ?? "",
    address: c.address ?? c.street ?? "",
    city: c.city ?? "",
    state: c.state ?? "",
    pincode: c.pincode ?? c.postalCode ?? "",
    country: c.country ?? "India",
    panNo: c.panNo ?? "",
    phoneOffice: c.phone ?? c.phoneOffice ?? "",
    _raw: c,
  };
}

function normalizeOrg(o: any): SourceEntity {
  return {
    type: "organization",
    id: o.id,
    name: o.name ?? "—",
    contactPerson: o.contactPerson ?? o.primaryContact ?? "",
    mobile: o.phone ?? o.mobile ?? "",
    email: o.email ?? "",
    gstin: o.gstNumber ?? o.gstin ?? "",
    address: o.address ?? o.street ?? "",
    city: o.city ?? "",
    state: o.state ?? "",
    pincode: o.pincode ?? o.postalCode ?? "",
    country: o.country ?? "India",
    panNo: o.panNo ?? "",
    phoneOffice: o.phone ?? o.phoneOffice ?? "",
    _raw: o,
  };
}

// ── Merged result row ─────────────────────────────────────────────────────

interface MergedResult {
  entity: SourceEntity;
  raw: any;
}

function buildFilters(param: string, value: string): SearchFilter[] {
  if (!value.trim()) return [];
  return [{ parameter: param, value: value.trim(), pattern: parsePattern(value.trim()) }];
}

// ── Props ─────────────────────────────────────────────────────────────────

interface LedgerSourcePickerProps {
  selected: SourceEntity | null;
  onSelect: (entity: SourceEntity | null) => void;
}

// ── Component ─────────────────────────────────────────────────────────────

export function LedgerSourcePicker({ selected, onSelect }: LedgerSourcePickerProps) {
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Shared NM param — both entity types use NM as default
  const filters = buildFilters("NM", inputValue);
  const enabled = isOpen && inputValue.trim().length > 0;

  // Run both searches in parallel
  const { data: contactData, isLoading: loadingContacts } = useSmartSearch(
    "CONTACT",
    [],
    "NM",
    inputValue,
    enabled,
  );
  const { data: orgData, isLoading: loadingOrgs } = useSmartSearch(
    "ORGANIZATION",
    [],
    "NM",
    inputValue,
    enabled,
  );

  const isLoading = loadingContacts || loadingOrgs;

  // Merge and annotate results — only show verified entities
  const merged: MergedResult[] = [
    ...((contactData as any)?.results ?? [])
      .filter((c: any) => c.entityVerificationStatus === "VERIFIED")
      .map((c: any) => ({
        entity: normalizeContact(c),
        raw: c,
      })),
    ...((orgData as any)?.results ?? [])
      .filter((o: any) => o.entityVerificationStatus === "VERIFIED")
      .map((o: any) => ({
        entity: normalizeOrg(o),
        raw: o,
      })),
  ];

  // Reset highlight when results change
  useEffect(() => {
    setHighlightIndex(0);
  }, [merged.length]);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = useCallback(
    (item: MergedResult) => {
      onSelect(item.entity);
      setInputValue("");
      setIsOpen(false);
    },
    [onSelect],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((i) => Math.min(i + 1, merged.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && merged[highlightIndex]) {
      e.preventDefault();
      handleSelect(merged[highlightIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  // ── Selected state: show chip ─────────────────────────────────────────
  if (selected) {
    const isOrg = selected.type === "organization";
    return (
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 14px", borderRadius: 10, marginBottom: 16,
        background: isOrg ? "#eff6ff" : "#f0fdf4",
        border: `1.5px solid ${isOrg ? "#93c5fd" : "#86efac"}`,
      }}>
        <div style={{
          width: 34, height: 34, borderRadius: 8, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: isOrg ? "#dbeafe" : "#dcfce7",
        }}>
          <Icon name={isOrg ? "building-2" : "user"} size={16} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{selected.name}</span>
            <span style={{
              padding: "1px 7px", borderRadius: 10, fontSize: 10, fontWeight: 700,
              background: isOrg ? "#dbeafe" : "#dcfce7",
              color: isOrg ? "#1d4ed8" : "#15803d",
            }}>
              {isOrg ? "Organization" : "Contact"}
            </span>
          </div>
          <div style={{ fontSize: 11, color: "#6b7280", display: "flex", gap: 10, flexWrap: "wrap" }}>
            {selected.mobile && <span>📱 {selected.mobile}</span>}
            {selected.email  && <span>✉ {selected.email}</span>}
            {selected.gstin  && <span>GST: {selected.gstin}</span>}
            {selected.city   && <span>📍 {selected.city}</span>}
          </div>
        </div>
        <button
          type="button"
          onClick={() => onSelect(null)}
          style={{
            padding: "4px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600,
            border: "1px solid #d1d5db", background: "white", cursor: "pointer",
            color: "#374151", flexShrink: 0,
          }}
        >
          Change
        </button>
      </div>
    );
  }

  // ── Search state ──────────────────────────────────────────────────────
  return (
    <div ref={containerRef} style={{ marginBottom: 16, position: "relative" }}>
      {/* Combined search input — no tab switcher needed */}
      <div
        style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "7px 12px", borderRadius: 10,
          border: `1.5px solid ${isOpen ? "#2563eb" : "#d1d5db"}`,
          background: "white", cursor: "text",
          boxShadow: isOpen ? "0 0 0 3px rgba(37,99,235,0.1)" : undefined,
          transition: "border-color 0.15s",
        }}
        onClick={() => { setIsOpen(true); inputRef.current?.focus(); }}
      >
        {/* Both badges — visually show searching both */}
        <span style={{
          display: "flex", gap: 4, flexShrink: 0,
        }}>
          <span style={{
            padding: "2px 6px", borderRadius: 6, fontSize: 10, fontWeight: 700,
            background: "#dcfce7", color: "#15803d",
          }}>Contact</span>
          <span style={{
            padding: "2px 6px", borderRadius: 6, fontSize: 10, fontWeight: 700,
            background: "#dbeafe", color: "#1d4ed8",
          }}>Org</span>
        </span>

        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => { setInputValue(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search by name, mobile, email, GSTIN…"
          style={{
            flex: 1, outline: "none", border: "none",
            background: "transparent", fontSize: 13, color: "#111827",
            minWidth: 120,
          }}
        />

        {isLoading ? (
          <div style={{
            width: 13, height: 13,
            border: "2px solid #e5e7eb",
            borderTopColor: "#2563eb",
            borderRadius: "50%",
            animation: "lsp-spin 0.7s linear infinite",
            flexShrink: 0,
          }} />
        ) : (
          <Icon name="search" size={14} />
        )}
      </div>

      {/* Results dropdown */}
      {isOpen && inputValue.trim() && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
          zIndex: 9999, background: "white", borderRadius: 12,
          border: "1.5px solid #e5e7eb",
          boxShadow: "0 8px 30px rgba(0,0,0,0.14)",
          overflow: "hidden", maxHeight: 340,
        }}>
          {/* Header */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "6px 12px", borderBottom: "1px solid #f3f4f6", background: "#fafafa",
          }}>
            <span style={{ fontSize: 11, color: "#6b7280" }}>
              {isLoading
                ? "Searching contacts & organizations…"
                : merged.length > 0
                  ? `${merged.filter(r => r.entity.type === "contact").length} contacts, ${merged.filter(r => r.entity.type === "organization").length} organizations`
                  : "No results found"}
            </span>
          </div>

          {/* Result rows */}
          <div style={{ overflowY: "auto", maxHeight: 280 }}>
            {merged.length === 0 && !isLoading && (
              <div style={{ padding: "20px", textAlign: "center", color: "#9ca3af", fontSize: 13 }}>
                No contacts or organizations found
              </div>
            )}
            {merged.map((item, idx) => {
              const isOrg = item.entity.type === "organization";
              const isHighlighted = idx === highlightIndex;
              return (
                <div
                  key={`${item.entity.type}-${item.entity.id}`}
                  onMouseDown={(e) => { e.preventDefault(); handleSelect(item); }}
                  onMouseEnter={() => setHighlightIndex(idx)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "8px 12px", cursor: "pointer",
                    background: isHighlighted ? "#eff6ff" : "white",
                    borderBottom: "1px solid #f9fafb",
                    transition: "background 0.1s",
                  }}
                >
                  {/* Type icon */}
                  <div style={{
                    width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: isOrg ? "#dbeafe" : "#dcfce7",
                  }}>
                    <Icon name={isOrg ? "building-2" : "user"} size={14} />
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>
                        {item.entity.name}
                      </span>
                      <span style={{
                        padding: "0 5px", borderRadius: 8, fontSize: 9, fontWeight: 700,
                        background: isOrg ? "#dbeafe" : "#dcfce7",
                        color: isOrg ? "#1d4ed8" : "#15803d",
                      }}>
                        {isOrg ? "ORG" : "CONTACT"}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: "#6b7280", display: "flex", gap: 8, flexWrap: "wrap", marginTop: 1 }}>
                      {item.entity.mobile && <span>{item.entity.mobile}</span>}
                      {item.entity.email  && <span>{item.entity.email}</span>}
                      {item.entity.gstin  && <span>GST: {item.entity.gstin}</span>}
                      {item.entity.city   && <span>{item.entity.city}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <style>{`@keyframes lsp-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
