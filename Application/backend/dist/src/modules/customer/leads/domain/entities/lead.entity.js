"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadEntity = void 0;
const aggregate_root_1 = require("../../../../../shared/domain/aggregate-root");
const lead_status_vo_1 = require("../value-objects/lead-status.vo");
const lead_created_event_1 = require("../events/lead-created.event");
const lead_allocated_event_1 = require("../events/lead-allocated.event");
const lead_status_changed_event_1 = require("../events/lead-status-changed.event");
class LeadEntity extends aggregate_root_1.AggregateRoot {
    static create(id, props) {
        const lead = new LeadEntity();
        lead._id = id;
        lead._leadNumber = props.leadNumber;
        lead._contactId = props.contactId;
        lead._organizationId = props.organizationId;
        lead._status = lead_status_vo_1.LeadStatus.NEW;
        lead._priority = props.priority || 'MEDIUM';
        lead._expectedValue = props.expectedValue;
        lead._expectedCloseDate = props.expectedCloseDate;
        lead._notes = props.notes;
        lead._isActive = true;
        lead._isDeleted = false;
        lead._deletedAt = null;
        lead._deletedById = null;
        lead._createdById = props.createdById;
        lead._createdAt = new Date();
        lead._updatedAt = new Date();
        lead.addDomainEvent(new lead_created_event_1.LeadCreatedEvent(id, props.contactId, props.createdById));
        return lead;
    }
    static fromPersistence(data) {
        const lead = new LeadEntity();
        lead._id = data.id;
        lead._leadNumber = data.leadNumber;
        lead._contactId = data.contactId;
        lead._organizationId = data.organizationId;
        lead._status = lead_status_vo_1.LeadStatus.fromString(data.status);
        lead._priority = data.priority;
        lead._expectedValue = data.expectedValue;
        lead._expectedCloseDate = data.expectedCloseDate;
        lead._allocatedToId = data.allocatedToId;
        lead._allocatedAt = data.allocatedAt;
        lead._lostReason = data.lostReason;
        lead._notes = data.notes;
        lead._isActive = data.isActive ?? true;
        lead._isDeleted = data.isDeleted ?? false;
        lead._deletedAt = data.deletedAt ?? null;
        lead._deletedById = data.deletedById ?? null;
        lead._createdById = data.createdById;
        lead._createdAt = data.createdAt;
        lead._updatedAt = data.updatedAt;
        return lead;
    }
    allocate(userId) {
        if (!userId)
            throw new Error('User ID is required for allocation');
        if (this._status.value !== 'NEW' && this._status.value !== 'VERIFIED') {
            throw new Error(`Cannot allocate lead in status ${this._status.value}. Must be NEW or VERIFIED.`);
        }
        this._allocatedToId = userId;
        this._allocatedAt = new Date();
        this._status = lead_status_vo_1.LeadStatus.ALLOCATED;
        this._updatedAt = new Date();
        this.addDomainEvent(new lead_allocated_event_1.LeadAllocatedEvent(this._id, userId, this._contactId));
    }
    changeStatus(newStatus, reason) {
        const target = lead_status_vo_1.LeadStatus.fromString(newStatus);
        if (!this._status.canTransitionTo(target)) {
            throw new Error(`Invalid transition: ${this._status.value} -> ${target.value}. \n` +
                `Valid transitions from ${this._status.value}: ${this._status.validTransitions().join(', ') || 'none (terminal state)'}`);
        }
        if (target.value === 'LOST' && !reason) {
            throw new Error('Lost reason is required when marking lead as LOST');
        }
        const old = this._status;
        this._status = target;
        if (reason)
            this._lostReason = reason;
        this._updatedAt = new Date();
        this.addDomainEvent(new lead_status_changed_event_1.LeadStatusChangedEvent(this._id, old.value, target.value));
    }
    updateDetails(data) {
        if (this._status.isTerminal()) {
            throw new Error(`Cannot update lead in terminal status: ${this._status.value}`);
        }
        if (data.priority)
            this._priority = data.priority;
        if (data.expectedValue !== undefined)
            this._expectedValue = data.expectedValue;
        if (data.expectedCloseDate)
            this._expectedCloseDate = data.expectedCloseDate;
        if (data.notes !== undefined)
            this._notes = data.notes;
        this._updatedAt = new Date();
    }
    deactivate() {
        if (!this._isActive)
            throw new Error('Lead is already inactive');
        this._isActive = false;
        this._updatedAt = new Date();
    }
    reactivate() {
        if (this._isActive)
            throw new Error('Lead is already active');
        this._isActive = true;
        this._updatedAt = new Date();
    }
    softDelete(deletedById) {
        if (this._isDeleted) {
            throw new Error('Lead is already deleted');
        }
        this._isDeleted = true;
        this._isActive = false;
        this._deletedAt = new Date();
        this._deletedById = deletedById;
        this._updatedAt = new Date();
    }
    restore() {
        if (!this._isDeleted) {
            throw new Error('Lead is not deleted');
        }
        this._isDeleted = false;
        this._isActive = true;
        this._deletedAt = null;
        this._deletedById = null;
        this._updatedAt = new Date();
    }
    get leadNumber() { return this._leadNumber; }
    get contactId() { return this._contactId; }
    get organizationId() { return this._organizationId; }
    get status() { return this._status; }
    get priority() { return this._priority; }
    get expectedValue() { return this._expectedValue; }
    get expectedCloseDate() { return this._expectedCloseDate; }
    get allocatedToId() { return this._allocatedToId; }
    get allocatedAt() { return this._allocatedAt; }
    get lostReason() { return this._lostReason; }
    get notes() { return this._notes; }
    get isActive() { return this._isActive; }
    get isDeleted() { return this._isDeleted; }
    get deletedAt() { return this._deletedAt; }
    get deletedById() { return this._deletedById; }
    get createdById() { return this._createdById; }
}
exports.LeadEntity = LeadEntity;
//# sourceMappingURL=lead.entity.js.map