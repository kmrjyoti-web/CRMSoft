import { Module } from '@nestjs/common';
import { DbAuditorController } from './db-auditor.controller';
import { DbAuditorService } from './db-auditor.service';
import { NamingCheckService } from './checks/naming-check.service';
import { CrossDbIncludeCheckService } from './checks/cross-db-include-check.service';
import { FkOrphanCheckService } from './checks/fk-orphan-check.service';

@Module({
  controllers: [DbAuditorController],
  providers: [
    DbAuditorService,
    NamingCheckService,
    CrossDbIncludeCheckService,
    FkOrphanCheckService,
  ],
  exports: [DbAuditorService],
})
export class DbAuditorModule {}
