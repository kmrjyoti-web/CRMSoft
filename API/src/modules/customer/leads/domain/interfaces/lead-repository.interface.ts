import { PrismaClient } from '@prisma/working-client';
import { LeadEntity } from '../entities/lead.entity';

/** Prisma interactive-transaction client (same API minus connection methods). */
export type TransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

export interface ILeadRepository {
  findById(id: string): Promise<LeadEntity | null>;
  save(lead: LeadEntity, tx?: TransactionClient): Promise<void>;
  delete(id: string): Promise<void>;
  nextLeadNumber(tx?: TransactionClient): Promise<string>;
}

export const LEAD_REPOSITORY = 'ILeadRepository';

