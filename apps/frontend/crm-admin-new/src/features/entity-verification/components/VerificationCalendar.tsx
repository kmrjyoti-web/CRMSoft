"use client";

import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, addMonths, subMonths, isSameMonth, isSameDay, isToday,
} from "date-fns";

import { Badge, Button, Icon, SelectInput } from "@/components/ui";
import { entityVerificationService } from "../services/entity-verification.service";
import type { VerificationRecord } from "../types/entity-verification.types";

// ── Colors ────────────────────────────────────────────

const STATUS_DOT: Record<string, string> = {
  VERIFIED: "#16a34a",
  PENDING: "#f59e0b",
  EXPIRED: "#94a3b8",
  FAILED: "#ef4444",
  REJECTED: "#e11d48",
};

const CHANNEL_LABEL: Record<string, string> = {
  EMAIL: "Email",
  MOBILE_SMS: "SMS",
  WHATSAPP: "WhatsApp",
};

// ── Types ─────────────────────────────────────────────

type CalendarView = "month" | "week";

interface DayCell {
  date: Date;
  isCurrentMonth: boolean;
  records: VerificationRecord[];
}

// ══════════════════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════════════════

export function VerificationCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>("month");
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [channelFilter, setChannelFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  // Fetch entire month's data
  const { data: listData, isLoading } = useQuery({
    queryKey: ["verification-calendar", format(monthStart, "yyyy-MM"), channelFilter, statusFilter],
    queryFn: () =>
      entityVerificationService.getReportList({
        dateFrom: format(startOfWeek(monthStart), "yyyy-MM-dd"),
        dateTo: format(endOfWeek(monthEnd), "yyyy-MM-dd"),
        channel: channelFilter || undefined,
        status: statusFilter || undefined,
        limit: 500,
        page: 1,
      }),
  });

  const records = listData?.data ?? [];

  // ── Build calendar grid ───────────────────────────

  const calendarDays: DayCell[] = useMemo(() => {
    const start = startOfWeek(monthStart);
    const end = endOfWeek(monthEnd);
    const days: DayCell[] = [];
    let day = start;

    while (day <= end) {
      const d = day;
      const dayRecords = records.filter((r) => isSameDay(new Date(r.createdAt), d));
      days.push({
        date: d,
        isCurrentMonth: isSameMonth(d, currentDate),
        records: dayRecords,
      });
      day = addDays(day, 1);
    }
    return days;
  }, [monthStart, monthEnd, currentDate, records]);

  // Week view: filter to selected week
  const weekDays = useMemo(() => {
    if (view !== "week") return [];
    const weekStart = startOfWeek(currentDate);
    return calendarDays.filter(
      (d) => d.date >= weekStart && d.date <= addDays(weekStart, 6),
    );
  }, [view, currentDate, calendarDays]);

  const displayDays = view === "week" ? weekDays : calendarDays;

  // Selected day's records
  const selectedRecords = useMemo(() => {
    if (!selectedDay) return [];
    return records.filter((r) => isSameDay(new Date(r.createdAt), selectedDay));
  }, [selectedDay, records]);

  // ── Navigation ────────────────────────────────────

  const goNext = useCallback(() => {
    if (view === "month") setCurrentDate((d) => addMonths(d, 1));
    else setCurrentDate((d) => addDays(d, 7));
  }, [view]);

  const goPrev = useCallback(() => {
    if (view === "month") setCurrentDate((d) => subMonths(d, 1));
    else setCurrentDate((d) => addDays(d, -7));
  }, [view]);

  const goToday = useCallback(() => {
    setCurrentDate(new Date());
    setSelectedDay(new Date());
  }, []);

  // ── Render ────────────────────────────────────────

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Verification Calendar</h1>
          <p className="text-sm text-gray-500 mt-0.5">Shared calendar view of all contact verification events</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-36">
            <SelectInput
              label="Channel"
              value={channelFilter}
              onChange={(v) => setChannelFilter(v as string)}
              options={[
                { value: "", label: "All Channels" },
                { value: "EMAIL", label: "Email" },
                { value: "MOBILE_SMS", label: "SMS" },
                { value: "WHATSAPP", label: "WhatsApp" },
              ]}
            />
          </div>
          <div className="w-36">
            <SelectInput
              label="Status"
              value={statusFilter}
              onChange={(v) => setStatusFilter(v as string)}
              options={[
                { value: "", label: "All Status" },
                { value: "PENDING", label: "Pending" },
                { value: "VERIFIED", label: "Verified" },
                { value: "EXPIRED", label: "Expired" },
                { value: "FAILED", label: "Failed" },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <button onClick={goPrev} className="p-1.5 rounded hover:bg-gray-100">
            <Icon name="chevron-left" size={18} />
          </button>
          <h2 className="text-base font-semibold text-gray-800 min-w-[160px] text-center">
            {view === "month"
              ? format(currentDate, "MMMM yyyy")
              : `${format(startOfWeek(currentDate), "MMM dd")} \u2013 ${format(addDays(startOfWeek(currentDate), 6), "MMM dd, yyyy")}`}
          </h2>
          <button onClick={goNext} className="p-1.5 rounded hover:bg-gray-100">
            <Icon name="chevron-right" size={18} />
          </button>
          <Button variant="outline" onClick={goToday}>Today</Button>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-md p-0.5">
          <button
            onClick={() => setView("month")}
            className={`px-3 py-1 text-xs font-medium rounded ${view === "month" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}
          >
            Month
          </button>
          <button
            onClick={() => setView("week")}
            className={`px-3 py-1 text-xs font-medium rounded ${view === "week" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}
          >
            Week
          </button>
        </div>
      </div>

      {/* Calendar + Detail side-panel */}
      <div className="flex gap-4">
        {/* Calendar Grid */}
        <div className="flex-1 bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
            {dayNames.map((d) => (
              <div key={d} className="px-2 py-2 text-xs font-medium text-gray-500 text-center">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className={`grid grid-cols-7 ${view === "week" ? "" : "auto-rows-[100px]"}`}>
            {displayDays.map((cell) => {
              const isSelected = selectedDay && isSameDay(cell.date, selectedDay);
              const hasRecords = cell.records.length > 0;

              return (
                <button
                  key={cell.date.toISOString()}
                  onClick={() => setSelectedDay(cell.date)}
                  className={`relative border-b border-r border-gray-100 p-1.5 text-left transition-colors
                    ${!cell.isCurrentMonth ? "bg-gray-50/50" : "bg-white"}
                    ${isSelected ? "ring-2 ring-blue-500 ring-inset z-10" : ""}
                    ${isToday(cell.date) ? "bg-blue-50/50" : ""}
                    hover:bg-blue-50/30
                    ${view === "week" ? "min-h-[120px]" : ""}
                  `}
                >
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium
                      ${isToday(cell.date) ? "bg-blue-600 text-white" : cell.isCurrentMonth ? "text-gray-700" : "text-gray-400"}
                    `}
                  >
                    {format(cell.date, "d")}
                  </span>

                  {/* Event dots */}
                  {hasRecords && (
                    <div className="mt-1 space-y-0.5">
                      {cell.records.slice(0, 3).map((r) => (
                        <div key={r.id} className="flex items-center gap-1 px-1">
                          <span
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: STATUS_DOT[r.status] ?? "#94a3b8" }}
                          />
                          <span className="text-[10px] text-gray-600 truncate leading-tight">
                            {r.entityName || r.sentToEmail || "Verification"}
                          </span>
                        </div>
                      ))}
                      {cell.records.length > 3 && (
                        <span className="text-[10px] text-blue-600 px-1">+{cell.records.length - 3} more</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Detail Panel */}
        <div className="w-80 flex-shrink-0 bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h3 className="text-sm font-medium text-gray-700">
              {selectedDay ? format(selectedDay, "EEEE, MMMM d, yyyy") : "Select a day"}
            </h3>
            {selectedDay && (
              <p className="text-xs text-gray-500 mt-0.5">
                {selectedRecords.length} verification{selectedRecords.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          <div className="max-h-[500px] overflow-y-auto">
            {!selectedDay ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Icon name="calendar" size={32} />
                <p className="text-sm mt-2">Click a date to view details</p>
              </div>
            ) : selectedRecords.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Icon name="inbox" size={32} />
                <p className="text-sm mt-2">No verifications on this day</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {selectedRecords.map((r) => (
                  <div key={r.id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {r.entityName || "Unknown Entity"}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {r.entityType === "RAW_CONTACT" ? "Raw Contact" : r.entityType.charAt(0) + r.entityType.slice(1).toLowerCase()}
                        </p>
                      </div>
                      <Badge
                        variant={
                          r.status === "VERIFIED" ? "success" :
                          r.status === "PENDING" ? "warning" :
                          r.status === "FAILED" || r.status === "REJECTED" ? "danger" : "secondary"
                        }
                      >
                        {r.status}
                      </Badge>
                    </div>

                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Icon name={r.mode === "OTP" ? "key-round" : "link"} size={12} />
                        <span>{r.mode} via {CHANNEL_LABEL[r.channel] ?? r.channel}</span>
                      </div>
                      {(r.sentToEmail || r.sentToMobile) && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Icon name="send" size={12} />
                          <span className="truncate">{r.sentToEmail || r.sentToMobile}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Icon name="clock" size={12} />
                        <span>{format(new Date(r.createdAt), "HH:mm")}</span>
                        {r.verifiedByUserName && (
                          <>
                            <span className="text-gray-300">|</span>
                            <span>by {r.verifiedByUserName}</span>
                          </>
                        )}
                      </div>
                      {r.status === "EXPIRED" && r.linkExpiresAt && (
                        <div className="flex items-center gap-2 text-xs text-red-500">
                          <Icon name="alert-triangle" size={12} />
                          <span>Expired {format(new Date(r.linkExpiresAt), "MMM dd, HH:mm")}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Legend</p>
            <div className="flex flex-wrap gap-3">
              {Object.entries(STATUS_DOT).map(([status, color]) => (
                <div key={status} className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-[10px] text-gray-500">{status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
