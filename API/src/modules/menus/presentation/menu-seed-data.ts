import { MenuSeedItem } from '../application/commands/bulk-seed-menus/bulk-seed-menus.command';

export const MENU_SEED_DATA: MenuSeedItem[] = [
  {
    name: 'Dashboard', code: 'DASHBOARD', icon: 'home',
    route: '/dashboard', permissionModule: 'dashboard', permissionAction: 'view',
  },
  { name: 'Divider 1', code: 'DIV_1', menuType: 'DIVIDER' },
  {
    name: 'Contacts', code: 'CONTACTS_GROUP', icon: 'users', menuType: 'GROUP',
    children: [
      {
        name: 'Raw Contacts', code: 'RAW_CONTACTS', icon: 'user-plus',
        route: '/raw-contacts', permissionModule: 'raw_contacts', permissionAction: 'view',
      },
      {
        name: 'Verified Contacts', code: 'CONTACTS', icon: 'user-check',
        route: '/contacts', permissionModule: 'contacts', permissionAction: 'view',
      },
      {
        name: 'Organizations', code: 'ORGANIZATIONS', icon: 'building',
        route: '/organizations', permissionModule: 'organizations', permissionAction: 'view',
      },
    ],
  },
  {
    name: 'Leads', code: 'LEADS', icon: 'trending-up',
    route: '/leads', permissionModule: 'leads', permissionAction: 'view',
  },
  {
    name: 'Communications', code: 'COMMUNICATIONS', icon: 'message-circle',
    route: '/communications', permissionModule: 'communications', permissionAction: 'view',
  },
  { name: 'Divider 2', code: 'DIV_2', menuType: 'DIVIDER' },
  {
    name: 'Activities', code: 'ACTIVITIES_GROUP', icon: 'calendar', menuType: 'GROUP',
    children: [
      {
        name: 'All Activities', code: 'ACTIVITIES', icon: 'list',
        route: '/activities', permissionModule: 'activities', permissionAction: 'view',
      },
      {
        name: 'Demos', code: 'DEMOS', icon: 'monitor',
        route: '/demos', permissionModule: 'demos', permissionAction: 'view',
      },
      {
        name: 'Tour Plans', code: 'TOUR_PLANS', icon: 'map',
        route: '/tour-plans', permissionModule: 'tour_plans', permissionAction: 'view',
      },
    ],
  },
  {
    name: 'Quotations', code: 'QUOTATIONS', icon: 'file-text',
    route: '/quotations', permissionModule: 'quotations', permissionAction: 'view',
  },
  { name: 'Divider 3', code: 'DIV_3', menuType: 'DIVIDER' },
  {
    name: 'Reports', code: 'REPORTS_GROUP', icon: 'bar-chart-2', menuType: 'GROUP',
    children: [
      {
        name: 'Lead Reports', code: 'REPORTS_LEADS', icon: 'trending-up',
        route: '/reports/leads', permissionModule: 'reports', permissionAction: 'view',
      },
      {
        name: 'Sales Reports', code: 'REPORTS_SALES', icon: 'dollar-sign',
        route: '/reports/sales', permissionModule: 'reports', permissionAction: 'view',
      },
      {
        name: 'Activity Reports', code: 'REPORTS_ACTIVITIES', icon: 'activity',
        route: '/reports/activities', permissionModule: 'reports', permissionAction: 'view',
      },
    ],
  },
  { name: 'Divider 4', code: 'DIV_4', menuType: 'DIVIDER' },
  {
    name: 'Admin', code: 'ADMIN_GROUP', icon: 'settings', menuType: 'GROUP',
    children: [
      {
        name: 'Employees', code: 'ADMIN_EMPLOYEES', icon: 'users',
        route: '/admin/employees', permissionModule: 'employees', permissionAction: 'view',
      },
      {
        name: 'Departments', code: 'ADMIN_DEPARTMENTS', icon: 'grid',
        route: '/admin/departments', permissionModule: 'departments', permissionAction: 'view',
      },
      {
        name: 'Designations', code: 'ADMIN_DESIGNATIONS', icon: 'award',
        route: '/admin/designations', permissionModule: 'designations', permissionAction: 'view',
      },
      {
        name: 'Roles & Permissions', code: 'ADMIN_ROLES', icon: 'shield',
        route: '/admin/roles', permissionModule: 'roles', permissionAction: 'view',
      },
      {
        name: 'Lookups', code: 'ADMIN_LOOKUPS', icon: 'list',
        route: '/admin/lookups', permissionModule: 'lookups', permissionAction: 'view',
      },
      {
        name: 'Menu Management', code: 'ADMIN_MENUS', icon: 'menu',
        route: '/admin/menus', permissionModule: 'menus', permissionAction: 'view',
        badgeText: 'New', badgeColor: '#3B82F6',
      },
      {
        name: 'Brands', code: 'ADMIN_BRANDS', icon: 'tag',
        route: '/admin/brands', permissionModule: 'brands', permissionAction: 'view',
      },
      {
        name: 'Manufacturers', code: 'ADMIN_MANUFACTURERS', icon: 'box',
        route: '/admin/manufacturers', permissionModule: 'manufacturers', permissionAction: 'view',
      },
      {
        name: 'Locations', code: 'ADMIN_LOCATIONS', icon: 'map-pin',
        route: '/admin/locations', permissionModule: 'locations', permissionAction: 'view',
      },
      {
        name: 'Custom Fields', code: 'ADMIN_CUSTOM_FIELDS', icon: 'sliders',
        route: '/admin/custom-fields', permissionModule: 'custom_fields', permissionAction: 'view',
      },
    ],
  },
];
