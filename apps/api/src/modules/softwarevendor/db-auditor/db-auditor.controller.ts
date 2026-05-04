import { Controller, Get, Param, Query } from '@nestjs/common';
import { DbAuditorService } from './db-auditor.service';
import { AuditCheckId } from './dto/audit-finding.dto';

@Controller('platform/db-auditor')
export class DbAuditorController {
  constructor(private readonly service: DbAuditorService) {}

  @Get('run')
  run(
    @Query('db') db?: string,
    @Query('deep') deep?: string,
  ) {
    return this.service.runAll({ db, deep: deep === 'true' });
  }

  @Get('run/:checkId')
  runCheck(
    @Param('checkId') checkId: AuditCheckId,
    @Query('db') db?: string,
    @Query('deep') deep?: string,
  ) {
    return this.service.runCheck(checkId, { db, deep: deep === 'true' });
  }

  @Get('findings')
  getFindings() {
    const report = this.service.getLastReport();
    if (!report) {
      return { message: 'No audit has been run yet. Call GET /run first.' };
    }
    return report;
  }
}
