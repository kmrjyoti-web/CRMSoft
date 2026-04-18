"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactOrganizationEntity = void 0;
const aggregate_root_1 = require("../../../../../shared/domain/aggregate-root");
const contact_org_relation_vo_1 = require("../../../../../shared/domain/value-objects/contact-org-relation.vo");
class ContactOrganizationEntity extends aggregate_root_1.AggregateRoot {
    static create(id, props) {
        if (!props.contactId)
            throw new Error('Contact ID is required');
        if (!props.organizationId)
            throw new Error('Organization ID is required');
        const co = new ContactOrganizationEntity();
        co._id = id;
        co._contactId = props.contactId;
        co._organizationId = props.organizationId;
        co._relationType = props.relationType
            ? contact_org_relation_vo_1.ContactOrgRelation.fromString(props.relationType)
            : contact_org_relation_vo_1.ContactOrgRelation.EMPLOYEE;
        co._isPrimary = props.isPrimary ?? false;
        co._designation = props.designation?.trim();
        co._department = props.department?.trim();
        co._startDate = props.startDate;
        co._isActive = true;
        co._notes = props.notes?.trim();
        co._createdAt = new Date();
        co._updatedAt = new Date();
        return co;
    }
    static fromPersistence(data) {
        const co = new ContactOrganizationEntity();
        co._id = data.id;
        co._contactId = data.contactId;
        co._organizationId = data.organizationId;
        co._relationType = contact_org_relation_vo_1.ContactOrgRelation.fromString(data.relationType);
        co._isPrimary = data.isPrimary;
        co._designation = data.designation;
        co._department = data.department;
        co._startDate = data.startDate;
        co._endDate = data.endDate;
        co._isActive = data.isActive;
        co._notes = data.notes;
        co._createdAt = data.createdAt;
        co._updatedAt = data.updatedAt;
        return co;
    }
    setAsPrimary() {
        this._isPrimary = true;
        this._updatedAt = new Date();
    }
    unsetPrimary() {
        this._isPrimary = false;
        this._updatedAt = new Date();
    }
    deactivate(endDate) {
        this._isActive = false;
        this._endDate = endDate || new Date();
        this._updatedAt = new Date();
    }
    reactivate() {
        this._isActive = true;
        this._endDate = undefined;
        this._updatedAt = new Date();
    }
    changeRelationType(newType) {
        this._relationType = contact_org_relation_vo_1.ContactOrgRelation.fromString(newType);
        this._updatedAt = new Date();
    }
    get contactId() { return this._contactId; }
    get organizationId() { return this._organizationId; }
    get relationType() { return this._relationType; }
    get isPrimary() { return this._isPrimary; }
    get designation() { return this._designation; }
    get department() { return this._department; }
    get startDate() { return this._startDate; }
    get endDate() { return this._endDate; }
    get isActive() { return this._isActive; }
    get notes() { return this._notes; }
}
exports.ContactOrganizationEntity = ContactOrganizationEntity;
//# sourceMappingURL=contact-organization.entity.js.map