// Religious Mode Presets — all supported religions, deities, puja items, and festivals

export const RELIGIOUS_PRESETS = {
  HINDU: {
    label: 'Hindu',
    labelHi: 'हिन्दू',
    deities: [
      { code: 'GANPATI', name: 'Shri Ganesh', nameHi: 'श्री गणेश', greeting: 'ॐ श्री गणेशाय नमः', emoji: '🐘' },
      { code: 'SHIVA', name: 'Lord Shiva', nameHi: 'भगवान शिव', greeting: 'ॐ नमः शिवाय', emoji: '🔱' },
      { code: 'LAKSHMI', name: 'Goddess Lakshmi', nameHi: 'देवी लक्ष्मी', greeting: 'ॐ श्रीं महालक्ष्म्यै नमः', emoji: '🪷' },
      { code: 'SARASWATI', name: 'Goddess Saraswati', nameHi: 'देवी सरस्वती', greeting: 'ॐ ऐं सरस्वत्यै नमः', emoji: '🦢' },
      { code: 'KRISHNA', name: 'Lord Krishna', nameHi: 'भगवान कृष्ण', greeting: 'हरे कृष्ण हरे कृष्ण', emoji: '🪈' },
      { code: 'RAM', name: 'Lord Ram', nameHi: 'भगवान राम', greeting: 'जय श्री राम', emoji: '🏹' },
      { code: 'HANUMAN', name: 'Lord Hanuman', nameHi: 'बजरंगबली', greeting: 'जय बजरंग बली', emoji: '🙏' },
    ],
    pujaItems: ['DEEP', 'AGARBATTI', 'CHANDAN', 'PRASAD', 'PHOOL', 'AARTI'],
    defaultSound: 'temple_bell',
  },
  SIKH: {
    label: 'Sikh',
    labelHi: 'सिख',
    deities: [
      { code: 'IK_ONKAR', name: 'Ik Onkar', nameHi: 'ੴ', greeting: 'ਵਾਹਿਗੁਰੂ ਜੀ ਕਾ ਖ਼ਾਲਸਾ', emoji: '☬' },
      { code: 'GURU_NANAK', name: 'Guru Nanak Dev Ji', nameHi: 'ਗੁਰੂ ਨਾਨਕ', greeting: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ', emoji: '🕯️' },
    ],
    pujaItems: ['DEEP', 'ARDAS', 'PRASAD', 'PHOOL'],
    defaultSound: 'bell_chime',
  },
  JAIN: {
    label: 'Jain',
    labelHi: 'जैन',
    deities: [
      { code: 'MAHAVIR', name: 'Lord Mahavir', nameHi: 'भगवान महावीर', greeting: 'णमो अरिहंताणं', emoji: '🕉️' },
    ],
    pujaItems: ['DEEP', 'CHANDAN', 'PHOOL', 'RICE'],
    defaultSound: 'bell_chime',
  },
  BUDDHIST: {
    label: 'Buddhist',
    labelHi: 'बौद्ध',
    deities: [
      { code: 'BUDDHA', name: 'Lord Buddha', nameHi: 'भगवान बुद्ध', greeting: 'बुद्धं शरणं गच्छामि', emoji: '☸️' },
    ],
    pujaItems: ['DEEP', 'AGARBATTI', 'PHOOL', 'MEDITATION'],
    defaultSound: 'bell_chime',
  },
  MUSLIM: {
    label: 'Muslim',
    labelHi: 'मुस्लिम',
    deities: [
      { code: 'BISMILLAH', name: 'Bismillah', nameHi: 'بِسْمِ ٱللَّٰهِ', greeting: 'بِسْمِ ٱللَّٰهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ', emoji: '🌙' },
    ],
    pujaItems: ['DUA', 'TASBIH'],
    defaultSound: 'bell_chime',
  },
  CHRISTIAN: {
    label: 'Christian',
    labelHi: 'ईसाई',
    deities: [
      { code: 'CROSS', name: 'Holy Cross', nameHi: 'पवित्र क्रॉस', greeting: 'In the name of the Father', emoji: '✝️' },
      { code: 'CANDLE', name: 'Prayer Candle', nameHi: 'प्रार्थना मोमबत्ती', greeting: 'Lord, guide our work today', emoji: '🕯️' },
    ],
    pujaItems: ['CANDLE', 'PRAYER', 'PHOOL'],
    defaultSound: 'bell_chime',
  },
  UNIVERSAL: {
    label: 'Universal / Spiritual',
    labelHi: 'सार्वभौमिक',
    deities: [
      { code: 'OM', name: 'Om', nameHi: 'ॐ', greeting: 'Peace and prosperity to all', emoji: '🕉️' },
      { code: 'EARTH', name: 'Mother Earth', nameHi: 'धरती माँ', greeting: 'May today bring success', emoji: '🌍' },
    ],
    pujaItems: ['DEEP', 'PHOOL', 'MEDITATION'],
    defaultSound: 'bell_chime',
  },
} as const;

export type ReligionCode = keyof typeof RELIGIOUS_PRESETS;

export const PUJA_ITEMS = {
  DEEP:       { name: 'Deep (Diya)', nameHi: 'दीप', icon: '🪔', sound: 'bell_chime' },
  AGARBATTI:  { name: 'Agarbatti', nameHi: 'अगरबत्ती', icon: '🧎', sound: 'soft_chime' },
  CHANDAN:    { name: 'Chandan (Tilak)', nameHi: 'चंदन', icon: '🌀', sound: 'om_chant' },
  PRASAD:     { name: 'Prasad', nameHi: 'प्रसाद', icon: '🍚', sound: 'aarti_bell' },
  PHOOL:      { name: 'Phool (Flowers)', nameHi: 'फूल', icon: '🌸', sound: 'temple_bell' },
  AARTI:      { name: 'Aarti', nameHi: 'आरती', icon: '🔥', sound: 'aarti_bell' },
  RICE:       { name: 'Akshat (Rice)', nameHi: 'अक्षत', icon: '🌾', sound: 'bell_chime' },
  MEDITATION: { name: 'Meditation', nameHi: 'ध्यान', icon: '🧘', sound: 'om_chant' },
  CANDLE:     { name: 'Candle', nameHi: 'मोमबत्ती', icon: '🕯️', sound: 'bell_chime' },
  PRAYER:     { name: 'Prayer', nameHi: 'प्रार्थना', icon: '🙏', sound: 'soft_chime' },
  DUA:        { name: 'Dua', nameHi: 'दुआ', icon: '🤲', sound: 'soft_chime' },
  TASBIH:     { name: 'Tasbih', nameHi: 'तस्बीह', icon: '📿', sound: 'soft_chime' },
  ARDAS:      { name: 'Ardas', nameHi: 'अरदास', icon: '🙏', sound: 'soft_chime' },
  WATER:      { name: 'Jal (Water)', nameHi: 'जल', icon: '💧', sound: 'soft_chime' },
} as const;

export type PujaItemCode = keyof typeof PUJA_ITEMS;

export const DEFAULT_RELIGIOUS_MODE_CONFIG = {
  enabled: false,
  religion: 'HINDU' as ReligionCode,
  deity: 'GANPATI',
  officeHours: { from: '09:00', to: '18:00' },
  allowedFor: 'ALL_USERS' as 'ADMIN_ONLY' | 'ALL_USERS' | 'SELECTED_ROLES',
  allowedRoleIds: [] as string[],
  greeting: {
    primary: 'ॐ श्री गणेशाय नमः',
    secondary: 'शुभ प्रभात! 🙏',
  },
  pujaItems: ['DEEP', 'AGARBATTI', 'CHANDAN', 'PRASAD', 'PHOOL'] as PujaItemCode[],
  soundEnabled: true,
  autoCloseAfterSeconds: 8,
  showOncePerDay: true,
  festivalMode: true,
};

export type ReligiousModeConfig = typeof DEFAULT_RELIGIOUS_MODE_CONFIG;
