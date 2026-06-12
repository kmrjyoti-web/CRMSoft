"use client";

import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { format, subDays } from "date-fns";

import { Badge, Button, Icon, Input, SelectInput } from "@/components/ui";
import { KpiCard } from "@/features/dashboard/components/KpiCard";
import { entityVerificationService } from "../services/entity-verification.service";
import type {
  VerificationReportFilters,
  VerificationRecord,
} from "../types/entity-verification.types";

// ── Colors ────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  VERIFIED: "#16a34a",
  PENDING: "#f59e0b",
  EXPIRED: "#94a3b8",
  FAILED: "#ef4444",
  REJECTED: "#e11d48",
};

const CHANNEL_COLORS: Record<string, string> = {
  EMAIL: "#3b82f6",
  MOBILE_SMS: "#8b5cf6",
  WHATSAPP: "#22c55e",
};

const PIE_COLORS = ["#3b82f6", "#8b5cf6", "#22c55e", "#f59e0b", "#ef4444"];

// ── Helpers ───────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, "success" | "warning" | "danger" | "secondary" | "primary"> = {
    VERIFIED: "success", PENDING: "warning", EXPIRED: "secondary", FAILED: "danger", REJECTED: "danger",
  };
  return <Badge variant={map[status] ?? "secondary"}>{status}</Badge>;
}

function ChannelIcon({ channel }: { channel: string }) {
  const icons: Record<string, string> = { EMAIL: "mail", MOBILE_SMS: "smartphone", WHATSAPP: "message-circle" };
  return <Icon name={icons[channel] ?? "globe"} size={14} color={CHANNEL_COLORS[channel] ?? "#64748b"} />;
}

function formatEntityType(t: string) {
  if (t === "RAW_CONTACT") return "Raw Contact";
  return t.charAt(0) + t.slice(1).toLowerCase();
}

type DatePreset = "7d" | "30d" | "90d" | "all";
type TabKey = "dashboard" | "records" | "statistics";

function getDateRange(preset: DatePreset): { dateFrom?: string; dateTo?: string } {
  if (preset === "all") return {};
  const days = preset === "7d" ? 7 : preset === "30d" ? 30 : 90;
  return {
    dateFrom: format(subDays(new Date(), days), "yyyy-MM-dd"),
    dateTo: format(new Date(), "yyyy-MM-dd"),
  };
}

function TabBtn({ active, label, icon, onClick }: { active: boolean; label: string; icon: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
        active
          ? "border-blue-600 text-blue-600"
          : "border-transparent text-gray-500 hover:text-gray-700"
      }`}
    >
      <Icon name={icon} size={16} />
      {label}
    </button>
  );
}

// ══════════════════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════════════════

export function VerificationReportPage() {
  const [tab, setTab] = useState<TabKey>("dashboard");
  const [datePreset, setDatePreset] = useState<DatePreset>("30d");
  const [filters, setFilters] = useState<VerificationReportFilters>({ page: 1, limit: 20 });
  const [search, setSearch] = useState("");

  const dateRange = useMemo(() => getDateRange(datePreset), [datePreset]);

  // ── Queries ───────────────────────────────────────

  const { data: summary } = useQuery({
    queryKey: ["verification-report-summary", dateRange],
    queryFn: () => entityVerificationService.getReportSummary(dateRange.dateFrom, dateRange.dateTo),
  });

  const { data: trend } = useQuery({
    queryKey: ["verification-report-trend", datePreset],
    queryFn: () => entityVerificationService.getVerificationTrend(
      datePreset === "7d" ? 7 : datePreset === "90d" ? 90 : 30,
    ),
  });

  const activeFilters = useMemo(() => ({
    ...filters, ...dateRange, search: search || undefined,
  }), [filters, dateRange, search]);

  const { data: listData, isLoading: listLoading } = useQuery({
    queryKey: ["verification-report-list", activeFilters],
    queryFn: () => entityVerificationService.getReportList(activeFilters),
    enabled: tab === "records",
  });

  const { data: expiredLinks } = useQuery({
    queryKey: ["verification-expired-links"],
    queryFn: () => entityVerificationService.getExpiredLinks(),
    enabled: tab === "records",
  });

  // ── Chart data ────────────────────────────────────

  const channelPieData = useMemo(() => {
    if (!summary) return [];
    return Object.entries(summary.byChannel).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }));
  }, [summary]);

  const entityPieData = useMemo(() => {
    if (!summary) return [];
    return Object.entries(summary.byEntityType).filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name: formatEntityType(name), value }));
  }, [summary]);

  const modePieData = useMemo(() => {
    if (!summary) return [];
    return Object.entries(summary.byMode).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }));
  }, [summary]);

  const statusBarData = useMemo(() => {
    if (!summary) return [];
    return [
      { name: "Verified", value: summary.verified, fill: STATUS_COLORS.VERIFIED },
      { name: "Pending", value: summary.pending, fill: STATUS_COLORS.PENDING },
      { name: "Expired", value: summary.expired, fill: STATUS_COLORS.EXPIRED },
      { name: "Failed", value: summary.failed, fill: STATUS_COLORS.FAILED },
      { name: "Rejected", value: summary.rejected, fill: STATUS_COLORS.REJECTED },
    ].filter(d => d.value > 0);
  }, [summary]);

  const allRecords = listData?.data ?? [];

  // ── Handlers ──────────────────────────────────────

  const handleFilterChange = useCallback((key: keyof VerificationReportFilters, value: string | null) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined, page: 1 }));
  }, []);

  const handleExport = useCallback(() => {
    const url = entityVerificationService.getExportUrl({
      status: filters.status, dateFrom: dateRange.dateFrom, dateTo: dateRange.dateTo,
    });
    window.open(url, "_blank");
  }, [filters.status, dateRange]);

  const handlePageChange = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  // ── Render ────────────────────────────────────────

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Contact Verification Master</h1>
          <p className="text-sm text-gray-500 mt-0.5">Entity verification dashboard, records &amp; analytics</p>
        </div>
        <div className="flex items-center gap-2">
          {(["7d", "30d", "90d", "all"] as DatePreset[]).map((p) => (
            <button
              key={p}
              onClick={() => setDatePreset(p)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                datePreset === p
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {p === "all" ? "All Time" : p === "7d" ? "7 Days" : p === "30d" ? "30 Days" : "90 Days"}
            </button>
          ))}
          <Button variant="outline" onClick={handleExport}>
            <Icon name="download" size={16} />
            Export
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 bg-white rounded-t-lg">
        <div className="flex">
          <TabBtn active={tab === "dashboard"} label="Dashboard" icon="layout-dashboard" onClick={() => setTab("dashboard")} />
          <TabBtn active={tab === "records"} label="All Records" icon="table" onClick={() => setTab("records")} />
          <TabBtn active={tab === "statistics"} label="Statistics" icon="bar-chart-3" onClick={() => setTab("statistics")} />
        </div>
      </div>

      {/* ══════════════════════════════════════════════ */}
      {/*  TAB 1: DASHBOARD                             */}
      {/* ══════════════════════════════════════════════ */}
      {tab === "dashboard" && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <KpiCard title="Total Sent" value={summary?.total ?? 0} icon="shield-check" color="#3b82f6" variant="clean" />
            <KpiCard title="Verified" value={summary?.verified ?? 0} icon="check-circle" color="#16a34a" variant="clean" />
            <KpiCard title="Pending" value={summary?.pending ?? 0} icon="clock" color="#f59e0b" variant="clean" />
            <KpiCard title="Expired" value={summary?.expired ?? 0} icon="timer-off" color="#94a3b8" variant="clean" />
            <KpiCard title="Failed" value={summary?.failed ?? 0} icon="x-circle" color="#ef4444" variant="clean" />
            <KpiCard title="Success Rate" value={`${summary?.verificationRate ?? 0}%`} icon="percent" color="#8b5cf6" variant="clean" />
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Verification Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trend?.trend ?? []}>
                <defs>
                  <linearGradient id="gTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gVerified" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => format(new Date(v), "MMM dd")} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip labelFormatter={(v) => format(new Date(v as string), "MMM dd, yyyy")} />
                <Legend />
                <Area type="monotone" dataKey="total" stroke="#3b82f6" fill="url(#gTotal)" strokeWidth={2} name="Total" />
                <Area type="monotone" dataKey="verified" stroke="#16a34a" fill="url(#gVerified)" strokeWidth={2} name="Verified" />
                <Line type="monotone" dataKey="expired" stroke="#94a3b8" strokeWidth={1.5} dot={false} name="Expired" />
                <Line type="monotone" dataKey="failed" stroke="#ef4444" strokeWidth={1.5} dot={false} name="Failed" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="text-sm font-medium text-gray-700 mb-3">By Channel</h3>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={channelPieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                    {channelPieData.map((entry, i) => (
                      <Cell key={entry.name} fill={CHANNEL_COLORS[entry.name] ?? PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="text-sm font-medium text-gray-700 mb-3">By Mode</h3>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={modePieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                    {modePieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700">Recent Verifications</h3>
              <button onClick={() => setTab("records")} className="text-xs text-blue-600 hover:underline">View All</button>
            </div>
            <RecentTable dateRange={dateRange} />
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════ */}
      {/*  TAB 2: ALL RECORDS                           */}
      {/* ══════════════════════════════════════════════ */}
      {tab === "records" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap bg-white rounded-lg border border-gray-200 p-4">
            <div className="w-56">
              <Input label="Search" value={search} onChange={(v) => setSearch(v)} leftIcon={<Icon name="search" size={16} />} />
            </div>
            <div className="w-36">
              <SelectInput label="Status" value={filters.status ?? ""} onChange={(v) => handleFilterChange("status", v as string)}
                options={[
                  { value: "", label: "All" }, { value: "PENDING", label: "Pending" },
                  { value: "VERIFIED", label: "Verified" }, { value: "EXPIRED", label: "Expired" },
                  { value: "FAILED", label: "Failed" }, { value: "REJECTED", label: "Rejected" },
                ]} />
            </div>
            <div className="w-36">
              <SelectInput label="Channel" value={filters.channel ?? ""} onChange={(v) => handleFilterChange("channel", v as string)}
                options={[
                  { value: "", label: "All" }, { value: "EMAIL", label: "Email" },
                  { value: "MOBILE_SMS", label: "SMS" }, { value: "WHATSAPP", label: "WhatsApp" },
                ]} />
            </div>
            <div className="w-32">
              <SelectInput label="Mode" value={filters.mode ?? ""} onChange={(v) => handleFilterChange("mode", v as string)}
                options={[{ value: "", label: "All" }, { value: "OTP", label: "OTP" }, { value: "LINK", label: "Link" }]} />
            </div>
            <div className="w-40">
              <SelectInput label="Entity Type" value={filters.entityType ?? ""} onChange={(v) => handleFilterChange("entityType", v as string)}
                options={[
                  { value: "", label: "All" }, { value: "CONTACT", label: "Contact" },
                  { value: "ORGANIZATION", label: "Organization" }, { value: "RAW_CONTACT", label: "Raw Contact" },
                ]} />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Entity</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Mode</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Channel</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Sent To</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Initiated By</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Expires</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {listLoading ? (
                    <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
                  ) : allRecords.length === 0 ? (
                    <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">No records found</td></tr>
                  ) : (
                    allRecords.map((r: VerificationRecord) => (
                      <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-900">{r.entityName || "\u2014"}</td>
                        <td className="px-4 py-3 text-gray-600">{formatEntityType(r.entityType)}</td>
                        <td className="px-4 py-3"><Badge variant={r.mode === "OTP" ? "primary" : "secondary"}>{r.mode}</Badge></td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5 text-gray-600">
                            <ChannelIcon channel={r.channel} />
                            {r.channel === "MOBILE_SMS" ? "SMS" : r.channel}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-xs font-mono">{r.sentToEmail || r.sentToMobile || "\u2014"}</td>
                        <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                        <td className="px-4 py-3 text-gray-600 text-xs">{r.verifiedByUserName || "\u2014"}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{format(new Date(r.createdAt), "MMM dd, yyyy HH:mm")}</td>
                        <td className="px-4 py-3 text-xs">
                          {r.otpExpiresAt ? (
                            <span className={new Date(r.otpExpiresAt) < new Date() ? "text-red-500" : "text-gray-500"}>
                              {format(new Date(r.otpExpiresAt), "HH:mm")}
                            </span>
                          ) : r.linkExpiresAt ? (
                            <span className={new Date(r.linkExpiresAt) < new Date() ? "text-red-500" : "text-gray-500"}>
                              {format(new Date(r.linkExpiresAt), "MMM dd HH:mm")}
                            </span>
                          ) : "\u2014"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {listData && listData.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
                <span className="text-sm text-gray-500">
                  {((listData.page - 1) * listData.limit) + 1}\u2013{Math.min(listData.page * listData.limit, listData.total)} of {listData.total}
                </span>
                <div className="flex gap-1">
                  <button disabled={listData.page <= 1} onClick={() => handlePageChange(listData.page - 1)}
                    className="px-3 py-1.5 text-xs rounded border border-gray-300 disabled:opacity-40 hover:bg-white">Prev</button>
                  <span className="px-3 py-1.5 text-xs text-gray-600">{listData.page} / {listData.totalPages}</span>
                  <button disabled={listData.page >= listData.totalPages} onClick={() => handlePageChange(listData.page + 1)}
                    className="px-3 py-1.5 text-xs rounded border border-gray-300 disabled:opacity-40 hover:bg-white">Next</button>
                </div>
              </div>
            )}
          </div>

          {(expiredLinks ?? []).length > 0 && (
            <div className="bg-white rounded-lg border border-orange-200 overflow-hidden">
              <div className="px-4 py-3 bg-orange-50 border-b border-orange-200 flex items-center gap-2">
                <Icon name="alert-triangle" size={16} color="#f59e0b" />
                <span className="text-sm font-medium text-orange-800">Expired Links ({expiredLinks?.length})</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-4 py-2.5 font-medium text-gray-600 text-xs">Entity</th>
                      <th className="text-left px-4 py-2.5 font-medium text-gray-600 text-xs">Type</th>
                      <th className="text-left px-4 py-2.5 font-medium text-gray-600 text-xs">Sent To</th>
                      <th className="text-left px-4 py-2.5 font-medium text-gray-600 text-xs">Link</th>
                      <th className="text-left px-4 py-2.5 font-medium text-gray-600 text-xs">Expired At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(expiredLinks ?? []).slice(0, 10).map((r: VerificationRecord) => (
                      <tr key={r.id} className="hover:bg-orange-50/50">
                        <td className="px-4 py-2.5 font-medium text-gray-900 text-xs">{r.entityName || "\u2014"}</td>
                        <td className="px-4 py-2.5 text-gray-600 text-xs">{formatEntityType(r.entityType)}</td>
                        <td className="px-4 py-2.5 text-gray-600 text-xs">{r.sentToEmail || r.sentToMobile || "\u2014"}</td>
                        <td className="px-4 py-2.5 text-xs">
                          {r.linkUrl ? (
                            <a href={r.linkUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline truncate block max-w-[200px]">
                              {r.linkUrl.split("/").pop()}
                            </a>
                          ) : "\u2014"}
                        </td>
                        <td className="px-4 py-2.5 text-red-500 text-xs">
                          {r.linkExpiresAt ? format(new Date(r.linkExpiresAt), "MMM dd, yyyy HH:mm") : "\u2014"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════ */}
      {/*  TAB 3: STATISTICS                            */}
      {/* ══════════════════════════════════════════════ */}
      {tab === "statistics" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Status Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={statusBarData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                    {statusBarData.map((d, i) => (
                      <Cell key={i} fill={d.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Channel Performance</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={channelPieData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={100} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                    {channelPieData.map((entry, i) => (
                      <Cell key={i} fill={CHANNEL_COLORS[entry.name] ?? PIE_COLORS[i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="text-sm font-medium text-gray-700 mb-4">By Entity Type</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={entityPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                    {entityPieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Verification Mode Split</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={modePieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                    <Cell fill="#3b82f6" />
                    <Cell fill="#8b5cf6" />
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Daily Verification Volume</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={trend?.trend ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => format(new Date(v), "dd")} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip labelFormatter={(v) => format(new Date(v as string), "MMM dd, yyyy")} />
                <Legend />
                <Bar dataKey="verified" stackId="a" fill="#16a34a" name="Verified" />
                <Bar dataKey="expired" stackId="a" fill="#94a3b8" name="Expired" />
                <Bar dataKey="failed" stackId="a" fill="#ef4444" name="Failed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{summary?.total ?? 0}</div>
              <div className="text-xs text-gray-500 mt-1">Total Verifications</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{summary?.verificationRate ?? 0}%</div>
              <div className="text-xs text-gray-500 mt-1">Success Rate</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{summary?.byMode?.OTP ?? 0}</div>
              <div className="text-xs text-gray-500 mt-1">OTP Verifications</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
              <div className="text-2xl font-bold text-indigo-600">{summary?.byMode?.LINK ?? 0}</div>
              <div className="text-xs text-gray-500 mt-1">Link Verifications</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════
//  SUB: Recent Table (Dashboard tab)
// ══════════════════════════════════════════════════════

function RecentTable({ dateRange }: { dateRange: { dateFrom?: string; dateTo?: string } }) {
  const { data } = useQuery({
    queryKey: ["verification-recent-5", dateRange],
    queryFn: () => entityVerificationService.getReportList({ ...dateRange, page: 1, limit: 5 }),
  });

  const records = data?.data ?? [];
  if (records.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-4">No recent verifications</p>;
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
          <th className="pb-2 font-medium">Entity</th>
          <th className="pb-2 font-medium">Channel</th>
          <th className="pb-2 font-medium">Status</th>
          <th className="pb-2 font-medium">Date</th>
        </tr>
      </thead>
      <tbody>
        {records.map((r: VerificationRecord) => (
          <tr key={r.id} className="border-b border-gray-50 last:border-0">
            <td className="py-2 font-medium text-gray-800">{r.entityName || "\u2014"}</td>
            <td className="py-2">
              <span className="inline-flex items-center gap-1 text-gray-600 text-xs">
                <ChannelIcon channel={r.channel} />
                {r.channel === "MOBILE_SMS" ? "SMS" : r.channel}
              </span>
            </td>
            <td className="py-2"><StatusBadge status={r.status} /></td>
            <td className="py-2 text-gray-500 text-xs">{format(new Date(r.createdAt), "MMM dd, HH:mm")}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
