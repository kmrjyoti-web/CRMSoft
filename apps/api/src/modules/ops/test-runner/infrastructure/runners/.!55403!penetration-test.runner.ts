import { Injectable } from '@nestjs/common';
import { TestType } from '@prisma/platform-client';
import { Client } from 'pg';
import type { ITestTypeRunner, TestRunConfig, TestTypeResult, SingleTestResult } from './test-runner.interface';

const SQL_PAYLOADS = [
  "' OR '1'='1",
  "'; DROP TABLE users; --",
  "1 UNION SELECT * FROM users --",
  "admin'--",
];

const XSS_PAYLOADS = [
  '<script>alert("xss")</script>',
  '<img src=x onerror=alert(1)>',
  'javascript:alert(1)',
];

const PROTECTED_ENDPOINTS = [
  '/api/v1/contacts',
  '/api/v1/leads',
  '/api/v1/products',
  '/api/v1/invoices',
  '/api/v1/users',
];

@Injectable()
export class PenetrationTestRunner implements ITestTypeRunner {
  type = TestType.PENETRATION;

  async run(config: TestRunConfig): Promise<TestTypeResult> {
    const startTime = Date.now();
    const results: SingleTestResult[] = [];
    const baseUrl = `http://localhost:${process.env.PORT ?? 3000}`;

    results.push(...(await this.testSqlInjection(baseUrl)));
    results.push(...(await this.testXss(baseUrl)));
    results.push(...(await this.testAuthBypass(baseUrl)));
    results.push(this.testTenantIsolation());
    results.push(...(await this.testRateLimiting(baseUrl)));
    results.push(...(await this.testSecurityHeaders(baseUrl)));

