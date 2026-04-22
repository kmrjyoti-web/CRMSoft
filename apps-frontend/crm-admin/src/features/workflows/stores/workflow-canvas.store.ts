import { create } from 'zustand';

import type { WorkflowExecutionResult } from '../types/visual-workflow.types';

// ── State ────────────────────────────────────────────────

export interface WorkflowCanvasState {
  workflowId: string | null;
  workflowName: string;
  workflowDescription: string;
  isActive: boolean;
  isDirty: boolean;
  selectedNodeId: string | null;
  isPaletteOpen: boolean;
  isConfigPanelOpen: boolean;
  isExecutionPanelOpen: boolean;
  executionResult: WorkflowExecutionResult | null;

  // Actions
  setWorkflow: (id: string, name: string, desc: string, active: boolean) => void;
  setDirty: (dirty: boolean) => void;
  selectNode: (nodeId: string | null) => void;
  togglePalette: () => void;
  toggleConfigPanel: () => void;
  toggleExecutionPanel: () => void;
  setExecutionResult: (result: WorkflowExecutionResult | null) => void;
  reset: () => void;
}

// ── Initial State ────────────────────────────────────────

const INITIAL_STATE = {
  workflowId: null,
  workflowName: '',
  workflowDescription: '',
  isActive: false,
  isDirty: false,
  selectedNodeId: null,
  isPaletteOpen: true,
  isConfigPanelOpen: false,
  isExecutionPanelOpen: false,
  executionResult: null,
} as const;

// ── Store ────────────────────────────────────────────────

export const useWorkflowCanvasStore = create<WorkflowCanvasState>((set) => ({
  ...INITIAL_STATE,

  setWorkflow: (id, name, desc, active) =>
    set({
      workflowId: id,
      workflowName: name,
      workflowDescription: desc,
      isActive: active,
      isDirty: false,
    }),

  setDirty: (dirty) => set({ isDirty: dirty }),

  selectNode: (nodeId) =>
    set({
      selectedNodeId: nodeId,
      isConfigPanelOpen: nodeId !== null,
    }),

  togglePalette: () => set((s) => ({ isPaletteOpen: !s.isPaletteOpen })),

  toggleConfigPanel: () =>
    set((s) => ({
      isConfigPanelOpen: !s.isConfigPanelOpen,
      // Clear selection when closing
      selectedNodeId: s.isConfigPanelOpen ? null : s.selectedNodeId,
    })),

  toggleExecutionPanel: () =>
    set((s) => ({ isExecutionPanelOpen: !s.isExecutionPanelOpen })),

  setExecutionResult: (result) =>
    set({ executionResult: result, isExecutionPanelOpen: result !== null }),

  reset: () => set({ ...INITIAL_STATE }),
}));
