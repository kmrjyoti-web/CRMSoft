"use client";

import { useMemo, useCallback } from "react";
import toast from "react-hot-toast";
import { TableFull, Badge, Button } from "@/components/ui";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import {
  useExpiringWarranties,
  useExtendWarranty,
  useExpiringContracts,
  useRenewAMCContract,
} from "../hooks/useAmcWarranty";
import type { WarrantyRecord, AMCContract } from "../types/amc-warranty.types";

const WARRANTY_COLUMNS = [
  { id: "warrantyNumber", label: "Warranty No", visible: true },
  { id: "customerName", label: "Customer", visible: true },
  { id: "productName", label: "Product", visible: true },
  { id: "endDate", label: "Expiry Date", visible: true },
  { id: "daysRemaining", label: "Days Remaining", visible: true },
];

const CONTRACT_COLUMNS = [
  { id: "contractNumber", label: "Contract No", visible: true },
  { id: "customerName", label: "Customer", visible: true },
  { id: "planName", label: "Plan", visible: true },
  { id: "endDate", label: "Expiry Date", visible: true },
  { id: "daysRemaining", label: "Days Remaining", visible: true },
];

function getDaysRemaining(endDate: string): number {
  const end = new Date(endDate).getTime();
  const now = Date.now();
  return Math.ceil((end - now) / (1000 * 60 * 60 * 24));
}

function DaysRemainingBadge({ days }: { days: number }) {
  if (days < 0)
    return <Badge variant="danger">Expired {Math.abs(days)}d ago</Badge>;
  if (days <= 7)
    return <Badge variant="danger">{days} days</Badge>;
  if (days <= 30)
    return <Badge variant="warning">{days} days</Badge>;
  return <Badge variant="success">{days} days</Badge>;
}

function flattenWarranties(
  items: WarrantyRecord[],
  onExtend: (id: string) => void,
): Record<string, unknown>[] {
  return items.map((w) => {
    const days = getDaysRemaining(w.endDate);
    return {
      id: w.id,
      warrantyNumber: w.warrantyNumber,
      customerName: w.customerName ?? "—",
      productName: w.productName ?? "—",
      endDate: new Date(w.endDate).toLocaleDateString("en-IN"),
      daysRemaining: <DaysRemainingBadge days={days} />,
      actions: (
        <Button
          size="sm"
          variant="outline"
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            onExtend(w.id);
          }}
        >
          Extend
        </Button>
      ),
    };
  });
}

function flattenContracts(
  items: AMCContract[],
  onRenew: (id: string) => void,
): Record<string, unknown>[] {
  return items.map((c) => {
    const days = getDaysRemaining(c.endDate);
    return {
      id: c.id,
      contractNumber: c.contractNumber,
      customerName: c.customerName ?? "—",
      planName: c.plan?.name ?? "—",
      endDate: new Date(c.endDate).toLocaleDateString("en-IN"),
      daysRemaining: <DaysRemainingBadge days={days} />,
      actions: (
        <Button
          size="sm"
          variant="primary"
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            onRenew(c.id);
          }}
        >
          Renew
        </Button>
      ),
    };
  });
}

export function RenewalsPage() {
  const extendWarranty = useExtendWarranty();
  const renewContract = useRenewAMCContract();

  const { data: warrantyData, isLoading: wLoading } =
    useExpiringWarranties(30);
  const { data: contractData, isLoading: cLoading } =
    useExpiringContracts(30);

  const handleExtend = useCallback(
    async (id: string) => {
      try {
        await extendWarranty.mutateAsync({ id, dto: { months: 12 } });
        toast.success("Warranty extended by 12 months");
      } catch {
        toast.error("Failed to extend warranty");
      }
    },
    [extendWarranty],
  );

  const handleRenew = useCallback(
    async (id: string) => {
      try {
        await renewContract.mutateAsync({ id });
        toast.success("Contract renewed successfully");
      } catch {
        toast.error("Failed to renew contract");
      }
    },
    [renewContract],
  );

  const warranties: WarrantyRecord[] = useMemo(() => {
    const d = warrantyData?.data;
    if (Array.isArray(d)) return d;
    const nested = d as unknown as { data?: WarrantyRecord[] };
    return nested?.data ?? [];
  }, [warrantyData]);

  const contracts: AMCContract[] = useMemo(() => {
    const d = contractData?.data;
    if (Array.isArray(d)) return d;
    const nested = d as unknown as { data?: AMCContract[] };
    return nested?.data ?? [];
  }, [contractData]);

  const warrantyTableData = useMemo(
    () => flattenWarranties(warranties, handleExtend),
    [warranties, handleExtend],
  );

  const contractTableData = useMemo(
    () => flattenContracts(contracts, handleRenew),
    [contracts, handleRenew],
  );

  if (wLoading || cLoading) return <LoadingSpinner fullPage />;

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 mb-1">
          Renewals Dashboard
        </h1>
        <p className="text-sm text-gray-500">
          Items expiring within the next 30 days
        </p>
      </div>

      {/* Expiring Warranties */}
      <div>
        <h2 className="text-base font-semibold text-gray-800 mb-3">
          Expiring Warranties ({warranties.length})
        </h2>
        {warranties.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
            <p className="text-sm text-gray-500">
              No warranties expiring in the next 30 days.
            </p>
          </div>
        ) : (
          <TableFull
            data={warrantyTableData as Record<string, unknown>[]}
            title="Expiring Warranties"
            columns={WARRANTY_COLUMNS}
            defaultViewMode="table"
            defaultDensity="compact"
          />
        )}
      </div>

      {/* Expiring AMC Contracts */}
      <div>
        <h2 className="text-base font-semibold text-gray-800 mb-3">
          Expiring AMC Contracts ({contracts.length})
        </h2>
        {contracts.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
            <p className="text-sm text-gray-500">
              No AMC contracts expiring in the next 30 days.
            </p>
          </div>
        ) : (
          <TableFull
            data={contractTableData as Record<string, unknown>[]}
            title="Expiring AMC Contracts"
            columns={CONTRACT_COLUMNS}
            defaultViewMode="table"
            defaultDensity="compact"
          />
        )}
      </div>
    </div>
  );
}
