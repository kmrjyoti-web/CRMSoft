export type PostType = 'PT_TEXT' | 'PT_IMAGE' | 'PT_VIDEO' | 'PT_PRODUCT_SHARE' | 'PT_JOB_POSTING' | 'PT_NEWS' | 'PT_ANNOUNCEMENT' | 'PT_POLL';
export type PostStatus = 'PS_DRAFT' | 'PS_SCHEDULED' | 'PS_ACTIVE' | 'PS_EXPIRED' | 'PS_ARCHIVED';

export interface Post {
  id: string;
  tenantId: string;
  authorId: string;
  postType: PostType;
  content?: string;
  mediaUrls: string[];
  linkedListingId?: string;
  linkedListing?: { id: string; title: string; mediaUrls: string[] };
  visibility: string;
  status: PostStatus;
  hashtags: string[];
  publishAt?: string;
  expiresAt?: string;
  pollConfig?: PollConfig;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  saveCount: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PollConfig {
  question: string;
  options: { text: string; votes: number }[];
  expiresAt?: string;
  multipleChoice?: boolean;
}

export interface PostComment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  content: string;
  parentId?: string;
  children?: PostComment[];
  createdAt: string;
}

export interface CreatePostDto {
  postType: PostType;
  content?: string;
  mediaUrls?: string[];
  linkedListingId?: string;
  visibility?: string;
  hashtags?: string[];
  publishAt?: string;
  expiresAt?: string;
  pollConfig?: Omit<PollConfig, 'options'> & { options: string[] };
}
