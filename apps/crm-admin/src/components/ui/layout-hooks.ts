// Re-export CoreUI layout hooks & components for use outside ui/
// This follows the golden rule: only ui/ imports from @coreui/*

export { useLayout } from '@coreui/layout';
export { useMargLayout } from '@coreui/layout';
export type { MenuItem } from '@coreui/layout';

// Theme customization & shortcuts components
export { MargThemeCustomizer } from '@coreui/layout';
export { MargShortcuts } from '@coreui/layout';
export type { MargShortcutsProps } from '@coreui/layout';
