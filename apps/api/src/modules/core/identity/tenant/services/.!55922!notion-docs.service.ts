import { Injectable, Logger } from '@nestjs/common';
import { Client } from '@notionhq/client';
import { PrismaService } from '../../../../../core/prisma/prisma.service';

@Injectable()
export class NotionDocsService {
  private readonly logger = new Logger(NotionDocsService.name);
  private notion: Client | null = null;

  constructor(private readonly prisma: PrismaService) {
    const token = process.env.NOTION_TOKEN;
    if (token) {
      this.notion = new Client({ auth: token });
      this.logger.log('Notion client initialized');
    } else {
