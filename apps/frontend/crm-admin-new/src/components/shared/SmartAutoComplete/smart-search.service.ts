import apiClient from '@/services/api-client';
import type { EntityType, SearchFilter } from './types';

// For CONTACT and ORGANIZATION use the existing rich endpoints (they include
// communications for phone/email, and handle the complex schema correctly).
// For other entity types fall back to the generic smart-search endpoint.

export const smartSearchService = {
  search: (entityType: EntityType, filters: SearchFilter[], limit = 20, offset = 0) => {
    // Extract a simple search string from the first filter value (strip wildcard chars)
    const primaryFilter = filters[0];
    const searchValue = primaryFilter ? primaryFilter.value.replace(/^[%=]|%$/g, '') : '';

    if (entityType === 'CONTACT') {
      return apiClient
        .get('/api/v1/contacts', { params: { search: searchValue, limit, page: 1 } })
        .then((r) => {
          // ApiResponse.paginated: { success, data: [...], meta: { total, ... } }
          const payload = r.data as any;
          const items: any[] = Array.isArray(payload?.data) ? payload.data : [];
          const total: number = payload?.meta?.total ?? items.length;
          const results = items.map((c: any) => {
            const comms: any[] = c.communications ?? [];
            const phone = comms.find((x: any) => ['MOBILE', 'PHONE', 'WHATSAPP'].includes(x.type))?.value ?? '';
            const email = comms.find((x: any) => x.type === 'EMAIL')?.value ?? '';
            const org   = c.contactOrganizations?.[0]?.organization;
            return {
              ...c,
              phone,
              email,
              city:  org?.city ?? c.city ?? '',
              gstin: c.gstin ?? '',
              name:  `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim(),
            };
          });
          return { results, total, limit, offset };
        });
    }

    if (entityType === 'ORGANIZATION') {
      return apiClient
        .get('/api/v1/organizations', { params: { search: searchValue, limit, page: 1 } })
        .then((r) => {
          const payload = r.data as any;
          const items: any[] = Array.isArray(payload?.data) ? payload.data : [];
          const total: number = payload?.meta?.total ?? items.length;
          const results = items.map((o: any) => ({
            ...o,
            gstin: o.gstNumber ?? o.gstin ?? '',
            phone: o.phone ?? '',
            email: o.email ?? '',
          }));
          return { results, total, limit, offset };
        });
    }

    // Generic smart-search for PRODUCT, LEDGER, etc.
    return apiClient
      .post('/api/v1/search/smart', { entityType, filters, limit, offset })
      .then((r) => r.data);
  },

  getParameters: (entityType: EntityType) =>
    apiClient.get(`/api/v1/search/smart/parameters/${entityType}`)
      .then((r) => r.data),
};
