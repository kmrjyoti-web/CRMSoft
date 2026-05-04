"use client";
import { useState } from "react";
import { Icon } from "@/components/ui";
import { DashboardCard } from "@/features/dashboard/components/DashboardCard";
import { HorizontalBarList } from "@/features/dashboard/components/HorizontalBarList";
import { AnalyticsFunnel } from "./AnalyticsFunnel";
import { useEntityAnalytics } from "../hooks/useMarketplace";

type EntityType = 'LISTING' | 'POST' | 'OFFER';

export function MarketplaceAnalyticsPage() {
  const [entityType, setEntityType] = useState<EntityType>('LISTING');
  const [entityId, setEntityId] = useState('');
  const [searchId, setSearchId] = useState('');

  const { data: analyticsData, isLoading } = useEntityAnalytics(entityType, searchId);

  const analytics = (analyticsData as { data?: unknown })?.data as
    | {
        impressions?: number;
        clicks?: number;
        enquiries?: number;
        leads?: number;
        orders?: number;
        topCities?: { city: string; count: number }[];
        deviceBreakdown?: Record<string, number>;
        ctr?: number;
        enquiryRate?: number;
        orderConversionRate?: number;
      }
    | undefined;

  const cityBarItems =
    analytics?.topCities?.map((c, i) => ({
      label: c.city,
      value: c.count,
      color: ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ec4899'][i % 5],
    })) ?? [];

  const deviceBarItems = analytics?.deviceBreakdown
    ? Object.entries(analytics.deviceBreakdown).map(([device, count], i) => ({
        label: device,
        value: count,
        color: ['#6366f1', '#3b82f6', '#10b981'][i % 3],
      }))
    : [];

  const handleSearch = () => {
    if (entityId.trim()) {
      setSearchId(entityId.trim());
    }
  };

  return (
    <div className="h-full flex flex-col">
      <header className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white shadow-sm">
        <h1 className="text-lg font-semibold text-gray-900">Entity Analytics</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-gray-50">
        {/* Search bar */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Drill Down by Entity</h2>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="text-xs text-gray-500 font-medium block mb-1.5">Entity Type</label>
              <select
                value={entityType}
                onChange={(e) => setEntityType(e.target.value as EntityType)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              >
                <option value="LISTING">Listing</option>
                <option value="POST">Post</option>
                <option value="OFFER">Offer</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-500 font-medium block mb-1.5">Entity ID</label>
              <input
                type="text"
                value={entityId}
                onChange={(e) => setEntityId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Paste entity UUID..."
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={!entityId.trim()}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg"
            >
              <Icon name="search" size={15} />
              Analyze
            </button>
          </div>
        </div>

        {/* Analytics results */}
        {searchId && (
          <>
            {isLoading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse h-64" />
                ))}
              </div>
            ) : analytics ? (
              <>
                {/* Summary row */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {[
                    { label: 'Impressions', value: analytics.impressions ?? 0, color: '#6366f1' },
                    { label: 'Clicks', value: analytics.clicks ?? 0, color: '#3b82f6' },
                    { label: 'Enquiries', value: analytics.enquiries ?? 0, color: '#f59e0b' },
                    { label: 'Leads', value: analytics.leads ?? 0, color: '#10b981' },
                    { label: 'Orders', value: analytics.orders ?? 0, color: '#ec4899' },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center"
                    >
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">{s.label}</p>
                      <p className="text-2xl font-bold mt-1" style={{ color: s.color }}>
                        {s.value.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Funnel + City + Device */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  <DashboardCard title="Conversion Funnel" badge={`${entityType}: ${searchId.substring(0, 8)}...`}>
                    <AnalyticsFunnel
                      impressions={analytics.impressions ?? 0}
                      clicks={analytics.clicks ?? 0}
                      enquiries={analytics.enquiries ?? 0}
                      leads={analytics.leads ?? 0}
                      orders={analytics.orders ?? 0}
                    />
                  </DashboardCard>

                  <DashboardCard title="Top Cities" badge="Geo Breakdown">
                    {cityBarItems.length > 0 ? (
                      <HorizontalBarList items={cityBarItems} />
                    ) : (
                      <div className="h-32 flex items-center justify-center text-sm text-gray-400">
                        No geo data
                      </div>
                    )}
                  </DashboardCard>

                  <DashboardCard title="Device Breakdown">
                    {deviceBarItems.length > 0 ? (
                      <HorizontalBarList items={deviceBarItems} barColor="#6366f1" />
                    ) : (
                      <div className="h-32 flex items-center justify-center text-sm text-gray-400">
                        No device data
                      </div>
                    )}
                  </DashboardCard>
                </div>

                {/* Rate metrics */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Click-Through Rate', value: `${((analytics.ctr ?? 0) * 100).toFixed(2)}%` },
                    { label: 'Enquiry Rate', value: `${((analytics.enquiryRate ?? 0) * 100).toFixed(2)}%` },
                    {
                      label: 'Order Conversion Rate',
                      value: `${((analytics.orderConversionRate ?? 0) * 100).toFixed(2)}%`,
                    },
                  ].map((m) => (
                    <div key={m.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">{m.label}</p>
                      <p className="text-xl font-bold text-gray-900 mt-1">{m.value}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="bg-white rounded-xl border border-gray-100 p-10 text-center text-gray-400 text-sm">
                No analytics data found for this entity
              </div>
            )}
          </>
        )}

        {!searchId && (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <Icon name="bar-chart-2" size={40} color="#d1d5db" />
            <p className="text-gray-400 text-sm mt-3">Enter an entity ID above to view analytics</p>
          </div>
        )}
      </div>
    </div>
  );
}
