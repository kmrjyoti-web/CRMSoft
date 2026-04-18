"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const global_reference_client_1 = require("../../../node_modules/.prisma/global-reference-client");
const globalRef = new global_reference_client_1.PrismaClient({
    datasources: { db: { url: process.env.GLOBAL_REFERENCE_DATABASE_URL } },
});
async function main() {
    console.log('🌱  Sprint B.2 — Seeding GlobalReferenceDB reference data...');
    console.log('  → GST rates...');
    const gstRates = await Promise.all([
        globalRef.glCfgGstRate.upsert({
            where: { name: 'GST Exempt' },
            update: {},
            create: { name: 'GST Exempt', rate: 0, type: 'EXEMPT', description: 'Fully exempt from GST (essential goods, healthcare)', sortOrder: 0 },
        }),
        globalRef.glCfgGstRate.upsert({
            where: { name: 'GST 5%' },
            update: {},
            create: { name: 'GST 5%', rate: 5, type: 'STANDARD', description: 'Essential goods — food, baby products, life-saving drugs', sortOrder: 1 },
        }),
        globalRef.glCfgGstRate.upsert({
            where: { name: 'GST 12%' },
            update: {},
            create: { name: 'GST 12%', rate: 12, type: 'STANDARD', description: 'Semi-essential goods — computers, processed food, business class air travel', sortOrder: 2 },
        }),
        globalRef.glCfgGstRate.upsert({
            where: { name: 'GST 18%' },
            update: {},
            create: { name: 'GST 18%', rate: 18, type: 'STANDARD', description: 'Standard rate — most services, electronics, telecom', sortOrder: 3 },
        }),
        globalRef.glCfgGstRate.upsert({
            where: { name: 'GST 28%' },
            update: {},
            create: { name: 'GST 28%', rate: 28, type: 'STANDARD', description: 'Luxury/sin goods — luxury cars, tobacco, aerated drinks', sortOrder: 4 },
        }),
        globalRef.glCfgGstRate.upsert({
            where: { name: 'GST 0%' },
            update: {},
            create: { name: 'GST 0%', rate: 0, type: 'ZERO_RATED', description: 'Zero-rated (exports) — 0% GST, eligible for ITC refund', sortOrder: 5 },
        }),
    ]);
    const gstMap = Object.fromEntries(gstRates.map((r) => [r.name, r.id]));
    console.log(`     ✅ ${gstRates.length} GST rates`);
    console.log('  → HSN/SAC codes (top 50)...');
    const hsnData = [
        { code: '0101', codeType: 'HSN', description: 'Live horses, asses, mules and hinnies', chapter: '01', section: 'I', gstKey: 'GST Exempt' },
        { code: '0102', codeType: 'HSN', description: 'Live bovine animals', chapter: '01', section: 'I', gstKey: 'GST Exempt' },
        { code: '0801', codeType: 'HSN', description: 'Coconuts, Brazil nuts and cashew nuts', chapter: '08', section: 'II', gstKey: 'GST 5%' },
        { code: '0804', codeType: 'HSN', description: 'Dates, figs, pineapples, avocados, guavas, mangoes', chapter: '08', section: 'II', gstKey: 'GST Exempt' },
        { code: '1001', codeType: 'HSN', description: 'Wheat and meslin', chapter: '10', section: 'II', gstKey: 'GST Exempt' },
        { code: '1006', codeType: 'HSN', description: 'Rice', chapter: '10', section: 'II', gstKey: 'GST Exempt' },
        { code: '3004', codeType: 'HSN', description: 'Medicaments (mixed or unmixed products)', chapter: '30', section: 'VI', gstKey: 'GST 12%' },
        { code: '3005', codeType: 'HSN', description: 'Wadding, gauze, bandages and similar articles', chapter: '30', section: 'VI', gstKey: 'GST 12%' },
        { code: '4901', codeType: 'HSN', description: 'Printed books, brochures, leaflets', chapter: '49', section: 'X', gstKey: 'GST Exempt' },
        { code: '4902', codeType: 'HSN', description: 'Newspapers, journals and periodicals', chapter: '49', section: 'X', gstKey: 'GST Exempt' },
        { code: '6101', codeType: 'HSN', description: 'Men\'s or boys\' overcoats (knitted)', chapter: '61', section: 'XI', gstKey: 'GST 12%' },
        { code: '6201', codeType: 'HSN', description: 'Men\'s or boys\' overcoats, windcheaters (woven)', chapter: '62', section: 'XI', gstKey: 'GST 12%' },
        { code: '8415', codeType: 'HSN', description: 'Air conditioning machines', chapter: '84', section: 'XVI', gstKey: 'GST 28%' },
        { code: '8471', codeType: 'HSN', description: 'Automatic data processing machines (computers)', chapter: '84', section: 'XVI', gstKey: 'GST 18%' },
        { code: '8473', codeType: 'HSN', description: 'Parts and accessories for computers', chapter: '84', section: 'XVI', gstKey: 'GST 18%' },
        { code: '8517', codeType: 'HSN', description: 'Telephone sets including smartphones', chapter: '85', section: 'XVI', gstKey: 'GST 18%' },
        { code: '8528', codeType: 'HSN', description: 'Reception apparatus for television (LED/LCD TVs)', chapter: '85', section: 'XVI', gstKey: 'GST 28%' },
        { code: '8544', codeType: 'HSN', description: 'Insulated wire, cable and optical fibre cables', chapter: '85', section: 'XVI', gstKey: 'GST 18%' },
        { code: '8703', codeType: 'HSN', description: 'Motor cars and other motor vehicles principally designed for transport', chapter: '87', section: 'XVII', gstKey: 'GST 28%' },
        { code: '8711', codeType: 'HSN', description: 'Motorcycles and mopeds', chapter: '87', section: 'XVII', gstKey: 'GST 28%' },
        { code: '9983', codeType: 'SAC', description: 'IT services including software development', chapter: '99', section: 'SAC', gstKey: 'GST 18%' },
        { code: '9984', codeType: 'SAC', description: 'Telecommunications services', chapter: '99', section: 'SAC', gstKey: 'GST 18%' },
        { code: '9985', codeType: 'SAC', description: 'Support services (outsourcing, call centres)', chapter: '99', section: 'SAC', gstKey: 'GST 18%' },
        { code: '9971', codeType: 'SAC', description: 'Financial and related services', chapter: '99', section: 'SAC', gstKey: 'GST 18%' },
        { code: '9963', codeType: 'SAC', description: 'Accommodation, food and beverage services', chapter: '99', section: 'SAC', gstKey: 'GST 18%' },
        { code: '9972', codeType: 'SAC', description: 'Real estate services', chapter: '99', section: 'SAC', gstKey: 'GST 18%' },
        { code: '9973', codeType: 'SAC', description: 'Leasing or rental services with or without operator', chapter: '99', section: 'SAC', gstKey: 'GST 18%' },
        { code: '9992', codeType: 'SAC', description: 'Education services', chapter: '99', section: 'SAC', gstKey: 'GST Exempt' },
        { code: '9993', codeType: 'SAC', description: 'Human health and social care services', chapter: '99', section: 'SAC', gstKey: 'GST Exempt' },
        { code: '9961', codeType: 'SAC', description: 'Services of wholesale trade', chapter: '99', section: 'SAC', gstKey: 'GST 18%' },
        { code: '9962', codeType: 'SAC', description: 'Services of retail trade', chapter: '99', section: 'SAC', gstKey: 'GST 18%' },
        { code: '3301', codeType: 'HSN', description: 'Essential oils — perfumes, cosmetics preparations', chapter: '33', section: 'VI', gstKey: 'GST 18%' },
        { code: '3401', codeType: 'HSN', description: 'Soap, organic surface-active products for skin wash', chapter: '34', section: 'VI', gstKey: 'GST 18%' },
        { code: '2101', codeType: 'HSN', description: 'Extracts, essences and concentrates, of coffee, tea or maté', chapter: '21', section: 'IV', gstKey: 'GST 18%' },
        { code: '2202', codeType: 'HSN', description: 'Waters including mineral waters and aerated waters', chapter: '22', section: 'IV', gstKey: 'GST 18%' },
        { code: '2402', codeType: 'HSN', description: 'Cigars, cheroots, cigarillos and cigarettes', chapter: '24', section: 'IV', gstKey: 'GST 28%' },
        { code: '5201', codeType: 'HSN', description: 'Cotton, not carded or combed', chapter: '52', section: 'XI', gstKey: 'GST 5%' },
        { code: '5208', codeType: 'HSN', description: 'Woven fabrics of cotton (>=85% by weight)', chapter: '52', section: 'XI', gstKey: 'GST 5%' },
        { code: '2814', codeType: 'HSN', description: 'Ammonia, anhydrous or in aqueous solution', chapter: '28', section: 'VI', gstKey: 'GST 18%' },
        { code: '2901', codeType: 'HSN', description: 'Acyclic hydrocarbons (petroleum gases)', chapter: '29', section: 'VI', gstKey: 'GST 18%' },
        { code: '2523', codeType: 'HSN', description: 'Portland cement, aluminous cement, slag cement', chapter: '25', section: 'V', gstKey: 'GST 28%' },
        { code: '7213', codeType: 'HSN', description: 'Bars and rods, hot-rolled, of iron or non-alloy steel', chapter: '72', section: 'XV', gstKey: 'GST 18%' },
        { code: '3102', codeType: 'HSN', description: 'Mineral or chemical fertilisers, nitrogenous', chapter: '31', section: 'VI', gstKey: 'GST 5%' },
        { code: '3808', codeType: 'HSN', description: 'Insecticides, herbicides, disinfectants', chapter: '38', section: 'VI', gstKey: 'GST 18%' },
        { code: '7113', codeType: 'HSN', description: 'Articles of jewellery and parts thereof', chapter: '71', section: 'XIV', gstKey: 'GST 5%' },
        { code: '7108', codeType: 'HSN', description: 'Gold in unwrought or semi-manufactured forms', chapter: '71', section: 'XIV', gstKey: 'GST 5%' },
        { code: '6401', codeType: 'HSN', description: 'Waterproof footwear with outer soles', chapter: '64', section: 'XII', gstKey: 'GST 12%' },
        { code: '6403', codeType: 'HSN', description: 'Footwear with outer soles of rubber/plastics/leather', chapter: '64', section: 'XII', gstKey: 'GST 18%' },
        { code: '9401', codeType: 'HSN', description: 'Seats (office chairs, car seats, etc.)', chapter: '94', section: 'XX', gstKey: 'GST 18%' },
        { code: '9403', codeType: 'HSN', description: 'Other furniture and parts thereof', chapter: '94', section: 'XX', gstKey: 'GST 18%' },
    ];
    let hsnCount = 0;
    for (const hsn of hsnData) {
        await globalRef.glCfgHsnCode.upsert({
            where: { code: hsn.code },
            update: {},
            create: {
                code: hsn.code,
                codeType: hsn.codeType,
                description: hsn.description,
                chapter: hsn.chapter,
                section: hsn.section,
                defaultGstRateId: gstMap[hsn.gstKey] ?? null,
            },
        });
        hsnCount++;
    }
    console.log(`     ✅ ${hsnCount} HSN/SAC codes`);
    console.log('  → Currencies...');
    const currencyData = [
        { code: 'INR', name: 'Indian Rupee', nameLocal: 'भारतीय रुपया', symbol: '₹', symbolAlt: 'Rs.', isDefault: true, sortOrder: 0 },
        { code: 'USD', name: 'US Dollar', nameLocal: 'US Dollar', symbol: '$', symbolAlt: 'US$', isDefault: false, sortOrder: 1 },
        { code: 'EUR', name: 'Euro', nameLocal: 'Euro', symbol: '€', isDefault: false, sortOrder: 2 },
        { code: 'GBP', name: 'British Pound Sterling', nameLocal: 'Pound Sterling', symbol: '£', isDefault: false, sortOrder: 3 },
        { code: 'JPY', name: 'Japanese Yen', nameLocal: '日本円', symbol: '¥', decimalPlaces: 0, isDefault: false, sortOrder: 4 },
        { code: 'AUD', name: 'Australian Dollar', nameLocal: 'Australian Dollar', symbol: 'A$', isDefault: false, sortOrder: 5 },
        { code: 'CAD', name: 'Canadian Dollar', nameLocal: 'Canadian Dollar', symbol: 'CA$', isDefault: false, sortOrder: 6 },
        { code: 'CHF', name: 'Swiss Franc', nameLocal: 'Schweizer Franken', symbol: 'Fr', isDefault: false, sortOrder: 7 },
        { code: 'SGD', name: 'Singapore Dollar', nameLocal: 'Singapore Dollar', symbol: 'S$', isDefault: false, sortOrder: 8 },
        { code: 'AED', name: 'UAE Dirham', nameLocal: 'درهم', symbol: 'د.إ', symbolAlt: 'AED', isDefault: false, sortOrder: 9 },
        { code: 'SAR', name: 'Saudi Riyal', nameLocal: 'ريال سعودي', symbol: '﷼', symbolAlt: 'SAR', isDefault: false, sortOrder: 10 },
    ];
    for (const c of currencyData) {
        await globalRef.glCfgCurrency.upsert({
            where: { code: c.code },
            update: {},
            create: {
                code: c.code,
                name: c.name,
                nameLocal: c.nameLocal,
                symbol: c.symbol,
                symbolAlt: c.symbolAlt ?? null,
                decimalPlaces: c.decimalPlaces ?? 2,
                isDefault: c.isDefault,
                sortOrder: c.sortOrder,
            },
        });
    }
    console.log(`     ✅ ${currencyData.length} currencies`);
    console.log('  → Timezones...');
    const timezoneData = [
        { tzIdentifier: 'Asia/Kolkata', displayName: '(UTC+05:30) India Standard Time', offsetHours: 5, offsetMinutes: 30, isDefault: true, sortOrder: 0 },
        { tzIdentifier: 'UTC', displayName: '(UTC+00:00) Coordinated Universal Time', offsetHours: 0, offsetMinutes: 0, sortOrder: 1 },
        { tzIdentifier: 'America/New_York', displayName: '(UTC-05:00) Eastern Time (US & Canada)', offsetHours: -5, offsetMinutes: 0, isDst: true, sortOrder: 2 },
        { tzIdentifier: 'America/Chicago', displayName: '(UTC-06:00) Central Time (US & Canada)', offsetHours: -6, offsetMinutes: 0, isDst: true, sortOrder: 3 },
        { tzIdentifier: 'America/Denver', displayName: '(UTC-07:00) Mountain Time (US & Canada)', offsetHours: -7, offsetMinutes: 0, isDst: true, sortOrder: 4 },
        { tzIdentifier: 'America/Los_Angeles', displayName: '(UTC-08:00) Pacific Time (US & Canada)', offsetHours: -8, offsetMinutes: 0, isDst: true, sortOrder: 5 },
        { tzIdentifier: 'Europe/London', displayName: '(UTC+00:00) London, Dublin, Edinburgh', offsetHours: 0, offsetMinutes: 0, isDst: true, sortOrder: 6 },
        { tzIdentifier: 'Europe/Paris', displayName: '(UTC+01:00) Paris, Brussels, Amsterdam', offsetHours: 1, offsetMinutes: 0, isDst: true, sortOrder: 7 },
        { tzIdentifier: 'Europe/Moscow', displayName: '(UTC+03:00) Moscow, St. Petersburg', offsetHours: 3, offsetMinutes: 0, sortOrder: 8 },
        { tzIdentifier: 'Asia/Dubai', displayName: '(UTC+04:00) Abu Dhabi, Muscat, Dubai', offsetHours: 4, offsetMinutes: 0, sortOrder: 9 },
        { tzIdentifier: 'Asia/Karachi', displayName: '(UTC+05:00) Karachi, Islamabad', offsetHours: 5, offsetMinutes: 0, sortOrder: 10 },
        { tzIdentifier: 'Asia/Dhaka', displayName: '(UTC+06:00) Dhaka, Almaty', offsetHours: 6, offsetMinutes: 0, sortOrder: 11 },
        { tzIdentifier: 'Asia/Bangkok', displayName: '(UTC+07:00) Bangkok, Hanoi, Jakarta', offsetHours: 7, offsetMinutes: 0, sortOrder: 12 },
        { tzIdentifier: 'Asia/Shanghai', displayName: '(UTC+08:00) Beijing, Chongqing, Shanghai', offsetHours: 8, offsetMinutes: 0, sortOrder: 13 },
        { tzIdentifier: 'Asia/Singapore', displayName: '(UTC+08:00) Singapore', offsetHours: 8, offsetMinutes: 0, sortOrder: 14 },
        { tzIdentifier: 'Asia/Tokyo', displayName: '(UTC+09:00) Tokyo, Osaka, Sapporo', offsetHours: 9, offsetMinutes: 0, sortOrder: 15 },
        { tzIdentifier: 'Australia/Sydney', displayName: '(UTC+10:00) Sydney, Melbourne, Canberra', offsetHours: 10, offsetMinutes: 0, isDst: true, sortOrder: 16 },
        { tzIdentifier: 'Pacific/Auckland', displayName: '(UTC+12:00) Auckland, Wellington', offsetHours: 12, offsetMinutes: 0, isDst: true, sortOrder: 17 },
    ];
    for (const tz of timezoneData) {
        await globalRef.glCfgTimezone.upsert({
            where: { tzIdentifier: tz.tzIdentifier },
            update: {},
            create: {
                tzIdentifier: tz.tzIdentifier,
                displayName: tz.displayName,
                offsetHours: tz.offsetHours,
                offsetMinutes: tz.offsetMinutes,
                isDst: tz.isDst ?? false,
                isDefault: tz.isDefault ?? false,
                sortOrder: tz.sortOrder,
            },
        });
    }
    console.log(`     ✅ ${timezoneData.length} timezones`);
    console.log('  → Industry types...');
    const industryData = [
        { code: 'GENERAL', name: 'General', nameHi: 'सामान्य', description: 'General purpose CRM (multi-industry)', sortOrder: 0 },
        { code: 'SOFTWARE', name: 'Software & IT', nameHi: 'सॉफ्टवेयर और आईटी', description: 'Software companies, IT services, SaaS, IT consulting', sortOrder: 1 },
        { code: 'RETAIL', name: 'Retail & E-commerce', nameHi: 'खुदरा और ई-कॉमर्स', description: 'Retail stores, online marketplaces, FMCG distribution', sortOrder: 2 },
        { code: 'PHARMA', name: 'Pharmaceutical & Healthcare', nameHi: 'फार्मास्युटिकल और स्वास्थ्य', description: 'Pharma companies, drug distributors, medical devices', sortOrder: 3 },
        { code: 'RESTAURANT', name: 'Restaurant & Food Service', nameHi: 'रेस्तरां और खाद्य सेवा', description: 'Restaurants, cafes, cloud kitchens, food delivery', sortOrder: 4 },
        { code: 'TOURISM', name: 'Tourism & Hospitality', nameHi: 'पर्यटन और आतिथ्य', description: 'Travel agencies, hotels, resorts, tour operators', sortOrder: 5 },
        { code: 'EDUCATION', name: 'Education', nameHi: 'शिक्षा', description: 'Schools, colleges, coaching institutes, EdTech', sortOrder: 6 },
        { code: 'REAL_ESTATE', name: 'Real Estate', nameHi: 'रियल एस्टेट', description: 'Real estate developers, brokers, property management', sortOrder: 7 },
        { code: 'MANUFACTURING', name: 'Manufacturing', nameHi: 'विनिर्माण', description: 'Manufacturing, production, assembly, industrial', sortOrder: 8 },
        { code: 'FINANCE', name: 'Finance & Banking', nameHi: 'वित्त और बैंकिंग', description: 'NBFCs, insurance, mutual funds, lending', sortOrder: 9 },
    ];
    for (const ind of industryData) {
        await globalRef.glCfgIndustryType.upsert({
            where: { code: ind.code },
            update: {},
            create: ind,
        });
    }
    console.log(`     ✅ ${industryData.length} industry types`);
    console.log('  → Languages...');
    const languageData = [
        { code: 'hi', code3: 'hin', name: 'Hindi', nameLocal: 'हिन्दी', script: 'Devanagari', isIndian: true, sortOrder: 0 },
        { code: 'en', code3: 'eng', name: 'English', nameLocal: 'English', script: 'Latin', isIndian: false, isDefault: true, sortOrder: 1 },
        { code: 'bn', code3: 'ben', name: 'Bengali', nameLocal: 'বাংলা', script: 'Bengali', isIndian: true, sortOrder: 2 },
        { code: 'te', code3: 'tel', name: 'Telugu', nameLocal: 'తెలుగు', script: 'Telugu', isIndian: true, sortOrder: 3 },
        { code: 'mr', code3: 'mar', name: 'Marathi', nameLocal: 'मराठी', script: 'Devanagari', isIndian: true, sortOrder: 4 },
        { code: 'ta', code3: 'tam', name: 'Tamil', nameLocal: 'தமிழ்', script: 'Tamil', isIndian: true, sortOrder: 5 },
        { code: 'ur', code3: 'urd', name: 'Urdu', nameLocal: 'اردو', script: 'Nastaliq', isIndian: true, sortOrder: 6 },
        { code: 'gu', code3: 'guj', name: 'Gujarati', nameLocal: 'ગુજરાતી', script: 'Gujarati', isIndian: true, sortOrder: 7 },
        { code: 'kn', code3: 'kan', name: 'Kannada', nameLocal: 'ಕನ್ನಡ', script: 'Kannada', isIndian: true, sortOrder: 8 },
        { code: 'ml', code3: 'mal', name: 'Malayalam', nameLocal: 'മലയാളം', script: 'Malayalam', isIndian: true, sortOrder: 9 },
        { code: 'pa', code3: 'pan', name: 'Punjabi', nameLocal: 'ਪੰਜਾਬੀ', script: 'Gurmukhi', isIndian: true, sortOrder: 10 },
        { code: 'or', code3: 'ori', name: 'Odia', nameLocal: 'ଓଡ଼ିଆ', script: 'Odia', isIndian: true, sortOrder: 11 },
        { code: 'ar', code3: 'ara', name: 'Arabic', nameLocal: 'العربية', script: 'Arabic', isIndian: false, sortOrder: 12 },
        { code: 'zh', code3: 'zho', name: 'Chinese (Simplified)', nameLocal: '中文', script: 'Han', isIndian: false, sortOrder: 13 },
        { code: 'fr', code3: 'fra', name: 'French', nameLocal: 'Français', script: 'Latin', isIndian: false, sortOrder: 14 },
        { code: 'de', code3: 'deu', name: 'German', nameLocal: 'Deutsch', script: 'Latin', isIndian: false, sortOrder: 15 },
    ];
    for (const lang of languageData) {
        await globalRef.glCfgLanguage.upsert({
            where: { code: lang.code },
            update: {},
            create: {
                code: lang.code,
                code3: lang.code3 ?? null,
                name: lang.name,
                nameLocal: lang.nameLocal ?? null,
                script: lang.script ?? null,
                isIndian: lang.isIndian,
                isDefault: lang.isDefault ?? false,
                sortOrder: lang.sortOrder,
            },
        });
    }
    console.log(`     ✅ ${languageData.length} languages`);
    console.log('  → Checking for India state records before seeding pincodes...');
    const indiaState = await globalRef.glCfgState.findFirst({
        where: { code: 'MH' },
    });
    if (indiaState) {
        const maharashtraId = indiaState.id;
        const delhiState = await globalRef.glCfgState.findFirst({ where: { code: 'DL' } });
        const karnatakaState = await globalRef.glCfgState.findFirst({ where: { code: 'KA' } });
        const tamilnaduState = await globalRef.glCfgState.findFirst({ where: { code: 'TN' } });
        const gujaratState = await globalRef.glCfgState.findFirst({ where: { code: 'GJ' } });
        const pincodeData = [
            { pincode: '400001', stateId: maharashtraId, district: 'Mumbai City', cityName: 'Mumbai', officeName: 'Mumbai GPO', officeType: 'H.O.', deliveryStatus: 'Delivery' },
            { pincode: '400051', stateId: maharashtraId, district: 'Mumbai Suburban', cityName: 'Mumbai', officeName: 'Bandra', officeType: 'S.O.', deliveryStatus: 'Delivery' },
            { pincode: '411001', stateId: maharashtraId, district: 'Pune', cityName: 'Pune', officeName: 'Pune GPO', officeType: 'H.O.', deliveryStatus: 'Delivery' },
            { pincode: '411045', stateId: maharashtraId, district: 'Pune', cityName: 'Pune', officeName: 'Hinjewadi', officeType: 'S.O.', deliveryStatus: 'Delivery' },
            { pincode: '440001', stateId: maharashtraId, district: 'Nagpur', cityName: 'Nagpur', officeName: 'Nagpur GPO', officeType: 'H.O.', deliveryStatus: 'Delivery' },
            ...(delhiState ? [
                { pincode: '110001', stateId: delhiState.id, district: 'Central Delhi', cityName: 'New Delhi', officeName: 'New Delhi GPO', officeType: 'H.O.', deliveryStatus: 'Delivery' },
                { pincode: '110020', stateId: delhiState.id, district: 'South Delhi', cityName: 'New Delhi', officeName: 'Saket', officeType: 'S.O.', deliveryStatus: 'Delivery' },
                { pincode: '110092', stateId: delhiState.id, district: 'East Delhi', cityName: 'New Delhi', officeName: 'Laxmi Nagar', officeType: 'S.O.', deliveryStatus: 'Delivery' },
            ] : []),
            ...(karnatakaState ? [
                { pincode: '560001', stateId: karnatakaState.id, district: 'Bangalore Urban', cityName: 'Bengaluru', officeName: 'Bangalore GPO', officeType: 'H.O.', deliveryStatus: 'Delivery' },
                { pincode: '560103', stateId: karnatakaState.id, district: 'Bangalore Urban', cityName: 'Bengaluru', officeName: 'Electronic City', officeType: 'S.O.', deliveryStatus: 'Delivery' },
                { pincode: '575001', stateId: karnatakaState.id, district: 'Dakshina Kannada', cityName: 'Mangaluru', officeName: 'Mangalore GPO', officeType: 'H.O.', deliveryStatus: 'Delivery' },
            ] : []),
            ...(tamilnaduState ? [
                { pincode: '600001', stateId: tamilnaduState.id, district: 'Chennai', cityName: 'Chennai', officeName: 'Chennai GPO', officeType: 'H.O.', deliveryStatus: 'Delivery' },
                { pincode: '641001', stateId: tamilnaduState.id, district: 'Coimbatore', cityName: 'Coimbatore', officeName: 'Coimbatore HO', officeType: 'H.O.', deliveryStatus: 'Delivery' },
            ] : []),
            ...(gujaratState ? [
                { pincode: '380001', stateId: gujaratState.id, district: 'Ahmedabad', cityName: 'Ahmedabad', officeName: 'Ahmedabad GPO', officeType: 'H.O.', deliveryStatus: 'Delivery' },
                { pincode: '395001', stateId: gujaratState.id, district: 'Surat', cityName: 'Surat', officeName: 'Surat HO', officeType: 'H.O.', deliveryStatus: 'Delivery' },
                { pincode: '390001', stateId: gujaratState.id, district: 'Vadodara', cityName: 'Vadodara', officeName: 'Vadodara GPO', officeType: 'H.O.', deliveryStatus: 'Delivery' },
            ] : []),
        ];
        let pinCount = 0;
        for (const p of pincodeData) {
            await globalRef.glCfgPincode.upsert({
                where: { pincode: p.pincode },
                update: {},
                create: p,
            });
            pinCount++;
        }
        console.log(`     ✅ ${pinCount} PIN codes seeded`);
    }
    else {
        console.log('     ⚠️  No India state records found (run seed-global.ts first) — skipping pincodes');
    }
    console.log('\n✅  Sprint B.2 seed complete.');
}
main()
    .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
})
    .finally(() => globalRef.$disconnect());
//# sourceMappingURL=seed-b2-reference.js.map