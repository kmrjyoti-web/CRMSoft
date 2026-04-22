import { useState, useCallback } from 'react';

interface EditorState {
  content: string;
  title: string;
  isDirty: boolean;
  isSaving: boolean;
  aiPanelOpen: boolean;
}

export function useDocumentEditor(initialContent = '', initialTitle = '') {
  const [state, setState] = useState<EditorState>({
    content: initialContent,
    title: initialTitle,
    isDirty: false,
    isSaving: false,
    aiPanelOpen: false,
  });

  const setContent = useCallback((content: string) => {
    setState((s) => ({ ...s, content, isDirty: true }));
  }, []);

  const setTitle = useCallback((title: string) => {
    setState((s) => ({ ...s, title, isDirty: true }));
  }, []);

  const setSaving = useCallback((isSaving: boolean) => {
    setState((s) => ({ ...s, isSaving }));
  }, []);

  const markClean = useCallback(() => {
    setState((s) => ({ ...s, isDirty: false }));
  }, []);

  const toggleAiPanel = useCallback(() => {
    setState((s) => ({ ...s, aiPanelOpen: !s.aiPanelOpen }));
  }, []);

  const setAiPanelOpen = useCallback((open: boolean) => {
    setState((s) => ({ ...s, aiPanelOpen: open }));
  }, []);

  const insertAtCursor = useCallback((text: string) => {
    setState((s) => ({
      ...s,
      content: s.content + text,
      isDirty: true,
    }));
  }, []);

  return {
    ...state,
    setContent,
    setTitle,
    setSaving,
    markClean,
    toggleAiPanel,
    setAiPanelOpen,
    insertAtCursor,
  };
}
