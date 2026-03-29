import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../core/prisma/prisma.module';
import { RecycleBinController } from './recycle-bin.controller';

@Module({
  imports: [PrismaModule],
  controllers: [RecycleBinController],
})
export class RecycleBinModule {}
