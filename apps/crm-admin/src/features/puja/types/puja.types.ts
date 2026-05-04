export type ReligionCode =
  | 'HINDU' | 'SIKH' | 'JAIN' | 'BUDDHIST'
  | 'MUSLIM' | 'CHRISTIAN' | 'UNIVERSAL';

export interface ReligiousModeConfig {
  enabled: boolean;
  religion: ReligionCode;
  deity: string;
  officeHours: { from: string; to: string };
  allowedFor: 'ADMIN_ONLY' | 'ALL_USERS' | 'SELECTED_ROLES';
  allowedRoleIds: string[];
  greeting: { primary: string; secondary: string };
  pujaItems: string[];
  soundEnabled: boolean;
  autoCloseAfterSeconds: number;
  showOncePerDay: boolean;
  festivalMode: boolean;
}

export interface PujaStatusResponse {
  show: boolean;
  config?: ReligiousModeConfig;
}

export interface DeityPreset {
  code: string;
  name: string;
  nameHi: string;
  greeting: string;
  emoji: string;
}

export interface ReligionPreset {
  label: string;
  labelHi: string;
  deities: DeityPreset[];
  pujaItems: string[];
  defaultSound: string;
}

export interface PujaItemMeta {
  name: string;
  nameHi: string;
  icon: string;
  sound: string;
}

export const PUJA_ITEMS_META: Record<string, PujaItemMeta> = {
  DEEP:       { name: 'Deep (Diya)', nameHi: 'दीप', icon: '🪔', sound: 'bell_chime' },
  AGARBATTI:  { name: 'Agarbatti', nameHi: 'अगरबत्ती', icon: '🧎', sound: 'soft_chime' },
  CHANDAN:    { name: 'Chandan', nameHi: 'चंदन', icon: '🌀', sound: 'om_chant' },
  PRASAD:     { name: 'Prasad', nameHi: 'प्रसाद', icon: '🍚', sound: 'aarti_bell' },
  PHOOL:      { name: 'Phool', nameHi: 'फूल', icon: '🌸', sound: 'temple_bell' },
  AARTI:      { name: 'Aarti', nameHi: 'आरती', icon: '🔥', sound: 'aarti_bell' },
  RICE:       { name: 'Akshat', nameHi: 'अक्षत', icon: '🌾', sound: 'bell_chime' },
  MEDITATION: { name: 'Meditation', nameHi: 'ध्यान', icon: '🧘', sound: 'om_chant' },
  CANDLE:     { name: 'Candle', nameHi: 'मोमबत्ती', icon: '🕯️', sound: 'bell_chime' },
  PRAYER:     { name: 'Prayer', nameHi: 'प्रार्थना', icon: '🙏', sound: 'soft_chime' },
  DUA:        { name: 'Dua', nameHi: 'दुआ', icon: '🤲', sound: 'soft_chime' },
  TASBIH:     { name: 'Tasbih', nameHi: 'तस्बीह', icon: '📿', sound: 'soft_chime' },
  ARDAS:      { name: 'Ardas', nameHi: 'अरदास', icon: '🙏', sound: 'soft_chime' },
  WATER:      { name: 'Jal', nameHi: 'जल', icon: '💧', sound: 'soft_chime' },
};

export const PUJA_SESSION_KEY = 'puja_last_shown';
