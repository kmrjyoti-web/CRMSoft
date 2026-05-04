"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Icon, Button, SelectInput, Input } from "@/components/ui";
import { useMappingSuggestions, useImportProfiles, useApplyMapping, useSaveProfile } from "../hooks/useBulkImport";
import type {
  ImportJob,
  FieldMappingRule,
  DuplicateStrategy,
  ImportTargetEntity,
} from "../types/bulk-import.types";

// ── Target field options per entity ──────────────────────

const CONTACT_FIELDS = [
  { label: "-- Skip --", value: "" },
  { label: "First Name", value: "firstName" },
  { label: "Last Name", value: "lastName" },
  { label: "Full Name", value: "fullName" },
  { label: "Email", value: "email" },
  { label: "Phone", value: "phone" },
  { label: "Mobile", value: "mobile" },
  { label: "Designation", value: "designation" },
  { label: "Department", value: "department" },
  { label: "Company Name", value: "companyName" },
  { label: "City", value: "city" },
  { label: "State", value: "state" },
  { label: "Pincode", value: "pincode" },
  { label: "Address", value: "address" },
  { label: "Source", value: "source" },
  { label: "Notes", value: "notes" },
  { label: "Website", value: "website" },
  { label: "GST Number", value: "gstNumber" },
];

const ORG_FIELDS = [
  { label: "-- Skip --", value: "" },
  { label: "Name", value: "name" },
  { label: "Email", value: "email" },
  { label: "Phone", value: "phone" },
  { label: "Website", value: "website" },
  { label: "Industry", value: "industry" },
  { label: "City", value: "city" },
  { label: "State", value: "state" },
  { label: "Country", value: "country" },
  { label: "Pincode", value: "pincode" },
  { label: "Address", value: "address" },
  { label: "GST Number", value: "gstNumber" },
  { label: "Notes", value: "notes" },
];

const LEAD_FIELDS = [
  { label: "-- Skip --", value: "" },
  { label: "Title", value: "title" },
  { label: "Contact Name", value: "contactName" },
  { label: "Email", value: "email" },
  { label: "Phone", value: "phone" },
  { label: "Company", value: "company" },
  { label: "Value", value: "value" },
  { label: "Source", value: "source" },
  { label: "Notes", value: "notes" },
];

const PRODUCT_FIELDS = [
  { label: "-- Skip --", value: "" },
  { label: "Name", value: "name" },
  { label: "SKU", value: "sku" },
  { label: "Category", value: "category" },
  { label: "Price", value: "price" },
  { label: "Description", value: "description" },
  { label: "Unit", value: "unit" },
  { label: "HSN Code", value: "hsnCode" },
  { label: "GST Rate", value: "gstRate" },
];

const FIELD_MAP: Record<string, typeof CONTACT_FIELDS> = {
  CONTACT: CONTACT_FIELDS,
  ORGANIZATION: ORG_FIELDS,
  LEAD: LEAD_FIELDS,
  PRODUCT: PRODUCT_FIELDS,
};

const DUPLICATE_OPTIONS = [
  { label: "Skip duplicates", value: "SKIP" },
  { label: "Update existing", value: "UPDATE" },
  { label: "Create anyway", value: "CREATE_ANYWAY" },
  { label: "Ask per row", value: "ASK_PER_ROW" },
];

interface ImportStepMappingProps {
  job: ImportJob;
  onMapped: () => void;
}

export function ImportStepMapping({ job, onMapped }: ImportStepMappingProps) {
  const fieldOptions = FIELD_MAP[job.targetEntity] || CONTACT_FIELDS;
  const { data: suggestionsRes } = useMappingSuggestions(job.targetEntity as ImportTargetEntity, job.fileHeaders);
  const { data: profilesRes } = useImportProfiles(job.targetEntity);
  const applyMut = useApplyMapping();
  const saveProfMut = useSaveProfile();

  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [dupStrategy, setDupStrategy] = useState<DuplicateStrategy>("SKIP");
  const [dupFields, setDupFields] = useState<string[]>(["email"]);
  const [profileName, setProfileName] = useState("");
  const [showSaveProfile, setShowSaveProfile] = useState(false);

  // Auto-populate from smart suggestions
  useEffect(() => {
    const raw = suggestionsRes?.data;
    // Handle both response shapes: { suggestions: [...] } or direct array
    const suggestions = Array.isArray(raw)
      ? raw
      : Array.isArray((raw as any)?.suggestions)
        ? (raw as any).suggestions
        : [];
    if (suggestions.length === 0) return;
    const auto: Record<string, string> = {};
    for (const s of suggestions) {
      if (s.sourceColumn && s.suggestedField && s.confidence >= 0.5) {
        auto[s.sourceColumn] = s.suggestedField;
      }
    }
    if (Object.keys(auto).length === 0) return;
    setMapping((prev) => {
      const merged = { ...auto };
      // User's manual picks take priority
      for (const [k, v] of Object.entries(prev)) {
        if (v) merged[k] = v;
      }
      return merged;
    });
  }, [suggestionsRes]);

  const profiles = Array.isArray(profilesRes?.data) ? profilesRes.data : [];

  const handleApplyProfile = (profileId: string) => {
    const profile = profiles.find((p) => p.id === profileId);
    if (!profile) return;
    const m: Record<string, string> = {};
    for (const rule of profile.fieldMapping) {
      m[rule.sourceColumn] = rule.targetField;
    }
    setMapping(m);
    setDupStrategy(profile.duplicateStrategy);
    setDupFields(profile.duplicateCheckFields);
    toast.success(`Profile "${profile.name}" applied`);
  };

  const handleSubmit = () => {
    const fieldMapping: FieldMappingRule[] = Object.entries(mapping)
      .filter(([, target]) => target)
      .map(([source, target]) => ({
        sourceColumn: source,
        targetField: target,
      }));

    if (fieldMapping.length === 0) {
      toast.error("Map at least one field");
      return;
    }

    applyMut.mutate(
      {
        jobId: job.id,
        dto: {
          fieldMapping,
          duplicateCheckFields: dupFields,
          duplicateStrategy: dupStrategy,
        },
      },
      {
        onSuccess: () => {
          toast.success("Mapping applied");
          onMapped();
        },
        onError: () => toast.error("Failed to apply mapping"),
      },
    );
  };

  const handleSaveProfile = () => {
    if (!profileName.trim()) return;
    saveProfMut.mutate(
      { jobId: job.id, dto: { name: profileName } },
      {
        onSuccess: () => {
          toast.success("Profile saved");
          setShowSaveProfile(false);
          setProfileName("");
        },
      },
    );
  };

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      {/* Profile Selector */}
      {profiles.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SelectInput
            label="Load Saved Profile"
            options={[
              { label: "-- Manual Mapping --", value: "" },
              ...profiles.map((p) => ({ label: p.name, value: p.id })),
            ]}
            value=""
            onChange={(v) => { if (v) handleApplyProfile(String(v)); }}
            leftIcon={<Icon name="file-clock" size={16} />}
          />
        </div>
      )}

      {/* Sample Data Preview */}
      {job.sampleData && job.sampleData.length > 0 && (
        <div
          style={{
            marginBottom: 20,
            padding: 12,
            background: "#f9fafb",
            borderRadius: 8,
            overflowX: "auto",
          }}
        >
          <p style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 8 }}>
            Sample Data (first row)
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {job.fileHeaders.map((h) => (
              <div
                key={h}
                style={{
                  padding: "4px 8px",
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 6,
                  fontSize: 11,
                }}
              >
                <strong>{h}:</strong>{" "}
                <span style={{ color: "#6b7280" }}>
                  {String(job.sampleData?.[0]?.[h] ?? "—")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Column Mapping */}
      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 10,
          overflow: "hidden",
          marginBottom: 24,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 40px 1fr",
            gap: 0,
            padding: "10px 16px",
            background: "#f9fafb",
            borderBottom: "1px solid #e5e7eb",
            fontSize: 12,
            fontWeight: 600,
            color: "#6b7280",
          }}
        >
          <span>File Column</span>
          <span />
          <span>CRM Field</span>
        </div>

        {job.fileHeaders.map((header) => (
          <div
            key={header}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 40px 1fr",
              gap: 0,
              padding: "10px 16px",
              borderBottom: "1px solid #f0f0f0",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 500 }}>{header}</span>
            <span style={{ textAlign: "center", color: "#9ca3af" }}>
              <Icon name="arrow-right" size={14} />
            </span>
            <SelectInput
              options={fieldOptions}
              value={mapping[header] ?? ""}
              onChange={(v) =>
                setMapping((prev) => ({ ...prev, [header]: String(v ?? "") }))
              }
            />
          </div>
        ))}
      </div>

      {/* Duplicate Strategy */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <SelectInput
          label="Duplicate Strategy"
          options={DUPLICATE_OPTIONS}
          value={dupStrategy}
          onChange={(v) => setDupStrategy(String(v ?? "SKIP") as DuplicateStrategy)}
          leftIcon={<Icon name="copy" size={16} />}
        />
        <Input
          label="Duplicate Check Fields"
          value={dupFields.join(", ")}
          onChange={(v) =>
            setDupFields(String(v).split(",").map((s) => s.trim()).filter(Boolean))
          }
          leftIcon={<Icon name="search" size={16} />}
        />
      </div>

      {/* Actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Button variant="outline" onClick={() => setShowSaveProfile(true)}>
          <Icon name="save" size={16} />
          Save as Profile
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          loading={applyMut.isPending}
        >
          Apply Mapping & Validate
        </Button>
      </div>

      {/* Save Profile Inline */}
      {showSaveProfile && (
        <div
          style={{
            marginTop: 16,
            padding: 16,
            background: "#f9fafb",
            borderRadius: 8,
            display: "flex",
            gap: 12,
            alignItems: "flex-end",
          }}
        >
          <div style={{ flex: 1 }}>
            <Input
              label="Profile Name"
              value={profileName}
              onChange={(v) => setProfileName(String(v))}
              leftIcon={<Icon name="tag" size={16} />}
            />
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSaveProfile}
            loading={saveProfMut.isPending}
            disabled={!profileName.trim()}
          >
            Save
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowSaveProfile(false)}>
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}
