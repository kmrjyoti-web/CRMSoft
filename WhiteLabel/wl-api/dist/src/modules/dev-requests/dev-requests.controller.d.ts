import { DevRequestsService } from './dev-requests.service';
import { DevRequestStatus, DevRequestType, ErrorSeverity } from '@prisma/client';
declare class SubmitRequestDto {
    partnerId: string;
    requestType: DevRequestType;
    title: string;
    description?: string;
    priority?: ErrorSeverity;
}
declare class ReviewDto {
    action: 'APPROVE' | 'REJECT';
    estimatedHours?: number;
    quotedPrice?: number;
    rejectedReason?: string;
}
declare class AssignDto {
    assignedDeveloper: string;
    gitBranch?: string;
}
declare class AcceptDto {
    actualHours?: number;
}
declare class SetDueDateDto {
    dueDate: string;
    slaHours?: number;
}
declare class AddCommentDto {
    authorRole: string;
    authorName: string;
    message: string;
    isInternal?: boolean;
}
export declare class DevRequestsController {
    private devRequestsService;
    constructor(devRequestsService: DevRequestsService);
    submit(dto: SubmitRequestDto): Promise<{
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
    getDashboard(): Promise<{
        byStatus: {
            status: import("@prisma/client").$Enums.DevRequestStatus;
            count: number;
        }[];
        overdueCount: number;
        recentCommentsToday: number;
    }>;
    findAll(partnerId?: string, status?: DevRequestStatus, page?: string, limit?: string): Promise<{
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
    review(id: string, dto: ReviewDto): Promise<{
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
    assign(id: string, dto: AssignDto): Promise<{
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
    accept(id: string, dto: AcceptDto): Promise<{
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
    setDueDate(id: string, dto: SetDueDateDto): Promise<{
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
    addComment(id: string, dto: AddCommentDto): Promise<{
        id: string;
        createdAt: Date;
        message: string;
        authorRole: string;
        authorName: string;
        isInternal: boolean;
        requestId: string;
    }>;
    getComments(id: string, isPartner?: string): Promise<{
        id: string;
        createdAt: Date;
        message: string;
        authorRole: string;
        authorName: string;
        isInternal: boolean;
        requestId: string;
    }[]>;
}
export {};
