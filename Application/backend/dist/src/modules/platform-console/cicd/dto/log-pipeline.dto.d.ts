export declare class LogPipelineDto {
    pipelineName: string;
    triggerType: string;
    branch: string;
    jobs?: Array<{
        name: string;
        status: string;
    }>;
}
