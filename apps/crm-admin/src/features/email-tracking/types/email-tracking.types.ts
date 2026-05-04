// ---------------------------------------------------------------------------
// Email Tracking Types
// ---------------------------------------------------------------------------

export interface EmailTrackingEvent {
  id: string;
  emailId: string;
  eventType: "OPEN" | "CLICK" | "BOUNCE";
  recipientEmail?: string;
  subject?: string;
  clickedUrl?: string;
  ipAddress?: string;
  userAgent?: string;
  bounceType?: string;
  bounceReason?: string;
  createdAt: string;
}

export interface EmailTrackingSummary {
  totalSent: number;
  totalOpened: number;
  totalClicked: number;
  totalBounced: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  eventsByDay: { date: string; opens: number; clicks: number; bounces: number }[];
}

export interface EmailTrackingFilters {
  emailId?: string;
  eventType?: "OPEN" | "CLICK" | "BOUNCE";
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}
