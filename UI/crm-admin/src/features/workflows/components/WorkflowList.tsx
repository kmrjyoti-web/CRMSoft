"use client";

import { useState, useMemo, useCallback } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import toast from "react-hot-toast";

import { Button, Icon, Badge } from "@/components/ui";

import { EmptyState } from "@/components/common/EmptyState";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import { PageHeader } from "@/components/common/PageHeader";

import { useWorkflowsList, useCloneWorkflow } from "../hooks/useWorkflows";

import type {
  WorkflowListParams,
  WorkflowEntityType,
  WorkflowListItem,
} from "../types/workflows.types";

// ── Constants ────────────────────────────────────────────

const ENTITY_TYPES: Array<{ label: string; value: WorkflowEntityType | "ALL" }> = [
  { label: "All", value: "ALL" },
  { label: "Lead", value: "LEAD" },
  { label: "Quotation", value: "QUOTATION" },
  { label: "Invoice", value: "INVOICE" },
  { label: "Installation", value: "INSTALLATION" },
  { label: "Ticket", value: "TICKET" },
];

// ── Component ────────────────────────────────────────────

export function WorkflowList() {
  const router = useRouter();
  const cloneMutation = useCloneWorkflow();

  const [params, setParams] = useState<WorkflowListParams>({
    page: 1,
    limit: 20,
  });

  const [selectedEntity, setSelectedEntity] = useState<string>("ALL");

  const { data, isLoading } = useWorkflowsList(params);

  const workflows = useMemo(() => data?.data ?? [], [data]);
  const meta = data?.meta;
  const totalCount = meta?.total ?? 0;

  const handleSearch = useCallback((value: string) => {
    setParams((prev) => ({ ...prev, search: value || undefined, page: 1 }));
  }, []);

  const handleEntityFilter = useCallback((value: string) => {
    setSelectedEntity(value);
    setParams((prev) => ({
      ...prev,
      entityType: value === "ALL" ? undefined : (value as WorkflowEntityType),
      page: 1,
    }));
  }, []);

  const handleClone = useCallback(
    async (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      try {
        await cloneMutation.mutateAsync(id);
        toast.success("Workflow cloned");
      } catch {
        toast.error("Failed to clone workflow");
      }
    },
    [cloneMutation],
  );

  if (isLoading) return <TableSkeleton title="Workflows" />;

  return (
    <div className="p-6">
      <PageHeader
        title="Workflows"
        subtitle={`${totalCount} workflow${totalCount !== 1 ? "s" : ""}`}
        actions={
          <Link href="/workflows/new">
            <Button variant="primary">
              <Icon name="plus" size={16} /> Add Workflow
            </Button>
          </Link>
        }
      />

      {/* Entity type filter + search bar */}
      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search workflows..."
            className="w-full rounded-lg border border-gray-200 px-4 py-2 pl-10 text-sm focus:border-blue-400 focus:outline-none"
            onChange={(e) => handleSearch(e.target.value)}
          />
          <Icon
            name="search"
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
        </div>

        <div className="flex gap-2">
          {ENTITY_TYPES.map((et) => (
            <Button
              key={et.value}
              size="sm"
              variant={selectedEntity === et.value ? "primary" : "outline"}
              onClick={() => handleEntityFilter(et.value)}
            >
              {et.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      {workflows.length === 0 ? (
        <EmptyState
          icon="git-branch"
          title="No workflows found"
          description="Get started by adding your first workflow."
          action={{
            label: "Add Workflow",
            onClick: () => router.push("/workflows/new"),
          }}
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs font-medium uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Entity Type</th>
                  <th className="px-4 py-3">States</th>
                  <th className="px-4 py-3">Transitions</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Default</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {workflows.map((item: WorkflowListItem) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/workflows/${item.id}`)}
                  >
                    <td className="px-4 py-3 font-medium">{item.name}</td>
                    <td className="px-4 py-3 text-gray-600">{item.code}</td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary">{item.entityType}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline">
                        {item._count?.states ?? 0}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline">
                        {item._count?.transitions ?? 0}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {item.isActive ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="default">Draft</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {item.isDefault && (
                        <Badge variant="primary">Default</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div
                        className="flex items-center justify-end gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link href={`/workflows/${item.id}`}>
                          <Button size="sm" variant="outline">
                            <Icon name="eye" size={14} /> View
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => handleClone(e, item.id)}
                        >
                          <Icon name="copy" size={14} /> Clone
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
              <span>
                Page {meta.page} of {meta.totalPages} ({meta.total} total)
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!meta.hasPrevious}
                  onClick={() =>
                    setParams((p) => ({ ...p, page: (p.page ?? 1) - 1 }))
                  }
                >
                  <Icon name="chevron-left" size={14} /> Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!meta.hasNext}
                  onClick={() =>
                    setParams((p) => ({ ...p, page: (p.page ?? 1) + 1 }))
                  }
                >
                  Next <Icon name="chevron-right" size={14} />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
