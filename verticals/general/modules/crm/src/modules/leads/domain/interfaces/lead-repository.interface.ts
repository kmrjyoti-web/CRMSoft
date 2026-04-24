import { LeadEntity } from '../entities/lead.entity';

/**
 * Opaque marker type for a database transaction context.
 * The infrastructure layer provides the concrete Prisma transaction client;
 * the domain layer must remain unaware of the underlying ORM.
 */
export type TransactionClient = Record<string, unknown>;

export interface ILeadRepository {
  findById(id: string): Promise<LeadEntity | null>;
  save(lead: LeadEntity, tx?: TransactionClient): Promise<void>;
  delete(id: string): Promise<void>;
  nextLeadNumber(tx?: TransactionClient): Promise<string>;
}

export const LEAD_REPOSITORY = 'ILeadRepository';

