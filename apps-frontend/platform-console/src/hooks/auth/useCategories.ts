'use client';

import { useEffect, useState } from 'react';

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

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

export function useCategories() {
  const [categories, setCategories] = useState<UserCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/platform-console/creator/user-categories`)
      .then((r) => r.json())
      .then((d) => setCategories(Array.isArray(d) ? d : (d.data ?? [])))
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
    const url = `${API_BASE}/platform-console/creator/user-categories/subcategories?vertical_code=${verticalCode}&category_code=${categoryCode}`;
    fetch(url)
      .then((r) => r.json())
      .then((d) => setSubcategories(Array.isArray(d) ? d : (d.data ?? [])))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [verticalCode, categoryCode]);

  return { subcategories, isLoading };
}
