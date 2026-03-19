// @ts-nocheck
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { AppError } from '../../../../../common/errors/app-error';
import { AutoNumberSequence, SequenceResetPolicy } from '@prisma/working-client';

@Injectable()
export class AutoNumberService {
  private readonly logger = new Logger(AutoNumberService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generate the next number for an entity with row-level locking.
   * Used by LeadService, ContactService, QuotationService, etc.
   */
  async next(tenantId: string, entityName: string): Promise<string> {
    return this.prisma.identity.$transaction(async (tx: any) => {
      const rows = await tx.$queryRawUnsafe<AutoNumberSequence[]>(
        `SELECT * FROM auto_number_sequences WHERE tenant_id = $1 AND entity_name = $2 FOR UPDATE`,
        tenantId,
        entityName,
      );
      if (!rows.length) throw AppError.from('CONFIG_ERROR');
      const seq = rows[0];
      if (!seq.isActive) throw AppError.from('CONFIG_ERROR');

      let current = seq.currentSequence;
      const shouldReset = this.shouldReset(seq);
      if (shouldReset) {
        current = seq.startFrom - seq.incrementBy;
        await tx.autoNumberSequence.update({
          where: { id: seq.id },
          data: {
            lastResetSequence: seq.currentSequence,
            lastResetAt: new Date(),
          },
        });
      }

      const nextVal = current + seq.incrementBy;
      const formatted = this.format(seq.formatPattern, seq.prefix, nextVal, seq.seqPadding);

      await tx.autoNumberSequence.update({
        where: { id: seq.id },
        data: { currentSequence: nextVal, sampleNumber: formatted },
      });

      return formatted;
    });
  }

  /** Preview the next number without incrementing. */
  async preview(tenantId: string, entityName: string): Promise<string> {
    const seq = await this.findSequence(tenantId, entityName);
    const nextVal = seq.currentSequence + seq.incrementBy;
    return this.format(seq.formatPattern, seq.prefix, nextVal, seq.seqPadding);
  }

  /** Manually reset a sequence. */
  async resetSequence(tenantId: string, entityName: string, newStart?: number): Promise<void> {
    const seq = await this.findSequence(tenantId, entityName);
    const startVal = newStart ?? seq.startFrom;
    await this.prisma.autoNumberSequence.update({
      where: { id: seq.id },
      data: {
        currentSequence: startVal - seq.incrementBy,
        lastResetAt: new Date(),
        lastResetSequence: seq.currentSequence,
      },
    });
    this.logger.log(`Reset sequence ${entityName} for tenant ${tenantId} to ${startVal}`);
  }

  /** Check and auto-reset all sequences based on reset policy. */
  async autoResetAll(tenantId: string): Promise<{ reset: string[]; skipped: string[] }> {
    const sequences = await this.prisma.autoNumberSequence.findMany({
      where: { tenantId, isActive: true },
    });
    const reset: string[] = [];
    const skipped: string[] = [];
    for (const seq of sequences) {
      if (this.shouldReset(seq)) {
        await this.resetSequence(tenantId, seq.entityName);
        reset.push(seq.entityName);
      } else {
        skipped.push(seq.entityName);
      }
    }
    return { reset, skipped };
  }

  /** Get all sequences for a tenant. */
  async getAll(tenantId: string): Promise<AutoNumberSequence[]> {
    return this.prisma.autoNumberSequence.findMany({ where: { tenantId } });
  }

  /** Get single sequence. */
  async getOne(tenantId: string, entityName: string): Promise<AutoNumberSequence> {
    return this.findSequence(tenantId, entityName);
  }

  /** Update sequence settings. */
  async update(tenantId: string, entityName: string, data: Partial<AutoNumberSequence>): Promise<AutoNumberSequence> {
    const seq = await this.findSequence(tenantId, entityName);
    return this.prisma.autoNumberSequence.update({ where: { id: seq.id }, data });
  }

  /** Format a number using the format pattern. */
  format(pattern: string, prefix: string, seq: number, defaultPad: number): string {
    const now = new Date();
    return pattern
      .replace(/{PREFIX}/g, prefix)
      .replace(/{YYYY}/g, now.getFullYear().toString())
      .replace(/{YY}/g, now.getFullYear().toString().slice(-2))
      .replace(/{MM}/g, String(now.getMonth() + 1).padStart(2, '0'))
      .replace(/{DD}/g, String(now.getDate()).padStart(2, '0'))
      .replace(/{SEQ:(\d+)}/g, (_, n) => seq.toString().padStart(Number(n), '0'))
      .replace(/{SEQ}/g, seq.toString().padStart(defaultPad, '0'));
  }

  private shouldReset(seq: AutoNumberSequence): boolean {
    if (seq.resetPolicy === SequenceResetPolicy.NEVER) return false;
    const lastReset = seq.lastResetAt ?? seq.createdAt;
    const now = new Date();
    switch (seq.resetPolicy) {
      case SequenceResetPolicy.DAILY:
        return now.toDateString() !== lastReset.toDateString();
      case SequenceResetPolicy.MONTHLY:
        return now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear();
      case SequenceResetPolicy.QUARTERLY:
        return Math.floor(now.getMonth() / 3) !== Math.floor(lastReset.getMonth() / 3)
          || now.getFullYear() !== lastReset.getFullYear();
      case SequenceResetPolicy.YEARLY:
        return now.getFullYear() !== lastReset.getFullYear();
      default:
        return false;
    }
  }

  private async findSequence(tenantId: string, entityName: string): Promise<AutoNumberSequence> {
    const seq = await this.prisma.autoNumberSequence.findUnique({
      where: { tenantId_entityName: { tenantId, entityName } },
    });
    if (!seq) throw AppError.from('CONFIG_ERROR');
    return seq;
  }
}
