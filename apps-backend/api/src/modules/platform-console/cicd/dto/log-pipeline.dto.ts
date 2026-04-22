export class LogPipelineDto {
  pipelineName: string;
  triggerType: string; // PUSH | PR | MANUAL | SCHEDULE
  branch: string;
  jobs?: Array<{ name: string; status: string }>;
}
