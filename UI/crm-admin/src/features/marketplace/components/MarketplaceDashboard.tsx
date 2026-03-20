"use client";
import { useMemo } from "react";
import { StatCard } from "@/features/dashboard/components/StatCard";
import { DashboardCard } from "@/features/dashboard/components/DashboardCard";
import { HorizontalBarList } from "@/features/dashboard/components/HorizontalBarList";
import { ActivityFeed } from "@/features/dashboard/components/ActivityFeed";
import { AnalyticsFunnel } from "./AnalyticsFunnel";
import { useMarketplaceDashboard } from "../hooks/useMarketplace";
import type { MarketplaceDashboardStats } from "../types/marketplace.types";

function DashboardSkeleton() {
  return (
    <div className="p-5 space-y-5 bg-gray-50 flex-1">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse">
            <div className="w-12 h-12 bg-gray-200 rounded-full mb-3" />
            <div className="h-3 bg-gray-200 rounded w-20 mb-2" />
            <div className="h-7 bg-gray-200 rounded w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}

const EMPTY_STATS: MarketplaceDashboardStats = {
  activeListings: 0,
  activePosts: 0,
  activeOffers: 0,
  pendingReviews: 0,
  totalEnquiries: 0,
  totalOrders: 0,
  totalRevenue: 0,
  topPosts: [],
  topListings: [],
  funnel: { impressions: 0, clicks: 0, enquiries: 0, leads: 0, orders: 0 },
  revenueByOfferType: [],
};

export function MarketplaceDashboardPage() {
  const { data: dashData, isLoading } = useMarketplaceDashboard();

  const stats: MarketplaceDashboardStats = (dashData as { data?: MarketplaceDashboardStats })?.data ?? EMPTY_STATS;

  const revenueBarItems = useMemo(
    () =>
      (stats.revenueByOfferType ?? []).map((r, i) => ({
        label: r.offerType,
        value: Math.round(r.revenue / 100),
        color: ['#6366f1', '#3b82f6', '#10b981', '#f59e0b'][i % 4],
      })),
    [stats.revenueByOfferType],
  );

  const topPostsFeedItems = useMemo(
    () =>
      (stats.topPosts ?? []).slice(0, 5).map((p) => ({
        id: p.id,
        name: p.postType,
        subtitle: p.content ? p.content.substring(0, 60) + '...' : undefined,
        meta1: p.viewCount?.toString(),
        meta1Label: 'Views',
        meta2: p.likeCount?.toString(),
        meta2Label: 'Likes',
        badge: p.status,
        badgeColor: (p.status === 'ACTIVE' ? 'green' : 'gray') as 'green' | 'gray',
        initials: p.postType[0],
      })),
    [stats.topPosts],
  );

  return (
    <div className="h-full flex flex-col">
      <header className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white shadow-sm">
        <h1 className="text-lg font-semibold text-gray-900">Marketplace Dashboard</h1>
      </header>

      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-gray-50">
          {/* Row 1: 6 KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard title="Active Listings" value={stats.activeListings} icon="shopping-bag" iconBg="#6366f1" />
            <StatCard title="Active Posts" value={stats.activePosts} icon="file-text" iconBg="#3b82f6" />
            <StatCard title="Active Offers" value={stats.activeOffers} icon="tag" iconBg="#10b981" />
            <StatCard title="Pending Reviews" value={stats.pendingReviews} icon="star" iconBg="#f59e0b" />
            <StatCard title="Enquiries" value={stats.totalEnquiries} icon="message-circle" iconBg="#ec4899" />
            <StatCard title="Total Orders" value={stats.totalOrders} icon="package" iconBg="#14b8a6" />
          </div>

          {/* Row 2: Funnel + Top Posts + Revenue */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <DashboardCard title="Conversion Funnel" badge="All Time" badgeIcon="trending-up">
              <AnalyticsFunnel
                impressions={stats.funnel?.impressions ?? 0}
                clicks={stats.funnel?.clicks ?? 0}
                enquiries={stats.funnel?.enquiries ?? 0}
                leads={stats.funnel?.leads ?? 0}
                orders={stats.funnel?.orders ?? 0}
              />
            </DashboardCard>

            <DashboardCard title="Top Performing Posts" badge="This Week" badgeIcon="zap">
              <ActivityFeed items={topPostsFeedItems} emptyText="No posts yet" />
            </DashboardCard>

            <DashboardCard title="Revenue by Offer Type" badge="This Month" badgeIcon="bar-chart-2">
              {revenueBarItems.length > 0 ? (
                <HorizontalBarList items={revenueBarItems} barColor="#6366f1" />
              ) : (
                <div className="h-40 flex items-center justify-center text-sm text-gray-400">No revenue data</div>
              )}
            </DashboardCard>
          </div>
        </div>
      )}
    </div>
  );
}
