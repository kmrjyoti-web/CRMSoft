export interface JobOptions {
    attempts?: number;
    backoff?: number;
    delay?: number;
    jobId?: string;
    priority?: number;
    removeOnComplete?: boolean | number;
    removeOnFail?: boolean | number;
}
export interface IMessageQueueService {
    add<T = unknown>(queueName: string, jobName: string, data: T, options?: JobOptions): Promise<string>;
    addBulk<T = unknown>(queueName: string, jobs: {
        name: string;
        data: T;
        opts?: JobOptions;
    }[]): Promise<string[]>;
    getJob(queueName: string, jobId: string): Promise<any>;
    getJobCounts(queueName: string): Promise<{
        waiting: number;
        active: number;
        completed: number;
        failed: number;
        delayed: number;
    }>;
    removeJob(queueName: string, jobId: string): Promise<void>;
}
//# sourceMappingURL=message-queue.interface.d.ts.map