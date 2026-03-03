"use client";

import { useState, useMemo, useCallback } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import toast from "react-hot-toast";

import { Button, Icon, Badge } from "@/components/ui";

import { EmptyState } from "@/components/common/EmptyState";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import { PageHeader } from "@/components/common/PageHeader";
import { useConfirmDialog } from "@/components/common/useConfirmDialog";

import { formatDate } from "@/lib/format-date";

import { useTemplatesList, useDeleteTemplate } from "../hooks/useCommunication";

import type {
  EmailTemplateListParams,
  TemplateCategory,
} from "../types/communication.types";

// ── Helpers ──────────────────────────────────────────────

const CATEGORIES: Array<{ label: string; value: TemplateCategory | "ALL" }> = [
  { label: "All", value: "ALL" },
  { label: "Sales", value: "SALES" },
  { label: "Marketing", value: "MARKETING" },
  { label: "Support", value: "SUPPORT" },
  { label: "Notification", value: "NOTIFICATION" },
  { label: "Other", value: "OTHER" },
];

const CATEGORY_BADGE_VARIANT: Record<
  TemplateCategory,
  "primary" | "success" | "warning" | "secondary" | "default"
> = {
  SALES: "primary",
  MARKETING: "success",
  SUPPORT: "warning",
  NOTIFICATION: "secondary",
  OTHER: "default",
};

// ── Component ────────────────────────────────────────────

export function TemplateList() {
  const router = useRouter();
  const { confirm, ConfirmDialogPortal } = useConfirmDialog();
  const deleteMutation = useDeleteTemplate();

  const [params, setParams] = useState<EmailTemplateListParams>({
    page: 1,
    limit: 20,
  });
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const queryParams = useMemo<EmailTemplateListParams>(() => {
    const p: EmailTemplateListParams = {
      page: params.page,
      limit: params.limit,
    };
    if (search) p.search = search;
    if (selectedCategory && selectedCategory !== "ALL") {
      p.category = selectedCategory as TemplateCategory;
    }
    return p;
  }, [params.page, params.limit, search, selectedCategory]);

  const { data, isLoading } = useTemplatesList(queryParams);

  const templates = useMemo(() => data?.data ?? [], [data]);
  const meta = data?.meta;
  const totalCount = meta?.total ?? 0;

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setParams((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
    setParams((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handleDelete = useCallback(
    async (id: string, name: string) => {
      const ok = await confirm({
        title: "Delete Template",
        message: `Are you sure you want to delete "${name}"?`,
        type: "danger",
        confirmText: "Delete",
      });
      if (!ok) return;
      try {
        await deleteMutation.mutateAsync(id);
        toast.success("Template deleted");
      } catch {
        toast.error("Failed to delete template");
      }
    },
    [confirm, deleteMutation],
  );

  if (isLoading) return <TableSkeleton title="Email Templates" />;

  return (
    <div className="p-6">
      <PageHeader
        title="Email Templates"
        subtitle={`${totalCount} template${totalCount !== 1 ? "s" : ""}`}
        actions={
          <Link href="/communication/templates/new">
            <Button variant="primary">
              <Icon name="plus" size={16} /> Add Template
            </Button>
          </Link>
        }
      />

      {/* Category filter buttons */}
      <div className="mb-4 flex items-center gap-3">
        <div className="flex gap-2">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.value}
              size="sm"
              variant={selectedCategory === cat.value ? "primary" : "outline"}
              onClick={() => handleCategoryChange(cat.value)}
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Search bar */}
      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search templates..."
            className="w-full rounded-lg border border-gray-200 px-4 py-2 pl-10 text-sm focus:border-blue-400 focus:outline-none"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <Icon
            name="search"
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
        </div>
      </div>

      {/* Template table */}
      {templates.length === 0 ? (
        <EmptyState
          icon="mail"
          title="No templates found"
          description="Get started by creating your first email template."
          action={{
            label: "Add Template",
            onClick: () => router.push("/communication/templates/new"),
          }}
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs font-medium uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Shared</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {templates.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() =>
                      router.push(`/communication/templates/${item.id}`)
                    }
                  >
                    <td className="px-4 py-3 font-medium">{item.name}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          CATEGORY_BADGE_VARIANT[item.category] ?? "default"
                        }
                      >
                        {item.category}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{item.subject}</td>
                    <td className="px-4 py-3">
                      <Badge variant={item.isShared ? "success" : "secondary"}>
                        {item.isShared ? "Yes" : "No"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatDate(item.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div
                        className="flex items-center justify-end gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link href={`/communication/templates/${item.id}`}>
                          <Button size="sm" variant="outline">
                            <Icon name="eye" size={14} />
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDelete(item.id, item.name)}
                        >
                          <Icon name="trash" size={14} />
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

      <ConfirmDialogPortal />
    </div>
  );
}
