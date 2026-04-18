"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedCalendarHighlights = seedCalendarHighlights;
const NATIONAL_HOLIDAYS = [
    { date: '2025-01-26', title: 'Republic Day', highlightType: 'NATIONAL_HOLIDAY', isHoliday: true, color: '#EF4444' },
    { date: '2025-03-14', title: 'Holi', highlightType: 'NATIONAL_HOLIDAY', isHoliday: true, color: '#F97316' },
    { date: '2025-04-14', title: 'Dr. Ambedkar Jayanti', highlightType: 'NATIONAL_HOLIDAY', isHoliday: true, color: '#3B82F6' },
    { date: '2025-04-18', title: 'Good Friday', highlightType: 'NATIONAL_HOLIDAY', isHoliday: true, color: '#EF4444' },
    { date: '2025-05-01', title: 'May Day', highlightType: 'NATIONAL_HOLIDAY', isHoliday: true, color: '#22C55E' },
    { date: '2025-08-15', title: 'Independence Day', highlightType: 'NATIONAL_HOLIDAY', isHoliday: true, color: '#F97316' },
    { date: '2025-08-27', title: 'Janmashtami', highlightType: 'NATIONAL_HOLIDAY', isHoliday: true, color: '#7C3AED' },
    { date: '2025-10-02', title: 'Gandhi Jayanti', highlightType: 'NATIONAL_HOLIDAY', isHoliday: true, color: '#EF4444' },
    { date: '2025-10-20', title: 'Dussehra', highlightType: 'NATIONAL_HOLIDAY', isHoliday: true, color: '#F97316' },
    { date: '2025-11-01', title: 'Diwali', highlightType: 'NATIONAL_HOLIDAY', isHoliday: true, color: '#F97316' },
    { date: '2025-11-05', title: 'Guru Nanak Jayanti', highlightType: 'NATIONAL_HOLIDAY', isHoliday: true, color: '#7C3AED' },
    { date: '2025-12-25', title: 'Christmas', highlightType: 'NATIONAL_HOLIDAY', isHoliday: true, color: '#22C55E' },
    { date: '2026-01-26', title: 'Republic Day', highlightType: 'NATIONAL_HOLIDAY', isHoliday: true, color: '#EF4444' },
    { date: '2026-03-03', title: 'Holi', highlightType: 'NATIONAL_HOLIDAY', isHoliday: true, color: '#F97316' },
    { date: '2026-04-14', title: 'Dr. Ambedkar Jayanti', highlightType: 'NATIONAL_HOLIDAY', isHoliday: true, color: '#3B82F6' },
    { date: '2026-04-03', title: 'Good Friday', highlightType: 'NATIONAL_HOLIDAY', isHoliday: true, color: '#EF4444' },
    { date: '2026-05-01', title: 'May Day', highlightType: 'NATIONAL_HOLIDAY', isHoliday: true, color: '#22C55E' },
    { date: '2026-08-15', title: 'Independence Day', highlightType: 'NATIONAL_HOLIDAY', isHoliday: true, color: '#F97316' },
    { date: '2026-10-02', title: 'Gandhi Jayanti', highlightType: 'NATIONAL_HOLIDAY', isHoliday: true, color: '#EF4444' },
    { date: '2026-10-19', title: 'Diwali', highlightType: 'NATIONAL_HOLIDAY', isHoliday: true, color: '#F97316' },
    { date: '2026-12-25', title: 'Christmas', highlightType: 'NATIONAL_HOLIDAY', isHoliday: true, color: '#22C55E' },
];
async function seedCalendarHighlights(prisma) {
    console.log('Seeding calendar highlights...');
    let created = 0;
    for (const h of NATIONAL_HOLIDAYS) {
        const exists = await prisma.calendarHighlight.findFirst({
            where: { date: new Date(h.date), title: h.title },
        });
        if (!exists) {
            await prisma.calendarHighlight.create({
                data: {
                    tenantId: null,
                    date: new Date(h.date),
                    title: h.title,
                    highlightType: h.highlightType,
                    color: h.color,
                    isHoliday: h.isHoliday,
                    isRecurring: false,
                },
            });
            created++;
        }
    }
    console.log(`Calendar highlights: ${created} created, ${NATIONAL_HOLIDAYS.length - created} already existed`);
}
//# sourceMappingURL=calendar-highlights.seed.js.map