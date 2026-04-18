"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationEntity = void 0;
const aggregate_root_1 = require("../../../../../shared/domain/aggregate-root");
const organization_created_event_1 = require("../events/organization-created.event");
const organization_updated_event_1 = require("../events/organization-updated.event");
const organization_deactivated_event_1 = require("../events/organization-deactivated.event");
class OrganizationEntity extends aggregate_root_1.AggregateRoot {
    static create(id, props) {
        if (!props.name || props.name.trim().length < 2) {
            throw new Error('Organization name must be at least 2 characters');
        }
        if (props.email && !OrganizationEntity.isValidEmail(props.email)) {
            throw new Error('Invalid email format');
        }
        const org = new OrganizationEntity();
        org._id = id;
        org._name = props.name.trim();
        org._tenantId = props.tenantId ?? '';
        org._website = props.website?.trim();
        org._email = props.email?.trim().toLowerCase();
        org._phone = props.phone?.trim();
        org._gstNumber = props.gstNumber?.trim().toUpperCase();
        org._address = props.address?.trim();
        org._city = props.city?.trim();
        org._state = props.state?.trim();
        org._country = props.country?.trim();
        org._pincode = props.pincode?.trim();
        org._industry = props.industry?.trim();
        org._annualRevenue = props.annualRevenue ?? undefined;
        org._notes = props.notes?.trim();
        org._isActive = true;
        org._createdById = props.createdById;
        org._isDeleted = false;
        org._deletedAt = null;
        org._deletedById = null;
        org._createdAt = new Date();
        org._updatedAt = new Date();
        org.addDomainEvent(new organization_created_event_1.OrganizationCreatedEvent(id, org._name, org._industry, props.createdById));
        return org;
    }
    static fromPersistence(data) {
        const org = new OrganizationEntity();
        org._id = data.id;
        org._name = data.name;
        org._tenantId = data.tenantId ?? '';
        org._website = data.website ?? undefined;
        org._email = data.email ?? undefined;
        org._phone = data.phone ?? undefined;
        org._gstNumber = data.gstNumber ?? undefined;
        org._address = data.address ?? undefined;
        org._city = data.city ?? undefined;
        org._state = data.state ?? undefined;
        org._country = data.country ?? undefined;
        org._pincode = data.pincode ?? undefined;
        org._industry = data.industry ?? undefined;
        org._annualRevenue = data.annualRevenue ?? undefined;
        org._notes = data.notes ?? undefined;
        org._isActive = data.isActive ?? true;
        org._createdById = data.createdById;
        org._isDeleted = data.isDeleted ?? false;
        org._deletedAt = data.deletedAt ?? null;
        org._deletedById = data.deletedById ?? null;
        org._createdAt = data.createdAt;
        org._updatedAt = data.updatedAt;
        return org;
    }
    updateDetails(data) {
        if (!this._isActive) {
            throw new Error('Cannot update deactivated organization');
        }
        if (data.name !== undefined) {
            if (data.name.trim().length < 2) {
                throw new Error('Organization name must be at least 2 characters');
            }
            this._name = data.name.trim();
        }
        if (data.email !== undefined) {
            if (data.email && !OrganizationEntity.isValidEmail(data.email)) {
                throw new Error('Invalid email format');
            }
            this._email = data.email?.trim().toLowerCase();
        }
        if (data.website !== undefined)
            this._website = data.website?.trim();
        if (data.phone !== undefined)
            this._phone = data.phone?.trim();
        if (data.gstNumber !== undefined)
            this._gstNumber = data.gstNumber?.trim().toUpperCase();
        if (data.address !== undefined)
            this._address = data.address?.trim();
        if (data.city !== undefined)
            this._city = data.city?.trim();
        if (data.state !== undefined)
            this._state = data.state?.trim();
        if (data.country !== undefined)
            this._country = data.country?.trim();
        if (data.pincode !== undefined)
            this._pincode = data.pincode?.trim();
        if (data.industry !== undefined)
            this._industry = data.industry?.trim();
        if (data.annualRevenue !== undefined)
            this._annualRevenue = data.annualRevenue ?? undefined;
        if (data.notes !== undefined)
            this._notes = data.notes?.trim();
        this._updatedAt = new Date();
        this.addDomainEvent(new organization_updated_event_1.OrganizationUpdatedEvent(this._id, this._name));
    }
    deactivate() {
        if (!this._isActive) {
            throw new Error('Organization is already deactivated');
        }
        this._isActive = false;
        this._updatedAt = new Date();
        this.addDomainEvent(new organization_deactivated_event_1.OrganizationDeactivatedEvent(this._id, this._name));
    }
    reactivate() {
        if (this._isActive) {
            throw new Error('Organization is already active');
        }
        this._isActive = true;
        this._updatedAt = new Date();
    }
    softDelete(deletedById) {
        if (this._isDeleted) {
            throw new Error('Organization is already deleted');
        }
        this._isDeleted = true;
        this._isActive = false;
        this._deletedAt = new Date();
        this._deletedById = deletedById;
        this._updatedAt = new Date();
    }
    restore() {
        if (!this._isDeleted) {
            throw new Error('Organization is not deleted');
        }
        this._isDeleted = false;
        this._isActive = true;
        this._deletedAt = null;
        this._deletedById = null;
        this._updatedAt = new Date();
    }
    get name() { return this._name; }
    get tenantId() { return this._tenantId; }
    get website() { return this._website; }
    get email() { return this._email; }
    get phone() { return this._phone; }
    get gstNumber() { return this._gstNumber; }
    get address() { return this._address; }
    get city() { return this._city; }
    get state() { return this._state; }
    get country() { return this._country; }
    get pincode() { return this._pincode; }
    get industry() { return this._industry; }
    get annualRevenue() { return this._annualRevenue; }
    get notes() { return this._notes; }
    get isActive() { return this._isActive; }
    get createdById() { return this._createdById; }
    get isDeleted() { return this._isDeleted; }
    get deletedAt() { return this._deletedAt; }
    get deletedById() { return this._deletedById; }
    static isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
}
exports.OrganizationEntity = OrganizationEntity;
//# sourceMappingURL=organization.entity.js.map