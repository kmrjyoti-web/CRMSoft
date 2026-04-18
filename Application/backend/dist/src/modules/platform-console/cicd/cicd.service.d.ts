import { PlatformConsolePrismaService } from '../prisma/platform-console-prisma.service';
import { LogDeploymentDto } from './dto/log-deployment.dto';
import { LogPipelineDto } from './dto/log-pipeline.dto';
export declare class CICDService {
    private readonly db;
    private readonly logger;
    constructor(db: PlatformConsolePrismaService);
    logDeployment(dto: LogDeploymentDto): Promise<any>;
    completeDeployment(id: string, data: {
        status: string;
        duration?: number;
        errorMessage?: string;
    }): Promise<any>;
    getDeployments(filters: {
        environment?: string;
        status?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        data: any[];
        total: number;
    }>;
    getDeployment(id: string): Promise<any>;
    getLatestDeployments(): Promise<any[]>;
    logPipelineRun(dto: LogPipelineDto): Promise<any>;
    completePipelineRun(id: string, data: {
        status: string;
        jobs?: any[];
    }): Promise<any>;
    getPipelines(params: {
        status?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        data: any[];
        total: number;
    }>;
    getPipeline(id: string): Promise<any>;
    getPipelineLogs(id: string): Promise<any[]>;
    addBuildLog(data: {
        pipelineRunId: string;
        jobName: string;
        output: string;
        exitCode?: number;
        duration?: number;
    }): Promise<any>;
    getStats(): Promise<object>;
}
