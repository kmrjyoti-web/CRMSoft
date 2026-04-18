"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDefaultSchedules = seedDefaultSchedules;
async function seedDefaultSchedules(db) {
    const existingNightly = await db.pcTestSchedule.findFirst({
        where: { scheduleType: 'NIGHTLY' },
    });
    if (!existingNightly) {
        await db.pcTestSchedule.create({
            data: {
                scheduleType: 'NIGHTLY',
                cronExpression: '30 17 * * *',
                isActive: true,
            },
        });
    }
    const existingWeekly = await db.pcTestSchedule.findFirst({
        where: { scheduleType: 'WEEKLY' },
    });
    if (!existingWeekly) {
        await db.pcTestSchedule.create({
            data: {
                scheduleType: 'WEEKLY',
                cronExpression: '30 2 * * 0',
                isActive: true,
            },
        });
    }
}
//# sourceMappingURL=seed-schedules.js.map