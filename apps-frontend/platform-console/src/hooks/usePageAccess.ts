'use client';

import { useEffect, useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

export interface PageAccessRule {
  pageRegistryId: string;
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canExport: boolean;
}

export interface MyAccess {
  combinedCode: string | null;
  allowAll: boolean;
  pages: PageAccessRule[];
}

// Module-level cache — one fetch per browser session
let cached: MyAccess | null = null;
let pending: Promise<MyAccess> | null = null;

async function fetchAccess(token: string): Promise<MyAccess> {
  if (cached) return cached;
  if (pending) return pending;

  pending = fetch(`${API_BASE}/pc-config/my-access`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((r) => r.json())
    .then((data) => {
      cached = data.data ?? data;
      return cached!;
    })
    .catch(() => {
      // On error, fall back to allow-all so the UI doesn't fully break
      const fallback: MyAccess = { combinedCode: null, allowAll: true, pages: [] };
      cached = fallback;
      return fallback;
    })
    .finally(() => { pending = null; });

  return pending;
}

export function clearAccessCache() {
  cached = null;
}

export function usePageAccess() {
  const [access, setAccess] = useState<MyAccess | null>(cached);
  const [loading, setLoading] = useState(!cached);

  useEffect(() => {
    if (cached) { setAccess(cached); setLoading(false); return; }

    const token = localStorage.getItem('portal_token');
    if (!token) {
      setAccess({ combinedCode: null, allowAll: true, pages: [] });
      setLoading(false);
      return;
    }

    fetchAccess(token)
      .then(setAccess)
      .finally(() => setLoading(false));
  }, []);

  const canRead = (pageCode: string): boolean => {
    if (!access) return true;
    if (access.allowAll) return true;
    const rule = access.pages.find((p) => p.pageRegistryId === pageCode);
    return rule?.canRead ?? true;
  };

  const canCreate = (pageCode: string): boolean => {
    if (!access) return false;
    if (access.allowAll) return true;
    const rule = access.pages.find((p) => p.pageRegistryId === pageCode);
    return rule?.canCreate ?? false;
  };

  return { access, loading, canRead, canCreate };
}
