"use client";

import { useMemo } from "react";
import { TableFull, Badge } from "@/components/ui";
import { useEntityPanel } from "@/hooks/useEntityPanel";
import { usePriceGroups } from "../hooks/usePriceGroups";
import { PriceGroupForm } from "./PriceGroupForm";
import type { CustomerPriceGroup } from "../types/price-groups.types";

const PRICE_GROUP_COLUMNS = [
  { id: "name", label: "Name", visible: true },
  { id: "code", label: "Code", visible: true },
  { id: "discountPercent", label: "Discount %", visible: true },
  { id: "memberCount", label: "Members", visible: true },
  { id: "priceListName", label: "Price List", visible: true },
  { id: "status", label: "Status", visible: true },
];

function flattenGroups(groups: CustomerPriceGroup[]): Record<string, unknown>[] {
  return groups.map((g) => ({
    id: g.id,
    name: <span style={{ fontWeight: 600 }}>{g.name}</span>,
    code: <Badge variant="outline">{g.code}</Badge>,
    discountPercent: g.discountPercent != null ? `${g.discountPercent}%` : "—",
    memberCount: g.memberCount,
    priceListName: g.priceListName ?? "—",
    status: <Badge variant={g.isActive ? "success" : "secondary"}>{g.isActive ? "Active" : "Inactive"}</Badge>,
  }));
}

export function PriceGroupList() {
  const { data, isLoading } = usePriceGroups({});
  const groups: CustomerPriceGroup[] = useMemo(() => {
    const raw = data?.data ?? data ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [data]);

  const rows = useMemo(() => (isLoading ? [] : flattenGroups(groups)), [groups, isLoading]);

  const { handleRowEdit, handleCreate } = useEntityPanel({
    entityKey: "priceGroup",
    entityLabel: "Price Group",
    FormComponent: PriceGroupForm,
    idProp: "priceGroupId",
    editRoute: "/pricing/price-lists/:id",
    createRoute: "/pricing/price-lists/new",
  });

  return (
    <TableFull
      data={rows}
      title="Customer Price Groups"
      tableKey="pricing-price-groups"
      columns={PRICE_GROUP_COLUMNS}
      defaultViewMode="table"
      defaultDensity="compact"
      onRowEdit={handleRowEdit}
      onCreate={handleCreate}
    />
  );
}
