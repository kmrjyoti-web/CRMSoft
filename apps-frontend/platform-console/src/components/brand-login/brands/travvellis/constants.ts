export const DURATION = 100;

export interface Phase {
  key: string;
  place: string;
  sub: string;
  s: number;
  e: number;
  t: [number, number];
  warm: [number, number];
  night: [number, number];
  fg: string[];
  plane: boolean;
  bg: string;
}

export const PHASES: Phase[] = [
  { key: 'mountain', place: 'Swiss Alps',      sub: 'Dawn Trek',        s: 0,  e: 14, t: [0.25, 0.85], warm: [0.7,  0.3],  night: [0.25, 0.05], fg: ['mountain'],          plane: true,  bg: 'mountain' },
  { key: 'train',    place: 'Scottish Hills',  sub: 'Morning Express',  s: 14, e: 28, t: [0.85, 1],    warm: [0.3,  0.08], night: [0.05, 0],    fg: ['train', 'mountain'], plane: true,  bg: 'train'    },
  { key: 'balloon',  place: 'Cappadocia',      sub: 'Midday Drift',     s: 28, e: 44, t: [1,    1],    warm: [0.08, 0.05], night: [0,    0],    fg: ['balloons'],          plane: false, bg: 'balloon'  },
  { key: 'beach',    place: 'Maldives',        sub: 'Afternoon Shore',  s: 44, e: 60, t: [1,    0.95], warm: [0.05, 0.15], night: [0,    0],    fg: ['beach'],             plane: true,  bg: 'beach'    },
  { key: 'sail',     place: 'Greek Isles',     sub: 'Golden Hour',      s: 60, e: 74, t: [0.95, 0.55], warm: [0.15, 0.75], night: [0,    0.1],  fg: ['sail'],              plane: false, bg: 'sail'     },
  { key: 'desert',   place: 'Giza',            sub: 'Dusk Caravan',     s: 74, e: 86, t: [0.55, 0.22], warm: [0.75, 0.85], night: [0.1,  0.3],  fg: ['desert'],            plane: false, bg: 'desert'   },
  { key: 'night',    place: 'Around the World', sub: 'Starlit Wonders', s: 86, e: 100, t: [0.22, 0],   warm: [0.85, 0],    night: [0.3,  1],    fg: ['night'],             plane: false, bg: 'night'    },
];

const urlOf = (id: string, w = 1920, q = 80) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=${q}`;

export const PHOTOS: Record<string, string> = {
  mountain: urlOf('photo-1464822759023-fed622ff2c3b'),
  train:    urlOf('photo-1506905925346-21bda4d32df4'),
  balloon:  urlOf('photo-1500530855697-b586d89ba3ee'),
  beach:    urlOf('photo-1507525428034-b723cf961d3e'),
  sail:     urlOf('photo-1495616811223-4d98c6e9c869'),
  desert:   urlOf('photo-1509316975850-ff9c5deb0cd9'),
  night:    urlOf('photo-1419242902214-272b3f66ee7a'),
};

export const lerp = (a: number, b: number, x: number): number => a + (b - a) * x;
export const smooth = (x: number): number => x * x * (3 - 2 * x);
export const pick = (t: number): Phase =>
  PHASES.find(p => t >= p.s && t < p.e) || PHASES[PHASES.length - 1];

export function interp(time: number) {
  const p = pick(time);
  const k = smooth((time - p.s) / (p.e - p.s));
  return {
    p, k,
    t:     lerp(p.t[0],     p.t[1],     k),
    warm:  lerp(p.warm[0],  p.warm[1],  k),
    night: lerp(p.night[0], p.night[1], k),
  };
}
