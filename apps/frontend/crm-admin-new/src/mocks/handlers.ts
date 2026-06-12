import { http, HttpResponse } from 'msw';

const BASE = 'http://localhost:3001/api/v1';

export const handlers = [
  // Auth
  http.post(`${BASE}/auth/admin/login`, async ({ request }) => {
    const body = await request.json() as any;
    if (body.email === 'test@example.com' && body.password === 'Test@123') {
      return HttpResponse.json({
        data: { accessToken: 'mock-jwt-token', refreshToken: 'mock-refresh' },
      });
    }
    return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  }),

  // Leads list
  http.get(`${BASE}/leads`, () => {
    return HttpResponse.json({
      data: {
        data: [
          { id: '1', firstName: 'Test', lastName: 'Lead', email: 'lead@test.com', phone: '9876543210', status: 'NEW', source: 'WEBSITE', createdAt: new Date().toISOString() },
          { id: '2', firstName: 'Another', lastName: 'Lead', email: 'lead2@test.com', phone: '9876543211', status: 'CONTACTED', source: 'REFERRAL', createdAt: new Date().toISOString() },
        ],
        meta: { total: 2, page: 1, limit: 10 },
      },
    });
  }),

  // Create lead
  http.post(`${BASE}/leads`, async ({ request }) => {
    const body = await request.json() as any;
    return HttpResponse.json({ data: { id: '3', ...body, createdAt: new Date().toISOString() } }, { status: 201 });
  }),

  // Contacts
  http.get(`${BASE}/contacts`, () => {
    return HttpResponse.json({
      data: {
        data: [
          { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@test.com', phone: '9876543210', createdAt: new Date().toISOString() },
        ],
        meta: { total: 1, page: 1, limit: 10 },
      },
    });
  }),

  // Organizations
  http.get(`${BASE}/organizations`, () => {
    return HttpResponse.json({
      data: {
        data: [
          { id: '1', name: 'Test Corp', code: 'TC', industry: 'Technology', createdAt: new Date().toISOString() },
        ],
        meta: { total: 1, page: 1, limit: 10 },
      },
    });
  }),

  // Notifications
  http.get(`${BASE}/notifications`, () => {
    return HttpResponse.json({ data: { data: [], meta: { total: 0, unreadCount: 0 } } });
  }),

  // Menus
  http.get(`${BASE}/menus/my`, () => {
    return HttpResponse.json({ data: [] });
  }),

  // Dashboard
  http.get(`${BASE}/dashboard*`, () => {
    return HttpResponse.json({ data: { totalLeads: 150, wonDeals: 45, revenue: 2500000, conversionRate: 30 } });
  }),

  // Lookups
  http.get(`${BASE}/lookups/values/:category`, ({ params }) => {
    return HttpResponse.json({
      data: {
        lookupId: '1',
        category: params.category,
        displayName: String(params.category),
        values: [
          { id: '1', value: 'Option 1', label: 'Option 1', isActive: true },
          { id: '2', value: 'Option 2', label: 'Option 2', isActive: true },
        ],
      },
    });
  }),

  // Users
  http.get(`${BASE}/users`, () => {
    return HttpResponse.json({ data: { data: [], meta: { total: 0 } } });
  }),
];
