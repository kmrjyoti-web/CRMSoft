"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePreferencesCommand = void 0;
class UpdatePreferencesCommand {
    constructor(userId, channels, categories, quietHoursStart, quietHoursEnd, digestFrequency, timezone) {
        this.userId = userId;
        this.channels = channels;
        this.categories = categories;
        this.quietHoursStart = quietHoursStart;
        this.quietHoursEnd = quietHoursEnd;
        this.digestFrequency = digestFrequency;
        this.timezone = timezone;
    }
}
exports.UpdatePreferencesCommand = UpdatePreferencesCommand;
//# sourceMappingURL=update-preferences.command.js.map