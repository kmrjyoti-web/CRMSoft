"use client";

import { useState, useMemo, useCallback } from "react";
import {
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { CHART_COLORS } from "@/features/dashboard/utils/chart-colors";
import { Icon, Badge, TableFull } from "@/components/ui";
import { StatCard } from "@/features/dashboard/components/StatCard";
import { DashboardCard } from "@/features/dashboard/components/DashboardCard";
import { HorizontalBarList } from "@/features/dashboard/components/HorizontalBarList";
import { StackedProgress } from "@/features/dashboard/components/StackedProgress";
import { SemiDonutChart } from "@/features/dashboard/components/SemiDonutChart";
import { ActivityFeed } from "@/features/dashboard/components/ActivityFeed";
import type { ActivityItem } from "@/features/dashboard/components/ActivityFeed";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import { AICDatePicker } from "@/components/shared/AICDatePicker";
import type { DateRange } from "@/components/shared/AICDatePicker";
import { format, subDays } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { useCRMDashboard } from "../hooks/useContacts";
import { contactsService } from "../services/contacts.service";
import type {
  CRMDashboardStats, IndustryWiseData, SourceWiseData,
  VerificationTrend, DepartmentWiseData, ContactListItem,
} from "../types/contacts.types";

// ── Page toolbar (matches TableFull header bar style) ──────

function CRMToolbar({
  title,
  actions,
}: {
  title: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white shadow-sm rounded-t-lg">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        <div className="h-5 w-px bg-gray-300" />
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <span>CRM</span>
          <Icon name="chevron-right" size={11} />
          <span>Contact Master</span>
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}

// ── Shared date range hook ────────────────────────────────

function useDateRange() {
  const [dateRange, setDateRange] = useState<DateRange>(() => ({
    start: subDays(new Date(), 30),
    end: new Date(),
  }));
  const handleRangeChange = useCallback((range: DateRange | null) => {
    if (range) setDateRange(range);
  }, []);
  return { dateRange, handleRangeChange };
}

// ── Date picker action ────────────────────────────────────

function DatePickerAction({
  dateRange,
  onRangeChange,
}: {
  dateRange: DateRange;
  onRangeChange: (r: DateRange | null) => void;
}) {
  return (
    <AICDatePicker
      mode="range"
      dateRange={dateRange}
      onRangeChange={onRangeChange}
      showPresets
      showHighlights
      placeholder="Select date range"
      size="sm"
    />
  );
}

// ══════════════════════════════════════════════════════════
//  SKELETON COMPONENTS
// ══════════════════════════════════════════════════════════

function Shimmer({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden bg-gray-200 rounded ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col gap-3 shadow-sm">
      <Shimmer className="w-12 h-12 rounded-full" />
      <div className="space-y-1.5">
        <Shimmer className="h-2.5 w-28" />
        <Shimmer className="h-7 w-16" />
      </div>
      <Shimmer className="h-2.5 w-36" />
      <Shimmer className="h-2.5 w-14" />
    </div>
  );
}

function CardSkeleton({ rows = 5, height }: { rows?: number; height?: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col">
      {/* header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-50">
        <Shimmer className="h-3.5 w-32" />
        <Shimmer className="h-5 w-20 rounded-md" />
      </div>
      {/* body */}
      <div className={`flex-1 p-5 space-y-3 ${height ?? ""}`}>
        {Array.from({ length: rows }).map((_, i) => (
          <Shimmer key={i} className={`h-3 ${i % 3 === 1 ? "w-3/4" : i % 3 === 2 ? "w-1/2" : "w-full"}`} />
        ))}
      </div>
    </div>
  );
}

function CRMDashboardSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-gray-50">
      {/* Row 1 — 8 stat cards, 4 col */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => <StatCardSkeleton key={i} />)}
      </div>
      {/* Row 2 — Dept + Status + Verification + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        <CardSkeleton rows={6} />
        <CardSkeleton rows={5} />
        <CardSkeleton rows={6} />
        <CardSkeleton rows={5} />
      </div>
      {/* Row 3 — Industry + Source + Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <CardSkeleton rows={6} />
        <CardSkeleton rows={6} />
        <CardSkeleton rows={4} height="h-48" />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  PAGE 1 — DASHBOARD  (/contacts/dashboard)
// ══════════════════════════════════════════════════════════

// Avatar colour palette for contacts without photos
const AVATAR_COLORS = [
  "#f97316", "#3b82f6", "#10b981", "#8b5cf6", "#ec4899",
  "#14b8a6", "#f59e0b", "#6366f1", "#ef4444", "#06b6d4",
];

export function CRMDashboardPage() {
  const { dateRange, handleRangeChange } = useDateRange();

  const params = useMemo(() => ({
    dateFrom: format(dateRange.start, "yyyy-MM-dd"),
    dateTo: format(dateRange.end, "yyyy-MM-dd"),
  }), [dateRange]);

  const { data: dashData, isLoading } = useCRMDashboard(params);

  const raw = dashData?.data;
  const stats: CRMDashboardStats = raw?.stats ?? {
    totalContacts: 0, activeContacts: 0, inactiveContacts: 0,
    verifiedContacts: 0, notVerifiedContacts: 0,
    totalOrganizations: 0, verifiedOrganizations: 0, totalCustomers: 0,
  };
  const industryWise: IndustryWiseData[] = Array.isArray(raw?.industryWise) ? raw.industryWise : [];
  const sourceWise: SourceWiseData[] = Array.isArray(raw?.sourceWise) ? raw.sourceWise : [];
  const verificationTrend: VerificationTrend[] = Array.isArray(raw?.verificationTrend) ? raw.verificationTrend : [];
  const departmentWise: DepartmentWiseData[] = Array.isArray(raw?.departmentWise) ? raw.departmentWise : [];
  const recentContacts: ContactListItem[] = Array.isArray(raw?.recentContacts) ? raw.recentContacts : [];

  // ── Derived ──────────────────────────────────────────────
  const contactStatusSegments = [
    { label: "Active", value: stats.activeContacts, color: "#f59e0b" },
    { label: "Verified", value: stats.verifiedContacts, color: "#0e7490" },
    { label: "Inactive", value: stats.inactiveContacts, color: "#ef4444" },
    { label: "Not Verified", value: stats.notVerifiedContacts, color: "#ec4899" },
  ];

  const verificationDonut = [
    { name: "Verified", value: stats.verifiedContacts, color: "#10b981" },
    { name: "Not Verified", value: stats.notVerifiedContacts, color: "#f97316" },
    { name: "Orgs Verified", value: stats.verifiedOrganizations, color: "#3b82f6" },
    {
      name: "Orgs Unverified",
      value: Math.max(0, stats.totalOrganizations - stats.verifiedOrganizations),
      color: "#fbbf24",
    },
  ];

  const deptBarItems = departmentWise.map((d, i) => ({
    label: d.department,
    value: d.count,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));

  const industryBarItems = industryWise.map((d, i) => ({
    label: d.industry,
    value: d.count,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));

  // Recent contacts → ActivityFeed items
  const recentFeedItems: ActivityItem[] = recentContacts.map((c, i) => {
    const orgName = c.contactOrganizations?.[0]?.organization?.name;
    const email = c.communications?.find((cm) => cm.type === "EMAIL")?.value;
    const phone = c.communications?.find(
      (cm) => cm.type === "PHONE" || cm.type === "MOBILE",
    )?.value;
    return {
      id: c.id,
      name: `${c.firstName} ${c.lastName}`.trim(),
      subtitle: [c.designation, orgName].filter(Boolean).join(" · "),
      initials: `${c.firstName?.[0] ?? ""}${c.lastName?.[0] ?? ""}`.toUpperCase(),
      avatarBg: AVATAR_COLORS[i % AVATAR_COLORS.length],
      badge: c.entityVerificationStatus === "VERIFIED" ? "Verified" : "Pending",
      badgeColor: c.entityVerificationStatus === "VERIFIED" ? "green" : "orange",
      meta1: email,
      meta1Label: "Email",
      meta2: phone,
      meta2Label: "Phone",
      meta3: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : undefined,
      meta3Label: "Added",
    };
  });

  return (
    <div className="h-full flex flex-col">
      <CRMToolbar
        title="Dashboard"
        actions={<DatePickerAction dateRange={dateRange} onRangeChange={handleRangeChange} />}
      />

      {isLoading ? (
        <CRMDashboardSkeleton />
      ) : (
        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-gray-50">

          {/* ── Row 1: 8 Stat Cards — 4 columns ─────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              title="Total No of Contacts"
              value={stats.totalContacts}
              icon="users"
              iconBg="#f97316"
              footnote="Active contacts in system"
              linkLabel="View All"
            />
            <StatCard
              title="Active Contacts"
              value={stats.activeContacts}
              total={stats.totalContacts}
              icon="user-check"
              iconBg="#0d9488"
              footnote="of total contacts"
              linkLabel="View All"
            />
            <StatCard
              title="Verified Contacts"
              value={stats.verifiedContacts}
              total={stats.totalContacts}
              icon="shield-check"
              iconBg="#3b82f6"
              linkLabel="View All"
            />
            <StatCard
              title="Pending Verification"
              value={stats.notVerifiedContacts}
              total={stats.totalContacts}
              icon="shield-alert"
              iconBg="#ec4899"
              linkLabel="View All"
            />
            <StatCard
              title="Total Organizations"
              value={stats.totalOrganizations}
              icon="building"
              iconBg="#8b5cf6"
              linkLabel="View All"
            />
            <StatCard
              title="Verified Orgs"
              value={stats.verifiedOrganizations}
              total={stats.totalOrganizations}
              icon="building-2"
              iconBg="#14b8a6"
              linkLabel="View All"
            />
            <StatCard
              title="Total Customers"
              value={stats.totalCustomers}
              icon="crown"
              iconBg="#f59e0b"
              linkLabel="View All"
            />
            <StatCard
              title="Inactive Contacts"
              value={stats.inactiveContacts}
              total={stats.totalContacts}
              icon="user-x"
              iconBg="#64748b"
              linkLabel="View All"
            />
          </div>

          {/* ── Row 2: Dept + Status + Verification + Recent ────── */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">

            {/* Contacts by Department */}
            <DashboardCard
              title="Contacts by Department"
              badge="This Period"
              badgeIcon="calendar"
            >
              {deptBarItems.length > 0 ? (
                <>
                  <HorizontalBarList items={deptBarItems} barColor="#f97316" />
                  {stats.totalContacts > 0 && (
                    <p className="mt-4 text-xs text-gray-500">
                      <span
                        className="inline-block w-2 h-2 rounded-full mr-1"
                        style={{ backgroundColor: "#10b981" }}
                      />
                      <span className="font-semibold text-emerald-600">
                        {Math.round((stats.activeContacts / Math.max(stats.totalContacts, 1)) * 100)}%
                      </span>{" "}
                      active rate
                    </p>
                  )}
                </>
              ) : (
                <EmptyChart />
              )}
            </DashboardCard>

            {/* Contact Status — stacked progress */}
            <DashboardCard
              title="Contact Status"
              badge="This Period"
              badgeIcon="calendar"
            >
              <StackedProgress total={stats.totalContacts} segments={contactStatusSegments} />
              {recentContacts[0] && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-gray-500 mb-2">Latest Added</p>
                  <div className="flex items-center gap-3 bg-orange-50 border border-orange-100 rounded-lg px-3 py-2.5">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ backgroundColor: AVATAR_COLORS[0] }}
                    >
                      {recentContacts[0].firstName?.[0]}{recentContacts[0].lastName?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {`${recentContacts[0].firstName} ${recentContacts[0].lastName}`.trim()}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {recentContacts[0].designation ?? recentContacts[0].department ?? "Contact"}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-orange-600 flex-shrink-0">
                      {recentContacts[0].entityVerificationStatus === "VERIFIED" ? "Verified" : "Pending"}
                    </span>
                  </div>
                </div>
              )}
            </DashboardCard>

            {/* Verification Overview — semi-donut */}
            <DashboardCard
              title="Verification Overview"
              badge="Today"
              badgeIcon="calendar"
            >
              <SemiDonutChart
                segments={verificationDonut}
                centerLabel="Total Verified"
                centerValue={stats.verifiedContacts + stats.verifiedOrganizations}
                semi
                height={190}
              />
            </DashboardCard>

            {/* Recent Contacts — activity feed */}
            <DashboardCard
              title="Recent Contacts"
              badge="All Departments"
              badgeIcon="users"
            >
              <ActivityFeed
                items={recentFeedItems.slice(0, 5)}
                emptyText="No contacts added yet"
                viewAllLabel="View All Contacts"
              />
            </DashboardCard>
          </div>

          {/* ── Row 3: Industry + Source + Trend ─────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            <DashboardCard title="Customers by Industry" badge="This Period" badgeIcon="calendar">
              {industryBarItems.length > 0 ? (
                <HorizontalBarList items={industryBarItems} barColor="#3b82f6" />
              ) : (
                <EmptyChart />
              )}
            </DashboardCard>

            <DashboardCard title="Contacts by Source" badge="This Period" badgeIcon="calendar">
              {sourceWise.length > 0 ? (
                <div className="space-y-3">
                  {sourceWise.map((s, i) => (
                    <div key={s.source} className="flex items-center gap-3">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                      />
                      <span className="flex-1 text-sm text-gray-700 truncate">{s.source}</span>
                      <span className="text-sm font-semibold text-gray-900">{s.count}</span>
                      <span className="w-10 text-right text-xs text-gray-400">{s.percentage}%</span>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyChart />
              )}
            </DashboardCard>

            <DashboardCard title="Verification Trend" badge="6 Months" badgeIcon="calendar">
              {verificationTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={verificationTrend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="period" tick={{ fontSize: 10 }} tickLine={false} />
                    <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                    <Area type="monotone" dataKey="verified" stackId="1" stroke="#10b981" fill="#10b98130" name="Verified" />
                    <Area type="monotone" dataKey="unverified" stackId="1" stroke="#f97316" fill="#f9731630" name="Unverified" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart />
              )}
            </DashboardCard>
          </div>

        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  PAGE 2 — ALL RECORDS  (/contacts/all-records)
//  Uses TableFull — same style as Raw Contacts & ContactList
// ══════════════════════════════════════════════════════════

const ALL_RECORDS_COLUMNS = [
  { id: "name", label: "Name", visible: true },
  { id: "designation", label: "Designation", visible: true },
  { id: "department", label: "Department", visible: true },
  { id: "organization", label: "Organization", visible: true },
  { id: "email", label: "Email", visible: true },
  { id: "phone", label: "Phone", visible: true },
  { id: "verification", label: "Verification", visible: true },
  { id: "status", label: "Status", visible: true },
  { id: "createdAt", label: "Created", visible: true },
];

function flattenAllRecords(contacts: ContactListItem[]): Record<string, unknown>[] {
  return contacts.map((c) => {
    const org = c.contactOrganizations?.[0]?.organization;
    const email = c.communications?.find((cm) => cm.type === "EMAIL")?.value;
    const phone = c.communications?.find(
      (cm) => cm.type === "PHONE" || cm.type === "MOBILE",
    )?.value;
    return {
      id: c.id,
      name: `${c.firstName} ${c.lastName}`.trim(),
      designation: c.designation ?? "—",
      department: c.department ?? "—",
      organization: org?.name ?? "—",
      email: email ?? "—",
      phone: phone ?? "—",
      verification: c.entityVerificationStatus === "VERIFIED" ? "Verified" : "Not Verified",
      status: c.isActive ? "Active" : "Inactive",
      createdAt: c.createdAt
        ? new Date(c.createdAt).toLocaleDateString()
        : "—",
      _verificationStatus: c.entityVerificationStatus,
      _isActive: c.isActive,
    };
  });
}

export function CRMAllRecordsPage() {
  const queryParams = useMemo(() => ({
    page: 1,
    limit: 50,
    sortBy: "createdAt",
    sortOrder: "desc",
  }), []);

  const { data, isLoading } = useQuery({
    queryKey: ["contacts-all", queryParams],
    queryFn: () => contactsService.getAll(queryParams as any),
  });

  const contacts: ContactListItem[] = useMemo(() => {
    const raw = (data as any)?.data ?? data ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [data]);

  const tableData = useMemo(() => {
    const flat = flattenAllRecords(contacts);
    return flat.map((row) => ({
      ...row,
      verification: (
        <Badge
          variant={
            (row as any)._verificationStatus === "VERIFIED"
              ? "success"
              : "danger"
          }
        >
          {row.verification as string}
        </Badge>
      ),
      status: (
        <Badge variant={(row as any)._isActive ? "primary" : "secondary"}>
          {row.status as string}
        </Badge>
      ),
    }));
  }, [contacts]);

  if (isLoading) return <TableSkeleton title="All Records" />;

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 min-h-0">
        <TableFull
          data={tableData}
          title="All Records"
          tableKey="crm-all-records"
          columns={ALL_RECORDS_COLUMNS}
          defaultViewMode="table"
          defaultDensity="compact"
        />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  PAGE 3 — STATISTICS  (/contacts/statistics)
// ══════════════════════════════════════════════════════════

export function CRMStatisticsPage() {
  const { dateRange, handleRangeChange } = useDateRange();

  const params = useMemo(() => ({
    dateFrom: format(dateRange.start, "yyyy-MM-dd"),
    dateTo: format(dateRange.end, "yyyy-MM-dd"),
  }), [dateRange]);

  const { data: dashData, isLoading } = useCRMDashboard(params);

  const raw = dashData?.data;
  const stats: CRMDashboardStats = raw?.stats ?? {
    totalContacts: 0, activeContacts: 0, inactiveContacts: 0,
    verifiedContacts: 0, notVerifiedContacts: 0,
    totalOrganizations: 0, verifiedOrganizations: 0, totalCustomers: 0,
  };
  const industryWise: IndustryWiseData[] = Array.isArray(raw?.industryWise) ? raw.industryWise : [];
  const sourceWise: SourceWiseData[] = Array.isArray(raw?.sourceWise) ? raw.sourceWise : [];
  const verificationTrend: VerificationTrend[] = Array.isArray(raw?.verificationTrend) ? raw.verificationTrend : [];
  const departmentWise: DepartmentWiseData[] = Array.isArray(raw?.departmentWise) ? raw.departmentWise : [];

  const verificationPie = [
    { name: "Verified", value: stats.verifiedContacts, fill: "#10b981" },
    { name: "Not Verified", value: stats.notVerifiedContacts, fill: "#ef4444" },
  ];
  const orgPie = [
    { name: "Verified", value: stats.verifiedOrganizations, fill: "#3b82f6" },
    { name: "Unverified", value: Math.max(0, stats.totalOrganizations - stats.verifiedOrganizations), fill: "#f59e0b" },
  ];

  const verificationRate = stats.totalContacts > 0 ? ((stats.verifiedContacts / stats.totalContacts) * 100).toFixed(1) : "0.0";
  const activeRate = stats.totalContacts > 0 ? ((stats.activeContacts / stats.totalContacts) * 100).toFixed(1) : "0.0";
  const orgVerifRate = stats.totalOrganizations > 0 ? ((stats.verifiedOrganizations / stats.totalOrganizations) * 100).toFixed(1) : "0.0";

  if (isLoading) return <LoadingSpinner fullPage />;

  return (
    <div className="h-full flex flex-col">
      <CRMToolbar
        title="Statistics"
        actions={<DatePickerAction dateRange={dateRange} onRangeChange={handleRangeChange} />}
      />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Verification Rate" value={`${verificationRate}%`} color="#10b981" icon="shield-check" />
        <MetricCard label="Active Rate" value={`${activeRate}%`} color="#3b82f6" icon="activity" />
        <MetricCard label="Org Verification Rate" value={`${orgVerifRate}%`} color="#8b5cf6" icon="building" />
        <MetricCard label="Total Customers" value={stats.totalCustomers.toString()} color="#f59e0b" icon="crown" />
      </div>

      {/* Verification splits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Contact Verification Split">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={verificationPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={50}
                label={((p: any) => `${p.name}: ${((p.value / Math.max(stats.totalContacts, 1)) * 100).toFixed(0)}%`) as any}>
                {verificationPie.map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Pie>
              <Tooltip /><Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Organization Verification Split">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={orgPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={50}
                label={((p: any) => `${p.name}: ${((p.value / Math.max(stats.totalOrganizations, 1)) * 100).toFixed(0)}%`) as any}>
                {orgPie.map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Pie>
              <Tooltip /><Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Trend */}
      <ChartCard title="Verification Trend Over Time">
        {verificationTrend.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={verificationTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip /><Legend />
              <Area type="monotone" dataKey="verified" stackId="1" stroke="#10b981" fill="#10b98140" name="Verified" />
              <Area type="monotone" dataKey="unverified" stackId="1" stroke="#ef4444" fill="#ef444440" name="Unverified" />
            </AreaChart>
          </ResponsiveContainer>
        ) : <EmptyChart />}
      </ChartCard>

      {/* Industry + Department */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Customers by Industry">
          {industryWise.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={industryWise} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="industry" type="category" tick={{ fontSize: 11 }} width={130} />
                <Tooltip />
                <Bar dataKey="count" name="Customers">
                  {industryWise.map((_e, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyChart />}
        </ChartCard>

        <ChartCard title="Contacts by Department">
          {departmentWise.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={departmentWise}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" name="Contacts">
                  {departmentWise.map((_e, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyChart />}
        </ChartCard>
      </div>

      {/* Source */}
      <ChartCard title="Contacts by Source / Campaign">
        {sourceWise.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={sourceWise}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="source" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" name="Contacts">
                {sourceWise.map((_e, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : <EmptyChart />}
      </ChartCard>
      </div>
    </div>
  );
}

// ── Legacy export for backward compat ─────────────────────
// (kept so any existing import of CRMDashboard doesn't break)
export function CRMDashboard() {
  return <CRMDashboardPage />;
}

// ══════════════════════════════════════════════════════════
//  SHARED SUB-COMPONENTS
// ══════════════════════════════════════════════════════════

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <h3 className="text-base font-semibold text-gray-800 mb-4">{title}</h3>
      {children}
    </div>
  );
}

function MetricCard({ label, value, color, icon }: { label: string; value: string; color: string; icon: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 flex items-center gap-4">
      <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}18` }}>
        <Icon name={icon as any} size={22} color={color} />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="flex items-center justify-center h-[260px] text-gray-400 text-sm">
      No data available
    </div>
  );
}
