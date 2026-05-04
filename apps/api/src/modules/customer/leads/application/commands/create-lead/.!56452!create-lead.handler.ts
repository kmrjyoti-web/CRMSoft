import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, Logger, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateLeadCommand } from './create-lead.command';
import { LeadEntity } from '../../../domain/entities/lead.entity';
import {
  ILeadRepository, LEAD_REPOSITORY,
} from '../../../domain/interfaces/lead-repository.interface';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { WorkflowEngineService } from '../../../../../../core/workflow/workflow-engine.service';

/**
 * Create a new Lead for a verified Contact.
 *
 * FLOW:
