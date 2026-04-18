"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunicationEntity = void 0;
const aggregate_root_1 = require("../../../../../shared/domain/aggregate-root");
const communication_type_vo_1 = require("../../../../../shared/domain/value-objects/communication-type.vo");
const priority_type_vo_1 = require("../../../../../shared/domain/value-objects/priority-type.vo");
const email_vo_1 = require("../../../../../shared/domain/value-objects/email.vo");
const phone_vo_1 = require("../../../../../shared/domain/value-objects/phone.vo");
class CommunicationEntity extends aggregate_root_1.AggregateRoot {
    static create(id, props) {
        const commType = communication_type_vo_1.CommunicationType.fromString(props.type);
        if (commType.isEmail()) {
            email_vo_1.Email.create(props.value);
        }
        else if (commType.isPhone()) {
            phone_vo_1.Phone.create(props.value);
        }
        if (!props.value || props.value.trim().length === 0) {
            throw new Error('Communication value is required');
        }
        if (!props.rawContactId && !props.contactId && !props.organizationId && !props.leadId) {
            throw new Error('At least one entity link is required (rawContactId, contactId, organizationId, or leadId)');
        }
        const comm = new CommunicationEntity();
        comm._id = id;
        comm._type = commType;
        comm._value = props.value.trim();
        comm._priorityType = props.priorityType
            ? priority_type_vo_1.PriorityType.fromString(props.priorityType)
            : priority_type_vo_1.PriorityType.PRIMARY;
        comm._isPrimary = props.isPrimary ?? false;
        comm._isVerified = false;
        comm._label = props.label?.trim();
        comm._rawContactId = props.rawContactId;
        comm._contactId = props.contactId;
        comm._organizationId = props.organizationId;
        comm._leadId = props.leadId;
        comm._notes = props.notes?.trim();
        comm._createdAt = new Date();
        comm._updatedAt = new Date();
        return comm;
    }
    static fromPersistence(data) {
        const comm = new CommunicationEntity();
        comm._id = data.id;
        comm._type = communication_type_vo_1.CommunicationType.fromString(data.type);
        comm._value = data.value;
        comm._priorityType = priority_type_vo_1.PriorityType.fromString(data.priorityType);
        comm._isPrimary = data.isPrimary;
        comm._isVerified = data.isVerified;
        comm._label = data.label;
        comm._rawContactId = data.rawContactId;
        comm._contactId = data.contactId;
        comm._organizationId = data.organizationId;
        comm._leadId = data.leadId;
        comm._notes = data.notes;
        comm._createdAt = data.createdAt;
        comm._updatedAt = data.updatedAt;
        return comm;
    }
    linkToContact(contactId) {
        if (!contactId)
            throw new Error('Contact ID is required');
        this._contactId = contactId;
        this._updatedAt = new Date();
    }
    linkToOrganization(organizationId) {
        if (!organizationId)
            throw new Error('Organization ID is required');
        this._organizationId = organizationId;
        this._updatedAt = new Date();
    }
    linkToLead(leadId) {
        if (!leadId)
            throw new Error('Lead ID is required');
        this._leadId = leadId;
        this._updatedAt = new Date();
    }
    markVerified() {
        this._isVerified = true;
        this._updatedAt = new Date();
    }
    changePriority(newPriority) {
        this._priorityType = priority_type_vo_1.PriorityType.fromString(newPriority);
        this._updatedAt = new Date();
    }
    setAsPrimary() {
        this._isPrimary = true;
        this._updatedAt = new Date();
    }
    unsetPrimary() {
        this._isPrimary = false;
        this._updatedAt = new Date();
    }
    get type() { return this._type; }
    get value() { return this._value; }
    get priorityType() { return this._priorityType; }
    get isPrimary() { return this._isPrimary; }
    get isVerified() { return this._isVerified; }
    get label() { return this._label; }
    get rawContactId() { return this._rawContactId; }
    get contactId() { return this._contactId; }
    get organizationId() { return this._organizationId; }
    get leadId() { return this._leadId; }
    get notes() { return this._notes; }
}
exports.CommunicationEntity = CommunicationEntity;
//# sourceMappingURL=communication.entity.js.map