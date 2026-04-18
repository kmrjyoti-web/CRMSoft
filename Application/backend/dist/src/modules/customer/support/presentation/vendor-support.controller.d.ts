import { ApiResponse } from '../../../../common/utils/api-response';
import { SupportTicketService } from '../services/support-ticket.service';
export declare class VendorSupportController {
    private readonly ticketService;
    constructor(ticketService: SupportTicketService);
    getStats(): Promise<ApiResponse<{
        open: number;
        inProgress: number;
        resolved: number;
        closed: number;
        total: number;
        avgResponseHours: number;
        avgSatisfaction: number;
        totalRatings: number;
    }>>;
    list(page?: number, limit?: number, tenantId?: string, status?: string, priority?: string, category?: string, assignedToId?: string): Promise<ApiResponse<{
        data: ({
            _count: {
                messages: number;
            };
        } & {
            id: string;
            tenantId: string;
            description: string;
            createdAt: Date;
            updatedAt: Date;
            isDeleted: boolean;
            deletedAt: Date | null;
            deletedById: string | null;
            updatedById: string | null;
            updatedByName: string | null;
            category: import("@prisma/working-client").$Enums.TicketCategory;
            status: import("@prisma/working-client").$Enums.TicketStatus;
            subject: string;
            tenantName: string | null;
            resolvedAt: Date | null;
            resolution: string | null;
            assignedToId: string | null;
            assignedToName: string | null;
            slaBreached: boolean;
            reportedById: string;
            ticketNo: string;
            priority: import("@prisma/working-client").$Enums.TicketPriority;
            screenshots: string[];
            autoContext: import("@prisma/working-client/runtime/library").JsonValue | null;
            closedAt: Date | null;
            satisfactionRating: number | null;
            satisfactionComment: string | null;
            linkedErrorIds: string[];
            firstResponseAt: Date | null;
            reportedByName: string | null;
            reportedByEmail: string | null;
        })[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>>;
    getById(id: string): Promise<ApiResponse<null> | ApiResponse<{
        messages: {
            id: string;
            createdAt: Date;
            message: string;
            senderId: string;
            attachments: string[];
            senderType: string;
            senderName: string | null;
            isInternal: boolean;
            ticketId: string;
        }[];
    } & {
        id: string;
        tenantId: string;
        description: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        category: import("@prisma/working-client").$Enums.TicketCategory;
        status: import("@prisma/working-client").$Enums.TicketStatus;
        subject: string;
        tenantName: string | null;
        resolvedAt: Date | null;
        resolution: string | null;
        assignedToId: string | null;
        assignedToName: string | null;
        slaBreached: boolean;
        reportedById: string;
        ticketNo: string;
        priority: import("@prisma/working-client").$Enums.TicketPriority;
        screenshots: string[];
        autoContext: import("@prisma/working-client/runtime/library").JsonValue | null;
        closedAt: Date | null;
        satisfactionRating: number | null;
        satisfactionComment: string | null;
        linkedErrorIds: string[];
        firstResponseAt: Date | null;
        reportedByName: string | null;
        reportedByEmail: string | null;
    }>>;
    update(id: string, body: {
        status?: string;
        assignedToId?: string;
        assignedToName?: string;
        priority?: string;
    }): Promise<ApiResponse<{
        id: string;
        tenantId: string;
        description: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        category: import("@prisma/working-client").$Enums.TicketCategory;
        status: import("@prisma/working-client").$Enums.TicketStatus;
        subject: string;
        tenantName: string | null;
        resolvedAt: Date | null;
        resolution: string | null;
        assignedToId: string | null;
        assignedToName: string | null;
        slaBreached: boolean;
        reportedById: string;
        ticketNo: string;
        priority: import("@prisma/working-client").$Enums.TicketPriority;
        screenshots: string[];
        autoContext: import("@prisma/working-client/runtime/library").JsonValue | null;
        closedAt: Date | null;
        satisfactionRating: number | null;
        satisfactionComment: string | null;
        linkedErrorIds: string[];
        firstResponseAt: Date | null;
        reportedByName: string | null;
        reportedByEmail: string | null;
    }>>;
    addMessage(id: string, body: {
        message: string;
        attachments?: string[];
        isInternal?: boolean;
    }, req: any): Promise<ApiResponse<{
        id: string;
        createdAt: Date;
        message: string;
        senderId: string;
        attachments: string[];
        senderType: string;
        senderName: string | null;
        isInternal: boolean;
        ticketId: string;
    }>>;
    getContext(id: string): Promise<ApiResponse<null> | ApiResponse<{
        autoContext: import("@prisma/working-client/runtime/library").JsonValue;
        linkedErrors: any[];
    }>>;
}
