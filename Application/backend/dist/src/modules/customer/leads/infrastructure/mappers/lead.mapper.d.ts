import { LeadEntity } from '../../domain/entities/lead.entity';
export declare class LeadMapper {
    static toDomain(raw: Record<string, unknown>): LeadEntity;
    static toPersistence(entity: LeadEntity): any;
}
