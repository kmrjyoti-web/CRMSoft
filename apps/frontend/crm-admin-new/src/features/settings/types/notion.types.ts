export interface NotionConfig {
  id: string;
  tenantId: string;
  tokenMasked: string;
  databaseId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotionDatabase {
  id: string;
  title: string;
}

export interface NotionEntry {
  id: string;
  promptNumber: string;
  title: string;
  description: string;
  status: string;
  filesChanged: string;
  testResults: string;
  date: string;
  url?: string;
}

export interface NotionEntryCreate {
  promptNumber: string;
  title: string;
  description?: string;
  status: string;
  filesChanged?: string;
  testResults?: string;
}

export interface NotionConfigUpdate {
  token: string;
  databaseId?: string;
}
