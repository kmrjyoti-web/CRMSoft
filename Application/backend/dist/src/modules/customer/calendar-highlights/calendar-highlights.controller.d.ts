import { CalendarHighlightsService } from './calendar-highlights.service';
export declare class CalendarHighlightsController {
    private svc;
    constructor(svc: CalendarHighlightsService);
    list(req: any, from: string, to: string, types?: string): Promise<{
        success: boolean;
        data: {
            id: string;
            tenantId: string | null;
            isActive: boolean;
            createdAt: Date;
            isDeleted: boolean;
            deletedAt: Date | null;
            deletedById: string | null;
            updatedById: string | null;
            updatedByName: string | null;
            color: string;
            industryCode: string | null;
            date: Date;
            title: string;
            highlightType: string;
            isRecurring: boolean;
            recurringType: string | null;
            isHoliday: boolean;
            stateCode: string | null;
        }[];
    }>;
    holidays(req: any, year: string): Promise<{
        success: boolean;
        data: {
            id: string;
            tenantId: string | null;
            isActive: boolean;
            createdAt: Date;
            isDeleted: boolean;
            deletedAt: Date | null;
            deletedById: string | null;
            updatedById: string | null;
            updatedByName: string | null;
            color: string;
            industryCode: string | null;
            date: Date;
            title: string;
            highlightType: string;
            isRecurring: boolean;
            recurringType: string | null;
            isHoliday: boolean;
            stateCode: string | null;
        }[];
    }>;
    create(req: any, body: any): Promise<{
        success: boolean;
        data: {
            id: string;
            tenantId: string | null;
            isActive: boolean;
            createdAt: Date;
            isDeleted: boolean;
            deletedAt: Date | null;
            deletedById: string | null;
            updatedById: string | null;
            updatedByName: string | null;
            color: string;
            industryCode: string | null;
            date: Date;
            title: string;
            highlightType: string;
            isRecurring: boolean;
            recurringType: string | null;
            isHoliday: boolean;
            stateCode: string | null;
        };
    }>;
}
