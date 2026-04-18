import { UserEntity } from '../../domain/entities/user.entity';
export declare class UserMapper {
    static toDomain(raw: Record<string, unknown>): UserEntity;
    static toPersistence(entity: UserEntity): Record<string, unknown>;
}
