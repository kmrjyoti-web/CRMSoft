"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseEntity = void 0;
class BaseEntity {
    constructor(id) {
        if (!id)
            throw new Error('Entity ID is required');
        this._id = id;
    }
    get id() {
        return this._id;
    }
    get createdAt() {
        return this._createdAt;
    }
    get updatedAt() {
        return this._updatedAt;
    }
    equals(other) {
        if (!other)
            return false;
        return this._id === other._id;
    }
}
exports.BaseEntity = BaseEntity;
//# sourceMappingURL=base.entity.js.map