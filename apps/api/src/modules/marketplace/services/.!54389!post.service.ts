import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { PostStatus, PostType, VisibilityType } from '@prisma/platform-client';

interface CreatePostDto {
  postType: string;
  content?: string;
  mediaUrls?: Record<string, unknown>[];
  linkedListingId?: string;
  visibility?: string;
  visibilityConfig?: Record<string, unknown>;
  publishAt?: Date;
  expiresAt?: Date;
  hashtags?: string[];
  pollConfig?: Record<string, unknown>;
