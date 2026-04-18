import { PrismaService } from '../../../../core/prisma/prisma.service';
import { DrillDownResult, ColumnDef } from '../interfaces/report.interface';
export declare class DrillDownService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getLeads(where: any, page: number, limit: number, columns?: ColumnDef[]): Promise<DrillDownResult>;
    getActivities(where: Record<string, unknown>, page: number, limit: number): Promise<DrillDownResult>;
    getDemos(where: Record<string, unknown>, page: number, limit: number): Promise<DrillDownResult>;
    getContacts(where: Record<string, unknown>, page: number, limit: number): Promise<DrillDownResult>;
}
