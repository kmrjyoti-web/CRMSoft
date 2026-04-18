"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserEntity = void 0;
const aggregate_root_1 = require("../../../../../../shared/domain/aggregate-root");
class UserEntity extends aggregate_root_1.AggregateRoot {
    static create(id, props) {
        const user = new UserEntity();
        user._id = id;
        user._email = props.email;
        user._password = props.password;
        user._firstName = props.firstName;
        user._lastName = props.lastName;
        user._phone = props.phone;
        user._avatar = props.avatar;
        user._status = props.status || 'ACTIVE';
        user._userType = props.userType || 'EMPLOYEE';
        user._roleId = props.roleId;
        user._departmentId = props.departmentId;
        user._designationId = props.designationId;
        user._reportingToId = props.reportingToId;
        user._employeeCode = props.employeeCode;
        user._joiningDate = props.joiningDate;
        user._isDeleted = false;
        user._deletedAt = null;
        user._deletedById = null;
        user._createdBy = props.createdBy;
        user._createdAt = new Date();
        user._updatedAt = new Date();
        return user;
    }
    static fromPersistence(data) {
        const user = new UserEntity();
        user._id = data.id;
        user._email = data.email;
        user._password = data.password;
        user._firstName = data.firstName;
        user._lastName = data.lastName;
        user._phone = data.phone ?? undefined;
        user._avatar = data.avatar ?? undefined;
        user._status = data.status;
        user._userType = data.userType;
        user._lastLoginAt = data.lastLoginAt ?? undefined;
        user._roleId = data.roleId;
        user._departmentId = data.departmentId ?? undefined;
        user._designationId = data.designationId ?? undefined;
        user._reportingToId = data.reportingToId ?? undefined;
        user._employeeCode = data.employeeCode ?? undefined;
        user._joiningDate = data.joiningDate ?? undefined;
        user._isDeleted = data.isDeleted ?? false;
        user._deletedAt = data.deletedAt ?? null;
        user._deletedById = data.deletedById ?? null;
        user._createdBy = data.createdBy ?? undefined;
        user._createdAt = data.createdAt;
        user._updatedAt = data.updatedAt;
        return user;
    }
    softDelete(deletedById) {
        if (this._isDeleted) {
            throw new Error('User is already deleted');
        }
        this._isDeleted = true;
        this._deletedAt = new Date();
        this._deletedById = deletedById;
        this._updatedAt = new Date();
    }
    restore() {
        if (!this._isDeleted) {
            throw new Error('User is not deleted');
        }
        this._isDeleted = false;
        this._deletedAt = null;
        this._deletedById = null;
        this._updatedAt = new Date();
    }
    get email() { return this._email; }
    get password() { return this._password; }
    get firstName() { return this._firstName; }
    get lastName() { return this._lastName; }
    get fullName() { return `${this._firstName} ${this._lastName}`; }
    get phone() { return this._phone; }
    get avatar() { return this._avatar; }
    get status() { return this._status; }
    get userType() { return this._userType; }
    get lastLoginAt() { return this._lastLoginAt; }
    get roleId() { return this._roleId; }
    get departmentId() { return this._departmentId; }
    get designationId() { return this._designationId; }
    get reportingToId() { return this._reportingToId; }
    get employeeCode() { return this._employeeCode; }
    get joiningDate() { return this._joiningDate; }
    get isDeleted() { return this._isDeleted; }
    get deletedAt() { return this._deletedAt; }
    get deletedById() { return this._deletedById; }
    get createdBy() { return this._createdBy; }
}
exports.UserEntity = UserEntity;
//# sourceMappingURL=user.entity.js.map