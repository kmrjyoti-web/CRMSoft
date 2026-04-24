import { Module } from '@nestjs/common';
import { RuleResolverService } from './services/rule-resolver.service';
import { ControlRoomService } from './services/control-room.service';
import { ControlRoomController } from './presentation/control-room.controller';

@Module({
  controllers: [ControlRoomController],
  providers: [RuleResolverService, ControlRoomService],
  exports: [RuleResolverService, ControlRoomService],
})
export class ControlRoomModule {}
