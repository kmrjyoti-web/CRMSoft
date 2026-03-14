"use client";

import { useState, useMemo } from "react";
import toast from "react-hot-toast";

import { TableFull, Input, SelectInput, Icon, Badge } from "@/components/ui";
import { useSidePanelStore } from "@/stores/side-panel.store";

import {
  useGroupTree,
  useGroupFlat,
  useCreateGroup,
} from "../hooks/useAccounts";

// ── Constants ─────────────────────────────────────────────────────────────

const PRIMARY_GROUP_OPTIONS = [
  { value: "CAPITAL",             label: "Capital Account" },
  { value: "CURRENT_ASSETS",      label: "Current Assets" },
  { value: "CURRENT_LIABILITIES", label: "Current Liabilities" },
  { value: "FIXED_ASSETS",        label: "Fixed Assets" },
  { value: "INVESTMENTS",         label: "Investments" },
  { value: "LOANS_LIABILITY",     label: "Loans (Liability)" },
  { value: "REVENUE",             label: "Revenue Account" },
  { value: "EXPENDITURE",         label: "Expenditure Account" },
  { value: "PROFIT_LOSS",         label: "Profit & Loss" },
  { value: "MISC_EXPENSES",       label: "Misc. Expenses (ASSET)" },
  { value: "BRANCH_DIVISIONS",    label: "Branch / Divisions" },
];

const COLUMNS = [
  { id: "name",         label: "Group Name",    visible: true },
  { id: "code",         label: "Code",          visible: true },
  { id: "primaryGroup", label: "Primary Group", visible: true },
  { id: "nature",       label: "Nature",        visible: true },
  { id: "isSystem",     label: "Type",          visible: true },
];

const INITIAL_FORM = {
  name:         "",
  code:         "",
  primaryGroup: "",
  parentId:     "",
  isProhibited: false,
};

// ── Inner Form ─────────────────────────────────────────────────────────────

function AccountGroupForm({
  onSuccess,
  parentOptions,
}: {
  onSuccess: () => void;
  parentOptions: { value: string; label: string }[];
}) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const createGroup = useCreateGroup();
  const set = (f: string, v: any) => setForm((p) => ({ ...p, [f]: v }));

  async function handleSave() {
    if (!form.name || !form.code || !form.primaryGroup) {
      toast.error("Name, Code, and Primary Group are required");
      return;
    }
    setSaving(true);
    try {
      await createGroup.mutateAsync({
        ...form,
        parentId: form.parentId || undefined,
      });
      toast.success("Group created");
      onSuccess();
    } catch {
      toast.error("Failed to create group");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      id="sp-form-account-group"
      onSubmit={(e) => { e.preventDefault(); handleSave(); }}
      style={{ display: "flex", flexDirection: "column", gap: 16 }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Input
          label="Group Name *"
          value={form.name}
          onChange={(v) => set("name", v)}
          leftIcon={<Icon name="folder" size={16} />}
        />
        <Input
          label="Code *"
          value={form.code}
          onChange={(v) => set("code", v)}
          leftIcon={<Icon name="hash" size={16} />}
        />
        <SelectInput
          label="Primary Group *"
          value={form.primaryGroup}
          options={PRIMARY_GROUP_OPTIONS}
          onChange={(v) => set("primaryGroup", String(v ?? ""))}
          leftIcon={<Icon name="layers" size={16} />}
        />
        <SelectInput
          label="Under Group (Parent)"
          value={form.parentId}
          options={[{ value: "", label: "— Root —" }, ...parentOptions]}
          onChange={(v) => set("parentId", String(v ?? ""))}
          leftIcon={<Icon name="git-branch" size={16} />}
        />
      </div>
    </form>
  );
}

// ── AccountGroupList ───────────────────────────────────────────────────────

export function AccountGroupList() {
  const { data: flatData } = useGroupFlat();
  const { openPanel, closePanel } = useSidePanelStore();

  const flat: any[] = useMemo(
    () => (flatData as any)?.data ?? [],
    [flatData],
  );

  const parentOptions = useMemo(
    () => flat.map((g: any) => ({ value: g.id, label: `${g.name} (${g.code})` })),
    [flat],
  );

  const rows = useMemo(() =>
    flat.map((g: any) => ({
      id:           g.id,
      name:         g.name,
      code:         g.code,
      primaryGroup: g.primaryGroup,
      nature: (
        <Badge variant={g.nature === "CREDIT" ? "success" : "primary"}>
          {g.nature ?? "—"}
        </Badge>
      ),
      isSystem: g.isSystem
        ? <Badge variant="secondary">System</Badge>
        : <Badge variant="outline">Custom</Badge>,
    })),
    [flat],
  );

  function openCreatePanel() {
    const panelId = "create-account-group";
    openPanel({
      id:    panelId,
      title: "New Account Group",
      icon:  "folder",
      width: 600,
      content: (
        <AccountGroupForm
          onSuccess={() => closePanel(panelId)}
          parentOptions={parentOptions}
        />
      ),
      footerButtons: [
        {
          id: "cancel", label: "Cancel", showAs: "text" as const, variant: "secondary" as const,
          onClick: () => useSidePanelStore.getState().closePanel(panelId),
        },
        {
          id: "save", label: "Create Group", icon: "check", showAs: "both" as const, variant: "primary" as const,
          onClick: () => {
            const f = document.getElementById("sp-form-account-group") as HTMLFormElement | null;
            f?.requestSubmit();
          },
        },
      ],
    });
  }

  return (
    <TableFull
      data={rows}
      title="Account Groups"
      tableKey="account-groups"
      columns={COLUMNS}
      defaultViewMode="table"
      defaultDensity="compact"
      onCreate={openCreatePanel}
    />
  );
}
