"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckOutVisitCommand = void 0;
class CheckOutVisitCommand {
    constructor(visitId, userId, latitude, longitude, photoUrl, outcome, notes) {
        this.visitId = visitId;
        this.userId = userId;
        this.latitude = latitude;
        this.longitude = longitude;
        this.photoUrl = photoUrl;
        this.outcome = outcome;
        this.notes = notes;
    }
}
exports.CheckOutVisitCommand = CheckOutVisitCommand;
//# sourceMappingURL=check-out-visit.command.js.map