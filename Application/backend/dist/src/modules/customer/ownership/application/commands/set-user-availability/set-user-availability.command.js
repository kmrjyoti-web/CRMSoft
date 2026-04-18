"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetUserAvailabilityCommand = void 0;
class SetUserAvailabilityCommand {
    constructor(userId, isAvailable, unavailableFrom, unavailableTo, delegateToId, reason, performedById) {
        this.userId = userId;
        this.isAvailable = isAvailable;
        this.unavailableFrom = unavailableFrom;
        this.unavailableTo = unavailableTo;
        this.delegateToId = delegateToId;
        this.reason = reason;
        this.performedById = performedById;
    }
}
exports.SetUserAvailabilityCommand = SetUserAvailabilityCommand;
//# sourceMappingURL=set-user-availability.command.js.map