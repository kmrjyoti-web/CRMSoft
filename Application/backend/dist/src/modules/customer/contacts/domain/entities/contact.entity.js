"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactEntity = void 0;
const aggregate_root_1 = require("../../../../../shared/domain/aggregate-root");
const contact_created_event_1 = require("../events/contact-created.event");
const contact_updated_event_1 = require("../events/contact-updated.event");
const contact_deactivated_event_1 = require("../events/contact-deactivated.event");
class ContactEntity extends aggregate_root_1.AggregateRoot {
    static create(id, props) {
        if (!props.firstName || props.firstName.trim().length === 0) {
            throw new Error('First name is required');
        }
        if (!props.lastName || props.lastName.trim().length === 0) {
            throw new Error('Last name is required');
        }
        const c = new ContactEntity();
        c._id = id;
        c._firstName = props.firstName.trim();
        c._lastName = props.lastName.trim();
        c._designation = props.designation?.trim() || undefined;
        c._department = props.department?.trim() || undefined;
        c._notes = props.notes?.trim() || undefined;
        c._isActive = true;
        c._isDeleted = false;
        c._deletedAt = null;
        c._deletedById = null;
        c._createdById = props.createdById;
        c._createdAt = new Date();
        c._updatedAt = new Date();
        c.addDomainEvent(new contact_created_event_1.ContactCreatedEvent(id, c._firstName, c._lastName, props.createdById));
        return c;
    }
    static fromPersistence(data) {
        const c = new ContactEntity();
        c._id = data.id;
        c._firstName = data.firstName;
        c._lastName = data.lastName;
        c._designation = data.designation ?? undefined;
        c._department = data.department ?? undefined;
        c._notes = data.notes ?? undefined;
        c._isActive = data.isActive ?? true;
        c._isDeleted = data.isDeleted ?? false;
        c._deletedAt = data.deletedAt ?? null;
        c._deletedById = data.deletedById ?? null;
        c._createdById = data.createdById;
        c._createdAt = data.createdAt;
        c._updatedAt = data.updatedAt;
        return c;
    }
    updateDetails(data, updatedById) {
        if (!this._isActive) {
            throw new Error('Cannot update deactivated contact');
        }
        const changed = [];
        if (data.firstName !== undefined) {
            if (data.firstName.trim().length === 0) {
                throw new Error('First name cannot be empty');
            }
            this._firstName = data.firstName.trim();
            changed.push('firstName');
        }
        if (data.lastName !== undefined) {
            if (data.lastName.trim().length === 0) {
                throw new Error('Last name cannot be empty');
            }
            this._lastName = data.lastName.trim();
            changed.push('lastName');
        }
        if (data.designation !== undefined) {
            this._designation = data.designation?.trim() || undefined;
            changed.push('designation');
        }
        if (data.department !== undefined) {
            this._department = data.department?.trim() || undefined;
            changed.push('department');
        }
        if (data.notes !== undefined) {
            this._notes = data.notes?.trim() || undefined;
            changed.push('notes');
        }
        if (changed.length === 0) {
            throw new Error('No fields provided to update');
        }
        this._updatedAt = new Date();
        this.addDomainEvent(new contact_updated_event_1.ContactUpdatedEvent(this._id, changed, updatedById));
    }
    deactivate() {
        if (!this._isActive) {
            throw new Error('Contact is already deactivated');
        }
        this._isActive = false;
        this._updatedAt = new Date();
        this.addDomainEvent(new contact_deactivated_event_1.ContactDeactivatedEvent(this._id, this._firstName, this._lastName));
    }
    reactivate() {
        if (this._isActive) {
            throw new Error('Contact is already active');
        }
        this._isActive = true;
        this._updatedAt = new Date();
    }
    softDelete(deletedById) {
        if (this._isDeleted) {
            throw new Error('Contact is already deleted');
        }
        this._isDeleted = true;
        this._isActive = false;
        this._deletedAt = new Date();
        this._deletedById = deletedById;
        this._updatedAt = new Date();
    }
    restore() {
        if (!this._isDeleted) {
            throw new Error('Contact is not deleted');
        }
        this._isDeleted = false;
        this._isActive = true;
        this._deletedAt = null;
        this._deletedById = null;
        this._updatedAt = new Date();
    }
    get fullName() { return `${this._firstName} ${this._lastName}`; }
    get firstName() { return this._firstName; }
    get lastName() { return this._lastName; }
    get designation() { return this._designation; }
    get department() { return this._department; }
    get notes() { return this._notes; }
    get isActive() { return this._isActive; }
    get isDeleted() { return this._isDeleted; }
    get deletedAt() { return this._deletedAt; }
    get deletedById() { return this._deletedById; }
    get createdById() { return this._createdById; }
}
exports.ContactEntity = ContactEntity;
//# sourceMappingURL=contact.entity.js.map