import { Module } from '@nestjs/common';
import { SmartSearchController } from './smart-search.controller';
import { SmartSearchService } from './smart-search.service';
import { PrismaModule } from '../../../core/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SmartSearchController],
  providers: [SmartSearchService],
  exports: [SmartSearchService],
})
export class SmartSearchModule {}
