import { SecurityService } from './security.service';
import { CreateIncidentDto } from './dto/create-incident.dto';
export declare class SecurityController {
    private readonly securityService;
    constructor(securityService: SecurityService);
    getLatestSnapshots(): Promise<any[]>;
    getSnapshots(service?: string, page?: string, limit?: string): Promise<{
        data: any[];
        total: number;
    }>;
    captureHealthSnapshot(): Promise<any[]>;
    getIncidents(status?: string, severity?: string, page?: string, limit?: string): Promise<{
        data: any[];
        total: number;
    }>;
    createIncident(dto: CreateIncidentDto): Promise<any>;
    getIncident(id: string): Promise<any>;
    updateIncident(id: string, body: {
        status?: string;
        rootCause?: string;
        resolution?: string;
    }): Promise<any>;
    addPostmortem(id: string, body: {
        postmortem: string;
    }): Promise<any>;
    getDRPlans(): Promise<any[]>;
    getDRPlan(service: string): Promise<any>;
    updateDRPlan(service: string, body: {
        runbook?: string;
        rto?: number;
        rpo?: number;
    }): Promise<any>;
    testDRPlan(service: string): Promise<any>;
    getNotificationStats(): Promise<object>;
    getNotifications(page?: string, limit?: string): Promise<{
        data: any[];
        total: number;
    }>;
}
