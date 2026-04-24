'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { autoMenuService, type AutoMenuItem } from './auto-menu.service';

interface MenuContextType {
  menu: AutoMenuItem[];
  isLoading: boolean;
  hasAccess: (path: string) => boolean;
}

const MenuContext = createContext<MenuContextType | null>(null);

export function MenuProvider({ children }: { children: ReactNode }) {
  const vendor = useAuthStore((s) => s.vendor);
  const [menu, setMenu] = useState<AutoMenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Vendor's enabled modules (from login response or empty)
    const enabledModules = vendor?.enabledModules ?? [];
    const autoMenu = autoMenuService.buildMenu(enabledModules, true);
    setMenu(autoMenu);
    setIsLoading(false);
  }, [vendor]);

  const hasAccess = (path: string): boolean => {
    const moduleKey = autoMenuService.getModuleRequirement(path);
    if (!moduleKey) return true;
    const enabledModules = vendor?.enabledModules ?? [];
    return enabledModules.includes(moduleKey);
  };

  return (
    <MenuContext.Provider value={{ menu, isLoading, hasAccess }}>
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error('useMenu must be used within MenuProvider');
  return ctx;
}
