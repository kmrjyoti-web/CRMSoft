import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { SlaAlertsService } from './sla-alerts.service';
export declare class SlaAlertsCron implements OnModuleInit, OnModuleDestroy {
    private slaAlertsService;
    private readonly logger;
    private breachInterval;
    private overdueInterval;
    constructor(slaAlertsService: SlaAlertsService);
    onModuleInit(): void;
    onModuleDestroy(): void;
}
