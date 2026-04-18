import { IEventHandler } from '@nestjs/cqrs';
import { OrganizationDeactivatedEvent } from '../../domain/events/organization-deactivated.event';
export declare class OnOrganizationDeactivatedHandler implements IEventHandler<OrganizationDeactivatedEvent> {
    private readonly logger;
    handle(event: OrganizationDeactivatedEvent): void;
}
