export class CreateTestPlanDto {
  name: string;
  description?: string;
  moduleScope?: string;
  verticalScope?: string;
  scenarios: Array<{
    title: string;
    steps: string;
    expected: string;
    priority: string; // HIGH | MEDIUM | LOW
  }>;
  createdBy: string;
}
