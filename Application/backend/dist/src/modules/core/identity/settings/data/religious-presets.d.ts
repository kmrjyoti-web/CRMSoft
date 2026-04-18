export declare const RELIGIOUS_PRESETS: {
    readonly HINDU: {
        readonly label: "Hindu";
        readonly labelHi: "हिन्दू";
        readonly deities: readonly [{
            readonly code: "GANPATI";
            readonly name: "Shri Ganesh";
            readonly nameHi: "श्री गणेश";
            readonly greeting: "ॐ श्री गणेशाय नमः";
            readonly emoji: "🐘";
        }, {
            readonly code: "SHIVA";
            readonly name: "Lord Shiva";
            readonly nameHi: "भगवान शिव";
            readonly greeting: "ॐ नमः शिवाय";
            readonly emoji: "🔱";
        }, {
            readonly code: "LAKSHMI";
            readonly name: "Goddess Lakshmi";
            readonly nameHi: "देवी लक्ष्मी";
            readonly greeting: "ॐ श्रीं महालक्ष्म्यै नमः";
            readonly emoji: "🪷";
        }, {
            readonly code: "SARASWATI";
            readonly name: "Goddess Saraswati";
            readonly nameHi: "देवी सरस्वती";
            readonly greeting: "ॐ ऐं सरस्वत्यै नमः";
            readonly emoji: "🦢";
        }, {
            readonly code: "KRISHNA";
            readonly name: "Lord Krishna";
            readonly nameHi: "भगवान कृष्ण";
            readonly greeting: "हरे कृष्ण हरे कृष्ण";
            readonly emoji: "🪈";
        }, {
            readonly code: "RAM";
            readonly name: "Lord Ram";
            readonly nameHi: "भगवान राम";
            readonly greeting: "जय श्री राम";
            readonly emoji: "🏹";
        }, {
            readonly code: "HANUMAN";
            readonly name: "Lord Hanuman";
            readonly nameHi: "बजरंगबली";
            readonly greeting: "जय बजरंग बली";
            readonly emoji: "🙏";
        }];
        readonly pujaItems: readonly ["DEEP", "AGARBATTI", "CHANDAN", "PRASAD", "PHOOL", "AARTI"];
        readonly defaultSound: "temple_bell";
    };
    readonly SIKH: {
        readonly label: "Sikh";
        readonly labelHi: "सिख";
        readonly deities: readonly [{
            readonly code: "IK_ONKAR";
            readonly name: "Ik Onkar";
            readonly nameHi: "ੴ";
            readonly greeting: "ਵਾਹਿਗੁਰੂ ਜੀ ਕਾ ਖ਼ਾਲਸਾ";
            readonly emoji: "☬";
        }, {
            readonly code: "GURU_NANAK";
            readonly name: "Guru Nanak Dev Ji";
            readonly nameHi: "ਗੁਰੂ ਨਾਨਕ";
            readonly greeting: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ";
            readonly emoji: "🕯️";
        }];
        readonly pujaItems: readonly ["DEEP", "ARDAS", "PRASAD", "PHOOL"];
        readonly defaultSound: "bell_chime";
    };
    readonly JAIN: {
        readonly label: "Jain";
        readonly labelHi: "जैन";
        readonly deities: readonly [{
            readonly code: "MAHAVIR";
            readonly name: "Lord Mahavir";
            readonly nameHi: "भगवान महावीर";
            readonly greeting: "णमो अरिहंताणं";
            readonly emoji: "🕉️";
        }];
        readonly pujaItems: readonly ["DEEP", "CHANDAN", "PHOOL", "RICE"];
        readonly defaultSound: "bell_chime";
    };
    readonly BUDDHIST: {
        readonly label: "Buddhist";
        readonly labelHi: "बौद्ध";
        readonly deities: readonly [{
            readonly code: "BUDDHA";
            readonly name: "Lord Buddha";
            readonly nameHi: "भगवान बुद्ध";
            readonly greeting: "बुद्धं शरणं गच्छामि";
            readonly emoji: "☸️";
        }];
        readonly pujaItems: readonly ["DEEP", "AGARBATTI", "PHOOL", "MEDITATION"];
        readonly defaultSound: "bell_chime";
    };
    readonly MUSLIM: {
        readonly label: "Muslim";
        readonly labelHi: "मुस्लिम";
        readonly deities: readonly [{
            readonly code: "BISMILLAH";
            readonly name: "Bismillah";
            readonly nameHi: "بِسْمِ ٱللَّٰهِ";
            readonly greeting: "بِسْمِ ٱللَّٰهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ";
            readonly emoji: "🌙";
        }];
        readonly pujaItems: readonly ["DUA", "TASBIH"];
        readonly defaultSound: "bell_chime";
    };
    readonly CHRISTIAN: {
        readonly label: "Christian";
        readonly labelHi: "ईसाई";
        readonly deities: readonly [{
            readonly code: "CROSS";
            readonly name: "Holy Cross";
            readonly nameHi: "पवित्र क्रॉस";
            readonly greeting: "In the name of the Father";
            readonly emoji: "✝️";
        }, {
            readonly code: "CANDLE";
            readonly name: "Prayer Candle";
            readonly nameHi: "प्रार्थना मोमबत्ती";
            readonly greeting: "Lord, guide our work today";
            readonly emoji: "🕯️";
        }];
        readonly pujaItems: readonly ["CANDLE", "PRAYER", "PHOOL"];
        readonly defaultSound: "bell_chime";
    };
    readonly UNIVERSAL: {
        readonly label: "Universal / Spiritual";
        readonly labelHi: "सार्वभौमिक";
        readonly deities: readonly [{
            readonly code: "OM";
            readonly name: "Om";
            readonly nameHi: "ॐ";
            readonly greeting: "Peace and prosperity to all";
            readonly emoji: "🕉️";
        }, {
            readonly code: "EARTH";
            readonly name: "Mother Earth";
            readonly nameHi: "धरती माँ";
            readonly greeting: "May today bring success";
            readonly emoji: "🌍";
        }];
        readonly pujaItems: readonly ["DEEP", "PHOOL", "MEDITATION"];
        readonly defaultSound: "bell_chime";
    };
};
export type ReligionCode = keyof typeof RELIGIOUS_PRESETS;
export declare const PUJA_ITEMS: {
    readonly DEEP: {
        readonly name: "Deep (Diya)";
        readonly nameHi: "दीप";
        readonly icon: "🪔";
        readonly sound: "bell_chime";
    };
    readonly AGARBATTI: {
        readonly name: "Agarbatti";
        readonly nameHi: "अगरबत्ती";
        readonly icon: "🧎";
        readonly sound: "soft_chime";
    };
    readonly CHANDAN: {
        readonly name: "Chandan (Tilak)";
        readonly nameHi: "चंदन";
        readonly icon: "🌀";
        readonly sound: "om_chant";
    };
    readonly PRASAD: {
        readonly name: "Prasad";
        readonly nameHi: "प्रसाद";
        readonly icon: "🍚";
        readonly sound: "aarti_bell";
    };
    readonly PHOOL: {
        readonly name: "Phool (Flowers)";
        readonly nameHi: "फूल";
        readonly icon: "🌸";
        readonly sound: "temple_bell";
    };
    readonly AARTI: {
        readonly name: "Aarti";
        readonly nameHi: "आरती";
        readonly icon: "🔥";
        readonly sound: "aarti_bell";
    };
    readonly RICE: {
        readonly name: "Akshat (Rice)";
        readonly nameHi: "अक्षत";
        readonly icon: "🌾";
        readonly sound: "bell_chime";
    };
    readonly MEDITATION: {
        readonly name: "Meditation";
        readonly nameHi: "ध्यान";
        readonly icon: "🧘";
        readonly sound: "om_chant";
    };
    readonly CANDLE: {
        readonly name: "Candle";
        readonly nameHi: "मोमबत्ती";
        readonly icon: "🕯️";
        readonly sound: "bell_chime";
    };
    readonly PRAYER: {
        readonly name: "Prayer";
        readonly nameHi: "प्रार्थना";
        readonly icon: "🙏";
        readonly sound: "soft_chime";
    };
    readonly DUA: {
        readonly name: "Dua";
        readonly nameHi: "दुआ";
        readonly icon: "🤲";
        readonly sound: "soft_chime";
    };
    readonly TASBIH: {
        readonly name: "Tasbih";
        readonly nameHi: "तस्बीह";
        readonly icon: "📿";
        readonly sound: "soft_chime";
    };
    readonly ARDAS: {
        readonly name: "Ardas";
        readonly nameHi: "अरदास";
        readonly icon: "🙏";
        readonly sound: "soft_chime";
    };
    readonly WATER: {
        readonly name: "Jal (Water)";
        readonly nameHi: "जल";
        readonly icon: "💧";
        readonly sound: "soft_chime";
    };
};
export type PujaItemCode = keyof typeof PUJA_ITEMS;
export declare const DEFAULT_RELIGIOUS_MODE_CONFIG: {
    enabled: boolean;
    religion: ReligionCode;
    deity: string;
    officeHours: {
        from: string;
        to: string;
    };
    allowedFor: "ADMIN_ONLY" | "ALL_USERS" | "SELECTED_ROLES";
    allowedRoleIds: string[];
    greeting: {
        primary: string;
        secondary: string;
    };
    pujaItems: PujaItemCode[];
    soundEnabled: boolean;
    autoCloseAfterSeconds: number;
    showOncePerDay: boolean;
    festivalMode: boolean;
};
export type ReligiousModeConfig = typeof DEFAULT_RELIGIOUS_MODE_CONFIG;
