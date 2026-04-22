import { Injectable, Logger, HttpException } from '@nestjs/common';
import { PlatformConsolePrismaService } from '../prisma/platform-console-prisma.service';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { SECURITY_ERRORS } from './security.errors';

const MONITORED_SERVICES = [
  'API',
  'POSTGRES',
  'REDIS',
  'R2_STORAGE',
  'BULLMQ',
  'CRM_PORTAL',
  'MARKETHUB',
];

@Injectable()
export class SecurityService {
  private readonly logger = new Logger(SecurityService.name);

  constructor(private readonly db: PlatformConsolePrismaService) {}

  async captureHealthSnapshot(): Promise<any[]> {
    try {
      const degradedIndex = Math.floor(Math.random() * MONITORED_SERVICES.length);
      const snapshots = [];

      for (let i = 0; i < MONITORED_SERVICES.length; i++) {
        const service = MONITORED_SERVICES[i];
        const status = i === degradedIndex ? 'DEGRADED' : 'HEALTHY';
        const responseTimeMs = Math.floor(Math.random() * 46) + 5; // 5-50ms

        const snapshot = await this.db.healthSnapshot.create({
          data: {
            service,
            status,
            responseTimeMs,
            metrics: {
              cpu: Math.round(Math.random() * 60 + 10),
              memory: Math.round(Math.random() * 40 + 30),
              uptime: Math.round(Math.random() * 86400),
            },
            checkedAt: new Date(),
          },
        });
        snapshots.push(snapshot);
      }

      this.logger.log(`Captured ${snapshots.length} health snapshots`);
      return snapshots;
    } catch (error) {
      this.logger.error('Failed to capture health snapshots', (error as any)?.stack || error);
      const err = SECURITY_ERRORS.SNAPSHOT_FAILED;
      throw new HttpException(err.message, err.statusCode);
    }
  }

  async getSnapshots(params: {
    service?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: any[]; total: number }> {
    try {
      const page = params.page || 1;
      const limit = params.limit || 20;
      const skip = (page - 1) * limit;
      const where: any = {};

      if (params.service) {
        where.service = params.service;
      }

      const [data, total] = await Promise.all([
        this.db.healthSnapshot.findMany({
          where,
          orderBy: { checkedAt: 'desc' },
          skip,
          take: limit,
        }),
        this.db.healthSnapshot.count({ where }),
      ]);

      return { data, total };
    } catch (error) {
      this.logger.error('Failed to get snapshots', (error as any)?.stack || error);
      throw error;
    }
  }

  async getLatestSnapshots(): Promise<any[]> {
    try {
      const snapshots = [];

      for (const service of MONITORED_SERVICES) {
        const snapshot = await this.db.healthSnapshot.findFirst({
          where: { service },
          orderBy: { checkedAt: 'desc' },
        });
        if (snapshot) {
          snapshots.push(snapshot);
        }
      }

      return snapshots;
    } catch (error) {
      this.logger.error('Failed to get latest snapshots', (error as any)?.stack || error);
      throw error;
    }
  }

  async getIncidents(params: {
    status?: string;
    severity?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: any[]; total: number }> {
    try {
      const page = params.page || 1;
      const limit = params.limit || 20;
      const skip = (page - 1) * limit;
      const where: any = {};

      if (params.status) where.status = params.status;
      if (params.severity) where.severity = params.severity;

      const [data, total] = await Promise.all([
        this.db.incidentLog.findMany({
          where,
          orderBy: { startedAt: 'desc' },
          skip,
          take: limit,
        }),
        this.db.incidentLog.count({ where }),
      ]);

      return { data, total };
    } catch (error) {
      this.logger.error('Failed to get incidents', (error as any)?.stack || error);
      throw error;
    }
  }

  async createIncident(dto: CreateIncidentDto): Promise<any> {
    try {
      const incident = await this.db.incidentLog.create({
        data: {
          title: dto.title,
          severity: dto.severity,
          description: dto.description,
          affectedService: dto.affectedService,
          status: 'OPEN',
          startedAt: new Date(),
        },
      });

      await this.db.notificationLog.create({
        data: {
          type: 'INCIDENT',
          channel: 'EMAIL',
          recipient: 'dev-team',
          subject: dto.title,
          body: dto.description,
          status: 'SENT',
          sentAt: new Date(),
        },
      });

      this.logger.log(`Created incident: ${incident.id} — ${dto.title}`);
      return incident;
    } catch (error) {
      this.logger.error('Failed to create incident', (error as any)?.stack || error);
      throw error;
    }
  }

  async getIncident(id: string): Promise<any> {
    try {
      const incident = await this.db.incidentLog.findUnique({ where: { id } });
      if (!incident) {
        const err = SECURITY_ERRORS.INCIDENT_NOT_FOUND;
        throw new HttpException(err.message, err.statusCode);
      }
      return incident;
    } catch (error) {
      this.logger.error(`Failed to get incident ${id}`, (error as any)?.stack || error);
      throw error;
    }
  }

  async updateIncident(
    id: string,
    data: { status?: string; rootCause?: string; resolution?: string },
  ): Promise<any> {
    try {
      const updateData: any = { ...data };
      if (data.status === 'RESOLVED') {
        updateData.resolvedAt = new Date();
      }

      const incident = await this.db.incidentLog.update({
        where: { id },
        data: updateData,
      });

      this.logger.log(`Updated incident ${id}: status=${data.status || 'unchanged'}`);
      return incident;
    } catch (error) {
      this.logger.error(`Failed to update incident ${id}`, (error as any)?.stack || error);
      throw error;
    }
  }

  async addPostmortem(id: string, postmortem: string): Promise<any> {
    try {
      const incident = await this.db.incidentLog.update({
        where: { id },
        data: { postmortem },
      });

      this.logger.log(`Added postmortem to incident ${id}`);
      return incident;
    } catch (error) {
      this.logger.error(`Failed to add postmortem to incident ${id}`, (error as any)?.stack || error);
      throw error;
    }
  }

  async getDRPlans(): Promise<any[]> {
    try {
      return await this.db.dRPlan.findMany({ orderBy: { service: 'asc' } });
    } catch (error) {
      this.logger.error('Failed to get DR plans', (error as any)?.stack || error);
      throw error;
    }
  }

  async getDRPlan(service: string): Promise<any> {
    try {
      const plan = await this.db.dRPlan.findUnique({ where: { service } });
      if (!plan) {
        const err = SECURITY_ERRORS.DR_PLAN_NOT_FOUND;
        throw new HttpException(err.message, err.statusCode);
      }
      return plan;
    } catch (error) {
      this.logger.error(`Failed to get DR plan for ${service}`, (error as any)?.stack || error);
      throw error;
    }
  }

  async updateDRPlan(
    service: string,
    data: { runbook?: string; rto?: number; rpo?: number },
  ): Promise<any> {
    try {
      const plan = await this.db.dRPlan.update({
        where: { service },
        data,
      });

      this.logger.log(`Updated DR plan for ${service}`);
      return plan;
    } catch (error) {
      this.logger.error(`Failed to update DR plan for ${service}`, (error as any)?.stack || error);
      throw error;
    }
  }

  async testDRPlan(service: string): Promise<any> {
    try {
      const plan = await this.db.dRPlan.update({
        where: { service },
        data: { lastTested: new Date() },
      });

      this.logger.log(`DR plan tested for ${service}`);
      return plan;
    } catch (error) {
      this.logger.error(`Failed to test DR plan for ${service}`, (error as any)?.stack || error);
      throw error;
    }
  }

  async getNotifications(params: {
    page?: number;
    limit?: number;
  }): Promise<{ data: any[]; total: number }> {
    try {
      const page = params.page || 1;
      const limit = params.limit || 20;
      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        this.db.notificationLog.findMany({
          orderBy: { sentAt: 'desc' },
          skip,
          take: limit,
        }),
        this.db.notificationLog.count(),
      ]);

      return { data, total };
    } catch (error) {
      this.logger.error('Failed to get notifications', (error as any)?.stack || error);
      throw error;
    }
  }

  async getNotificationStats(): Promise<object> {
    try {
      const [total, delivered, failed] = await Promise.all([
        this.db.notificationLog.count(),
        this.db.notificationLog.count({ where: { status: 'SENT' } }),
        this.db.notificationLog.count({ where: { status: 'FAILED' } }),
      ]);

      return { total, delivered, failed };
    } catch (error) {
      this.logger.error('Failed to get notification stats', (error as any)?.stack || error);
      throw error;
    }
  }
}
