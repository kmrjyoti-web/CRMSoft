"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedGlobalMenuItems = seedGlobalMenuItems;
const SEED_MENU_ITEMS = [
    { menuKey: 'dashboard', label: 'Dashboard', labelHi: 'डैशबोर्ड', icon: 'cilSpeedometer', route: '/dashboard', sortOrder: 1 },
    { menuKey: 'contacts', label: 'Contacts', labelHi: 'संपर्क', icon: 'cilPeople', route: '/contacts', moduleCode: 'CONTACTS', sortOrder: 2 },
    { menuKey: 'leads', label: 'Leads', labelHi: 'लीड्स', icon: 'cilChart', route: '/leads', moduleCode: 'LEADS', sortOrder: 3 },
    { menuKey: 'products', label: 'Products', labelHi: 'उत्पाद', icon: 'cilCart', route: '/products', moduleCode: 'PRODUCTS', sortOrder: 4 },
    { menuKey: 'quotations', label: 'Quotations', labelHi: 'कोटेशन', icon: 'cilDescription', route: '/quotations', moduleCode: 'QUOTATIONS', sortOrder: 5 },
    { menuKey: 'invoices', label: 'Invoices', labelHi: 'चालान', icon: 'cilFile', route: '/invoices', moduleCode: 'INVOICES', sortOrder: 6 },
    { menuKey: 'orders', label: 'Orders', labelHi: 'ऑर्डर', icon: 'cilBasket', route: '/orders', moduleCode: 'ORDERS', sortOrder: 7 },
    { menuKey: 'markethub', label: 'MarketHub', labelHi: 'मार्केटहब', icon: 'cilGlobeAlt', sortOrder: 8 },
    { menuKey: 'markethub-offers', label: 'Offers', labelHi: 'ऑफर्स', icon: 'cilTags', route: '/markethub/offers', parentKey: 'markethub', moduleCode: 'MARKETPLACE', sortOrder: 1 },
    { menuKey: 'markethub-profiles', label: 'Profiles', labelHi: 'प्रोफाइल', icon: 'cilUser', route: '/markethub/profiles', parentKey: 'markethub', moduleCode: 'MARKETPLACE', sortOrder: 2 },
    { menuKey: 'markethub-feed', label: 'Feed', labelHi: 'फीड', icon: 'cilNewspaper', route: '/markethub/feed', parentKey: 'markethub', moduleCode: 'MARKETPLACE', sortOrder: 3 },
    { menuKey: 'markethub-analytics', label: 'Analytics', labelHi: 'एनालिटिक्स', icon: 'cilChartPie', route: '/markethub/analytics', parentKey: 'markethub', moduleCode: 'MARKETPLACE', sortOrder: 4 },
    { menuKey: 'settings', label: 'Settings', labelHi: 'सेटिंग्स', icon: 'cilSettings', sortOrder: 9 },
    { menuKey: 'settings-general', label: 'General', labelHi: 'सामान्य', icon: 'cilCog', route: '/settings/general', parentKey: 'settings', sortOrder: 1 },
    { menuKey: 'settings-users', label: 'Users & Roles', labelHi: 'उपयोगकर्ता और भूमिकाएं', icon: 'cilGroup', route: '/settings/users', parentKey: 'settings', sortOrder: 2 },
];
async function seedGlobalMenuItems(db) {
    for (const item of SEED_MENU_ITEMS) {
        await db.globalMenuConfig.upsert({
            where: { menuKey: item.menuKey },
            update: {
                label: item.label,
                labelHi: item.labelHi,
                icon: item.icon || null,
                parentKey: item.parentKey || null,
                route: item.route || null,
                moduleCode: item.moduleCode || null,
                sortOrder: item.sortOrder,
            },
            create: {
                menuKey: item.menuKey,
                label: item.label,
                labelHi: item.labelHi,
                icon: item.icon || null,
                parentKey: item.parentKey || null,
                route: item.route || null,
                moduleCode: item.moduleCode || null,
                sortOrder: item.sortOrder,
            },
        });
    }
}
//# sourceMappingURL=seed-menus.js.map