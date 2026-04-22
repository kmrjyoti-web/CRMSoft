// ── Enums ────────────────────────────────────────────────

export type TargetPeriod = "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY";
export type TargetMetric = "LEADS_CREATED" | "LEADS_CONVERTED" | "REVENUE" | "CALLS" | "MEETINGS" | "QUOTATIONS" | "ACTIVITIES";

// ── Entities ─────────────────────────────────────────────

export interface Target {
  id: string;
  name: string;
  description?: string;
  metric: TargetMetric;
  period: TargetPeriod;
  targetValue: number;
  unit: string;
  scope: "INDIVIDUAL" | "TEAM" | "COMPANY";
  userId?: string;
  userName?: string;
  teamId?: string;
  teamName?: string;
  isActive: boolean;
  startDate: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TargetProgress {
  targetId: string;
  targetName: string;
  metric: TargetMetric;
  period: TargetPeriod;
  targetValue: number;
  currentValue: number;
  achievementPercent: number;
  remaining: number;
  daysRemaining: number;
  trend: "UP" | "DOWN" | "FLAT";
  trendPercent: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  department?: string;
  leadsCreated: number;
  leadsConverted: number;
  revenue: number;
  activities: number;
  score: number;
  previousRank?: number;
  change: "UP" | "DOWN" | "SAME";
}

export interface TeamPerformance {
  totalLeads: number;
  convertedLeads: number;
  conversionRate: number;
  totalRevenue: number;
  totalActivities: number;
  byMember: { userId: string; userName: string; leads: number; conversions: number; revenue: number }[];
  byPeriod: { period: string; leads: number; conversions: number; revenue: number }[];
}

// ── DTOs ─────────────────────────────────────────────────

export interface CreateTargetDto {
  name: string;
  description?: string;
  metric: TargetMetric;
  period: TargetPeriod;
  targetValue: number;
  unit: string;
  scope: "INDIVIDUAL" | "TEAM" | "COMPANY";
  userId?: string;
  teamId?: string;
  startDate: string;
  endDate?: string;
}
