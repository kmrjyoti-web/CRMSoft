"use client";

import { useState } from "react";

import { Button, Icon } from "@/components/ui";

import { useAuthStore } from "@/stores/auth.store";

import { FormConfigDrawer } from "./FormConfigDrawer";

const ALLOWED_ROLES = ["ADMIN", "DEVELOPER", "SUPER_ADMIN"];

interface FormConfigButtonProps {
  formKey: string;
}

export function FormConfigButton({ formKey }: FormConfigButtonProps) {
  const roles = useAuthStore((s) => s.roles);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const canConfigure = roles.some((r) => ALLOWED_ROLES.includes(r));
  if (!canConfigure) return null;

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setDrawerOpen(true)}
        title="Configure form fields"
      >
        <Icon name="settings" size={16} />
      </Button>
      <FormConfigDrawer
        formKey={formKey}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  );
}
