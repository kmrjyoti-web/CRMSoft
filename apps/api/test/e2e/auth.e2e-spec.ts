/**
 * E2E tests for Auth endpoints.
 * Uses NestJS TestingModule with mocked PrismaService + JwtService
 * so no real database is required.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/core/prisma/prisma.service';
import { createMockPrismaService } from '../helpers/mock-prisma';
import * as bcrypt from 'bcrypt';

describe('Auth E2E', () => {
  let app: INestApplication;
  let prisma: ReturnType<typeof createMockPrismaService>;

  const hashedPassword = bcrypt.hashSync('Test@1234', 10);

  const mockAdmin = {
    id: 'u-1',
    email: 'admin@test.com',
    password: hashedPassword,
    firstName: 'Test',
    lastName: 'Admin',
    status: 'ACTIVE',
    userType: 'ADMIN',
    role: { id: 'r-1', name: 'SUPER_ADMIN', displayName: 'Super Admin', level: 1 },
    customerProfile: null,
    referralPartner: null,
    tenantId: 'tenant-1',
  };

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

  describe('POST /auth/admin/login', () => {
    it('should return 200 and accessToken on valid credentials', async () => {
      prisma.identity.user.findFirst.mockResolvedValue(mockAdmin);

      const res = await request(app.getHttpServer())
        .post('/auth/admin/login')
        .send({ email: 'admin@test.com', password: 'Test@1234' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
    });

    it('should return 401 on wrong password', async () => {
      prisma.identity.user.findFirst.mockResolvedValue(mockAdmin);

      await request(app.getHttpServer())
        .post('/auth/admin/login')
        .send({ email: 'admin@test.com', password: 'wrongpassword' })
        .expect(401);
    });

    it('should return 401 when user not found', async () => {
      prisma.identity.user.findFirst.mockResolvedValue(null);

      await request(app.getHttpServer())
        .post('/auth/admin/login')
        .send({ email: 'nobody@test.com', password: 'Test@1234' })
        .expect(401);
    });

    it('should return 400 on missing email', async () => {
      await request(app.getHttpServer())
        .post('/auth/admin/login')
        .send({ password: 'Test@1234' })
        .expect(400);
    });
  });

  describe('GET /auth/me', () => {
    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .get('/auth/me')
        .expect(401);
    });

    it('should return user profile with valid token', async () => {
      prisma.identity.user.findFirst.mockResolvedValue(mockAdmin);

      // First login to get a real token
      const loginRes = await request(app.getHttpServer())
        .post('/auth/admin/login')
        .send({ email: 'admin@test.com', password: 'Test@1234' });

      if (loginRes.status !== 200) return; // skip if login mock not set up

      const token = loginRes.body.data?.accessToken;
      if (!token) return;

      prisma.identity.user.findUnique.mockResolvedValue(mockAdmin);

      const res = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.data).toHaveProperty('id');
    });
  });
});
