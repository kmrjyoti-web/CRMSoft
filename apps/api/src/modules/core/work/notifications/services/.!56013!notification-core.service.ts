// @ts-nocheck
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';

@Injectable()
export class NotificationCoreService {
  constructor(private readonly prisma: PrismaService) {}

  async create(params: {
    category: string;
    title: string;
    message: string;
    recipientId: string;
    senderId?: string;
    priority?: string;
    channel?: string;
    entityType?: string;
    entityId?: string;
    data?: Record<string, unknown>;
    groupKey?: string;
  }) {
