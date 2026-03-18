"use client";

import { useState, useMemo, useCallback } from "react";
import {
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { KpiCard } from "@/features/dashboard/components/KpiCard";
import { CHART_COLORS } from "@/features/dashboard/utils/chart-colors";
import { Icon, Badge, TableFull } from "@/components/ui";
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
//  PAGE 1 — DASHBOARD  (/contacts/dashboard)
// ══════════════════════════════════════════════════════════

export function CRMDashboardPage() {
  const { dateRange, handleRangeChange } = useDateRange();

  const params = useMemo(() => ({
    dateFrom: format(dateRange.start, "yyyy-MM-dd"),
    dateTo: format(dateRange.end, "yyyy-MM-dd"),
  }), [dateRange]);

  const { data: dashData, isLoading } = useCRMDashboard(params);

  const raw = dashData?.data as any;
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

  const verificationPie = [
    { name: "Verified", value: stats.verifiedContacts, fill: "#10b981" },
    { name: "Not Verified", value: stats.notVerifiedContacts, fill: "#ef4444" },
  ];
  const orgPie = [
    { name: "Verified", value: stats.verifiedOrganizations, fill: "#3b82f6" },
    { name: "Unverified", value: Math.max(0, stats.totalOrganizations - stats.verifiedOrganizations), fill: "#f59e0b" },
  ];

  if (isLoading) return <LoadingSpinner fullPage />;

  return (
    <div className="h-full flex flex-col">
      <CRMToolbar
        title="Dashboard"
        actions={<DatePickerAction dateRange={dateRange} onRangeChange={handleRangeChange} />}
      />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard title="Total Contacts" value={stats.totalContacts} icon="users" color="#3b82f6" variant="clean" />
        <KpiCard title="Active Contacts" value={stats.activeContacts} icon="user-check" color="#10b981" variant="clean" />
        <KpiCard title="Verified Contacts" value={stats.verifiedContacts} icon="shield-check" color="#06b6d4" variant="clean" />
        <KpiCard title="Not Verified" value={stats.notVerifiedContacts} icon="shield-alert" color="#ef4444" variant="clean" />
        <KpiCard title="Total Organizations" value={stats.totalOrganizations} icon="building" color="#8b5cf6" variant="clean" />
        <KpiCard title="Verified Orgs" value={stats.verifiedOrganizations} icon="building-2" color="#14b8a6" variant="clean" />
        <KpiCard title="Total Customers" value={stats.totalCustomers} icon="crown" color="#f59e0b" variant="clean" />
        <KpiCard title="Inactive Contacts" value={stats.inactiveContacts} icon="user-x" color="#f97316" variant="clean" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Contact Verification Status">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={verificationPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={95} innerRadius={48}
                label={((p: any) => `${p.name}: ${p.value}`) as any}>
                {verificationPie.map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Pie>
              <Tooltip /><Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Customers by Industry">
          {industryWise.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={industryWise} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="industry" type="category" tick={{ fontSize: 11 }} width={120} />
                <Tooltip />
                <Bar dataKey="count" name="Customers">
                  {industryWise.map((_e, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyChart />}
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Contacts by Source / Campaign">
          {sourceWise.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={sourceWise} dataKey="count" nameKey="source" cx="50%" cy="50%" outerRadius={95}
                  label={((p: any) => `${p.source} (${p.percentage}%)`) as any}>
                  {sourceWise.map((_e, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip /><Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : <EmptyChart />}
        </ChartCard>

        <ChartCard title="Verification Trend">
          {verificationTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
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
      </div>

      {/* Charts Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Organization Verification">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={orgPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={95} innerRadius={48}
                label={((p: any) => `${p.name}: ${p.value}`) as any}>
                {orgPie.map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Pie>
              <Tooltip /><Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Contacts by Department">
          {departmentWise.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
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

      {/* Recent Contacts */}
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <h3 className="text-base font-semibold text-gray-800 mb-4">Recent Contacts</h3>
        {recentContacts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-500">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Designation</th>
                  <th className="pb-3 font-medium">Department</th>
                  <th className="pb-3 font-medium">Organization</th>
                  <th className="pb-3 font-medium">Verification</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentContacts.slice(0, 10).map((c) => {
                  const org = c.contactOrganizations?.[0]?.organization;
                  return (
                    <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2.5 font-medium text-gray-800">{c.firstName} {c.lastName}</td>
                      <td className="py-2.5 text-gray-600">{c.designation ?? "-"}</td>
                      <td className="py-2.5 text-gray-600">{c.department ?? "-"}</td>
                      <td className="py-2.5 text-gray-600">{org?.name ?? "-"}</td>
                      <td className="py-2.5">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                          c.entityVerificationStatus === "VERIFIED" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                        }`}>
                          {c.entityVerificationStatus === "VERIFIED" ? "Verified" : "Not Verified"}
                        </span>
                      </td>
                      <td className="py-2.5">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          c.isActive ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-500"
                        }`}>
                          {c.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : <EmptyChart />}
      </div>
      </div>
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
    const raw = (data as any)?.data;
    if (Array.isArray(raw?.data)) return raw.data;
    if (Array.isArray(raw)) return raw;
    return [];
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

  const raw = dashData?.data as any;
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
        <StatCard label="Verification Rate" value={`${verificationRate}%`} color="#10b981" icon="shield-check" />
        <StatCard label="Active Rate" value={`${activeRate}%`} color="#3b82f6" icon="activity" />
        <StatCard label="Org Verification Rate" value={`${orgVerifRate}%`} color="#8b5cf6" icon="building" />
        <StatCard label="Total Customers" value={stats.totalCustomers.toString()} color="#f59e0b" icon="crown" />
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

function StatCard({ label, value, color, icon }: { label: string; value: string; color: string; icon: string }) {
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
