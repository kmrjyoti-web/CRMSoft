// Source: Angular utils/page-layout.service.ts
import { create } from "zustand";

interface PageLayoutStore {
  showMainHeader: boolean;
  showMainSidebar: boolean;
  showMainFooter: boolean;

  hideHeader: () => void;
  showHeader: () => void;
  hideSidebar: () => void;
  showSidebar: () => void;
  hideFooter: () => void;
  showFooter: () => void;
  enterFullScreen: () => void;
  reset: () => void;
}

export const usePageLayout = create<PageLayoutStore>((set) => ({
  showMainHeader: true,
  showMainSidebar: true,
  showMainFooter: true,

  hideHeader: () => set({ showMainHeader: false }),
  showHeader: () => set({ showMainHeader: true }),
  hideSidebar: () => set({ showMainSidebar: false }),
  showSidebar: () => set({ showMainSidebar: true }),
  hideFooter: () => set({ showMainFooter: false }),
  showFooter: () => set({ showMainFooter: true }),

  enterFullScreen: () =>
    set({ showMainHeader: false, showMainSidebar: false, showMainFooter: false }),

  reset: () =>
    set({ showMainHeader: true, showMainSidebar: true, showMainFooter: true }),
}));
