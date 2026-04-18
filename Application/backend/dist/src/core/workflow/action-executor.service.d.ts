import { PrismaService } from '../prisma/prisma.service';
import { TemplateResolverService } from './template-resolver.service';
import { WorkflowActionContext } from './interfaces/action-handler.interface';
import { FieldUpdateAction } from './actions/field-update.action';
import { SendEmailAction } from './actions/send-email.action';
import { SendNotificationAction } from './actions/send-notification.action';
import { CreateActivityAction } from './actions/create-activity.action';
import { CreateTaskAction } from './actions/create-task.action';
import { WebhookAction } from './actions/webhook.action';
import { AssignOwnerAction } from './actions/assign-owner.action';
export declare class ActionExecutorService {
    private readonly prisma;
    private readonly templateResolver;
    private readonly logger;
    private readonly handlers;
    constructor(prisma: PrismaService, templateResolver: TemplateResolverService, fieldUpdate: FieldUpdateAction, sendEmail: SendEmailAction, sendNotification: SendNotificationAction, createActivity: CreateActivityAction, createTask: CreateTaskAction, webhook: WebhookAction, assignOwner: AssignOwnerAction);
    executeAll(actions: any[] | null | undefined, context: WorkflowActionContext, instanceId: string, transitionId: string): Promise<void>;
    private executeSingle;
    private logAction;
}
