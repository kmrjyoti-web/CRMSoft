import { PrismaService } from '../../../../core/prisma/prisma.service';
import { CronJobConfig, CronJobRunLog } from '@prisma/working-client';
export declare class CronAlertService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    sendAlert(job: CronJobConfig, error: string, runLog: CronJobRunLog): Promise<void>;
    private buildAlertBody;
    private sendEmailAlert;
    private sendInAppAlert;
}
