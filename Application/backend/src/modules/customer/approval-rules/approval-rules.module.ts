import { Module } from '@nestjs/common';
import { ApprovalRulesController } from './presentation/approval-rules.controller';

@Module({
  controllers: [ApprovalRulesController],
})
export class ApprovalRulesModule {}
