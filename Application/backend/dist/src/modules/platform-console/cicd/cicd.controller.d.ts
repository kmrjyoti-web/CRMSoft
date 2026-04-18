import { CICDService } from './cicd.service';
import { LogDeploymentDto } from './dto/log-deployment.dto';
import { LogPipelineDto } from './dto/log-pipeline.dto';
export declare class CICDController {
    private readonly cicdService;
    constructor(cicdService: CICDService);
    getStats(): Promise<object>;
    getLatestDeployments(): Promise<any[]>;
    getDeployments(environment?: string, status?: string, page?: string, limit?: string): Promise<{
        data: any[];
        total: number;
    }>;
    logDeployment(dto: LogDeploymentDto): Promise<any>;
    getDeployment(id: string): Promise<any>;
    completeDeployment(id: string, body: {
        status: string;
        duration?: number;
        errorMessage?: string;
    }): Promise<any>;
    getPipelines(status?: string, page?: string, limit?: string): Promise<{
        data: any[];
        total: number;
    }>;
    logPipelineRun(dto: LogPipelineDto): Promise<any>;
    getPipeline(id: string): Promise<any>;
    completePipelineRun(id: string, body: {
        status: string;
        jobs?: any[];
    }): Promise<any>;
    getPipelineLogs(id: string): Promise<any[]>;
    addBuildLog(id: string, body: {
        jobName: string;
        output: string;
        exitCode?: number;
        duration?: number;
    }): Promise<any>;
}
