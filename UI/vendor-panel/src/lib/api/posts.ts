import apiClient from './client';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type { Post, CreatePostDto, PostComment } from '@/types/post';

export const postsApi = {
  feed: (params?: { page?: number; limit?: number }) =>
    apiClient.get<ApiResponse<PaginatedResponse<Post>>>('/marketplace/posts/feed', { params }).then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<ApiResponse<Post>>(`/marketplace/posts/${id}`).then((r) => r.data),

  create: (data: CreatePostDto) =>
    apiClient.post<ApiResponse<Post>>('/marketplace/posts', data).then((r) => r.data),

  update: (id: string, data: Partial<CreatePostDto>) =>
    apiClient.put<ApiResponse<Post>>(`/marketplace/posts/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/marketplace/posts/${id}`).then((r) => r.data),

  like: (id: string) =>
    apiClient.post<ApiResponse<void>>(`/marketplace/posts/${id}/like`).then((r) => r.data),

  comment: (id: string, content: string, parentId?: string) =>
    apiClient.post<ApiResponse<PostComment>>(`/marketplace/posts/${id}/comment`, { content, parentId }).then((r) => r.data),
};
