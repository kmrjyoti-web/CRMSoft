"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserMapper = void 0;
const user_entity_1 = require("../../domain/entities/user.entity");
class UserMapper {
    static toDomain(raw) {
        return user_entity_1.UserEntity.fromPersistence({
            id: raw.id,
            email: raw.email,
            password: raw.password,
            firstName: raw.firstName,
            lastName: raw.lastName,
            phone: raw.phone,
            avatar: raw.avatar,
            status: raw.status,
            userType: raw.userType,
            lastLoginAt: raw.lastLoginAt,
            roleId: raw.roleId,
            departmentId: raw.departmentId,
            designationId: raw.designationId,
            reportingToId: raw.reportingToId,
            employeeCode: raw.employeeCode,
            joiningDate: raw.joiningDate,
            isDeleted: raw.isDeleted,
            deletedAt: raw.deletedAt,
            deletedById: raw.deletedById,
            createdBy: raw.createdBy,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
        });
    }
    static toPersistence(entity) {
        return {
            id: entity.id,
            email: entity.email,
            password: entity.password,
            firstName: entity.firstName,
            lastName: entity.lastName,
            phone: entity.phone || null,
            avatar: entity.avatar || null,
            status: entity.status,
            userType: entity.userType,
            lastLoginAt: entity.lastLoginAt || null,
            roleId: entity.roleId,
            departmentId: entity.departmentId || null,
            designationId: entity.designationId || null,
            reportingToId: entity.reportingToId || null,
            employeeCode: entity.employeeCode || null,
            joiningDate: entity.joiningDate || null,
            isDeleted: entity.isDeleted,
            deletedAt: entity.deletedAt,
            deletedById: entity.deletedById,
            createdBy: entity.createdBy || null,
        };
    }
}
exports.UserMapper = UserMapper;
//# sourceMappingURL=user.mapper.js.map