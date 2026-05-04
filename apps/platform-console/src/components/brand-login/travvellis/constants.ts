export type TravelPhase = {
  id: string;
  label: string;
  timeLabel: string;
  skyStart: string;
  skyEnd: string;
  accentColor: string;
  stampText: string;
};

export const TRAVEL_PHASES: TravelPhase[] = [
  {
    id: 'dawn_departure',
    label: 'Dawn Departure',
    timeLabel: '05:30',
    skyStart: '#1a1040',
    skyEnd: '#f97316',
    accentColor: '#f97316',
    stampText: 'DEPARTED',
  },
  {
    id: 'morning_flight',
    label: 'Morning Flight',
    timeLabel: '08:00',
    skyStart: '#60a5fa',
    skyEnd: '#e0f2fe',
    accentColor: '#3b82f6',
    stampText: 'IN TRANSIT',
  },
  {
    id: 'midday_arrival',
    label: 'Midday Arrival',
    timeLabel: '12:00',
    skyStart: '#0ea5e9',
    skyEnd: '#bae6fd',
    accentColor: '#0ea5e9',
    stampText: 'ARRIVED',
  },
  {
    id: 'afternoon_explore',
    label: 'Afternoon Explore',
    timeLabel: '15:30',
    skyStart: '#fbbf24',
    skyEnd: '#fed7aa',
    accentColor: '#f59e0b',
    stampText: 'EXPLORING',
  },
  {
    id: 'evening_return',
    label: 'Evening Return',
    timeLabel: '18:30',
    skyStart: '#ef4444',
    skyEnd: '#fb923c',
    accentColor: '#ef4444',
    stampText: 'RETURNING',
  },
  {
    id: 'dusk_transit',
    label: 'Dusk Transit',
    timeLabel: '20:00',
    skyStart: '#6d28d9',
    skyEnd: '#db2777',
    accentColor: '#8b5cf6',
    stampText: 'TRANSIT',
  },
  {
    id: 'night_rest',
    label: 'Night Rest',
    timeLabel: '23:00',
    skyStart: '#0f172a',
    skyEnd: '#1e1b4b',
    accentColor: '#818cf8',
    stampText: 'CHECKED IN',
  },
];

export const PHASE_DURATION_S = 14; // seconds per phase
export const TOTAL_DURATION_S = TRAVEL_PHASES.length * PHASE_DURATION_S;

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function clamp(v: number, min: number, max: number): number {
  return Math.min(Math.max(v, min), max);
}

export function smoothstep(t: number): number {
  const c = clamp(t, 0, 1);
  return c * c * (3 - 2 * c);
}

export function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function lerpColor(a: string, b: string, t: number): string {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  const s = smoothstep(t);
  const r = Math.round(lerp(ar, br, s));
  const g = Math.round(lerp(ag, bg, s));
  const bv = Math.round(lerp(ab, bb, s));
  return `rgb(${r},${g},${bv})`;
}
