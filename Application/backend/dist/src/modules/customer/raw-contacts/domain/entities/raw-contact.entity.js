"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RawContactEntity = void 0;
const aggregate_root_1 = require("../../../../../shared/domain/aggregate-root");
const raw_contact_status_vo_1 = require("../value-objects/raw-contact-status.vo");
const raw_contact_created_event_1 = require("../events/raw-contact-created.event");
const raw_contact_verified_event_1 = require("../events/raw-contact-verified.event");
class RawContactEntity extends aggregate_root_1.AggregateRoot {
    static create(id, props) {
        if (!props.firstName || props.firstName.trim().length === 0) {
            throw new Error('First name is required');
        }
        if (!props.lastName || props.lastName.trim().length === 0) {
            throw new Error('Last name is required');
        }
        const rc = new RawContactEntity();
        rc._id = id;
        rc._firstName = props.firstName.trim();
        rc._lastName = props.lastName.trim();
        rc._status = raw_contact_status_vo_1.RawContactStatus.RAW;
        rc._source = props.source || 'MANUAL';
        rc._companyName = props.companyName?.trim();
        rc._designation = props.designation?.trim();
        rc._department = props.department?.trim();
        rc._notes = props.notes?.trim();
        rc._isActive = true;
        rc._isDeleted = false;
        rc._deletedAt = null;
        rc._deletedById = null;
        rc._createdById = props.createdById;
        rc._createdAt = new Date();
        rc._updatedAt = new Date();
        rc.addDomainEvent(new raw_contact_created_event_1.RawContactCreatedEvent(id, rc._firstName, rc._lastName, rc._source, props.createdById));
        return rc;
    }
    static fromPersistence(data) {
        const rc = new RawContactEntity();
        rc._id = data.id;
        rc._firstName = data.firstName;
        rc._lastName = data.lastName;
        rc._status = raw_contact_status_vo_1.RawContactStatus.fromString(data.status);
        rc._source = data.source;
        rc._companyName = data.companyName ?? undefined;
        rc._designation = data.designation ?? undefined;
        rc._department = data.department ?? undefined;
        rc._notes = data.notes ?? undefined;
        rc._verifiedAt = data.verifiedAt ?? undefined;
        rc._verifiedById = data.verifiedById ?? undefined;
        rc._contactId = data.contactId ?? undefined;
        rc._isActive = data.isActive ?? true;
        rc._isDeleted = data.isDeleted ?? false;
        rc._deletedAt = data.deletedAt ?? null;
        rc._deletedById = data.deletedById ?? null;
        rc._createdById = data.createdById;
        rc._createdAt = data.createdAt;
        rc._updatedAt = data.updatedAt;
        return rc;
    }
    verify(contactId, verifiedById) {
        if (!contactId)
            throw new Error('Contact ID is required for verification');
        if (!verifiedById)
            throw new Error('Verified by user ID is required');
        const target = raw_contact_status_vo_1.RawContactStatus.VERIFIED;
        if (!this._status.canTransitionTo(target)) {
            throw new Error(`Cannot verify raw contact in status ${this._status.value}`);
        }
        this._status = target;
        this._contactId = contactId;
        this._verifiedAt = new Date();
        this._verifiedById = verifiedById;
        this._updatedAt = new Date();
        this.addDomainEvent(new raw_contact_verified_event_1.RawContactVerifiedEvent(this._id, contactId, verifiedById, this._companyName));
    }
    reject(reason) {
        const target = raw_contact_status_vo_1.RawContactStatus.REJECTED;
        if (!this._status.canTransitionTo(target)) {
            throw new Error(`Cannot reject raw contact in status ${this._status.value}`);
        }
        this._status = target;
        if (reason)
            this._notes = reason;
        this._updatedAt = new Date();
    }
    markDuplicate() {
        const target = raw_contact_status_vo_1.RawContactStatus.DUPLICATE;
        if (!this._status.canTransitionTo(target)) {
            throw new Error(`Cannot mark duplicate from status ${this._status.value}`);
        }
        this._status = target;
        this._updatedAt = new Date();
    }
    reopen() {
        const target = raw_contact_status_vo_1.RawContactStatus.RAW;
        if (!this._status.canTransitionTo(target)) {
            throw new Error(`Cannot reopen from status ${this._status.value}`);
        }
        this._status = target;
        this._updatedAt = new Date();
    }
    updateDetails(data) {
        if (this._status.isTerminal()) {
            throw new Error(`Cannot update raw contact in terminal status ${this._status.value}`);
        }
        if (data.firstName !== undefined) {
            if (data.firstName.trim().length === 0)
                throw new Error('First name cannot be empty');
            this._firstName = data.firstName.trim();
        }
        if (data.lastName !== undefined) {
            if (data.lastName.trim().length === 0)
                throw new Error('Last name cannot be empty');
            this._lastName = data.lastName.trim();
        }
        if (data.companyName !== undefined)
            this._companyName = data.companyName?.trim();
        if (data.designation !== undefined)
            this._designation = data.designation?.trim();
        if (data.department !== undefined)
            this._department = data.department?.trim();
        if (data.notes !== undefined)
            this._notes = data.notes?.trim();
        this._updatedAt = new Date();
    }
    deactivate() {
        if (!this._isActive)
            throw new Error('RawContact is already inactive');
        this._isActive = false;
        this._updatedAt = new Date();
    }
    reactivate() {
        if (this._isActive)
            throw new Error('RawContact is already active');
        this._isActive = true;
        this._updatedAt = new Date();
    }
    softDelete(deletedById) {
        if (this._isDeleted) {
            throw new Error('RawContact is already deleted');
        }
        this._isDeleted = true;
        this._isActive = false;
        this._deletedAt = new Date();
        this._deletedById = deletedById;
        this._updatedAt = new Date();
    }
    restore() {
        if (!this._isDeleted) {
            throw new Error('RawContact is not deleted');
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
    get status() { return this._status; }
    get source() { return this._source; }
    get companyName() { return this._companyName; }
    get designation() { return this._designation; }
    get department() { return this._department; }
    get notes() { return this._notes; }
    get verifiedAt() { return this._verifiedAt; }
    get verifiedById() { return this._verifiedById; }
    get contactId() { return this._contactId; }
    get isActive() { return this._isActive; }
    get isDeleted() { return this._isDeleted; }
    get deletedAt() { return this._deletedAt; }
    get deletedById() { return this._deletedById; }
    get createdById() { return this._createdById; }
}
exports.RawContactEntity = RawContactEntity;
//# sourceMappingURL=raw-contact.entity.js.map