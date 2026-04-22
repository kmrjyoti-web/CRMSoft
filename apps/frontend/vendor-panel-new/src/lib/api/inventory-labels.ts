import { apiClient } from './client';

export interface InventoryLabel {
  id: string;
  industryCode: string;
  serialNoLabel: string;
  code1Label: string | null;
  code2Label: string | null;
  expiryLabel: string | null;
  stockInLabel: string | null;
  stockOutLabel: string | null;
  locationLabel: string | null;
}

export const inventoryLabelsApi = {
  list: () =>
    apiClient.get('/vendor/inventory-labels').then((r) => r.data),

  upsert: (payload: Partial<InventoryLabel>) =>
    apiClient.post('/vendor/inventory-labels', payload).then((r) => r.data),
};
