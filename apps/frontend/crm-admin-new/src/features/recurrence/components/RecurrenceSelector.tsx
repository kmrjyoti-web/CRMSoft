"use client";

import { useState, useEffect, useCallback } from "react";

import { Button, Card, Input, SelectInput, Icon } from "@/components/ui";

import type { RecurrenceRule, RecurrenceFrequency } from "../types/recurrence.types";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface RecurrenceSelectorProps {
  value?: RecurrenceRule;
  onChange: (rule: RecurrenceRule | undefined) => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FREQUENCY_OPTIONS: { label: string; value: RecurrenceFrequency }[] = [
  { label: "Daily", value: "DAILY" },
  { label: "Weekly", value: "WEEKLY" },
  { label: "Monthly", value: "MONTHLY" },
  { label: "Yearly", value: "YEARLY" },
];

const DAY_LABELS: { key: string; label: string }[] = [
  { key: "MO", label: "Mon" },
  { key: "TU", label: "Tue" },
  { key: "WE", label: "Wed" },
  { key: "TH", label: "Thu" },
  { key: "FR", label: "Fri" },
  { key: "SA", label: "Sat" },
  { key: "SU", label: "Sun" },
];

type EndCondition = "never" | "count" | "until";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function RecurrenceSelector({ value, onChange }: RecurrenceSelectorProps) {
  const [enabled, setEnabled] = useState(!!value);
  const [frequency, setFrequency] = useState<RecurrenceFrequency>(value?.frequency ?? "WEEKLY");
  const [interval, setInterval] = useState(value?.interval ?? 1);
  const [byDay, setByDay] = useState<string[]>(value?.byDay ?? []);
  const [byMonthDay, setByMonthDay] = useState<string>(
    value?.byMonthDay ? value.byMonthDay.join(", ") : ""
  );
  const [endCondition, setEndCondition] = useState<EndCondition>(
    value?.count ? "count" : value?.until ? "until" : "never"
  );
  const [count, setCount] = useState(value?.count ?? 10);
  const [until, setUntil] = useState(value?.until ?? "");

  // Build and emit rule
  const buildRule = useCallback((): RecurrenceRule => {
    const rule: RecurrenceRule = {
      frequency,
      interval: Math.max(1, interval),
    };

    if (frequency === "WEEKLY" && byDay.length > 0) {
      rule.byDay = byDay;
    }

    if (frequency === "MONTHLY" && byMonthDay.trim()) {
      rule.byMonthDay = byMonthDay
        .split(",")
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n) && n >= 1 && n <= 31);
    }

    if (endCondition === "count") {
      rule.count = Math.max(1, count);
    } else if (endCondition === "until" && until) {
      rule.until = until;
    }

    return rule;
  }, [frequency, interval, byDay, byMonthDay, endCondition, count, until]);

  useEffect(() => {
    if (enabled) {
      onChange(buildRule());
    } else {
      onChange(undefined);
    }
  }, [enabled, frequency, interval, byDay, byMonthDay, endCondition, count, until]);

  // Toggle day
  function toggleDay(day: string) {
    setByDay((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  return (
    <Card>
      <div style={{ padding: "16px" }}>
        {/* Enable toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: enabled ? "16px" : "0" }}>
          <input
            type="checkbox"
            id="recurrence-toggle"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            style={{ width: "16px", height: "16px" }}
          />
          <label htmlFor="recurrence-toggle" style={{ fontSize: "14px", fontWeight: 500, cursor: "pointer" }}>
            Repeat
          </label>
        </div>

        {enabled && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Frequency & Interval */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <SelectInput
                label="Frequency"
                leftIcon={<Icon name="repeat" size={16} />}
                value={frequency}
                onChange={(v) => setFrequency(v as RecurrenceFrequency)}
                options={FREQUENCY_OPTIONS}
              />
              <Input
                label="Every (interval)"
                leftIcon={<Icon name="hash" size={16} />}
                type="number"
                value={String(interval)}
                onChange={(v: string) => setInterval(parseInt(v, 10) || 1)}
              />
            </div>

            {/* WEEKLY: Day checkboxes */}
            {frequency === "WEEKLY" && (
              <div>
                <p style={{ margin: "0 0 8px 0", fontSize: "13px", fontWeight: 500, color: "#374151" }}>
                  Repeat on
                </p>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {DAY_LABELS.map((d) => (
                    <Button
                      key={d.key}
                      type="button"
                      variant={byDay.includes(d.key) ? "primary" : "outline"}
                      onClick={() => toggleDay(d.key)}
                    >
                      {d.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* MONTHLY: monthDay input */}
            {frequency === "MONTHLY" && (
              <Input
                label="On days of month (comma-separated, e.g. 1, 15)"
                leftIcon={<Icon name="calendar" size={16} />}
                value={byMonthDay}
                onChange={(v: string) => setByMonthDay(v)}
              />
            )}

            {/* End condition */}
            <div>
              <p style={{ margin: "0 0 8px 0", fontSize: "13px", fontWeight: 500, color: "#374151" }}>
                Ends
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {/* Never */}
                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="end-condition"
                    checked={endCondition === "never"}
                    onChange={() => setEndCondition("never")}
                  />
                  Never
                </label>

                {/* After X occurrences */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", cursor: "pointer" }}>
                    <input
                      type="radio"
                      name="end-condition"
                      checked={endCondition === "count"}
                      onChange={() => setEndCondition("count")}
                    />
                    After
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={count}
                    onChange={(e) => setCount(parseInt(e.target.value, 10) || 1)}
                    disabled={endCondition !== "count"}
                    style={{
                      width: "80px",
                      padding: "4px 8px",
                      border: "1px solid #d1d5db",
                      borderRadius: "4px",
                      fontSize: "14px",
                    }}
                  />
                  <span style={{ fontSize: "14px" }}>occurrences</span>
                </div>

                {/* Until date */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", cursor: "pointer" }}>
                    <input
                      type="radio"
                      name="end-condition"
                      checked={endCondition === "until"}
                      onChange={() => setEndCondition("until")}
                    />
                    Until
                  </label>
                  <input
                    type="date"
                    value={until}
                    onChange={(e) => setUntil(e.target.value)}
                    disabled={endCondition !== "until"}
                    style={{
                      padding: "4px 8px",
                      border: "1px solid #d1d5db",
                      borderRadius: "4px",
                      fontSize: "14px",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
