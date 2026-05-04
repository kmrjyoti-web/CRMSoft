import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '.prisma/platform-console-client';

@Injectable()
export class PlatformConsolePrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PlatformConsolePrismaService.name);

  constructor() {
    super({
      datasources: {
        db: { url: process.env.PLATFORM_CONSOLE_DATABASE_URL },
      },
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('PlatformConsoleDB connected');
    } catch (error) {
      this.logger.error('PlatformConsoleDB connection failed', (error as Error).stack);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
