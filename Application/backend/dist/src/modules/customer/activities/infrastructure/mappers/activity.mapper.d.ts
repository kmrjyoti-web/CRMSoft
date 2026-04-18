import { ActivityEntity } from '../../domain/entities/activity.entity';
export declare class ActivityMapper {
    static toDomain(raw: Record<string, unknown>): ActivityEntity;
    static toPersistence(entity: ActivityEntity): any;
}
