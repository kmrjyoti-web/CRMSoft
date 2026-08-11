import { Module } from '@nestjs/common';
import { HelpController } from './presentation/help.controller';
import { HelpService } from './services/help.service';

@Module({
  controllers: [HelpController],
  providers: [HelpService],
  exports: [HelpService],
})
export class HelpModule {}
