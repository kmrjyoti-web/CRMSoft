import { create } from 'zustand';
import type {
  CanvasDesign,
  CanvasElement,
  CanvasBand,
  BandType,
  ControlType,
  PaperSettings,
  HistoryEntry,
} from '../types/report-designer.types';
import { BAND_DEFINITIONS } from '../constants/control-definitions';

interface DesignerState {
  // Design
  design: CanvasDesign;
  isDirty: boolean;
  templateId: string | null;
  templateName: string;
  documentType: string;

  // Selection
  selectedElementId: string | null;
  selectedBandType: BandType | null;

  // UI
  zoom: number;
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;

  // History
  history: HistoryEntry[];
  historyIndex: number;

  // Actions — Design
  setDesign: (design: CanvasDesign) => void;
  loadTemplate: (templateId: string, name: string, docType: string, design: CanvasDesign | null) => void;
  setPaper: (paper: Partial<PaperSettings>) => void;

  // Actions — Elements
  addElement: (bandType: BandType, element: CanvasElement) => void;
  updateElement: (elementId: string, updates: Partial<CanvasElement>) => void;
  removeElement: (elementId: string) => void;
  moveElement: (elementId: string, toBandType: BandType) => void;
  selectElement: (elementId: string | null) => void;

  // Actions — Bands
  updateBandHeight: (bandType: BandType, height: number) => void;
  toggleBandCollapse: (bandType: BandType) => void;
  selectBand: (bandType: BandType | null) => void;

  // Actions — UI
  setZoom: (zoom: number) => void;
  toggleGrid: () => void;
  toggleSnap: () => void;

  // Actions — History
  undo: () => void;
  redo: () => void;
  pushHistory: (description: string) => void;

  // Computed
  getSelectedElement: () => CanvasElement | null;
  getSelectedBand: () => CanvasBand | null;
  getAllElements: () => CanvasElement[];
}

function createEmptyDesign(): CanvasDesign {
  return {
    version: 2,
    paper: { size: 'A4', orientation: 'portrait', margins: { top: 20, right: 15, bottom: 20, left: 15 } },
    bands: BAND_DEFINITIONS.map((bd) => ({
      type: bd.type,
      height: bd.defaultHeight,
      elements: [],
    })),
    formulas: [],
  };
}

let elementCounter = 0;
export function generateElementId(): string {
  elementCounter += 1;
  return `el_${Date.now()}_${elementCounter}`;
}

export const useDesignerStore = create<DesignerState>((set, get) => ({
  // Initial state
  design: createEmptyDesign(),
  isDirty: false,
  templateId: null,
  templateName: '',
  documentType: '',

  selectedElementId: null,
  selectedBandType: null,

  zoom: 100,
  showGrid: true,
  snapToGrid: true,
  gridSize: 10,

  history: [],
  historyIndex: -1,

  // Design actions
  setDesign: (design) => {
    set({ design, isDirty: true });
    get().pushHistory('Design updated');
  },

  loadTemplate: (templateId, name, docType, design) => {
    const finalDesign = design ?? createEmptyDesign();
    elementCounter = 0;
    set({
      templateId,
      templateName: name,
      documentType: docType,
      design: finalDesign,
      isDirty: false,
      selectedElementId: null,
      selectedBandType: null,
      history: [{ design: JSON.parse(JSON.stringify(finalDesign)), description: 'Loaded', timestamp: Date.now() }],
      historyIndex: 0,
    });
  },

  setPaper: (paper) => {
    set((state) => ({
      design: { ...state.design, paper: { ...state.design.paper, ...paper } },
      isDirty: true,
    }));
  },

  // Element actions
  addElement: (bandType, element) => {
    set((state) => {
      const newBands = state.design.bands.map((band) =>
        band.type === bandType
          ? { ...band, elements: [...band.elements, element] }
          : band,
      );
      return { design: { ...state.design, bands: newBands }, isDirty: true };
    });
    get().pushHistory(`Added ${element.type}`);
  },

  updateElement: (elementId, updates) => {
    set((state) => {
      const newBands = state.design.bands.map((band) => ({
        ...band,
        elements: band.elements.map((el) =>
          el.id === elementId ? { ...el, ...updates } : el,
        ),
      }));
      return { design: { ...state.design, bands: newBands }, isDirty: true };
    });
  },

  removeElement: (elementId) => {
    set((state) => {
      const newBands = state.design.bands.map((band) => ({
        ...band,
        elements: band.elements.filter((el) => el.id !== elementId),
      }));
      return {
        design: { ...state.design, bands: newBands },
        isDirty: true,
        selectedElementId: state.selectedElementId === elementId ? null : state.selectedElementId,
      };
    });
    get().pushHistory('Removed element');
  },

  moveElement: (elementId, toBandType) => {
    const state = get();
    let movedElement: CanvasElement | null = null;

    const cleanedBands = state.design.bands.map((band) => {
      const found = band.elements.find((el) => el.id === elementId);
      if (found) movedElement = found;
      return { ...band, elements: band.elements.filter((el) => el.id !== elementId) };
    });

    if (!movedElement) return;

    const newBands = cleanedBands.map((band) =>
      band.type === toBandType
        ? { ...band, elements: [...band.elements, movedElement!] }
        : band,
    );

    set({ design: { ...state.design, bands: newBands }, isDirty: true });
    get().pushHistory('Moved element');
  },

  selectElement: (elementId) => set({ selectedElementId: elementId }),

  // Band actions
  updateBandHeight: (bandType, height) => {
    set((state) => {
      const newBands = state.design.bands.map((band) =>
        band.type === bandType ? { ...band, height: Math.max(20, height) } : band,
      );
      return { design: { ...state.design, bands: newBands }, isDirty: true };
    });
  },

  toggleBandCollapse: (bandType) => {
    set((state) => {
      const newBands = state.design.bands.map((band) =>
        band.type === bandType ? { ...band, collapsed: !band.collapsed } : band,
      );
      return { design: { ...state.design, bands: newBands } };
    });
  },

  selectBand: (bandType) => set({ selectedBandType: bandType, selectedElementId: null }),

  // UI actions
  setZoom: (zoom) => set({ zoom: Math.max(25, Math.min(200, zoom)) }),
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  toggleSnap: () => set((state) => ({ snapToGrid: !state.snapToGrid })),

  // History
  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    set({
      design: JSON.parse(JSON.stringify(history[newIndex].design)),
      historyIndex: newIndex,
      isDirty: true,
    });
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    set({
      design: JSON.parse(JSON.stringify(history[newIndex].design)),
      historyIndex: newIndex,
      isDirty: true,
    });
  },

  pushHistory: (description) => {
    const { design, history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({
      design: JSON.parse(JSON.stringify(design)),
      description,
      timestamp: Date.now(),
    });
    // Keep last 50 entries
    if (newHistory.length > 50) newHistory.shift();
    set({ history: newHistory, historyIndex: newHistory.length - 1 });
  },

  // Computed
  getSelectedElement: () => {
    const { design, selectedElementId } = get();
    if (!selectedElementId) return null;
    for (const band of design.bands) {
      const el = band.elements.find((e) => e.id === selectedElementId);
      if (el) return el;
    }
    return null;
  },

  getSelectedBand: () => {
    const { design, selectedBandType } = get();
    if (!selectedBandType) return null;
    return design.bands.find((b) => b.type === selectedBandType) ?? null;
  },

  getAllElements: () => {
    return get().design.bands.flatMap((b) => b.elements);
  },
}));
