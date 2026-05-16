import { create } from 'zustand';

interface UiState {
  activeTab: 'feed' | 'discover' | 'create' | 'offers' | 'profile';
  isOffline: boolean;
  showInstallPrompt: boolean;
  setActiveTab: (tab: UiState['activeTab']) => void;
  setOffline: (v: boolean) => void;
  setShowInstallPrompt: (v: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  activeTab: 'feed',
  isOffline: false,
  showInstallPrompt: false,
  setActiveTab: (activeTab) => set({ activeTab }),
  setOffline: (isOffline) => set({ isOffline }),
  setShowInstallPrompt: (showInstallPrompt) => set({ showInstallPrompt }),
}));
