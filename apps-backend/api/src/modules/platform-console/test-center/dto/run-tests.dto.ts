export class RunTestsDto {
  moduleScope?: string;
  verticalScope?: string;
  planId?: string;
  triggerType?: string; // MANUAL | SCHEDULED | CI — defaults to MANUAL
}
