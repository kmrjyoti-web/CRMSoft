"use client";

import { useState, useMemo, useCallback } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { KpiCard } from "@/features/dashboard/components/KpiCard";
import { CHART_COLORS } from "@/features/dashboard/utils/chart-colors";
import { AICDatePicker } from "@/components/shared/AICDatePicker";
import type { DateRange } from "@/components/shared/AICDatePicker";
import { format, subDays } from "date-fns";
import { useCRMDashboard } from "../hooks/useContacts";
import type {
  CRMDashboardStats,
  IndustryWiseData,
  SourceWiseData,
  VerificationTrend,
  DepartmentWiseData,
  ContactListItem,
} from "../types/contacts.types";

export function CRMDashboard() {
  const [dateRange, setDateRange] = useState<DateRange>(() => ({
    start: subDays(new Date(), 30),
    end: new Date(),
  }));

  const handleRangeChange = useCallback((range: DateRange | null) => {
    if (range) setDateRange(range);
  }, []);

  const params = useMemo(() => ({
    dateFrom: format(dateRange.start, "yyyy-MM-dd"),
    dateTo: format(dateRange.end, "yyyy-MM-dd"),
  }), [dateRange]);
  const { data: dashData, isLoading } = useCRMDashboard(params);

  // Safely extract dashboard data
  const raw = dashData?.data as any;
  const stats: CRMDashboardStats = raw?.stats ?? {
    totalContacts: 0,
    activeContacts: 0,
    inactiveContacts: 0,
    verifiedContacts: 0,
    notVerifiedContacts: 0,
    totalOrganizations: 0,
    verifiedOrganizations: 0,
    totalCustomers: 0,
  };

  const industryWise: IndustryWiseData[] = Array.isArray(raw?.industryWise) ? raw.industryWise : [];
  const sourceWise: SourceWiseData[] = Array.isArray(raw?.sourceWise) ? raw.sourceWise : [];
  const verificationTrend: VerificationTrend[] = Array.isArray(raw?.verificationTrend) ? raw.verificationTrend : [];
  const departmentWise: DepartmentWiseData[] = Array.isArray(raw?.departmentWise) ? raw.departmentWise : [];
  const recentContacts: ContactListItem[] = Array.isArray(raw?.recentContacts) ? raw.recentContacts : [];

  // Verification pie data
  const verificationPie = [
    { name: "Verified", value: stats.verifiedContacts, fill: "#10b981" },
    { name: "Not Verified", value: stats.notVerifiedContacts, fill: "#ef4444" },
  ];

  // Organization pie data
  const orgPie = [
    { name: "Verified", value: stats.verifiedOrganizations, fill: "#3b82f6" },
    { name: "Unverified", value: Math.max(0, stats.totalOrganizations - stats.verifiedOrganizations), fill: "#f59e0b" },
  ];

  if (isLoading) {
    return <LoadingSpinner fullPage />;
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="CRM Dashboard"
        description="Contact, verification, and customer insights at a glance."
        actions={
          <AICDatePicker
            mode="range"
            dateRange={dateRange}
            onRangeChange={handleRangeChange}
            showPresets
            showHighlights
            placeholder="Select date range"
            size="sm"
          />
        }
      />

      {/* ── KPI Cards — 2 rows of 4 ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          title="Total Contacts"
          value={stats.totalContacts}
          icon="users"
          color="#3b82f6"
          variant="clean"
        />
        <KpiCard
          title="Active Contacts"
          value={stats.activeContacts}
          icon="user-check"
          color="#10b981"
          variant="clean"
        />
        <KpiCard
          title="Verified Contacts"
          value={stats.verifiedContacts}
          icon="shield-check"
          color="#06b6d4"
          variant="clean"
        />
        <KpiCard
          title="Not Verified"
          value={stats.notVerifiedContacts}
          icon="shield-alert"
          color="#ef4444"
          variant="clean"
        />
        <KpiCard
          title="Total Organizations"
          value={stats.totalOrganizations}
          icon="building"
          color="#8b5cf6"
          variant="clean"
        />
        <KpiCard
          title="Verified Orgs"
          value={stats.verifiedOrganizations}
          icon="building-2"
          color="#14b8a6"
          variant="clean"
        />
        <KpiCard
          title="Total Customers"
          value={stats.totalCustomers}
          icon="crown"
          color="#f59e0b"
          variant="clean"
        />
        <KpiCard
          title="Inactive Contacts"
          value={stats.inactiveContacts}
          icon="user-x"
          color="#f97316"
          variant="clean"
        />
      </div>

      {/* ── Charts Row 1 — Verification Pie + Industry Bar ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Verification Status */}
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Contact Verification Status</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={verificationPie}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={50}
                label={((props: any) => `${props.name}: ${props.value}`) as any}
              >
                {verificationPie.map((entry, i) => (
                  <Cell key={`v-${i}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Industry Wise Customers */}
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Customers by Industry</h3>
          {industryWise.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={industryWise} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="industry" type="category" tick={{ fontSize: 11 }} width={120} />
                <Tooltip />
                <Bar dataKey="count" name="Customers">
                  {industryWise.map((_e, i) => (
                    <Cell key={`ind-${i}`} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart message="No industry data available" />
          )}
        </div>
      </div>

      {/* ── Charts Row 2 — Source Pie + Verification Trend ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campaign Source Wise */}
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Contacts by Source / Campaign</h3>
          {sourceWise.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={sourceWise}
                  dataKey="count"
                  nameKey="source"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={((props: any) => `${props.source} (${props.percentage}%)`) as any}
                >
                  {sourceWise.map((_e, i) => (
                    <Cell key={`src-${i}`} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart message="No source data available" />
          )}
        </div>

        {/* Verification Trend */}
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Verification Trend</h3>
          {verificationTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={verificationTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="verified" stackId="1" stroke="#10b981" fill="#10b98140" name="Verified" />
                <Area type="monotone" dataKey="unverified" stackId="1" stroke="#ef4444" fill="#ef444440" name="Unverified" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart message="No verification trend data" />
          )}
        </div>
      </div>

      {/* ── Charts Row 3 — Organization Verification + Department Wise ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Organization Verification */}
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Organization Verification</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={orgPie}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={50}
                label={((props: any) => `${props.name}: ${props.value}`) as any}
              >
                {orgPie.map((entry, i) => (
                  <Cell key={`org-${i}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Department Wise */}
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Contacts by Department</h3>
          {departmentWise.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={departmentWise}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" name="Contacts">
                  {departmentWise.map((_e, i) => (
                    <Cell key={`dept-${i}`} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart message="No department data available" />
          )}
        </div>
      </div>

      {/* ── Recent Contacts Table ── */}
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
                      <td className="py-2.5 font-medium text-gray-800">
                        {c.firstName} {c.lastName}
                      </td>
                      <td className="py-2.5 text-gray-600">{c.designation ?? "-"}</td>
                      <td className="py-2.5 text-gray-600">{c.department ?? "-"}</td>
                      <td className="py-2.5 text-gray-600">{org?.name ?? "-"}</td>
                      <td className="py-2.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                            c.entityVerificationStatus === "VERIFIED"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {c.entityVerificationStatus === "VERIFIED" ? "Verified" : "Not Verified"}
                        </span>
                      </td>
                      <td className="py-2.5">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            c.isActive ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {c.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyChart message="No recent contacts" />
        )}
      </div>
    </div>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-[280px] text-gray-400 text-sm">
      {message}
    </div>
  );
}
