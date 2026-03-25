export interface PortalRoute {
  route: string;
  name: string;
  nameHi: string;
  icon: string;
  group: string;
  isDefault?: boolean;
}

export const CUSTOMER_PORTAL_ROUTES: PortalRoute[] = [
  { route: '/dashboard',      name: 'Dashboard',              nameHi: 'डैशबोर्ड',          icon: 'layout-dashboard', group: 'Main',        isDefault: true },
  { route: '/profile',        name: 'My Profile',             nameHi: 'मेरी प्रोफ़ाइल',      icon: 'user',             group: 'Main',        isDefault: true },
  { route: '/products',       name: 'My Products / Services', nameHi: 'मेरे उत्पाद / सेवाएं', icon: 'package',          group: 'Business' },
  { route: '/invoices',       name: 'Invoices',               nameHi: 'चालान',              icon: 'file-text',        group: 'Finance',     isDefault: true },
  { route: '/payments',       name: 'Payments',               nameHi: 'भुगतान',             icon: 'indian-rupee',     group: 'Finance',     isDefault: true },
  { route: '/ledger',         name: 'Ledger Statement',       nameHi: 'खाता विवरण',          icon: 'book-open',        group: 'Finance' },
  { route: '/quotations',     name: 'Quotations',             nameHi: 'कोटेशन',             icon: 'file-check',       group: 'Sales' },
  { route: '/orders',         name: 'My Orders',              nameHi: 'मेरे ऑर्डर',          icon: 'shopping-cart',    group: 'Sales' },
  { route: '/support',        name: 'Support Tickets',        nameHi: 'सपोर्ट टिकट',         icon: 'headphones',       group: 'Support',     isDefault: true },
  { route: '/support/new',    name: 'Create Ticket',          nameHi: 'टिकट बनाएं',          icon: 'plus-circle',      group: 'Support',     isDefault: true },
  { route: '/documents',      name: 'Documents',              nameHi: 'दस्तावेज़',            icon: 'folder',           group: 'Resources' },
  { route: '/employees',      name: 'Registered Employees',   nameHi: 'पंजीकृत कर्मचारी',    icon: 'users',            group: 'Team' },
  { route: '/notifications',  name: 'Notifications',          nameHi: 'सूचनाएं',             icon: 'bell',             group: 'Main',        isDefault: true },
  { route: '/settings',       name: 'Settings',               nameHi: 'सेटिंग्स',            icon: 'settings',         group: 'Main',        isDefault: true },
  { route: '/marketplace',    name: 'Marketplace',            nameHi: 'मार्केटप्लेस',          icon: 'store',            group: 'Marketplace' },
  { route: '/amc-warranty',   name: 'AMC & Warranty',         nameHi: 'एएमसी और वारंटी',      icon: 'shield-check',     group: 'Support' },
];

export const DEFAULT_ROUTE_PATHS = CUSTOMER_PORTAL_ROUTES
  .filter((r) => r.isDefault)
  .map((r) => r.route);
