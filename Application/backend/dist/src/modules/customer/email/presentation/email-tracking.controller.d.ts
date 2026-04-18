import { CommandBus } from '@nestjs/cqrs';
import { Response } from 'express';
export declare class EmailTrackingController {
    private readonly commandBus;
    constructor(commandBus: CommandBus);
    trackOpen(emailId: string, ipAddress: string, userAgent: string, res: Response): Promise<void>;
    trackClick(emailId: string, url: string, ipAddress: string, userAgent: string, res: Response): Promise<void>;
    trackBounce(emailId: string, reason: string): Promise<{
        success: boolean;
    }>;
}
