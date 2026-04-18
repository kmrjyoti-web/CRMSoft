"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseEntity = void 0;
class BaseEntity {
    constructor(id, tenantId, props) {
        this._id = id;
        this._tenantId = tenantId;
        this.props = props;
        this._createdAt = new Date();
        this._updatedAt = new Date();
    }
    get id() {
        return this._id;
    }
    get tenantId() {
        return this._tenantId;
    }
    get createdAt() {
        return this._createdAt;
    }
    get updatedAt() {
        return this._updatedAt;
    }
    setTimestamps(createdAt, updatedAt) {
        this._createdAt = createdAt;
        this._updatedAt = updatedAt;
    }
    touch() {
        this._updatedAt = new Date();
    }
    equals(other) {
        return this._id === other._id && this._tenantId === other._tenantId;
    }
}
exports.BaseEntity = BaseEntity;
//# sourceMappingURL=base-entity.js.map