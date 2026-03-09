export interface AnalyticsOverview {
  totalRevenue: number;
  revenueGrowth: number;
  totalOrders: number;
  ordersGrowth: number;
  averageOrderValue: number;
  activeListings: number;
  listingViews: number;
  viewsGrowth: number;
  newEnquiries: number;
  enquiryConversionRate: number;
  avgResponseTime: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
}

export interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
}

export interface ListingPerformance {
  listingId: string;
  title: string;
  mediaUrl?: string;
  views: number;
  enquiries: number;
  orders: number;
  revenue: number;
  conversionRate: number;
}
