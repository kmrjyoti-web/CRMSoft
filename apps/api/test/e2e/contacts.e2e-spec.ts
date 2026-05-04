/**
 * E2E tests for Contacts endpoints.
 * Uses NestJS TestingModule with mocked PrismaService.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/core/prisma/prisma.service';
import { createMockPrismaService } from '../helpers/mock-prisma';
import { createAuthHeader } from '../helpers/auth.helper';

describe('Contacts E2E', () => {
  let app: INestApplication;
  let prisma: ReturnType<typeof createMockPrismaService>;

  const mockContact = {
    id: 'c-1',
    firstName: 'Priya',
    lastName: 'Sharma',
    isActive: true,
    tenantId: 'test-tenant-1',
    communications: [{ id: 'cm-1', type: 'MOBILE', value: '9876543210', isPrimary: true }],
    contactOrganizations: [],
    leads: [],
    filters: [],
    rawContacts: [],
    createdByUser: { id: 'test-user-1', firstName: 'Admin', lastName: 'User' },
    _count: { leads: 0, communications: 1, activities: 0 },
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

  describe('GET /contacts', () => {
    it('should return 401 without auth', async () => {
      await request(app.getHttpServer())
        .get('/contacts')
        .expect(401);
    });

    it('should return paginated contacts list', async () => {
      prisma.working.contact.findMany.mockResolvedValue([mockContact]);
      prisma.working.contact.count.mockResolvedValue(1);

      const res = await request(app.getHttpServer())
        .get('/contacts')
        .set(authHeaders)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
    });

    it('should accept search query param', async () => {
      prisma.working.contact.findMany.mockResolvedValue([]);
      prisma.working.contact.count.mockResolvedValue(0);

      const res = await request(app.getHttpServer())
        .get('/contacts?search=Priya')
        .set(authHeaders)
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it('should accept pagination params', async () => {
      prisma.working.contact.findMany.mockResolvedValue([mockContact]);
      prisma.working.contact.count.mockResolvedValue(1);

      const res = await request(app.getHttpServer())
        .get('/contacts?page=1&limit=10')
        .set(authHeaders)
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /contacts/:id', () => {
    it('should return a contact by id', async () => {
      prisma.working.contact.findUnique.mockResolvedValue(mockContact);

      const res = await request(app.getHttpServer())
        .get('/contacts/c-1')
        .set(authHeaders)
        .expect(200);

      expect(res.body.data.id).toBe('c-1');
      expect(res.body.data.firstName).toBe('Priya');
    });

    it('should return 404 when contact not found', async () => {
      prisma.working.contact.findUnique.mockResolvedValue(null);

      await request(app.getHttpServer())
        .get('/contacts/no-such-id')
        .set(authHeaders)
        .expect(404);
    });
  });

  describe('POST /contacts', () => {
    it('should create a contact and return it', async () => {
      prisma.working.contact.create.mockResolvedValue(mockContact);
      prisma.working.contact.findUnique.mockResolvedValue(mockContact);

      const dto = {
        firstName: 'Priya',
        lastName: 'Sharma',
        communications: [{ type: 'MOBILE', value: '9876543210', isPrimary: true }],
      };

      const res = await request(app.getHttpServer())
        .post('/contacts')
        .set(authHeaders)
        .send(dto)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
    });

    it('should return 400 when firstName is missing', async () => {
      await request(app.getHttpServer())
        .post('/contacts')
        .set(authHeaders)
        .send({ lastName: 'Sharma' })
        .expect(400);
    });
  });
});
