import type { DocumentCategory, StorageType } from '../types/documents.types';

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
}

export function getMimeIcon(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'music';
  if (mimeType.includes('pdf')) return 'file-text';
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'table';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'monitor';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'file-text';
  if (mimeType.includes('zip') || mimeType.includes('compressed')) return 'archive';
  return 'file';
}

export function getCategoryLabel(category: DocumentCategory): string {
  const labels: Record<DocumentCategory, string> = {
    GENERAL: 'General',
    PROPOSAL: 'Proposal',
    CONTRACT: 'Contract',
    INVOICE: 'Invoice',
    QUOTATION: 'Quotation',
    REPORT: 'Report',
    PRESENTATION: 'Presentation',
    SPREADSHEET: 'Spreadsheet',
    IMAGE: 'Image',
    VIDEO: 'Video',
    AUDIO: 'Audio',
    OTHER: 'Other',
  };
  return labels[category] ?? category;
}

export function getCategoryColor(category: DocumentCategory): 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'secondary' {
  const colors: Record<DocumentCategory, 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'secondary'> = {
    GENERAL: 'default',
    PROPOSAL: 'primary',
    CONTRACT: 'success',
    INVOICE: 'warning',
    QUOTATION: 'primary',
    REPORT: 'secondary',
    PRESENTATION: 'primary',
    SPREADSHEET: 'success',
    IMAGE: 'default',
    VIDEO: 'default',
    AUDIO: 'default',
    OTHER: 'default',
  };
  return colors[category] ?? 'default';
}

export function getStorageLabel(type: StorageType): string {
  const labels: Record<StorageType, string> = {
    LOCAL: 'Local',
    S3: 'Cloud (S3)',
    CLOUD_LINK: 'Cloud Link',
  };
  return labels[type] ?? type;
}

export function getStatusColor(status: string): 'default' | 'primary' | 'success' | 'warning' | 'danger' {
  const map: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'danger'> = {
    UPLOADING: 'warning',
    ACTIVE: 'success',
    ARCHIVED: 'default',
    DELETED: 'danger',
  };
  return map[status] ?? 'default';
}
