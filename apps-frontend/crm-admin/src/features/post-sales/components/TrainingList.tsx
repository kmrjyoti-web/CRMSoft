"use client";

import { useMemo } from "react";

import { TableFull } from "@/components/ui";

import { useTableFilters } from "@/hooks/useTableFilters";

import { useEntityPanel } from "@/hooks/useEntityPanel";

import { TableSkeleton } from "@/components/common/TableSkeleton";

import { HelpButton } from "@/components/common/HelpButton";

import { useTrainingsList } from "../hooks/usePostSales";

import { TRAINING_FILTER_CONFIG } from "../utils/training-filters";

import { TrainingForm } from "./TrainingForm";
import { TrainingListUserHelp } from "../help/TrainingListUserHelp";
import { PostSalesDevHelp } from "../help/PostSalesDevHelp";

import type {
  TrainingListItem,
  TrainingListParams,
} from "../types/post-sales.types";

// ── Column definitions ──────────────────────────────────

const TRAINING_COLUMNS = [
  { id: "trainingNo", label: "Training No", visible: true },
  { id: "title", label: "Title", visible: true },
  { id: "mode", label: "Mode", visible: true },
  { id: "contact", label: "Contact / Org", visible: true },
  { id: "status", label: "Status", visible: true },
  { id: "scheduledDate", label: "Scheduled Date", visible: true },
  { id: "trainerName", label: "Trainer", visible: true },
];

// ── Helpers ─────────────────────────────────────────────

function flattenTrainings(
  items: TrainingListItem[],
): Record<string, unknown>[] {
  return items.map((item) => ({
    id: item.id,
    trainingNo: item.trainingNo,
    title: item.title || "—",
    mode: item.mode,
    contact: item.contact
      ? `${item.contact.firstName} ${item.contact.lastName}${item.organization ? ` (${item.organization.name})` : ""}`
      : "—",
    status: item.status,
    scheduledDate: item.scheduledDate
      ? new Date(item.scheduledDate).toLocaleDateString("en-IN")
      : "—",
    trainerName: item.trainerName || "—",
  }));
}

// ── Component ───────────────────────────────────────────

export function TrainingList() {
  const { handleRowEdit, handleCreate } = useEntityPanel({
    entityKey: "training",
    entityLabel: "Training",
    FormComponent: TrainingForm,
    idProp: "trainingId",
    editRoute: "/post-sales/trainings/:id/edit",
    createRoute: "/post-sales/trainings/new",
    displayField: "trainingNo",
  });

  const { activeFilters, filterParams, handleFilterChange, clearFilters } =
    useTableFilters(TRAINING_FILTER_CONFIG);

  const params = useMemo<TrainingListParams>(
    () => ({
      page: 1,
      limit: 50,
      sortBy: "createdAt",
      sortOrder: "desc" as const,
      ...filterParams,
    }),
    [filterParams],
  );

  const { data, isLoading } = useTrainingsList(params);

  const responseData = data?.data;
  const items: TrainingListItem[] = useMemo(() => {
    if (Array.isArray(responseData)) return responseData;
    const nested = responseData as unknown as { data?: TrainingListItem[] };
    return nested?.data ?? [];
  }, [responseData]);

  const tableData = useMemo(() => flattenTrainings(items), [items]);

  if (isLoading) return <TableSkeleton title="Trainings" />;

  return (
    <div className="h-full flex flex-col">
      <TableFull
        data={tableData as Record<string, unknown>[]}
        title="Trainings"
        columns={TRAINING_COLUMNS}
        defaultViewMode="table"
        defaultDensity="compact"
        filterConfig={TRAINING_FILTER_CONFIG}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        onFilterClear={clearFilters}
        onRowEdit={handleRowEdit}
        onCreate={handleCreate}
        headerActions={
          <HelpButton
            panelId="trainings-list-help"
            title="Trainings — Help"
            userContent={<TrainingListUserHelp />}
            devContent={<PostSalesDevHelp />}
          />
        }
      />
    </div>
  );
}
