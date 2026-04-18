import { IEventHandler } from '@nestjs/cqrs';
import { OrganizationCreatedEvent } from '../../domain/events/organization-created.event';
export declare class OnOrganizationCreatedHandler implements IEventHandler<OrganizationCreatedEvent> {
    private readonly logger;
    handle(event: OrganizationCreatedEvent): void;
}
