import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { DevRequestStatus, DevRequestType, ErrorSeverity } from '@prisma/client';
export declare class DevRequestsService {
    private prisma;
    private audit;
    constructor(prisma: PrismaService, audit: AuditService);
    submit(dto: {
        partnerId: string;
        requestType: DevRequestType;
        title: string;
        description?: string;
        priority?: ErrorSeverity;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.DevRequestStatus;
        partnerId: string;
        gitBranch: string | null;
        requestType: import("@prisma/client").$Enums.DevRequestType;
        title: string;
        description: string | null;
        priority: import("@prisma/client").$Enums.ErrorSeverity;
        estimatedHours: number | null;
        actualHours: number | null;
        quotedPrice: import("@prisma/client-runtime-utils").Decimal | null;
        approvedPrice: import("@prisma/client-runtime-utils").Decimal | null;
        assignedDeveloper: string | null;
        attachments: import("@prisma/client/runtime/client").JsonValue | null;
        deliveredAt: Date | null;
        acceptedAt: Date | null;
        rejectedReason: string | null;
        dueDate: Date | null;
        slaHours: number | null;
    }>;
    findAll(params: {
        partnerId?: string;
        status?: DevRequestStatus;
        page?: number;
        limit?: number;
    }): Promise<{
        data: ({
            partner: {
                partnerCode: string;
                companyName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.DevRequestStatus;
            partnerId: string;
            gitBranch: string | null;
            requestType: import("@prisma/client").$Enums.DevRequestType;
            title: string;
            description: string | null;
            priority: import("@prisma/client").$Enums.ErrorSeverity;
            estimatedHours: number | null;
            actualHours: number | null;
            quotedPrice: import("@prisma/client-runtime-utils").Decimal | null;
            approvedPrice: import("@prisma/client-runtime-utils").Decimal | null;
            assignedDeveloper: string | null;
            attachments: import("@prisma/client/runtime/client").JsonValue | null;
            deliveredAt: Date | null;
            acceptedAt: Date | null;
            rejectedReason: string | null;
            dueDate: Date | null;
            slaHours: number | null;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<{
        partner: {
            email: string;
            companyName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.DevRequestStatus;
        partnerId: string;
        gitBranch: string | null;
        requestType: import("@prisma/client").$Enums.DevRequestType;
        title: string;
        description: string | null;
        priority: import("@prisma/client").$Enums.ErrorSeverity;
        estimatedHours: number | null;
        actualHours: number | null;
        quotedPrice: import("@prisma/client-runtime-utils").Decimal | null;
        approvedPrice: import("@prisma/client-runtime-utils").Decimal | null;
        assignedDeveloper: string | null;
        attachments: import("@prisma/client/runtime/client").JsonValue | null;
        deliveredAt: Date | null;
        acceptedAt: Date | null;
        rejectedReason: string | null;
        dueDate: Date | null;
        slaHours: number | null;
    }>;
    review(id: string, dto: {
        action: 'APPROVE' | 'REJECT';
        estimatedHours?: number;
        quotedPrice?: number;
        rejectedReason?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.DevRequestStatus;
        partnerId: string;
        gitBranch: string | null;
        requestType: import("@prisma/client").$Enums.DevRequestType;
        title: string;
        description: string | null;
        priority: import("@prisma/client").$Enums.ErrorSeverity;
        estimatedHours: number | null;
        actualHours: number | null;
        quotedPrice: import("@prisma/client-runtime-utils").Decimal | null;
        approvedPrice: import("@prisma/client-runtime-utils").Decimal | null;
        assignedDeveloper: string | null;
        attachments: import("@prisma/client/runtime/client").JsonValue | null;
        deliveredAt: Date | null;
        acceptedAt: Date | null;
        rejectedReason: string | null;
        dueDate: Date | null;
        slaHours: number | null;
    }>;
    assign(id: string, dto: {
        assignedDeveloper: string;
        gitBranch?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.DevRequestStatus;
        partnerId: string;
        gitBranch: string | null;
        requestType: import("@prisma/client").$Enums.DevRequestType;
        title: string;
        description: string | null;
        priority: import("@prisma/client").$Enums.ErrorSeverity;
        estimatedHours: number | null;
        actualHours: number | null;
        quotedPrice: import("@prisma/client-runtime-utils").Decimal | null;
        approvedPrice: import("@prisma/client-runtime-utils").Decimal | null;
        assignedDeveloper: string | null;
        attachments: import("@prisma/client/runtime/client").JsonValue | null;
        deliveredAt: Date | null;
        acceptedAt: Date | null;
        rejectedReason: string | null;
        dueDate: Date | null;
        slaHours: number | null;
    }>;
    deliver(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.DevRequestStatus;
        partnerId: string;
        gitBranch: string | null;
        requestType: import("@prisma/client").$Enums.DevRequestType;
        title: string;
        description: string | null;
        priority: import("@prisma/client").$Enums.ErrorSeverity;
        estimatedHours: number | null;
        actualHours: number | null;
        quotedPrice: import("@prisma/client-runtime-utils").Decimal | null;
        approvedPrice: import("@prisma/client-runtime-utils").Decimal | null;
        assignedDeveloper: string | null;
        attachments: import("@prisma/client/runtime/client").JsonValue | null;
        deliveredAt: Date | null;
        acceptedAt: Date | null;
        rejectedReason: string | null;
        dueDate: Date | null;
        slaHours: number | null;
    }>;
    accept(id: string, actualHours?: number): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.DevRequestStatus;
        partnerId: string;
        gitBranch: string | null;
        requestType: import("@prisma/client").$Enums.DevRequestType;
        title: string;
        description: string | null;
        priority: import("@prisma/client").$Enums.ErrorSeverity;
        estimatedHours: number | null;
        actualHours: number | null;
        quotedPrice: import("@prisma/client-runtime-utils").Decimal | null;
        approvedPrice: import("@prisma/client-runtime-utils").Decimal | null;
        assignedDeveloper: string | null;
        attachments: import("@prisma/client/runtime/client").JsonValue | null;
        deliveredAt: Date | null;
        acceptedAt: Date | null;
        rejectedReason: string | null;
        dueDate: Date | null;
        slaHours: number | null;
    }>;
    setDueDate(id: string, dueDate: Date, slaHours?: number): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.DevRequestStatus;
        partnerId: string;
        gitBranch: string | null;
        requestType: import("@prisma/client").$Enums.DevRequestType;
        title: string;
        description: string | null;
        priority: import("@prisma/client").$Enums.ErrorSeverity;
        estimatedHours: number | null;
        actualHours: number | null;
        quotedPrice: import("@prisma/client-runtime-utils").Decimal | null;
        approvedPrice: import("@prisma/client-runtime-utils").Decimal | null;
        assignedDeveloper: string | null;
        attachments: import("@prisma/client/runtime/client").JsonValue | null;
        deliveredAt: Date | null;
        acceptedAt: Date | null;
        rejectedReason: string | null;
        dueDate: Date | null;
        slaHours: number | null;
    }>;
    getOverdue(): Promise<({
        partner: {
            partnerCode: string;
            companyName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.DevRequestStatus;
        partnerId: string;
        gitBranch: string | null;
        requestType: import("@prisma/client").$Enums.DevRequestType;
        title: string;
        description: string | null;
        priority: import("@prisma/client").$Enums.ErrorSeverity;
        estimatedHours: number | null;
        actualHours: number | null;
        quotedPrice: import("@prisma/client-runtime-utils").Decimal | null;
        approvedPrice: import("@prisma/client-runtime-utils").Decimal | null;
        assignedDeveloper: string | null;
        attachments: import("@prisma/client/runtime/client").JsonValue | null;
        deliveredAt: Date | null;
        acceptedAt: Date | null;
        rejectedReason: string | null;
        dueDate: Date | null;
        slaHours: number | null;
    })[]>;
    addComment(requestId: string, dto: {
        authorRole: string;
        authorName: string;
        message: string;
        isInternal?: boolean;
    }): Promise<{
        id: string;
        createdAt: Date;
        message: string;
        authorRole: string;
        authorName: string;
        isInternal: boolean;
        requestId: string;
    }>;
    getComments(requestId: string, isPartner?: boolean): Promise<{
        id: string;
        createdAt: Date;
        message: string;
        authorRole: string;
        authorName: string;
        isInternal: boolean;
        requestId: string;
    }[]>;
    getDashboard(): Promise<{
        byStatus: {
            status: import("@prisma/client").$Enums.DevRequestStatus;
            count: number;
        }[];
        overdueCount: number;
        recentCommentsToday: number;
    }>;
}
