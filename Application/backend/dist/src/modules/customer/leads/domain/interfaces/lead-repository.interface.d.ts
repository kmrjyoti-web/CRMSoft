import { LeadEntity } from '../entities/lead.entity';
export type TransactionClient = Record<string, unknown>;
export interface ILeadRepository {
    findById(id: string): Promise<LeadEntity | null>;
    save(lead: LeadEntity, tx?: TransactionClient): Promise<void>;
    delete(id: string): Promise<void>;
    nextLeadNumber(tx?: TransactionClient): Promise<string>;
}
export declare const LEAD_REPOSITORY = "ILeadRepository";
