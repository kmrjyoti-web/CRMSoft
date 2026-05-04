/**
 * E2E tests for Leads endpoints.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/core/prisma/prisma.service';
import { createMockPrismaService } from '../helpers/mock-prisma';
import { createAuthHeader } from '../helpers/auth.helper';

describe('Leads E2E', () => {
  let app: INestApplication;
  let prisma: ReturnType<typeof createMockPrismaService>;

  const mockLead = {
    id: 'lead-1',
    leadNumber: 'LEAD-0001',
    title: 'CRM Software Demo',
    stage: 'NEW',
    priority: 'MEDIUM',
    isActive: true,
    tenantId: 'test-tenant-1',
    source: 'WEBSITE',
    assignedTo: { id: 'u-1', firstName: 'Sales', lastName: 'Rep' },
    createdByUser: { id: 'u-1', firstName: 'Admin', lastName: 'User' },
    contact: null,
    organization: null,
    _count: { activities: 0, quotations: 0 },
  };

  const authHeaders = createAuthHeader();

  beforeAll(async () => {
    prisma = createMockPrismaService();

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /leads', () => {
    it('should require auth', async () => {
      await request(app.getHttpServer())
        .get('/leads')
        .expect(401);
    });

    it('should return paginated leads', async () => {
      prisma.working.lead.findMany.mockResolvedValue([mockLead]);
      prisma.working.lead.count.mockResolvedValue(1);

      const res = await request(app.getHttpServer())
        .get('/leads')
        .set(authHeaders)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should filter by stage', async () => {
      prisma.working.lead.findMany.mockResolvedValue([mockLead]);
      prisma.working.lead.count.mockResolvedValue(1);

      await request(app.getHttpServer())
        .get('/leads?stage=NEW')
        .set(authHeaders)
        .expect(200);
    });
  });

  describe('GET /leads/:id', () => {
    it('should return lead by id', async () => {
      prisma.working.lead.findUnique.mockResolvedValue(mockLead);

      const res = await request(app.getHttpServer())
        .get('/leads/lead-1')
        .set(authHeaders)
        .expect(200);

      expect(res.body.data.id).toBe('lead-1');
      expect(res.body.data.leadNumber).toBe('LEAD-0001');
    });

    it('should return 404 for missing lead', async () => {
      prisma.working.lead.findUnique.mockResolvedValue(null);

      await request(app.getHttpServer())
        .get('/leads/no-such-id')
        .set(authHeaders)
        .expect(404);
    });
  });

  describe('POST /leads', () => {
    it('should create a lead', async () => {
      prisma.working.lead.count.mockResolvedValue(0);
      prisma.working.lead.create.mockResolvedValue(mockLead);
      prisma.working.lead.findUnique.mockResolvedValue(mockLead);

      const dto = {
        title: 'CRM Software Demo',
        stage: 'NEW',
        priority: 'MEDIUM',
        source: 'WEBSITE',
      };

      const res = await request(app.getHttpServer())
        .post('/leads')
        .set(authHeaders)
        .send(dto)
        .expect(201);

      expect(res.body.success).toBe(true);
    });

    it('should return 400 when title is missing', async () => {
      await request(app.getHttpServer())
        .post('/leads')
        .set(authHeaders)
        .send({ stage: 'NEW' })
        .expect(400);
    });
  });

  describe('PUT /leads/:id/stage', () => {
    it('should update lead stage', async () => {
      const updatedLead = { ...mockLead, stage: 'QUALIFIED' };
      prisma.working.lead.findUnique.mockResolvedValue(mockLead);
      prisma.working.lead.update.mockResolvedValue(updatedLead);

      const res = await request(app.getHttpServer())
        .put('/leads/lead-1/stage')
        .set(authHeaders)
        .send({ stage: 'QUALIFIED' })
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });
});
