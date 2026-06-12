export type TimePeriod = "morning" | "working" | "afternoon" | "evening" | "night";
export type EventPhase = "none" | "newyear" | "diwali" | "product-launch";

export function getTimePeriod(hour?: number): TimePeriod {
  const h = hour ?? new Date().getHours();
  if (h >= 5 && h < 9) return "morning";
  if (h >= 9 && h < 12) return "working";
  if (h >= 12 && h < 17) return "afternoon";
  if (h >= 17 && h < 20) return "evening";
  return "night";
}

export function getGreeting(period: TimePeriod): string {
  switch (period) {
    case "morning":
      return "Good Morning";
    case "working":
      return "Welcome Back";
    case "afternoon":
      return "Good Afternoon";
    case "evening":
      return "Good Evening";
    case "night":
      return "Good Night";
  }
}

// ── Event Phase Detection ───────────────────────────────

interface EventConfig {
  phase: Exclude<EventPhase, "none">;
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
}

const EVENT_CALENDAR: EventConfig[] = [
  { phase: "newyear", startMonth: 12, startDay: 28, endMonth: 1, endDay: 3 },
  { phase: "diwali", startMonth: 10, startDay: 20, endMonth: 11, endDay: 5 },
];

export function getEventPhase(): EventPhase {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  for (const e of EVENT_CALENDAR) {
    if (e.startMonth > e.endMonth) {
      // Spans year boundary (e.g. Dec → Jan)
      if (
        (month > e.startMonth || (month === e.startMonth && day >= e.startDay)) ||
        (month < e.endMonth || (month === e.endMonth && day <= e.endDay))
      ) return e.phase;
    } else {
      if (
        (month > e.startMonth || (month === e.startMonth && day >= e.startDay)) &&
        (month < e.endMonth || (month === e.endMonth && day <= e.endDay))
      ) return e.phase;
    }
  }
  return "none";
}

// ── Background Image URLs ───────────────────────────────

export interface PhaseImages {
  primary: string;
  secondary: string;
}

const UQ = "auto=format&fit=crop&w=1920&q=75";

const PERIOD_IMAGES: Record<TimePeriod, PhaseImages> = {
  morning: {
    primary:   `https://images.unsplash.com/photo-1502082553048-f009c37129b9?${UQ}`,
    secondary: `https://images.unsplash.com/photo-1441974231531-c6227db76b6e?${UQ}`,
  },
  working: {
    primary:   `https://images.unsplash.com/photo-1550751827-4bd374c3f58b?${UQ}`,
    secondary: `https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?${UQ}`,
  },
  afternoon: {
    primary:   `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?${UQ}`,
    secondary: `https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?${UQ}`,
  },
  evening: {
    primary:   `https://images.unsplash.com/photo-1518837695005-2083093ee35b?${UQ}`,
    secondary: `https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?${UQ}`,
  },
  night: {
    primary:   `https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?${UQ}`,
    secondary: `https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?${UQ}`,
  },
};

const EVENT_IMAGES: Record<Exclude<EventPhase, "none">, PhaseImages> = {
  newyear: {
    primary:   `https://images.unsplash.com/photo-1546274527-9327167dc1f9?${UQ}`,
    secondary: `https://images.unsplash.com/photo-1544025162-d76694265947?${UQ}`,
  },
  diwali: {
    primary:   `https://images.unsplash.com/photo-1604525521377-6f8d4b47a5b1?${UQ}`,
    secondary: `https://images.unsplash.com/photo-1600670447636-9ec0c017d54e?${UQ}`,
  },
  "product-launch": {
    primary:   `https://images.unsplash.com/photo-1557804506-669a67965ba0?${UQ}`,
    secondary: `https://images.unsplash.com/photo-1519389950473-47ba0277781c?${UQ}`,
  },
};

export function getPhaseImages(period: TimePeriod, event: EventPhase = "none"): PhaseImages {
  if (event !== "none") return EVENT_IMAGES[event];
  return PERIOD_IMAGES[period];
}
