import { create } from 'zustand';

import type { WaConversationStatus } from '../types/whatsapp.types';

interface ConversationState {
  activeConversationId: string | null;
  filterStatus: WaConversationStatus | 'ALL';
  searchQuery: string;
  setActiveConversation: (id: string | null) => void;
  setFilterStatus: (status: WaConversationStatus | 'ALL') => void;
  setSearchQuery: (q: string) => void;
}

export const useConversationStore = create<ConversationState>((set) => ({
  activeConversationId: null,
  filterStatus: 'ALL',
  searchQuery: '',
  setActiveConversation: (id) => set({ activeConversationId: id }),
  setFilterStatus: (status) => set({ filterStatus: status }),
  setSearchQuery: (q) => set({ searchQuery: q }),
}));
