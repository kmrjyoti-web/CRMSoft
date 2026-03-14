"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { TableFull, Badge } from "@/components/ui";
import { formatDate } from "@/lib/format-date";
import { useTemplatesList } from "../hooks/useCommunication";
import type { TemplateCategory } from "../types/communication.types";

const TEMPLATE_COLUMNS = [
  { id: "name", label: "Name", visible: true },
  { id: "category", label: "Category", visible: true },
  { id: "subject", label: "Subject", visible: true },
  { id: "isShared", label: "Shared", visible: true },
  { id: "createdAt", label: "Created", visible: true },
];

const CATEGORY_BADGE_VARIANT: Record<TemplateCategory, "primary" | "success" | "warning" | "secondary" | "default"> = {
  SALES: "primary",
  MARKETING: "success",
  SUPPORT: "warning",
  NOTIFICATION: "secondary",
  OTHER: "default",
};

function flattenTemplates(templates: any[]): Record<string, any>[] {
  return templates.map((t) => ({
    id: t.id,
    name: <span style={{ fontWeight: 600 }}>{t.name}</span>,
    category: <Badge variant={CATEGORY_BADGE_VARIANT[t.category as TemplateCategory] ?? "default"}>{t.category}</Badge>,
    subject: t.subject,
    isShared: <Badge variant={t.isShared ? "success" : "secondary"}>{t.isShared ? "Yes" : "No"}</Badge>,
    createdAt: formatDate(t.createdAt),
  }));
}

export function TemplateList() {
  const router = useRouter();
  const { data, isLoading } = useTemplatesList({ page: 1, limit: 50 });

  const templates = useMemo(() => data?.data ?? [], [data]);
  const rows = useMemo(() => (isLoading ? [] : flattenTemplates(templates)), [templates, isLoading]);

  return (
    <TableFull
      data={rows}
      title="Email Templates"
      tableKey="communication-templates"
      columns={TEMPLATE_COLUMNS}
      defaultViewMode="table"
      defaultDensity="compact"
      onRowEdit={(row) => router.push(`/communication/templates/${row.id}`)}
      onCreate={() => router.push("/communication/templates/new")}
    />
  );
}
