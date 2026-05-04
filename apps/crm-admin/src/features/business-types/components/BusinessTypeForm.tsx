"use client";

import { useState, useMemo } from "react";

import toast from "react-hot-toast";

import { Button, Card, Input, SelectInput, Icon } from "@/components/ui";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

import {
  useBusinessProfile,
  useBusinessTypes,
  useAssignBusinessType,
  useUpdateTradeProfile,
} from "../hooks/useBusinessTypes";
import type { BusinessType, BusinessProfile } from "../types/business-types.types";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface BusinessTypeFormProps {
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BusinessTypeForm({ onClose }: BusinessTypeFormProps) {
  const { data: profileData, isLoading: profileLoading } = useBusinessProfile();
  const { data: typesData } = useBusinessTypes(true);
  const assignMut = useAssignBusinessType();
  const updateTradeMut = useUpdateTradeProfile();

  const profile = useMemo<BusinessProfile | null>(() => {
    const raw = profileData?.data ?? profileData ?? null;
    return raw as BusinessProfile | null;
  }, [profileData]);

  const typeOptions = useMemo(() => {
    const raw = typesData?.data ?? typesData ?? [];
    const list = Array.isArray(raw) ? raw : [];
    return list.map((t: BusinessType) => ({ label: t.name, value: t.code }));
  }, [typesData]);

  const [selectedTypeCode, setSelectedTypeCode] = useState(profile?.businessTypeCode ?? "");
  const [tradeType, setTradeType] = useState(profile?.tradeType ?? "");
  const [dealsWith, setDealsWith] = useState(profile?.dealsWith ?? "");
  const [industry, setIndustry] = useState(profile?.industry ?? "");

  // Sync form with profile when loaded
  useMemo(() => {
    if (profile) {
      setSelectedTypeCode(profile.businessTypeCode);
      setTradeType(profile.tradeType ?? "");
      setDealsWith(profile.dealsWith ?? "");
      setIndustry(profile.industry ?? "");
    }
  }, [profile]);

  function handleAssign() {
    if (!selectedTypeCode) {
      toast.error("Please select a business type");
      return;
    }
    assignMut.mutate(
      { businessTypeCode: selectedTypeCode },
      {
        onSuccess: () => toast.success("Business type assigned"),
        onError: () => toast.error("Failed to assign business type"),
      }
    );
  }

  function handleSaveTradeProfile() {
    updateTradeMut.mutate(
      {
        tradeType: tradeType || undefined,
        dealsWith: dealsWith || undefined,
        industry: industry || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Trade profile updated");
          onClose();
        },
        onError: () => toast.error("Failed to update trade profile"),
      }
    );
  }

  if (profileLoading) {
    return (
      <div style={{ padding: "24px", display: "flex", justifyContent: "center" }}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", maxWidth: "600px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 600 }}>Business Type Configuration</h2>
        <Button variant="ghost" onClick={onClose}>
          <Icon name="x" size={16} />
        </Button>
      </div>

      {/* Current Profile */}
      {profile && (
        <Card>
          <div style={{ padding: "16px" }}>
            <h4 style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: 600, color: "#6b7280" }}>
              Current Profile
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "14px" }}>
              <div>
                <span style={{ color: "#9ca3af" }}>Type:</span>{" "}
                <strong>{profile.businessTypeName}</strong>
              </div>
              <div>
                <span style={{ color: "#9ca3af" }}>Trade:</span>{" "}
                {profile.tradeType || "\u2014"}
              </div>
              <div>
                <span style={{ color: "#9ca3af" }}>Deals With:</span>{" "}
                {profile.dealsWith || "\u2014"}
              </div>
              <div>
                <span style={{ color: "#9ca3af" }}>Industry:</span>{" "}
                {profile.industry || "\u2014"}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Assign Business Type */}
      <div style={{ marginTop: "20px" }}>
        <Card>
          <div style={{ padding: "16px" }}>
            <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: 600 }}>
              Assign Business Type
            </h4>
            <div style={{ display: "flex", gap: "12px", alignItems: "flex-end" }}>
              <div style={{ flex: 1 }}>
                <SelectInput
                  label="Business Type"
                  leftIcon={<Icon name="briefcase" size={16} />}
                  value={selectedTypeCode}
                  onChange={(v) => setSelectedTypeCode(String(v ?? ""))}
                  options={typeOptions}
                />
              </div>
              <Button variant="primary" onClick={handleAssign} disabled={assignMut.isPending}>
                {assignMut.isPending ? <LoadingSpinner /> : "Assign"}
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Trade Profile */}
      <div style={{ marginTop: "20px" }}>
        <Card>
          <div style={{ padding: "16px" }}>
            <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: 600 }}>
              Trade Profile
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <Input
                label="Trade Type"
                leftIcon={<Icon name="repeat" size={16} />}
                value={tradeType}
                onChange={(v: string) => setTradeType(v)}
              />
              <Input
                label="Deals With"
                leftIcon={<Icon name="handshake" size={16} />}
                value={dealsWith}
                onChange={(v: string) => setDealsWith(v)}
              />
              <Input
                label="Industry"
                leftIcon={<Icon name="factory" size={16} />}
                value={industry}
                onChange={(v: string) => setIndustry(v)}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
              <Button
                variant="primary"
                onClick={handleSaveTradeProfile}
                disabled={updateTradeMut.isPending}
              >
                {updateTradeMut.isPending ? <LoadingSpinner /> : "Save Trade Profile"}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
