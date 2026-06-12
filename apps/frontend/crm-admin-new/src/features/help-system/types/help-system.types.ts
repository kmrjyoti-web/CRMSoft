// ---------------------------------------------------------------------------
// Help System Types
// ---------------------------------------------------------------------------

export interface HelpArticle {
  id: string;
  code: string;
  title: string;
  content: string;
  category: string;
  screenCode?: string;
  fieldCode?: string;
  tags?: string[];
  helpfulCount: number;
  notHelpfulCount: number;
  isPublished: boolean;
  sortOrder?: number;
  createdAt: string;
  updatedAt: string;
}

export interface HelpCategory {
  name: string;
  articleCount: number;
}

// DTOs
export interface CreateArticleDto {
  code: string;
  title: string;
  content: string;
  category: string;
  screenCode?: string;
  fieldCode?: string;
  tags?: string[];
  isPublished?: boolean;
  sortOrder?: number;
}

export interface UpdateArticleDto {
  title?: string;
  content?: string;
  category?: string;
  screenCode?: string;
  fieldCode?: string;
  tags?: string[];
  isPublished?: boolean;
  sortOrder?: number;
}

export interface HelpArticleFilters {
  search?: string;
  category?: string;
  screenCode?: string;
  page?: number;
  limit?: number;
}
