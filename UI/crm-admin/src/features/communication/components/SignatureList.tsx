"use client";

import { useMemo } from "react";
import { TableFull, Badge } from "@/components/ui";
import { useEntityPanel } from "@/hooks/useEntityPanel";
import { useSignaturesList } from "../hooks/useCommunication";
import { SignatureForm } from "./SignatureForm";
import type { EmailSignatureItem } from "../types/communication.types";

const SIGNATURE_COLUMNS = [
  { id: "name", label: "Name", visible: true },
  { id: "isDefault", label: "Default", visible: true },
  { id: "status", label: "Status", visible: true },
];

function flattenSignatures(signatures: EmailSignatureItem[]): Record<string, unknown>[] {
  return signatures.map((s) => ({
    id: s.id,
    name: <span style={{ fontWeight: 600 }}>{s.name}</span>,
    isDefault: s.isDefault ? <Badge variant="primary">Default</Badge> : "—",
    status: <Badge variant={s.isActive ? "success" : "secondary"}>{s.isActive ? "Active" : "Inactive"}</Badge>,
  }));
}

export function SignatureList() {
  const { data, isLoading } = useSignaturesList();
  const signatures: EmailSignatureItem[] = useMemo(() => {
    const raw = data?.data ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [data]);

  const rows = useMemo(() => (isLoading ? [] : flattenSignatures(signatures)), [signatures, isLoading]);

  const { handleRowEdit, handleCreate } = useEntityPanel({
    entityKey: "signature",
    entityLabel: "Signature",
    FormComponent: SignatureForm,
    idProp: "signatureId",
    editRoute: "/communication/signatures/:id",
    createRoute: "/communication/signatures/new",
  });

  return (
    <TableFull
      data={rows}
      title="Email Signatures"
      tableKey="communication-signatures"
      columns={SIGNATURE_COLUMNS}
      defaultViewMode="table"
      defaultDensity="compact"
      onRowEdit={handleRowEdit}
      onCreate={handleCreate}
    />
  );
}
