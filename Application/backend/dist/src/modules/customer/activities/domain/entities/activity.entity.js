"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityEntity = void 0;
const aggregate_root_1 = require("../../../../../shared/domain/aggregate-root");
class ActivityEntity extends aggregate_root_1.AggregateRoot {
    static create(id, props) {
        const activity = new ActivityEntity();
        activity._id = id;
        activity._type = props.type;
        activity._subject = props.subject;
        activity._description = props.description;
        activity._scheduledAt = props.scheduledAt;
        activity._endTime = props.endTime;
        activity._duration = props.duration;
        activity._leadId = props.leadId;
        activity._contactId = props.contactId;
        activity._locationName = props.locationName;
        activity._latitude = props.latitude;
        activity._longitude = props.longitude;
        activity._isActive = true;
        activity._isDeleted = false;
        activity._deletedAt = null;
        activity._deletedById = null;
        activity._createdById = props.createdById;
        activity._createdAt = new Date();
        activity._updatedAt = new Date();
        return activity;
    }
    static fromPersistence(data) {
        const activity = new ActivityEntity();
        activity._id = data.id;
        activity._type = data.type;
        activity._subject = data.subject;
        activity._description = data.description ?? undefined;
        activity._outcome = data.outcome ?? undefined;
        activity._duration = data.duration ?? undefined;
        activity._scheduledAt = data.scheduledAt ?? undefined;
        activity._endTime = data.endTime ?? undefined;
        activity._completedAt = data.completedAt ?? undefined;
        activity._latitude = data.latitude != null ? Number(data.latitude) : undefined;
        activity._longitude = data.longitude != null ? Number(data.longitude) : undefined;
        activity._locationName = data.locationName ?? undefined;
        activity._leadId = data.leadId ?? undefined;
        activity._contactId = data.contactId ?? undefined;
        activity._isActive = data.isActive ?? true;
        activity._isDeleted = data.isDeleted ?? false;
        activity._deletedAt = data.deletedAt ?? null;
        activity._deletedById = data.deletedById ?? null;
        activity._createdById = data.createdById;
        activity._createdAt = data.createdAt;
        activity._updatedAt = data.updatedAt;
        return activity;
    }
    complete(outcome) {
        this._outcome = outcome;
        this._completedAt = new Date();
        this._updatedAt = new Date();
    }
    updateDetails(data) {
        if (data.subject !== undefined)
            this._subject = data.subject;
        if (data.description !== undefined)
            this._description = data.description;
        if (data.scheduledAt !== undefined)
            this._scheduledAt = data.scheduledAt;
        if (data.endTime !== undefined)
            this._endTime = data.endTime;
        if (data.duration !== undefined)
            this._duration = data.duration;
        if (data.locationName !== undefined)
            this._locationName = data.locationName;
        if (data.latitude !== undefined)
            this._latitude = data.latitude;
        if (data.longitude !== undefined)
            this._longitude = data.longitude;
        this._updatedAt = new Date();
    }
    softDelete(deletedById) {
        if (this._isDeleted) {
            throw new Error('Activity is already deleted');
        }
        this._isDeleted = true;
        this._isActive = false;
        this._deletedAt = new Date();
        this._deletedById = deletedById;
        this._updatedAt = new Date();
    }
    restore() {
        if (!this._isDeleted) {
            throw new Error('Activity is not deleted');
        }
        this._isDeleted = false;
        this._isActive = true;
        this._deletedAt = null;
        this._deletedById = null;
        this._updatedAt = new Date();
    }
    get type() { return this._type; }
    get subject() { return this._subject; }
    get description() { return this._description; }
    get outcome() { return this._outcome; }
    get duration() { return this._duration; }
    get scheduledAt() { return this._scheduledAt; }
    get endTime() { return this._endTime; }
    get completedAt() { return this._completedAt; }
    get latitude() { return this._latitude; }
    get longitude() { return this._longitude; }
    get locationName() { return this._locationName; }
    get leadId() { return this._leadId; }
    get contactId() { return this._contactId; }
    get isActive() { return this._isActive; }
    get isDeleted() { return this._isDeleted; }
    get deletedAt() { return this._deletedAt; }
    get deletedById() { return this._deletedById; }
    get createdById() { return this._createdById; }
}
exports.ActivityEntity = ActivityEntity;
//# sourceMappingURL=activity.entity.js.map