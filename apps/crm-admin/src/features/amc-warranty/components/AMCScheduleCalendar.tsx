"use client";

import { useMemo, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { TableFull, Badge, Button, Modal } from "@/components/ui";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import { useTableFilters } from "@/hooks/useTableFilters";
import {
  useAMCSchedules,
  useCompleteAMCSchedule,
  useRescheduleAMCSchedule,
} from "../hooks/useAmcWarranty";
import { AMC_SCHEDULE_FILTER_CONFIG } from "../utils/amc-warranty-filters";
import type { AMCSchedule, ScheduleStatus } from "../types/amc-warranty.types";

const COLUMNS = [
  { id: "scheduleDate", label: "Schedule Date", visible: true },
  { id: "scheduleType", label: "Type", visible: true },
  { id: "scheduleStatus", label: "Status", visible: true },
  { id: "contractNumber", label: "Contract No", visible: true },
  { id: "customerName", label: "Customer", visible: true },
  { id: "assignedToName", label: "Technician", visible: true },
];

const STATUS_VARIANT: Record<ScheduleStatus, string> = {
  SCHEDULED: "primary",
  CONFIRMED: "success",
  IN_PROGRESS: "warning",
  COMPLETED: "success",
  MISSED: "danger",
  RESCHEDULED: "secondary",
  CANCELLED: "outline",
};

export function AMCScheduleCalendar() {
  const complete = useCompleteAMCSchedule();
  const reschedule = useRescheduleAMCSchedule();

  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleTargetId, setRescheduleTargetId] = useState("");
  const [newDate, setNewDate] = useState("");

  const handleComplete = useCallback(
    async (id: string) => {
      try {
        await complete.mutateAsync({ id, dto: {} });
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

  const { activeFilters, filterParams, handleFilterChange, clearFilters } =
    useTableFilters(AMC_SCHEDULE_FILTER_CONFIG);

  const params = useMemo(
    () => ({ page: 1, limit: 50, ...filterParams }),
    [filterParams],
  );

  const { data, isLoading } = useAMCSchedules(params);

  const responseData = data?.data;
  const items: AMCSchedule[] = useMemo(() => {
    if (Array.isArray(responseData)) return responseData;
    const nested = responseData as unknown as { data?: AMCSchedule[] };
    return nested?.data ?? [];
  }, [responseData]);

  const tableData = useMemo(
    () =>
      items.map((s) => ({
        id: s.id,
        scheduleDate: new Date(s.scheduleDate).toLocaleDateString("en-IN"),
        scheduleType: s.scheduleType,
        scheduleStatus: (
          <Badge
            variant={(STATUS_VARIANT[s.status] as any) ?? "default"}
          >
            {s.status}
          </Badge>
        ),
        contractNumber: s.contract?.contractNumber ?? "—",
        customerName: s.contract?.customerName ?? "—",
        assignedToName: s.assignedToName ?? "—",
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
      })),
    [items, handleComplete],
  );

  if (isLoading) return <TableSkeleton title="AMC Schedule" />;

  return (
    <div className="h-full flex flex-col">
      <TableFull
        data={tableData as Record<string, unknown>[]}
        title="AMC Schedule"
        columns={COLUMNS}
        defaultViewMode="table"
        defaultDensity="compact"
        filterConfig={AMC_SCHEDULE_FILTER_CONFIG}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        onFilterClear={clearFilters}
      />

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
