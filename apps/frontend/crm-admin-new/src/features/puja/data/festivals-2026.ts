import type { ReligionCode } from "../types/puja.types";

export interface Festival {
  name: string;
  nameHi: string;
  date: string;          // ISO yyyy-mm-dd
  religion: ReligionCode;
  icon: string;
  greeting: string;
  description: string;
}

export const FESTIVALS_2026: Festival[] = [
  // ── HINDU ───────────────────────────────────────────────────────────────
  {
    name: "Makar Sankranti",   nameHi: "मकर संक्रांति",
    date: "2026-01-14",        religion: "HINDU",
    icon: "🪁",               greeting: "Happy Makar Sankranti!",
    description: "Harvest festival — kite-flying & sesame sweets",
  },
  {
    name: "Vasant Panchami",   nameHi: "वसंत पंचमी",
    date: "2026-01-25",        religion: "HINDU",
    icon: "🦢",               greeting: "Jai Maa Saraswati!",
    description: "Saraswati Puja — worship of knowledge & arts",
  },
  {
    name: "Mahashivratri",     nameHi: "महाशिवरात्रि",
    date: "2026-02-26",        religion: "HINDU",
    icon: "🔱",               greeting: "Har Har Mahadev!",
    description: "Night of Shiva — fasting & all-night vigil",
  },
  {
    name: "Holi",              nameHi: "होली",
    date: "2026-03-03",        religion: "HINDU",
    icon: "🎨",               greeting: "Happy Holi! 🌈",
    description: "Festival of colours — victory of good over evil",
  },
  {
    name: "Ram Navami",        nameHi: "राम नवमी",
    date: "2026-03-27",        religion: "HINDU",
    icon: "🏹",               greeting: "Jai Shri Ram!",
    description: "Birthday of Lord Rama",
  },
  {
    name: "Hanuman Jayanti",   nameHi: "हनुमान जयंती",
    date: "2026-04-10",        religion: "HINDU",
    icon: "🐒",               greeting: "Jai Bajrang Bali!",
    description: "Birthday of Lord Hanuman",
  },
  {
    name: "Akshaya Tritiya",   nameHi: "अक्षय तृतीया",
    date: "2026-04-20",        religion: "HINDU",
    icon: "✨",               greeting: "Happy Akshaya Tritiya!",
    description: "Auspicious day for new beginnings & gold buying",
  },
  {
    name: "Guru Purnima",      nameHi: "गुरु पूर्णिमा",
    date: "2026-07-11",        religion: "HINDU",
    icon: "🙏",               greeting: "Happy Guru Purnima!",
    description: "Celebration of teachers and gurus",
  },
  {
    name: "Raksha Bandhan",    nameHi: "रक्षा बंधन",
    date: "2026-08-09",        religion: "HINDU",
    icon: "🪢",               greeting: "Happy Raksha Bandhan!",
    description: "Festival of siblings — tying rakhi",
  },
  {
    name: "Janmashtami",       nameHi: "जन्माष्टमी",
    date: "2026-08-16",        religion: "HINDU",
    icon: "🪈",               greeting: "Happy Janmashtami! Jai Shri Krishna!",
    description: "Birthday of Lord Krishna",
  },
  {
    name: "Ganesh Chaturthi",  nameHi: "गणेश चतुर्थी",
    date: "2026-08-31",        religion: "HINDU",
    icon: "🐘",               greeting: "Ganpati Bappa Morya!",
    description: "10-day celebration of Lord Ganesha",
  },
  {
    name: "Navratri begins",   nameHi: "नवरात्रि",
    date: "2026-10-08",        religion: "HINDU",
    icon: "🪷",               greeting: "Jai Mata Di!",
    description: "Nine nights of Durga worship",
  },
  {
    name: "Dussehra",          nameHi: "दशहरा",
    date: "2026-10-17",        religion: "HINDU",
    icon: "🏹",               greeting: "Happy Dussehra!",
    description: "Victory of Rama over Ravana",
  },
  {
    name: "Diwali",            nameHi: "दीपावली",
    date: "2026-10-28",        religion: "HINDU",
    icon: "🪔",               greeting: "Happy Diwali! Shubh Deepawali!",
    description: "Festival of lights — Lakshmi Puja",
  },
  {
    name: "Chhath Puja",       nameHi: "छठ पूजा",
    date: "2026-11-01",        religion: "HINDU",
    icon: "🌅",               greeting: "Happy Chhath Puja!",
    description: "Sun worship — offering to Surya Dev",
  },

  // ── SIKH ────────────────────────────────────────────────────────────────
  {
    name: "Guru Gobind Singh Jayanti",  nameHi: "गुरु गोबिंद सिंह जयंती",
    date: "2026-01-05",                 religion: "SIKH",
    icon: "☬",                         greeting: "Waheguru Ji Ka Khalsa!",
    description: "Birthday of the 10th Sikh Guru",
  },
  {
    name: "Baisakhi",          nameHi: "बैसाखी",
    date: "2026-04-14",        religion: "SIKH",
    icon: "🌾",               greeting: "Happy Baisakhi!",
    description: "Harvest festival & founding of the Khalsa",
  },
  {
    name: "Guru Nanak Jayanti",nameHi: "गुरु नानक जयंती",
    date: "2026-11-24",        religion: "SIKH",
    icon: "🕯️",              greeting: "Waheguru Ji Ka Khalsa!",
    description: "Birthday of Guru Nanak Dev Ji",
  },

  // ── JAIN ────────────────────────────────────────────────────────────────
  {
    name: "Paryushana Parva",  nameHi: "पर्यूषण पर्व",
    date: "2026-08-25",        religion: "JAIN",
    icon: "🕉️",               greeting: "Michhami Dukkadam",
    description: "8-day festival of forgiveness and self-purification",
  },
  {
    name: "Mahavir Jayanti",   nameHi: "महावीर जयंती",
    date: "2026-04-09",        religion: "JAIN",
    icon: "🦁",               greeting: "Happy Mahavir Jayanti!",
    description: "Birthday of Lord Mahavira — 24th Tirthankara",
  },

  // ── BUDDHIST ────────────────────────────────────────────────────────────
  {
    name: "Buddha Purnima",    nameHi: "बुद्ध पूर्णिमा",
    date: "2026-05-12",        religion: "BUDDHIST",
    icon: "☸️",               greeting: "Happy Buddha Purnima!",
    description: "Birth, enlightenment & death of Gautama Buddha",
  },

  // ── MUSLIM ──────────────────────────────────────────────────────────────
  {
    name: "Eid ul-Fitr",       nameHi: "ईद उल-फ़ित्र",
    date: "2026-03-20",        religion: "MUSLIM",
    icon: "🌙",               greeting: "Eid Mubarak!",
    description: "Festival marking the end of Ramadan",
  },
  {
    name: "Eid ul-Adha",       nameHi: "ईद उल-अज़हा",
    date: "2026-05-27",        religion: "MUSLIM",
    icon: "🌙",               greeting: "Eid Mubarak! Bakra Eid ki shubhkamnayein!",
    description: "Festival of sacrifice",
  },
  {
    name: "Muharram",          nameHi: "मुहर्रम",
    date: "2026-07-17",        religion: "MUSLIM",
    icon: "🤲",               greeting: "Muharram Mubarak",
    description: "Islamic New Year — solemn remembrance",
  },

  // ── CHRISTIAN ───────────────────────────────────────────────────────────
  {
    name: "Christmas",         nameHi: "क्रिसमस",
    date: "2026-12-25",        religion: "CHRISTIAN",
    icon: "✝️",               greeting: "Merry Christmas!",
    description: "Birth of Jesus Christ",
  },
  {
    name: "Good Friday",       nameHi: "गुड फ्राइडे",
    date: "2026-04-03",        religion: "CHRISTIAN",
    icon: "✝️",               greeting: "Blessed Good Friday",
    description: "Crucifixion of Jesus Christ",
  },
  {
    name: "Easter",            nameHi: "ईस्टर",
    date: "2026-04-05",        religion: "CHRISTIAN",
    icon: "✝️",               greeting: "Happy Easter!",
    description: "Resurrection of Jesus Christ",
  },
];

/** Get festivals for a specific date (yyyy-mm-dd) */
export function getFestivalsForDate(date: string): Festival[] {
  return FESTIVALS_2026.filter((f) => f.date === date);
}

/** Get the next upcoming festival from today */
export function getNextFestival(today: string): Festival | null {
  const sorted = FESTIVALS_2026
    .filter((f) => f.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
  return sorted[0] ?? null;
}

/** Get festivals within the next N days */
export function getUpcomingFestivals(today: string, days = 30): Festival[] {
  const future = new Date(today);
  future.setDate(future.getDate() + days);
  const futureStr = future.toISOString().split("T")[0];
  return FESTIVALS_2026
    .filter((f) => f.date >= today && f.date <= futureStr)
    .sort((a, b) => a.date.localeCompare(b.date));
}
