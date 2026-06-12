"use client";

import { useState, useEffect } from "react";

import { Modal, Button, Input, SelectInput, DatePicker, NumberInput, Icon } from "@/components/ui";
import { UserSelect } from "@/components/common/UserSelect";

import { useCreateTarget, useUpdateTarget } from "../hooks/usePerformance";
import type { Target, TargetMetric, TargetPeriod } from "../types/performance.types";

// ── Props ───────────────────────────────────────────────

interface TargetFormProps {
  target?: Target;
  open: boolean;
  onClose: () => void;
}

// ── Component ───────────────────────────────────────────

export function TargetForm({ target, open, onClose }: TargetFormProps) {
  const isEdit = !!target;
  const createMutation = useCreateTarget();
  const updateMutation = useUpdateTarget();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [metric, setMetric] = useState<string>("LEADS_CREATED");
  const [period, setPeriod] = useState<string>("MONTHLY");
  const [targetValue, setTargetValue] = useState<number | null>(null);
  const [unit, setUnit] = useState("");
  const [scope, setScope] = useState<string>("INDIVIDUAL");
  const [userId, setUserId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Pre-fill on edit
  useEffect(() => {
    if (target) {
      setName(target.name);
      setDescription(target.description ?? "");
      setMetric(target.metric);
      setPeriod(target.period);
      setTargetValue(target.targetValue);
      setUnit(target.unit);
      setScope(target.scope);
      setUserId(target.userId ?? null);
      setStartDate(target.startDate);
      setEndDate(target.endDate ?? "");
    } else {
      setName("");
      setDescription("");
      setMetric("LEADS_CREATED");
      setPeriod("MONTHLY");
      setTargetValue(null);
      setUnit("");
      setScope("INDIVIDUAL");
      setUserId(null);
      setStartDate("");
      setEndDate("");
    }
  }, [target, open]);

  const handleSubmit = () => {
    if (!name.trim() || targetValue === null || !startDate) return;

    const dto = {
      name: name.trim(),
      description: description.trim() || undefined,
      metric: metric as TargetMetric,
      period: period as TargetPeriod,
      targetValue,
      unit,
      scope: scope as "INDIVIDUAL" | "TEAM" | "COMPANY",
      userId: scope === "INDIVIDUAL" && userId ? userId : undefined,
      startDate,
      endDate: endDate || undefined,
    };

    if (isEdit && target) {
      updateMutation.mutate(
        { id: target.id, dto },
        { onSuccess: () => onClose() },
      );
    } else {
      createMutation.mutate(dto, {
        onSuccess: () => onClose(),
      });
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const metricOptions = [
    { label: "Leads Created", value: "LEADS_CREATED" },
    { label: "Leads Converted", value: "LEADS_CONVERTED" },
    { label: "Revenue", value: "REVENUE" },
    { label: "Calls", value: "CALLS" },
    { label: "Meetings", value: "MEETINGS" },
    { label: "Quotations", value: "QUOTATIONS" },
    { label: "Activities", value: "ACTIVITIES" },
  ];

  const periodOptions = [
    { label: "Daily", value: "DAILY" },
    { label: "Weekly", value: "WEEKLY" },
    { label: "Monthly", value: "MONTHLY" },
    { label: "Quarterly", value: "QUARTERLY" },
    { label: "Yearly", value: "YEARLY" },
  ];

  const scopeOptions = [
    { label: "Individual", value: "INDIVIDUAL" },
    { label: "Team", value: "TEAM" },
    { label: "Company", value: "COMPANY" },
  ];

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit Target" : "New Target"}>
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>
        <Input
          label="Name"
          value={name}
          onChange={(val: string) => setName(val)}
          leftIcon={<Icon name="target" size={16} />}
          required
        />

        <Input
          label="Description"
          value={description}
          onChange={(val: string) => setDescription(val)}
          leftIcon={<Icon name="file-text" size={16} />}
        />

        <SelectInput
          label="Metric"
          options={metricOptions}
          value={metric}
          onChange={(val: string | number | boolean | null) =>
            setMetric(String(val ?? "LEADS_CREATED"))
          }
          leftIcon={<Icon name="bar-chart-2" size={16} />}
        />

        <SelectInput
          label="Period"
          options={periodOptions}
          value={period}
          onChange={(val: string | number | boolean | null) =>
            setPeriod(String(val ?? "MONTHLY"))
          }
          leftIcon={<Icon name="calendar" size={16} />}
        />

        <NumberInput
          label="Target Value"
          value={targetValue}
          onChange={(val: number | null) => setTargetValue(val)}
        />

        <Input
          label="Unit"
          value={unit}
          onChange={(val: string) => setUnit(val)}
          leftIcon={<Icon name="hash" size={16} />}
        />

        <SelectInput
          label="Scope"
          options={scopeOptions}
          value={scope}
          onChange={(val: string | number | boolean | null) =>
            setScope(String(val ?? "INDIVIDUAL"))
          }
          leftIcon={<Icon name="users" size={16} />}
        />

        {scope === "INDIVIDUAL" && (
          <UserSelect
            label="User"
            value={userId}
            onChange={(val: string | number | boolean | null) =>
              setUserId(val ? String(val) : null)
            }
          />
        )}

        <DatePicker
          label="Start Date"
          value={startDate}
          onChange={(v: string) => setStartDate(v)}
          required
        />

        <DatePicker
          label="End Date"
          value={endDate}
          onChange={(v: string) => setEndDate(v)}
        />

        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!name.trim() || targetValue === null || !startDate || isSubmitting}
          >
            {isSubmitting ? "Saving..." : isEdit ? "Update" : "Create"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
