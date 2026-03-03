import { Module } from '@nestjs/common';
import { DepartmentsController } from './presentation/departments.controller';

@Module({
  controllers: [DepartmentsController],
})
export class DepartmentsModule {}
