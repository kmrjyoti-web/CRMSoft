import { PlatformConsolePrismaService } from '../prisma/platform-console-prisma.service';
import { CreateTestPlanDto } from './dto/create-test-plan.dto';
import { CreateScheduleDto } from './dto/create-schedule.dto';
export declare class TestCenterService {
    private readonly db;
    private readonly logger;
    constructor(db: PlatformConsolePrismaService);
    createTestPlan(dto: CreateTestPlanDto): Promise<any>;
    getTestPlans(params: {
        page?: number;
        limit?: number;
    }): Promise<{
        data: any[];
        total: number;
    }>;
    getTestPlan(id: string): Promise<any>;
    updateTestPlan(id: string, data: {
        name?: string;
        description?: string;
        scenarios?: any[];
        isActive?: boolean;
    }): Promise<any>;
    deleteTestPlan(id: string): Promise<any>;
    getExecutions(filters: {
        status?: string;
        moduleScope?: string;
        triggerType?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        data: any[];
        total: number;
    }>;
    getExecution(id: string): Promise<any>;
    getLatestExecution(): Promise<any>;
    getSchedules(): Promise<any[]>;
    createSchedule(dto: CreateScheduleDto): Promise<any>;
    updateSchedule(id: string, data: {
        cronExpression?: string;
        isActive?: boolean;
        moduleScope?: string;
    }): Promise<any>;
    deleteSchedule(id: string): Promise<any>;
    getStats(): Promise<object>;
}
