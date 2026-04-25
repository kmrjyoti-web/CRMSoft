import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ScalingService } from './scaling.service';
export declare class ScalingCron implements OnModuleInit, OnModuleDestroy {
    private scalingService;
    private readonly logger;
    private evaluationInterval;
    constructor(scalingService: ScalingService);
    onModuleInit(): void;
    onModuleDestroy(): void;
}
