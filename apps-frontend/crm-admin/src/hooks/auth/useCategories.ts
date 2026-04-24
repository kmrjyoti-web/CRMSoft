'use client';

import { useEffect, useState } from 'react';
import api from '@/services/api-client';

export interface UserCategory {
  id: string;
  code: string;
  name: string;
  description: string | null;
  icon: string | null;
  canOfferToB2b: boolean;
  canOfferToB2c: boolean;
  canViewB2cShopping: boolean;
  marketplaceRole: string | null;
  sortOrder: number;
}

export interface Subcategory {
  id: string;
  code: string;
  name: string;
  description: string | null;
  registrationFields: FieldDef[];
  requiresDocumentUpload: boolean;
  requiredDocuments: string[];
  requiresApproval: boolean;
  category: Pick<UserCategory, 'code' | 'name' | 'icon'>;
}

export interface FieldDef {
  name: string;
  label: string;
  type: 'text' | 'phone' | 'number' | 'textarea' | 'select' | 'multiselect';
  required: boolean;
  options?: string[];
}

export function useCategories() {
  const [categories, setCategories] = useState<UserCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/api/v1/platform-console/creator/user-categories')
      .then(({ data }) => {
        const list = Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
        setCategories(list);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return { categories, isLoading };
}

export function useSubcategories(verticalCode: string, categoryCode?: string) {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!verticalCode || !categoryCode) return;
    setIsLoading(true);
    api.get('/api/v1/platform-console/creator/user-categories/subcategories', {
      params: { vertical_code: verticalCode, category_code: categoryCode },
    })
      .then(({ data }) => {
        const list = Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
        setSubcategories(list);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [verticalCode, categoryCode]);

  return { subcategories, isLoading };
}
