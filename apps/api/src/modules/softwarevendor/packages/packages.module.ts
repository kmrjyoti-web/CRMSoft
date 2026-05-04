import { Module } from '@nestjs/common';
import { PackagesController } from './presentation/packages.controller';

@Module({
  controllers: [PackagesController],
})
export class PackagesModule {}
