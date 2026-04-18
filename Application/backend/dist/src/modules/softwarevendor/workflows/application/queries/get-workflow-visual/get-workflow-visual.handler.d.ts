import { IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetWorkflowVisualQuery } from './get-workflow-visual.query';
export declare class GetWorkflowVisualHandler implements IQueryHandler<GetWorkflowVisualQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: GetWorkflowVisualQuery): Promise<{
        id: string;
        name: string;
        nodes: {
            id: string;
            code: string;
            name: string;
            type: string;
            position: {
                x: number;
                y: number;
            };
            data: {
                label: string;
                description: string;
                nodeCategory: string;
                nodeSubType: import("@prisma/working-client").$Enums.WorkflowStateType;
                icon: string;
                color: string;
                config: {};
                isConfigured: boolean;
            };
            stateType: import("@prisma/working-client").$Enums.WorkflowStateType;
            category: import("@prisma/working-client").$Enums.WorkflowStateCategory | null;
            color: string | null;
            icon: string | null;
            sortOrder: number;
        }[];
        edges: {
            id: string;
            source: string;
            target: string;
            label: string;
            type: string;
            animated: boolean;
            markerEnd: {
                type: string;
                width: number;
                height: number;
            };
            style: {
                stroke: string;
                strokeWidth: number;
            };
        }[];
    }>;
}
