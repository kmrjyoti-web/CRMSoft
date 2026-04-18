"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AggregateRoot = void 0;
const cqrs_1 = require("@nestjs/cqrs");
class AggregateRoot extends cqrs_1.AggregateRoot {
    constructor() {
        super(...arguments);
        this._domainEvents = [];
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
    addDomainEvent(event) {
        this._domainEvents.push(event);
        this.apply(event);
    }
    getDomainEvents() {
        return [...this._domainEvents];
    }
    clearDomainEvents() {
        this._domainEvents = [];
    }
    equals(other) {
        if (!other)
            return false;
        return this._id === other._id;
    }
}
exports.AggregateRoot = AggregateRoot;
//# sourceMappingURL=aggregate-root.js.map