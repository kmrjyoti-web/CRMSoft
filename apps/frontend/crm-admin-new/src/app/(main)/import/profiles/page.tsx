"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { SelectInput } from "@/components/ui/SelectInput";
import { PageSkeleton } from "@/components/common";
import { bulkImportService } from "@/features/bulk-import/services/bulk-import.service";
import type { ImportProfile } from "@/features/bulk-import/types/bulk-import.types";

const ENTITY_OPTIONS = [
  { value: "", label: "All Entities" },
  { value: "CONTACT", label: "Contacts" },
  { value: "ORGANIZATION", label: "Organizations" },
  { value: "LEAD", label: "Leads" },
  { value: "PRODUCT", label: "Products" },
];

const STATUS_VARIANT: Record<string, "success" | "secondary" | "danger"> = {
  ACTIVE: "success",
  INACTIVE: "secondary",
  ARCHIVED: "danger",
};

function extractList(res: unknown): ImportProfile[] {
  if (!res) return [];
  const r = res as Record<string, unknown>;
  if (Array.isArray(r.data)) return r.data as ImportProfile[];
  if (r.data && typeof r.data === "object") {
    const inner = r.data as Record<string, unknown>;
    if (Array.isArray(inner.data)) return inner.data as ImportProfile[];
  }
  return [];
}

export default function ImportProfilesPage() {
  const [entityFilter, setEntityFilter] = useState("");

  const { data: res, isLoading } = useQuery({
    queryKey: ["import", "profiles", entityFilter || undefined],
    queryFn: () =>
      bulkImportService.listProfiles({
        targetEntity: entityFilter || undefined,
      }),
  });

  const profiles: ImportProfile[] = extractList(res);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Import Profiles</h1>
          <p className="text-sm text-gray-500">
            Manage saved column mapping profiles for bulk imports
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="w-48">
          <SelectInput
            options={ENTITY_OPTIONS}
            value={entityFilter || null}
            onChange={(v) => setEntityFilter(String(v ?? ""))}
            placeholder="All Entities"
          />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <PageSkeleton />
      ) : profiles.length === 0 ? (
        <Card>
          <div className="p-12 text-center">
            <Icon
              name="file-text"
              size={40}
              className="mx-auto mb-3 text-gray-300"
            />
            <p className="font-medium text-gray-900">No import profiles</p>
            <p className="text-sm text-gray-500 mt-1">
              Profiles are created when you save a column mapping during import
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {profiles.map((profile) => (
            <Card key={profile.id} className="hover:shadow-md transition-shadow">
              <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {profile.name}
                    </h3>
                    {profile.description && (
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                        {profile.description}
                      </p>
                    )}
                  </div>
                  <Badge variant={STATUS_VARIANT[profile.status] ?? "secondary"}>
                    {profile.status}
                  </Badge>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <Badge variant="outline">{profile.targetEntity}</Badge>
                  {profile.sourceSystem && (
                    <Badge variant="secondary">{profile.sourceSystem}</Badge>
                  )}
                  {profile.isDefault && (
                    <Badge variant="primary">Default</Badge>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-gray-500 pt-3 border-t mb-3">
                  <span className="flex items-center gap-1">
                    <Icon name="layers" size={13} className="text-gray-400" />
                    {profile.fieldMapping?.length ?? 0} fields
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon name="repeat" size={13} className="text-gray-400" />
                    {profile.usageCount} uses
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon name="upload" size={13} className="text-gray-400" />
                    {profile.totalImported} imported
                  </span>
                </div>

                {/* Success Rate */}
                {profile.avgSuccessRate != null && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-500">Success Rate</span>
                      <span className="font-medium text-gray-700">
                        {Math.round(profile.avgSuccessRate)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${
                          profile.avgSuccessRate >= 90
                            ? "bg-green-500"
                            : profile.avgSuccessRate >= 70
                              ? "bg-yellow-500"
                              : "bg-red-500"
                        }`}
                        style={{
                          width: `${Math.min(profile.avgSuccessRate, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Meta */}
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>
                    By {profile.createdByName}
                  </span>
                  {profile.lastUsedAt && (
                    <span>
                      Last used{" "}
                      {new Date(profile.lastUsedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {/* Duplicate Strategy */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                  <span className="text-xs text-gray-500">Duplicates:</span>
                  <Badge variant="outline" className="text-xs">
                    {profile.duplicateStrategy.replace(/_/g, " ")}
                  </Badge>
                  {profile.fuzzyMatchEnabled && (
                    <Badge variant="secondary" className="text-xs">
                      Fuzzy
                    </Badge>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
