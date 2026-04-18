import { PlatformConsolePrismaService } from '../prisma/platform-console-prisma.service';
import { CreateIncidentDto } from './dto/create-incident.dto';
export declare class SecurityService {
    private readonly db;
    private readonly logger;
    constructor(db: PlatformConsolePrismaService);
    captureHealthSnapshot(): Promise<any[]>;
    getSnapshots(params: {
        service?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        data: any[];
        total: number;
    }>;
    getLatestSnapshots(): Promise<any[]>;
    getIncidents(params: {
        status?: string;
        severity?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        data: any[];
        total: number;
    }>;
    createIncident(dto: CreateIncidentDto): Promise<any>;
    getIncident(id: string): Promise<any>;
    updateIncident(id: string, data: {
        status?: string;
        rootCause?: string;
        resolution?: string;
    }): Promise<any>;
    addPostmortem(id: string, postmortem: string): Promise<any>;
    getDRPlans(): Promise<any[]>;
    getDRPlan(service: string): Promise<any>;
    updateDRPlan(service: string, data: {
        runbook?: string;
        rto?: number;
        rpo?: number;
    }): Promise<any>;
    testDRPlan(service: string): Promise<any>;
    getNotifications(params: {
        page?: number;
        limit?: number;
    }): Promise<{
        data: any[];
        total: number;
    }>;
    getNotificationStats(): Promise<object>;
}
