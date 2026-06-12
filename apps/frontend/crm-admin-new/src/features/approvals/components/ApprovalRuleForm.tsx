"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { Modal, Button, Icon, Input, SelectInput, NumberInput } from "@/components/ui";

import {
  useCreateApprovalRule,
  useUpdateApprovalRule,
} from "../hooks/useApprovals";

import type { ApprovalRule } from "../types/approval.types";

// ── Constants ───────────────────────────────────────────

const ENTITY_TYPE_OPTIONS = [
  { label: "Raw Contact", value: "RAW_CONTACT" },
  { label: "Contact", value: "CONTACT" },
  { label: "Organization", value: "ORGANIZATION" },
  { label: "Lead", value: "LEAD" },
  { label: "Quotation", value: "QUOTATION" },
  { label: "Ticket", value: "TICKET" },
  { label: "Product", value: "PRODUCT" },
];

const ACTION_OPTIONS = [
  { label: "Create", value: "CREATE" },
  { label: "Update", value: "UPDATE" },
  { label: "Delete", value: "DELETE" },
  { label: "Status Change", value: "STATUS_CHANGE" },
];

// ── Props ───────────────────────────────────────────────

interface ApprovalRuleFormProps {
  rule?: ApprovalRule;
  open: boolean;
  onClose: () => void;
}

// ── Component ───────────────────────────────────────────

export function ApprovalRuleForm({ rule, open, onClose }: ApprovalRuleFormProps) {
  const isEdit = !!rule;
  const createMutation = useCreateApprovalRule();
  const updateMutation = useUpdateApprovalRule();

  // ── Form State ──
  const [entityType, setEntityType] = useState("");
  const [action, setAction] = useState("");
  const [checkerRole, setCheckerRole] = useState("");
  const [minCheckers, setMinCheckers] = useState<number | null>(1);
  const [skipForRoles, setSkipForRoles] = useState("");
  const [amountField, setAmountField] = useState("");
  const [amountThreshold, setAmountThreshold] = useState<number | null>(null);
  const [expiryHours, setExpiryHours] = useState<number | null>(48);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Populate on Edit ──
  useEffect(() => {
    if (rule) {
      setEntityType(rule.entityType);
      setAction(rule.action);
      setCheckerRole(rule.checkerRole);
      setMinCheckers(rule.minCheckers);
      setSkipForRoles(rule.skipForRoles?.join(", ") ?? "");
      setAmountField(rule.amountField ?? "");
      setAmountThreshold(rule.amountThreshold ?? null);
      setExpiryHours(rule.expiryHours);
    } else {
      resetForm();
    }
  }, [rule, open]);

  const resetForm = () => {
    setEntityType("");
    setAction("");
    setCheckerRole("");
    setMinCheckers(1);
    setSkipForRoles("");
    setAmountField("");
    setAmountThreshold(null);
    setExpiryHours(48);
    setErrors({});
  };

  // ── Validation ──
  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!entityType) errs.entityType = "Entity type is required";
    if (!action.trim()) errs.action = "Action is required";
    if (!checkerRole.trim()) errs.checkerRole = "Checker role is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Submit ──
  const handleSubmit = async () => {
    if (!validate()) return;

    const dto = {
      entityType,
      action: action.trim(),
      checkerRole: checkerRole.trim(),
      minCheckers: minCheckers ?? 1,
      skipForRoles: skipForRoles
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      amountField: amountField.trim() || undefined,
      amountThreshold: amountThreshold ?? undefined,
      expiryHours: expiryHours ?? 48,
    };

    try {
      if (isEdit && rule) {
        await updateMutation.mutateAsync({ id: rule.id, dto });
        toast.success("Approval rule updated");
      } else {
        await createMutation.mutateAsync(dto);
        toast.success("Approval rule created");
      }
      resetForm();
      onClose();
    } catch {
      toast.error(`Failed to ${isEdit ? "update" : "create"} rule`);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Approval Rule" : "New Approval Rule"}
      size="lg"
      footer={
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            <Icon name="save" size={16} /> {isEdit ? "Update" : "Create"}
          </Button>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Row 1: Entity Type + Action */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <SelectInput
              label="Entity Type"
              options={ENTITY_TYPE_OPTIONS}
              value={entityType}
              onChange={(v) => setEntityType(String(v ?? ""))}
              leftIcon={<Icon name="database" size={16} />}
              required
              error={!!errors.entityType}
              errorMessage={errors.entityType}
            />
          </div>
          <div>
            <SelectInput
              label="Action"
              options={ACTION_OPTIONS}
              value={action}
              onChange={(v) => setAction(String(v ?? ""))}
              leftIcon={<Icon name="zap" size={16} />}
              required
              error={!!errors.action}
              errorMessage={errors.action}
            />
          </div>
        </div>

        {/* Row 2: Checker Role + Min Checkers */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <Input
              label="Checker Role"
              value={checkerRole}
              onChange={setCheckerRole}
              leftIcon={<Icon name="shield" size={16} />}
              required
              placeholder="e.g. ADMIN, MANAGER"
              error={!!errors.checkerRole}
              errorMessage={errors.checkerRole}
            />
          </div>
          <div>
            <NumberInput
              label="Min Checkers"
              value={minCheckers}
              onChange={setMinCheckers}
              min={1}
              max={10}
            />
          </div>
        </div>

        {/* Row 3: Skip For Roles */}
        <div>
          <Input
            label="Skip For Roles"
            value={skipForRoles}
            onChange={setSkipForRoles}
            leftIcon={<Icon name="user-x" size={16} />}
            placeholder="Comma-separated role names (e.g. SUPER_ADMIN, CEO)"
          />
          <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>
            Users with these roles will bypass this approval requirement
          </p>
        </div>

        {/* Row 4: Amount Field + Amount Threshold */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <Input
              label="Amount Field"
              value={amountField}
              onChange={setAmountField}
              leftIcon={<Icon name="hash" size={16} />}
              placeholder="e.g. totalAmount"
            />
            <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>
              Optional: field name for amount-based rules
            </p>
          </div>
          <div>
            <NumberInput
              label="Amount Threshold"
              value={amountThreshold}
              onChange={setAmountThreshold}
              min={0}
            />
            <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>
              Minimum amount to trigger approval
            </p>
          </div>
        </div>

        {/* Row 5: Expiry Hours */}
        <div style={{ maxWidth: 240 }}>
          <NumberInput
            label="Expiry Hours"
            value={expiryHours}
            onChange={setExpiryHours}
            min={1}
            max={720}
          />
          <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>
            How many hours before the approval request expires
          </p>
        </div>
      </div>
    </Modal>
  );
}
