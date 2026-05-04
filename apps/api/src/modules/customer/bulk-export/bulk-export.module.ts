import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ExportController } from './presentation/export.controller';
import { ExportService } from './services/export.service';

@Module({
  imports: [CqrsModule],
  controllers: [ExportController],
  providers: [ExportService],
  exports: [ExportService],
})
export class BulkExportModule {}
