"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrackEventCommand = void 0;
class TrackEventCommand {
    constructor(tenantId, entityType, entityId, eventType, userId, source, deviceType, city, state, pincode, orderValue, metadata) {
        this.tenantId = tenantId;
        this.entityType = entityType;
        this.entityId = entityId;
        this.eventType = eventType;
        this.userId = userId;
        this.source = source;
        this.deviceType = deviceType;
        this.city = city;
        this.state = state;
        this.pincode = pincode;
        this.orderValue = orderValue;
        this.metadata = metadata;
    }
}
exports.TrackEventCommand = TrackEventCommand;
//# sourceMappingURL=track-event.command.js.map