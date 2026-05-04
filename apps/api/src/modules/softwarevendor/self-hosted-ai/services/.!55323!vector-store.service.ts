import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { OllamaService } from './ollama.service';

export interface ChunkResult {
  id: string;
  content: string;
  score: number;
  documentId: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class VectorStoreService {
  private readonly logger = new Logger(VectorStoreService.name);
  private pgvectorEnabled = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly ollama: OllamaService,
  ) {
    this.initPgVector().catch(() => {
