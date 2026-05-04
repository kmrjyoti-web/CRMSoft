import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
import { AssignFiltersCommand } from './assign-filters.command';
import { ENTITY_FILTER_CONFIG } from '../../../entity-filter.types';

/**
 * Assigns lookup values as filters to an entity.
