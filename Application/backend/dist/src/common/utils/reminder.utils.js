"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAutoReminder = createAutoReminder;
async function createAutoReminder(prisma, params) {
    const { entityType, entityId, eventDate, title, recipientId, createdById, channels = ['IN_APP'], minutesBefore = 30, } = params;
    const scheduledAt = new Date(eventDate.getTime() - minutesBefore * 60 * 1000);
    if (scheduledAt <= new Date())
        return;
    for (const channel of channels) {
        await prisma.reminder.create({
            data: {
                entityType,
                entityId,
                channel: channel,
                scheduledAt,
                title: `Reminder: ${title}`,
                message: `${title} is scheduled at ${eventDate.toISOString()}`,
                recipientId,
                createdById,
            },
        });
    }
}
//# sourceMappingURL=reminder.utils.js.map