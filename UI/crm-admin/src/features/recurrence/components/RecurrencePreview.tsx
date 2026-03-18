"use client";

import { useMemo } from "react";

import { Card, Icon } from "@/components/ui";

import type { RecurrenceRule } from "../types/recurrence.types";
import { formatDate } from "@/lib/format-date";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface RecurrencePreviewProps {
  rule: RecurrenceRule;
  startDate: string;
}

// ---------------------------------------------------------------------------
// Day name helper
// ---------------------------------------------------------------------------

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function getDayName(date: Date): string {
  return DAY_NAMES[date.getDay()];
}


// ---------------------------------------------------------------------------
// Day code to JS day index mapping
// ---------------------------------------------------------------------------

const DAY_CODE_TO_INDEX: Record<string, number> = {
  SU: 0,
  MO: 1,
  TU: 2,
  WE: 3,
  TH: 4,
  FR: 5,
  SA: 6,
};

// ---------------------------------------------------------------------------
// Occurrence calculator (reasonable approximation)
// ---------------------------------------------------------------------------

function computeOccurrences(rule: RecurrenceRule, startDate: string, maxCount: number = 10): Date[] {
  const results: Date[] = [];
  const start = new Date(startDate);
  if (isNaN(start.getTime())) return results;

  const untilDate = rule.until ? new Date(rule.until) : null;
  const maxOccurrences = rule.count ?? maxCount;
  const interval = Math.max(1, rule.interval);

  let current = new Date(start);
  let iterations = 0;
  const MAX_ITERATIONS = 500; // safety

  while (results.length < Math.min(maxOccurrences, maxCount) && iterations < MAX_ITERATIONS) {
    iterations++;

    if (untilDate && current > untilDate) break;

    let shouldAdd = false;

    switch (rule.frequency) {
      case "DAILY":
        shouldAdd = true;
        break;

      case "WEEKLY":
        if (rule.byDay && rule.byDay.length > 0) {
          // Check if current day matches any byDay
          const currentDayIndex = current.getDay();
          shouldAdd = rule.byDay.some((d) => DAY_CODE_TO_INDEX[d] === currentDayIndex);
        } else {
          shouldAdd = true;
        }
        break;

      case "MONTHLY":
        if (rule.byMonthDay && rule.byMonthDay.length > 0) {
          shouldAdd = rule.byMonthDay.includes(current.getDate());
        } else {
          shouldAdd = current.getDate() === start.getDate();
        }
        break;

      case "YEARLY":
        shouldAdd =
          current.getMonth() === start.getMonth() &&
          current.getDate() === start.getDate();
        break;
    }

    if (shouldAdd && current >= start) {
      results.push(new Date(current));
    }

    // Advance
    switch (rule.frequency) {
      case "DAILY":
        current.setDate(current.getDate() + interval);
        break;
      case "WEEKLY":
        if (rule.byDay && rule.byDay.length > 0) {
          // Advance one day at a time for weekly with specific days
          current.setDate(current.getDate() + 1);
          // Check if we crossed a week boundary (apply interval)
          if (current.getDay() === 1 && interval > 1) {
            // Monday -> advance extra weeks
            current.setDate(current.getDate() + 7 * (interval - 1));
          }
        } else {
          current.setDate(current.getDate() + 7 * interval);
        }
        break;
      case "MONTHLY":
        if (rule.byMonthDay && rule.byMonthDay.length > 0) {
          // Advance one day at a time within months
          current.setDate(current.getDate() + 1);
        } else {
          current.setMonth(current.getMonth() + interval);
        }
        break;
      case "YEARLY":
        current.setFullYear(current.getFullYear() + interval);
        break;
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// Human-readable summary
// ---------------------------------------------------------------------------

function describeRule(rule: RecurrenceRule): string {
  const parts: string[] = [];
  const interval = rule.interval > 1 ? `every ${rule.interval} ` : "every ";

  switch (rule.frequency) {
    case "DAILY":
      parts.push(`${interval}day${rule.interval > 1 ? "s" : ""}`);
      break;
    case "WEEKLY":
      parts.push(`${interval}week${rule.interval > 1 ? "s" : ""}`);
      if (rule.byDay && rule.byDay.length > 0) {
        parts.push(`on ${rule.byDay.join(", ")}`);
      }
      break;
    case "MONTHLY":
      parts.push(`${interval}month${rule.interval > 1 ? "s" : ""}`);
      if (rule.byMonthDay && rule.byMonthDay.length > 0) {
        parts.push(`on day${rule.byMonthDay.length > 1 ? "s" : ""} ${rule.byMonthDay.join(", ")}`);
      }
      break;
    case "YEARLY":
      parts.push(`${interval}year${rule.interval > 1 ? "s" : ""}`);
      break;
  }

  if (rule.count) {
    parts.push(`(${rule.count} times)`);
  } else if (rule.until) {
    parts.push(`until ${new Date(rule.until).toLocaleDateString("en-IN")}`);
  }

  return `Repeats ${parts.join(" ")}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function RecurrencePreview({ rule, startDate }: RecurrencePreviewProps) {
  const occurrences = useMemo(() => computeOccurrences(rule, startDate, 10), [rule, startDate]);
  const summary = useMemo(() => describeRule(rule), [rule]);

  return (
    <Card>
      <div style={{ padding: "16px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
          <Icon name="calendar-clock" size={18} />
          <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 600 }}>Recurrence Preview</h4>
        </div>

        {/* Summary */}
        <p style={{ margin: "0 0 12px 0", fontSize: "13px", color: "#6b7280", fontStyle: "italic" }}>
          {summary}
        </p>

        {/* Occurrences list */}
        {occurrences.length === 0 ? (
          <p style={{ margin: 0, fontSize: "13px", color: "#9ca3af" }}>
            No occurrences to display.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {occurrences.map((date, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "6px 10px",
                  borderRadius: "4px",
                  backgroundColor: i === 0 ? "#ecfdf5" : "#f9fafb",
                  fontSize: "13px",
                }}
              >
                <span style={{ color: "#9ca3af", fontWeight: 500, width: "24px", textAlign: "right" }}>
                  {i + 1}.
                </span>
                <span style={{ fontWeight: 500 }}>{formatDate(date)}</span>
                <span style={{ color: "#6b7280" }}>({getDayName(date)})</span>
              </div>
            ))}
          </div>
        )}

        {occurrences.length >= 10 && (
          <p style={{ margin: "8px 0 0 0", fontSize: "12px", color: "#9ca3af" }}>
            Showing first 10 occurrences
          </p>
        )}
      </div>
    </Card>
  );
}
