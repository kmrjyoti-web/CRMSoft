import { OnModuleInit } from '@nestjs/common';
import { PlatformConsolePrismaService } from './prisma/platform-console-prisma.service';
export declare class PlatformConsoleModule implements OnModuleInit {
    private readonly db;
    constructor(db: PlatformConsolePrismaService);
    onModuleInit(): Promise<void>;
}
