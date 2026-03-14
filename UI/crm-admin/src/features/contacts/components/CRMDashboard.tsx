"use client";

import { useState, useMemo, useCallback } from "react";
import {
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { KpiCard } from "@/features/dashboard/components/KpiCard";
import { CHART_COLORS } from "@/features/dashboard/utils/chart-colors";
import { Icon, Badge, Input, SelectInput, Button } from "@/components/ui";
import { AICDatePicker } from "@/components/shared/AICDatePicker";
import type { DateRange } from "@/components/shared/AICDatePicker";
import { format, subDays } from "date-fns";
import { useCRMDashboard } from "../hooks/useContacts";
import { contactsService } from "../services/contacts.service";
import type {
  CRMDashboardStats, IndustryWiseData, SourceWiseData,
  VerificationTrend, DepartmentWiseData, ContactListItem,
} from "../types/contacts.types";

// ── Page toolbar (matches Executive Dashboard style) ──────

function CRMToolbar({
  title,
  actions,
}: {
  title: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-0 pb-5">
      <div className="flex items-center gap-3">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-sm text-gray-400">
          <span>CRM</span>
          <Icon name="chevron-right" size={13} />
          <span>Contact Master</span>
          <Icon name="chevron-right" size={13} />
        </div>
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
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
    <div className="p-6 space-y-6">
      <CRMToolbar
        title="Dashboard"
        actions={<DatePickerAction dateRange={dateRange} onRangeChange={handleRangeChange} />}
      />

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
  );
}

// ══════════════════════════════════════════════════════════
//  PAGE 2 — ALL RECORDS  (/contacts/all-records)
// ══════════════════════════════════════════════════════════

export function CRMAllRecordsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [verifFilter, setVerifFilter] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  const queryParams = useMemo(() => ({
    page,
    limit,
    search: search || undefined,
    isActive: statusFilter === "" ? undefined : statusFilter === "active",
    entityVerificationStatus: verifFilter || undefined,
  }), [page, limit, search, statusFilter, verifFilter]);

  const { data, isLoading } = useQuery({
    queryKey: ["contacts-all", queryParams],
    queryFn: () => contactsService.getAll(queryParams as any),
  });

  const contacts: ContactListItem[] = Array.isArray((data as any)?.data?.data)
    ? (data as any).data.data
    : Array.isArray((data as any)?.data)
    ? (data as any).data
    : [];

  const meta = (data as any)?.data?.meta ?? { total: 0, page: 1, limit };
  const totalPages = Math.ceil((meta.total || 0) / limit);

  const handleSearch = useCallback((v: string) => {
    setSearch(v);
    setPage(1);
  }, []);

  const hasFilers = search || statusFilter || verifFilter;

  return (
    <div className="p-6 space-y-4">
      <CRMToolbar
        title="All Records"
        actions={
          <span className="text-sm text-gray-500">
            {meta.total > 0 ? `${meta.total} contacts` : ""}
          </span>
        }
      />

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[220px]">
          <Input
            label="Search contacts"
            value={search}
            onChange={handleSearch}
            leftIcon={<Icon name="search" size={15} />}
          />
        </div>
        <div className="w-40">
          <SelectInput
            label="Status"
            value={statusFilter}
            onChange={(v) => { setStatusFilter(v as string); setPage(1); }}
            options={[
              { value: "", label: "All Status" },
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ]}
          />
        </div>
        <div className="w-44">
          <SelectInput
            label="Verification"
            value={verifFilter}
            onChange={(v) => { setVerifFilter(v as string); setPage(1); }}
            options={[
              { value: "", label: "All" },
              { value: "VERIFIED", label: "Verified" },
              { value: "NOT_VERIFIED", label: "Not Verified" },
            ]}
          />
        </div>
        {hasFilers && (
          <Button variant="outline" onClick={() => { setSearch(""); setStatusFilter(""); setVerifFilter(""); setPage(1); }}>
            Clear
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16"><LoadingSpinner /></div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-left text-gray-500">
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Designation</th>
                    <th className="px-4 py-3 font-medium">Department</th>
                    <th className="px-4 py-3 font-medium">Organization</th>
                    <th className="px-4 py-3 font-medium">Email / Phone</th>
                    <th className="px-4 py-3 font-medium">Verification</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-14 text-center text-gray-400 text-sm">
                        <Icon name="inbox" size={32} />
                        <p className="mt-2">No contacts found</p>
                      </td>
                    </tr>
                  ) : contacts.map((c) => {
                    const org = c.contactOrganizations?.[0]?.organization;
                    const email = c.communications?.find((cm) => cm.type === "EMAIL")?.value;
                    const phone = c.communications?.find((cm) => cm.type === "PHONE" || cm.type === "MOBILE")?.value;
                    return (
                      <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-800">{c.firstName} {c.lastName}</td>
                        <td className="px-4 py-3 text-gray-600">{c.designation ?? "-"}</td>
                        <td className="px-4 py-3 text-gray-600">{c.department ?? "-"}</td>
                        <td className="px-4 py-3 text-gray-600">{org?.name ?? "-"}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          {email && <div>{email}</div>}
                          {phone && <div>{phone}</div>}
                          {!email && !phone && "-"}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={c.entityVerificationStatus === "VERIFIED" ? "success" : "danger"}>
                            {c.entityVerificationStatus === "VERIFIED" ? "Verified" : "Not Verified"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={c.isActive ? "primary" : "secondary"}>
                            {c.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
                <p className="text-xs text-gray-500">
                  Showing {((page - 1) * limit) + 1}–{Math.min(page * limit, meta.total)} of {meta.total} contacts
                </p>
                <div className="flex gap-1 items-center">
                  <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-40">
                    <Icon name="chevron-left" size={16} />
                  </button>
                  <span className="px-3 py-1 text-xs text-gray-700">Page {page} of {totalPages}</span>
                  <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-40">
                    <Icon name="chevron-right" size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
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
    <div className="p-6 space-y-6">
      <CRMToolbar
        title="Statistics"
        actions={<DatePickerAction dateRange={dateRange} onRangeChange={handleRangeChange} />}
      />

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
