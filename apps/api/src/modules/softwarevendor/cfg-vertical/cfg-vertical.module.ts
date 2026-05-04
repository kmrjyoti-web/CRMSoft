import { Module } from '@nestjs/common';
import { CfgVerticalController } from './cfg-vertical.controller';
import { CfgVerticalService } from './cfg-vertical.service';

@Module({
  controllers: [CfgVerticalController],
  providers: [CfgVerticalService],
  exports: [CfgVerticalService],
})
export class CfgVerticalModule {}
