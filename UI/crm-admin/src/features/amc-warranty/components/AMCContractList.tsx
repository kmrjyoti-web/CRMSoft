"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { TableFull, Badge, Button } from "@/components/ui";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import { useTableFilters } from "@/hooks/useTableFilters";
import {
  useAMCContracts,
  useActivateAMCContract,
  useRenewAMCContract,
} from "../hooks/useAmcWarranty";
import { AMC_CONTRACT_FILTER_CONFIG } from "../utils/amc-warranty-filters";
import type { AMCContract, ContractStatus } from "../types/amc-warranty.types";

const COLUMNS = [
  { id: "contractNumber", label: "Contract No", visible: true },
  { id: "customerName", label: "Customer", visible: true },
  { id: "planName", label: "Plan", visible: true },
  { id: "contractStatus", label: "Status", visible: true },
  { id: "startDate", label: "Start Date", visible: true },
  { id: "endDate", label: "End Date", visible: true },
  { id: "totalAmount", label: "Total", visible: true },
  { id: "balance", label: "Balance", visible: true },
  { id: "visitUsage", label: "Visits", visible: true },
];

const STATUS_VARIANT: Record<ContractStatus, string> = {
  DRAFT: "default",
  ACTIVE: "success",
  EXPIRED: "danger",
  CANCELLED: "secondary",
  RENEWED: "primary",
};

function flattenContracts(
  items: AMCContract[],
  onActivate: (id: string) => void,
  onRenew: (id: string) => void,
  onView: (id: string) => void,
): Record<string, unknown>[] {
  return items.map((c) => ({
    id: c.id,
    contractNumber: c.contractNumber,
    customerName: c.customerName ?? "—",
    planName: c.plan?.name ?? "—",
    contractStatus: (
      <Badge variant={(STATUS_VARIANT[c.status] as any) ?? "default"}>
        {c.status}
      </Badge>
    ),
    startDate: new Date(c.startDate).toLocaleDateString("en-IN"),
    endDate: new Date(c.endDate).toLocaleDateString("en-IN"),
    totalAmount: `₹${Number(c.totalAmount).toLocaleString("en-IN")}`,
    balance: `₹${Number(c.balanceAmount).toLocaleString("en-IN")}`,
    visitUsage: `${c.freeVisitsUsed}/${c.freeVisitsTotal} visits`,
    actions: (
      <div className="flex gap-1">
        {c.status === "DRAFT" && (
          <Button
            size="sm"
            variant="primary"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              onActivate(c.id);
            }}
          >
            Activate
          </Button>
        )}
        {c.status === "ACTIVE" && (
          <Button
            size="sm"
            variant="outline"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              onRenew(c.id);
            }}
          >
            Renew
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            onView(c.id);
          }}
        >
          View
        </Button>
      </div>
    ),
  }));
}

export function AMCContractList() {
  const router = useRouter();
  const activateContract = useActivateAMCContract();
  const renewContract = useRenewAMCContract();

  const handleActivate = async (id: string) => {
    try {
      await activateContract.mutateAsync(id);
      toast.success("Contract activated successfully");
    } catch {
      toast.error("Failed to activate contract");
    }
  };

  const handleRenew = async (id: string) => {
    try {
      await renewContract.mutateAsync({ id });
      toast.success("Contract renewed successfully");
    } catch {
      toast.error("Failed to renew contract");
    }
  };

  const handleView = (id: string) => {
    router.push(`/post-sales/amc/contracts/${id}`);
  };

  const { activeFilters, filterParams, handleFilterChange, clearFilters } =
    useTableFilters(AMC_CONTRACT_FILTER_CONFIG);

  const params = useMemo(
    () => ({ page: 1, limit: 50, ...filterParams }),
    [filterParams],
  );

  const { data, isLoading } = useAMCContracts(params);

  const responseData = data?.data;
  const items: AMCContract[] = useMemo(() => {
    if (Array.isArray(responseData)) return responseData;
    const nested = responseData as unknown as { data?: AMCContract[] };
    return nested?.data ?? [];
  }, [responseData]);

  const tableData = useMemo(
    () =>
      flattenContracts(items, handleActivate, handleRenew, handleView),
    [items],
  );

  if (isLoading) return <TableSkeleton title="AMC Contracts" />;

  return (
    <div className="h-full flex flex-col">
      <TableFull
        data={tableData as Record<string, any>[]}
        title="AMC Contracts"
        columns={COLUMNS}
        defaultViewMode="table"
        defaultDensity="compact"
        filterConfig={AMC_CONTRACT_FILTER_CONFIG}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        onFilterClear={clearFilters}
        onRowEdit={(row) => router.push(`/post-sales/amc/contracts/${row.id}`)}
        onCreate={() => {}}
      />
    </div>
  );
}
