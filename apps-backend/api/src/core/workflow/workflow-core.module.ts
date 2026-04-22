import { Global, Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { WorkflowEngineService } from './workflow-engine.service';
import { ConditionEvaluatorService } from './condition-evaluator.service';
import { ActionExecutorService } from './action-executor.service';
import { TemplateResolverService } from './template-resolver.service';
import { SlaMonitorService } from './sla-monitor.service';
import { FieldUpdateAction } from './actions/field-update.action';
import { SendEmailAction } from './actions/send-email.action';
import { SendNotificationAction } from './actions/send-notification.action';
import { CreateActivityAction } from './actions/create-activity.action';
import { CreateTaskAction } from './actions/create-task.action';
import { WebhookAction } from './actions/webhook.action';
import { AssignOwnerAction } from './actions/assign-owner.action';

const ActionHandlers = [
  FieldUpdateAction,
  SendEmailAction,
  SendNotificationAction,
  CreateActivityAction,
  CreateTaskAction,
  WebhookAction,
  AssignOwnerAction,
];

const Services = [
  WorkflowEngineService,
  ConditionEvaluatorService,
  ActionExecutorService,
  TemplateResolverService,
  SlaMonitorService,
];

@Global()
@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [...Services, ...ActionHandlers],
  exports: [WorkflowEngineService, ConditionEvaluatorService],
})
export class WorkflowCoreModule {}
