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

import { useRolesList, useDeleteRole } from "../hooks/useRoles";

import type { RoleListItem, RoleListParams } from "../types/settings.types";

// ── Component ────────────────────────────────────────────

export function RoleList() {
  const router = useRouter();
  const { confirm, ConfirmDialogPortal } = useConfirmDialog();
  const deleteMutation = useDeleteRole();

  const [params, setParams] = useState<RoleListParams>({
    page: 1,
    limit: 20,
  });

  const { data, isLoading } = useRolesList(params);

  const roles = useMemo(() => data?.data ?? [], [data]);
  const meta = data?.meta;
  const totalCount = meta?.total ?? 0;

  const handleDelete = useCallback(
    async (role: RoleListItem) => {
      const ok = await confirm({
        title: "Delete Role",
        message: `Are you sure you want to delete "${role.displayName}"? This cannot be undone.`,
        type: "danger",
        confirmText: "Delete",
      });
      if (!ok) return;
      try {
        await deleteMutation.mutateAsync(role.id);
        toast.success("Role deleted");
      } catch {
        toast.error("Failed to delete role");
      }
    },
    [confirm, deleteMutation],
  );

  const handleSearch = useCallback((value: string) => {
    setParams((prev) => ({ ...prev, search: value || undefined, page: 1 }));
  }, []);

  if (isLoading) return <TableSkeleton title="Roles" />;

  return (
    <div className="p-6">
      <PageHeader
        title="Roles"
        subtitle={`${totalCount} role${totalCount !== 1 ? "s" : ""}`}
        actions={
          <Link href="/settings/roles/new">
            <Button variant="primary">
              <Icon name="plus" size={16} /> Add Role
            </Button>
          </Link>
        }
      />

      {/* Search bar */}
      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search roles..."
            className="w-full rounded-lg border border-gray-200 px-4 py-2 pl-10 text-sm focus:border-blue-400 focus:outline-none"
            onChange={(e) => handleSearch(e.target.value)}
          />
          <Icon
            name="search"
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
        </div>
      </div>

      {/* Role table */}
      {roles.length === 0 ? (
        <EmptyState
          icon="shield"
          title="No roles found"
          description="Get started by adding your first role."
          action={{
            label: "Add Role",
            onClick: () => router.push("/settings/roles/new"),
          }}
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs font-medium uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Display Name</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Level</th>
                  <th className="px-4 py-3">Users</th>
                  <th className="px-4 py-3">System</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {roles.map((role: RoleListItem) => (
                  <tr
                    key={role.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() =>
                      router.push(`/settings/roles/${role.id}/edit`)
                    }
                  >
                    <td className="px-4 py-3 font-medium">{role.name}</td>
                    <td className="px-4 py-3">{role.displayName}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {role.description ?? "—"}
                    </td>
                    <td className="px-4 py-3">{role.level}</td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary">
                        {role._count?.users ?? 0}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {role.isSystem ? (
                        <Badge variant="warning">System</Badge>
                      ) : (
                        <Badge variant="outline">Custom</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div
                        className="flex items-center justify-end gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link href={`/settings/roles/${role.id}/edit`}>
                          <Button size="sm" variant="ghost">
                            <Icon name="edit" size={14} />
                          </Button>
                        </Link>
                        {!role.isSystem && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(role)}
                          >
                            <Icon name="trash-2" size={14} />
                          </Button>
                        )}
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
