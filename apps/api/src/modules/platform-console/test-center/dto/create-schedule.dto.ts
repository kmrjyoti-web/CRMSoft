export class CreateScheduleDto {
  planId?: string;
  scheduleType: string; // NIGHTLY | WEEKLY | PER_RELEASE | CUSTOM
  cronExpression?: string;
  moduleScope?: string;
  verticalScope?: string;
  brandScope?: string;
}
