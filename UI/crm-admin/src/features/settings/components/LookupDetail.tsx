"use client";

import { useMemo, useCallback, useState } from "react";

import { useRouter } from "next/navigation";

import toast from "react-hot-toast";

import { Button, Icon, Badge, TableFull } from "@/components/ui";

import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { PageHeader } from "@/components/common/PageHeader";

import { useLookupDetail, useDeactivateLookup } from "../hooks/useLookups";

import type { LookupValueItem } from "../types/lookup.types";

// ── Value table columns ─────────────────────────────────

const VALUE_COLUMNS = [
  { id: "rowIndex", label: "#", visible: true },
  { id: "value", label: "Value Code", visible: true },
  { id: "label", label: "Label", visible: true },
  { id: "icon", label: "Icon", visible: true },
  { id: "color", label: "Color", visible: true },
  { id: "isDefault", label: "Default", visible: true },
  { id: "status", label: "Status", visible: true },
];

// ── Helpers ─────────────────────────────────────────────

function flattenValues(values: LookupValueItem[]): Record<string, unknown>[] {
  return values.map((v) => ({
    id: v.id,
    rowIndex: v.rowIndex,
    value: v.value,
    label: v.label,
    icon: v.icon ?? "—",
    color: v.color ?? "—",
    isDefault: v.isDefault ? "Yes" : "No",
    status: v.isActive ? "Active" : "Inactive",
  }));
}

// ── Props ───────────────────────────────────────────────

interface LookupDetailProps {
  lookupId: string;
}

// ── Component ───────────────────────────────────────────

export function LookupDetail({ lookupId }: LookupDetailProps) {
  const router = useRouter();
  const { data, isLoading, error } = useLookupDetail(lookupId);
  const deactivateMutation = useDeactivateLookup();
  const [deactivating, setDeactivating] = useState(false);

  const lookup = useMemo(() => {
    const d = data?.data;
    if (!d) return null;
    if (typeof d === "object" && "data" in d) {
      return (d as unknown as { data: typeof d }).data;
    }
    return d;
  }, [data]);

  const tableData = useMemo(
    () => flattenValues(lookup?.values ?? []),
    [lookup],
  );

  const handleDeactivate = useCallback(async () => {
    if (!lookup || lookup.isSystem) return;
    setDeactivating(true);
    try {
      await deactivateMutation.mutateAsync(lookupId);
      toast.success("Lookup deactivated");
      router.push("/settings/lookups");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to deactivate lookup";
      toast.error(message);
    } finally {
      setDeactivating(false);
    }
  }, [lookup, lookupId, deactivateMutation, router]);

  if (isLoading) return <LoadingSpinner fullPage />;

  if (error || !lookup) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-medium mb-1">Failed to load lookup</p>
          <p className="text-sm text-gray-500">
            {error ? (error as Error).message : "Lookup not found"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <PageHeader
        title={lookup.displayName}
        actions={
          <div className="flex gap-2">
            {!lookup.isSystem && lookup.isActive && (
              <Button
                variant="danger"
                onClick={handleDeactivate}
                loading={deactivating}
                disabled={deactivating}
              >
                <Icon name="trash-2" size={16} /> Deactivate
              </Button>
            )}
            <Button variant="outline" onClick={() => router.push("/settings/lookups")}>
              <Icon name="arrow-left" size={16} /> Back
            </Button>
          </div>
        }
      />

      {/* Lookup Info */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
        <div>
          <span className="text-gray-500">Category Code</span>
          <p className="font-medium">{lookup.category}</p>
        </div>
        <div>
          <span className="text-gray-500">Display Name</span>
          <p className="font-medium">{lookup.displayName}</p>
        </div>
        <div>
          <span className="text-gray-500">System</span>
          <p>
            <Badge variant={lookup.isSystem ? "warning" : "secondary"}>
              {lookup.isSystem ? "System" : "Custom"}
            </Badge>
          </p>
        </div>
        <div>
          <span className="text-gray-500">Status</span>
          <p>
            <Badge variant={lookup.isActive ? "success" : "danger"}>
              {lookup.isActive ? "Active" : "Inactive"}
            </Badge>
          </p>
        </div>
        {lookup.description && (
          <div className="col-span-2 sm:col-span-4">
            <span className="text-gray-500">Description</span>
            <p className="font-medium">{lookup.description}</p>
          </div>
        )}
      </div>

      {/* Values Table */}
      <div className="mt-6 h-[500px] flex flex-col">
        <TableFull
          data={tableData as Record<string, any>[]}
          title={`Values (${lookup.values?.length ?? 0})`}
          columns={VALUE_COLUMNS}
          defaultViewMode="table"
          defaultDensity="compact"
        />
      </div>
    </div>
  );
}
