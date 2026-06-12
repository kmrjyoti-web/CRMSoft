"use client";

import { useState, useMemo } from "react";
import toast from "react-hot-toast";

import {
  Card,
  Badge,
  Button,
  Input,
  SelectInput,
  NumberInput,
  Icon,
  TableFull,
} from "@/components/ui";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { EmptyState } from "@/components/common/EmptyState";

import { useChartOfAccounts, useCreateLedger } from "../hooks/useAccounts";
import { formatCurrency } from "@/lib/format-currency";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const GROUP_TYPES = ["ASSET", "LIABILITY", "EQUITY", "INCOME", "EXPENSE"] as const;
type GroupType = (typeof GROUP_TYPES)[number];

const GROUP_TYPE_OPTIONS = GROUP_TYPES.map((g) => ({ label: g, value: g }));

const GROUP_BADGE_VARIANT: Record<GroupType, string> = {
  ASSET: "primary",
  LIABILITY: "danger",
  EQUITY: "secondary",
  INCOME: "success",
  EXPENSE: "warning",
};

const GROUP_ICON: Record<GroupType, string> = {
  ASSET: "landmark",
  LIABILITY: "credit-card",
  EQUITY: "shield",
  INCOME: "trending-up",
  EXPENSE: "trending-down",
};

const LEDGER_COLUMNS = [
  { id: "code", label: "Code", visible: true },
  { id: "name", label: "Name", visible: true },
  { id: "subGroup", label: "Sub Group", visible: true },
  { id: "balance", label: "Balance", visible: true },
  { id: "isSystem", label: "System", visible: true },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------


interface Ledger {
  id: string;
  code: string;
  name: string;
  groupType: GroupType;
  subGroup?: string;
  balance?: number | null;
  isSystem?: boolean;
}

// ---------------------------------------------------------------------------
// Collapsible Group Section
// ---------------------------------------------------------------------------

function GroupSection({
  groupType,
  ledgers,
}: {
  groupType: GroupType;
  ledgers: Ledger[];
}) {
  const [expanded, setExpanded] = useState(true);

  const flatData = useMemo(
    () =>
      ledgers.map((l) => ({
        id: l.id,
        code: l.code,
        name: l.name,
        subGroup: l.subGroup || "\u2014",
        balance: formatCurrency(l.balance),
        isSystem: l.isSystem ? "Yes" : "No",
      })),
    [ledgers],
  );

  return (
    <div style={{ marginBottom: 16 }}>
      <button
        type="button"
        onClick={() => setExpanded((p) => !p)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          width: "100%",
          padding: "10px 14px",
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderRadius: 8,
          cursor: "pointer",
          fontSize: 14,
          fontWeight: 600,
          color: "#1e293b",
        }}
      >
        <Icon name={expanded ? "chevron-down" : "chevron-right"} size={16} />
        <Icon name={GROUP_ICON[groupType] as any} size={16} />
        <span>{groupType}</span>
        <Badge variant={GROUP_BADGE_VARIANT[groupType] as any}>
          {ledgers.length}
        </Badge>
      </button>

      {expanded && (
        <div style={{ marginTop: 8 }}>
          {ledgers.length === 0 ? (
            <EmptyState
              icon="book-open"
              title={`No ${groupType.toLowerCase()} ledgers`}
              description="Create a ledger below to get started."
            />
          ) : (
            <TableFull
              data={flatData}
              title=""
              columns={LEDGER_COLUMNS}
              tableKey={`chart-of-accounts-${groupType.toLowerCase()}`}
              defaultViewMode="table"
              defaultDensity="compact"
            />
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Create Ledger Form
// ---------------------------------------------------------------------------

interface CreateFormState {
  code: string;
  name: string;
  groupType: string;
  subGroup: string;
  openingBalance: number | null;
}

const INITIAL_FORM: CreateFormState = {
  code: "",
  name: "",
  groupType: "",
  subGroup: "",
  openingBalance: null,
};

function CreateLedgerForm() {
  const [form, setForm] = useState<CreateFormState>(INITIAL_FORM);
  const createLedger = useCreateLedger();

  const handleSubmit = () => {
    if (!form.code || !form.name || !form.groupType) {
      toast.error("Code, Name, and Group Type are required");
      return;
    }

    createLedger.mutate(
      {
        code: form.code,
        name: form.name,
        groupType: form.groupType,
        subGroup: form.subGroup || undefined,
        openingBalance: form.openingBalance ?? 0,
      },
      {
        onSuccess: () => {
          toast.success("Ledger created successfully");
          setForm(INITIAL_FORM);
        },
        onError: () => {
          toast.error("Failed to create ledger");
        },
      },
    );
  };

  return (
    <Card>
      <div style={{ padding: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: "#1e293b" }}>
          <Icon name="plus-circle" size={18} /> Create Ledger
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Input
            label="Code"
            value={form.code}
            onChange={(v) => setForm((p) => ({ ...p, code: v }))}
            leftIcon={<Icon name="hash" size={16} />}
          />
          <Input
            label="Name"
            value={form.name}
            onChange={(v) => setForm((p) => ({ ...p, name: v }))}
            leftIcon={<Icon name="file-text" size={16} />}
          />
          <SelectInput
            label="Group Type"
            options={GROUP_TYPE_OPTIONS}
            value={form.groupType}
            onChange={(v) => setForm((p) => ({ ...p, groupType: String(v ?? "") }))}
          />
          <Input
            label="Sub Group"
            value={form.subGroup}
            onChange={(v) => setForm((p) => ({ ...p, subGroup: v }))}
            leftIcon={<Icon name="layers" size={16} />}
          />
          <NumberInput
            label="Opening Balance"
            value={form.openingBalance}
            onChange={(v) => setForm((p) => ({ ...p, openingBalance: v }))}
          />
        </div>

        <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={createLedger.isPending}
          >
            <Icon name="plus" size={16} />
            {createLedger.isPending ? "Creating..." : "Create Ledger"}
          </Button>
        </div>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function ChartOfAccounts() {
  const { data, isLoading } = useChartOfAccounts();

  // Backend returns { ASSET: [...], LIABILITY: [...], ... } grouped by type
  const groupedLedgers = useMemo(() => {
    const raw = (data as any)?.data ?? {};
    const groups: Record<GroupType, Ledger[]> = {
      ASSET: [],
      LIABILITY: [],
      EQUITY: [],
      INCOME: [],
      EXPENSE: [],
    };
    for (const gt of GROUP_TYPES) {
      if (Array.isArray(raw[gt])) {
        groups[gt] = raw[gt];
      }
    }
    return groups;
  }, [data]);

  if (isLoading) return <LoadingSpinner fullPage />;

  return (
    <div>
      <PageHeader
        title="Chart of Accounts"
        subtitle="Manage ledger accounts grouped by type"
      />

      {/* Grouped ledger sections */}
      <div style={{ marginBottom: 24 }}>
        {GROUP_TYPES.map((gt) => (
          <GroupSection key={gt} groupType={gt} ledgers={groupedLedgers[gt]} />
        ))}
      </div>

      {/* Create Ledger form */}
      <CreateLedgerForm />
    </div>
  );
}
