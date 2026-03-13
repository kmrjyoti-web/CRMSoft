"use client";

import { useMemo, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button, Badge, Modal, TableFull } from "@/components/ui";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import {
  useAMCContract,
  useActivateAMCContract,
  useRenewAMCContract,
  useCompleteAMCSchedule,
  useRescheduleAMCSchedule,
} from "../hooks/useAmcWarranty";
import type { AMCSchedule, ScheduleStatus } from "../types/amc-warranty.types";

const STATUS_COLOR_MAP: Record<string, string> = {
  draft: "secondary",
  active: "success",
  expired: "danger",
  cancelled: "outline",
  renewed: "primary",
};

const SCHEDULE_STATUS_VARIANT: Record<ScheduleStatus, string> = {
  SCHEDULED: "primary",
  CONFIRMED: "success",
  IN_PROGRESS: "warning",
  COMPLETED: "success",
  MISSED: "danger",
  RESCHEDULED: "secondary",
  CANCELLED: "outline",
};

const SCHEDULE_COLUMNS = [
  { id: "scheduleDate", label: "Date", visible: true },
  { id: "scheduleType", label: "Type", visible: true },
  { id: "scheduleStatus", label: "Status", visible: true },
  { id: "assignedToName", label: "Technician", visible: true },
  { id: "completedDate", label: "Completed", visible: true },
];

interface Props {
  contractId: string;
}

function UsageBar({ label, used, total }: { label: string; used: number; total: number }) {
  const pct = total > 0 ? Math.min((used / total) * 100, 100) : 0;
  const color = pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-yellow-400" : "bg-green-500";
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>{label}</span>
        <span>
          {used}/{total} used
        </span>
      </div>
      <div className="h-2 rounded-full bg-gray-200">
        <div
          className={`h-2 rounded-full ${color} transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function AMCContractDetail({ contractId }: Props) {
  const router = useRouter();
  const { data, isLoading } = useAMCContract(contractId);
  const activate = useActivateAMCContract();
  const renew = useRenewAMCContract();
  const complete = useCompleteAMCSchedule();
  const reschedule = useRescheduleAMCSchedule();

  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleTargetId, setRescheduleTargetId] = useState("");
  const [newDate, setNewDate] = useState("");

  const contract = data?.data;

  const handleActivate = useCallback(async () => {
    try {
      await activate.mutateAsync(contractId);
      toast.success("Contract activated");
    } catch {
      toast.error("Failed to activate contract");
    }
  }, [contractId, activate]);

  const handleRenew = useCallback(async () => {
    try {
      await renew.mutateAsync({ id: contractId });
      toast.success("Contract renewed");
    } catch {
      toast.error("Failed to renew contract");
    }
  }, [contractId, renew]);

  const handleComplete = useCallback(
    async (scheduleId: string) => {
      try {
        await complete.mutateAsync({ id: scheduleId, dto: {} });
        toast.success("Schedule marked as completed");
      } catch {
        toast.error("Failed to complete schedule");
      }
    },
    [complete],
  );

  const handleReschedule = useCallback(async () => {
    if (!newDate) {
      toast.error("Please select a new date");
      return;
    }
    try {
      await reschedule.mutateAsync({ id: rescheduleTargetId, newDate });
      toast.success("Schedule rescheduled");
      setShowRescheduleModal(false);
      setNewDate("");
    } catch {
      toast.error("Failed to reschedule");
    }
  }, [rescheduleTargetId, newDate, reschedule]);

  const schedulesTableData = useMemo(() => {
    const schedules: AMCSchedule[] = contract?.schedules ?? [];
    return schedules.map((s) => ({
      id: s.id,
      scheduleDate: new Date(s.scheduleDate).toLocaleDateString("en-IN"),
      scheduleType: s.scheduleType,
      scheduleStatus: (
        <Badge
          variant={
            (SCHEDULE_STATUS_VARIANT[s.status] as any) ?? "default"
          }
        >
          {s.status}
        </Badge>
      ),
      assignedToName: s.assignedToName ?? "—",
      completedDate: s.completedDate
        ? new Date(s.completedDate).toLocaleDateString("en-IN")
        : "—",
      actions: (
        <div className="flex gap-1">
          {(s.status === "SCHEDULED" || s.status === "CONFIRMED") && (
            <>
              <Button
                size="sm"
                variant="primary"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  handleComplete(s.id);
                }}
              >
                Complete
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  setRescheduleTargetId(s.id);
                  setShowRescheduleModal(true);
                }}
              >
                Reschedule
              </Button>
            </>
          )}
        </div>
      ),
    }));
  }, [contract, handleComplete]);

  if (isLoading) return <LoadingSpinner fullPage />;

  if (!contract) {
    return (
      <div className="p-6 text-center py-12">
        <p className="text-sm text-gray-500">Contract not found</p>
        <Button
          variant="outline"
          onClick={() => router.push("/post-sales/amc")}
          className="mt-4"
        >
          Back to Contracts
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <PageHeader
        title={`AMC Contract ${contract.contractNumber}`}
        subtitle={contract.customerName ?? ""}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.back()}>
              Back
            </Button>
            {contract.status === "DRAFT" && (
              <Button
                variant="primary"
                onClick={handleActivate}
                loading={activate.isPending}
              >
                Activate
              </Button>
            )}
            {contract.status === "ACTIVE" && (
              <Button
                variant="outline"
                onClick={handleRenew}
                loading={renew.isPending}
              >
                Renew
              </Button>
            )}
          </div>
        }
      />

      <div className="mt-4 flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4">
        <span className="text-sm text-gray-500">Status:</span>
        <StatusBadge status={contract.status} colorMap={STATUS_COLOR_MAP} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Contract Info */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
              Contract Details
            </h3>
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-gray-400">Contract Number</dt>
                <dd className="text-sm font-medium">
                  {contract.contractNumber}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Plan</dt>
                <dd className="text-sm">{contract.plan?.name ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Customer</dt>
                <dd className="text-sm">{contract.customerName ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Billing Cycle</dt>
                <dd className="text-sm">{contract.billingCycle}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Start Date</dt>
                <dd className="text-sm">
                  {new Date(contract.startDate).toLocaleDateString("en-IN")}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">End Date</dt>
                <dd className="text-sm">
                  {new Date(contract.endDate).toLocaleDateString("en-IN")}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Total Amount</dt>
                <dd className="text-sm font-medium">
                  ₹{Number(contract.totalAmount).toLocaleString("en-IN")}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Paid Amount</dt>
                <dd className="text-sm">
                  ₹{Number(contract.paidAmount).toLocaleString("en-IN")}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Balance</dt>
                <dd className="text-sm text-red-600 font-medium">
                  ₹{Number(contract.balanceAmount).toLocaleString("en-IN")}
                </dd>
              </div>
              {contract.nextBillingDate && (
                <div>
                  <dt className="text-xs text-gray-400">Next Billing</dt>
                  <dd className="text-sm">
                    {new Date(contract.nextBillingDate).toLocaleDateString(
                      "en-IN",
                    )}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Usage */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
              Service Usage
            </h3>
            <UsageBar
              label="Visits"
              used={contract.freeVisitsUsed}
              total={contract.freeVisitsTotal}
            />
            <UsageBar
              label="Phone Support Calls"
              used={contract.freeCallsUsed}
              total={contract.freeCallsTotal}
            />
            <UsageBar
              label="Online Support"
              used={contract.freeOnlineUsed}
              total={contract.freeOnlineTotal}
            />
          </div>

          {/* Schedules Table */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
              Schedules (
              {contract._count?.schedules ??
                contract.schedules?.length ??
                0}
              )
            </h3>
            <TableFull
              data={schedulesTableData as Record<string, any>[]}
              title=""
              columns={SCHEDULE_COLUMNS}
              defaultViewMode="table"
              defaultDensity="compact"
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
              Auto Renew
            </h3>
            <Badge variant={contract.autoRenew ? "success" : "outline"}>
              {contract.autoRenew ? "Enabled" : "Disabled"}
            </Badge>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
              Metadata
            </h3>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-xs text-gray-400">Created</dt>
                <dd>
                  {new Date(contract.createdAt).toLocaleDateString("en-IN")}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Updated</dt>
                <dd>
                  {new Date(contract.updatedAt).toLocaleDateString("en-IN")}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Reschedule Modal */}
      <Modal
        open={showRescheduleModal}
        onClose={() => setShowRescheduleModal(false)}
        title="Reschedule Visit"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowRescheduleModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleReschedule}
              loading={reschedule.isPending}
            >
              Reschedule
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            New Date *
          </label>
          <input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2 text-sm"
          />
        </div>
      </Modal>
    </div>
  );
}
