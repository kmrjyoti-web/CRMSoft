"use client";

import { useState } from "react";

import { Icon, Button } from "@/components/ui";

import { ExportConfigModal } from "./ExportConfigModal";

// ── Props ───────────────────────────────────────────────

interface ExportButtonProps {
  entityType: string;
  variant?: "primary" | "outline" | "ghost";
  label?: string;
}

// ── Component ───────────────────────────────────────────

export function ExportButton({
  entityType,
  variant = "outline",
  label = "Export",
}: ExportButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <Button variant={variant} size="sm" onClick={() => setModalOpen(true)}>
        <Icon name="download" size={14} />
        {label}
      </Button>

      <ExportConfigModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        entityType={entityType}
      />
    </>
  );
}
