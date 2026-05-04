# 🚀 CRM Backend — Step-by-Step Prompt Development Guide

## How This Works

Each **STEP** below is one prompt. Copy the prompt, paste to AI, get code, paste in VS Code.
After each step: **run tests to verify everything works**.

---

## STEP 01: Extract & Install

```bash
# 1. Extract the project
tar xzf crm-backend.tar.gz
cd crm-backend

# 2. Open in VS Code
code .

# 3. Install dependencies
npm install

# 4. Start database
docker-compose up -d

# 5. Verify database is running
docker ps
# You should see: crm-postgres, crm-redis
```

### ✅ Verification
```bash
docker exec crm-postgres pg_isready -U crm_admin
# Expected: /var/run/postgresql:5432 - accepting connections
```

---

## STEP 02: Database Migration & Seed

```bash
# 1. Generate Prisma client
npx prisma generate

# 2. Create initial migration
npx prisma migrate dev --name init

# 3. Seed database
npx ts-node prisma/seed.ts
```

### ✅ Verification
```bash
npx prisma studio
# Opens browser at localhost:5555 — check tables exist
# Check: roles (7), users (4), permissions (100), lookup categories (7)
```

---

## STEP 03: Run Shared Domain Tests

These tests verify the foundation — Value Objects and Aggregate Root base classes.

```bash
# Run ONLY shared domain tests
npx jest src/shared --verbose
```

### ✅ Expected Output
```
 PASS  src/shared/domain/__tests__/email.vo.spec.ts (12 tests)
 PASS  src/shared/domain/__tests__/phone.vo.spec.ts (5 tests)
 PASS  src/shared/domain/__tests__/money.vo.spec.ts (12 tests)
 PASS  src/shared/domain/__tests__/aggregate-root.spec.ts (5 tests)

Test Suites: 4 passed, 4 total
Tests:       34 passed, 34 total
```

### If any test FAILS:
- Read the error message
- Fix the specific file
- Re-run: `npx jest src/shared --verbose`

---

## STEP 04: Run Auth Tests

```bash
npx jest src/core/auth --verbose
```

### ✅ Expected Output
```
 PASS  src/core/auth/__tests__/auth.service.spec.ts

  AuthService
    login()
      ✓ should return user and tokens on valid credentials
      ✓ should throw on wrong email
      ✓ should throw on wrong password
      ✓ should throw on inactive user
    register()
      ✓ should create user and return data
      ✓ should throw on duplicate email

Test Suites: 1 passed, 1 total
Tests:       6 passed, 6 total
```

---

## STEP 05: Start Server & Test Login

```bash
# Start development server
npm run start:dev
```

### ✅ Verification: Test Login API
Open a NEW terminal and run:

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@crm.com","password":"Admin@123"}'
```

### ✅ Expected Response
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { "id": "...", "email": "admin@crm.com", "role": "SUPER_ADMIN" },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

### Also verify Swagger:
Open browser → http://localhost:3000/docs

---

## STEP 06: Run Lead Domain Tests (CQRS + DDD)

This is the MOST IMPORTANT test — it verifies all business rules.

```bash
npx jest src/modules/leads --verbose
```

### ✅ Expected Output
```
 PASS  src/modules/leads/__tests__/unit/lead-status.vo.spec.ts

  LeadStatus Value Object
    fromString()
      ✓ should create from valid string
      ✓ should throw on invalid string
    canTransitionTo()
      ✓ NEW can go to VERIFIED
      ✓ NEW can go to LOST
      ✓ NEW cannot go to WON
      ✓ NEW cannot go to ALLOCATED
      ✓ VERIFIED can go to ALLOCATED
      ✓ QUOTATION_SENT can go to WON
      ✓ WON cannot go anywhere (terminal)
      ✓ LOST cannot go anywhere (terminal)
      ✓ ON_HOLD can go back to IN_PROGRESS
    validTransitions()
      ✓ should return all valid next statuses
      ✓ WON has no transitions
    isTerminal()
      ✓ WON is terminal
      ✓ LOST is terminal
      ✓ NEW is not terminal
      ✓ ALLOCATED is not terminal
    isActive() / equals()
      ✓ NEW is active
      ✓ WON is not active
      ✓ same status equals
      ✓ different status not equals

 PASS  src/modules/leads/__tests__/unit/lead.entity.spec.ts

  LeadEntity
    create()
      ✓ should create lead with NEW status
      ✓ should default priority to MEDIUM
      ✓ should emit LeadCreatedEvent
    allocate()
      ✓ should allocate from NEW status
      ✓ should allocate from VERIFIED status
      ✓ should throw when allocating from IN_PROGRESS
      ✓ should throw when allocating from WON
      ✓ should throw without userId
      ✓ should emit LeadAllocatedEvent
    changeStatus()
      ✓ should allow NEW -> VERIFIED
      ✓ should allow ALLOCATED -> IN_PROGRESS
      ✓ should reject NEW -> WON (invalid transition)
      ✓ should reject NEW -> ALLOCATED
      ✓ should reject transition from WON (terminal)
      ✓ should reject LOST without reason
      ✓ should accept LOST with reason
      ✓ should throw on invalid status string
      ✓ should emit LeadStatusChangedEvent
    updateDetails()
      ✓ should update priority
      ✓ should update expectedValue
      ✓ should throw on terminal status
    fromPersistence()
      ✓ should reconstitute without events

Test Suites: 2 passed, 2 total
Tests:       41 passed, 41 total
```

---

## STEP 07: Run ALL Tests Together

```bash
# Run all tests with coverage report
npx jest --coverage --verbose
```

### ✅ Expected Output
```
Test Suites: 7 passed, 7 total
Tests:       81 passed, 81 total

--------------------|---------|----------|---------|---------|
File                | % Stmts | % Branch | % Funcs | % Lines |
--------------------|---------|----------|---------|---------|
shared/domain/      |   100   |   100    |   100   |   100   |
core/auth/          |    95   |    90    |   100   |    95   |
modules/leads/      |   100   |   100    |   100   |   100   |
--------------------|---------|----------|---------|---------|
All files           |    98   |    96    |   100   |    98   |
--------------------|---------|----------|---------|---------|
```

Coverage must be ≥ 85% to pass. If it drops below, CI blocks merge.

---

## 📋 WHAT TO DO NEXT

After all 7 steps pass, you have a **verified foundation**. Now build modules one by one:

### Next Prompts to Use:

**PROMPT P03** — Generate a CQRS module. Example for Contacts:

```
Generate a complete CQRS + DDD module for CONTACTS.

Entity: ContactEntity (Aggregate Root)
Business Rules:
1. Contact starts as RAW type
2. validate() changes type to VALIDATED, requires validatedBy user
3. Validated contacts can have leads auto-created
4. Cannot validate an already validated contact
5. Email format validation (use Email value object)

Status Transitions:
- RAW -> VALIDATED (via validate() method)

Commands:
1. CreateContactCommand
2. ValidateContactCommand
3. UpdateContactCommand

Queries:
1. GetContactByIdQuery
2. GetContactsListQuery (paginated, filter by type, search)

Domain Events:
1. ContactCreatedEvent -> triggers nothing yet
2. ContactValidatedEvent -> triggers auto lead creation

Follow the exact same pattern as the Lead module.
Generate: domain/, application/, infrastructure/, presentation/, __tests__/
```

**PROMPT P05** — Generate more tests:

```
Generate additional unit tests for LeadEntity covering:
- All 10 status transitions exhaustively (10x10 = 100 combinations)
- Edge cases: null values, empty strings
- Domain event data verification
- Concurrent status changes
```

**PROMPT P08** — Generate security tests:

```
Generate security tests for the auth module:
- Auth bypass (no token, expired token, tampered token)
- SQL injection in search parameters
- Rate limiting on login endpoint
- Permission escalation (sales exec → admin routes)
- IDOR (accessing other user's resources)
```

---

## 📁 Complete File Map

```
crm-backend/
├── .env                              ← Environment config
├── .vscode/                          ← VS Code settings + debugger
├── docker-compose.yml                ← PostgreSQL + Redis
├── package.json                      ← Dependencies + scripts
├── tsconfig.json                     ← TypeScript config
├── prisma/
│   ├── schema.prisma                 ← 30+ tables, all enums
│   └── seed.ts                       ← 4 users, 7 roles, lookups
├── src/
│   ├── main.ts                       ← Bootstrap + Swagger
│   ├── app.module.ts                 ← Root module
│   ├── shared/
│   │   └── domain/
│   │       ├── base.entity.ts        ← BaseEntity abstract
│   │       ├── aggregate-root.ts     ← AggregateRoot + events
│   │       ├── domain-event.ts       ← DomainEvent base
│   │       ├── value-objects/
│   │       │   ├── email.vo.ts       ← Email validation
│   │       │   ├── phone.vo.ts       ← Phone validation
│   │       │   └── money.vo.ts       ← Money arithmetic
│   │       └── __tests__/            ← 34 tests ✓
│   ├── common/
│   │   ├── decorators/               ← @CurrentUser, @Roles, @Public
│   │   ├── guards/                   ← JwtAuthGuard, RolesGuard
│   │   ├── filters/                  ← AllExceptionsFilter
│   │   ├── dto/                      ← PaginationDto
│   │   └── utils/                    ← ApiResponse helper
│   ├── core/
│   │   ├── prisma/                   ← PrismaService (global)
│   │   └── auth/
│   │       ├── auth.service.ts       ← Login, register, JWT
│   │       ├── auth.controller.ts    ← 5 endpoints
│   │       ├── jwt.strategy.ts       ← Passport JWT
│   │       └── __tests__/            ← 6 tests ✓
│   └── modules/
│       └── leads/
│           ├── domain/
│           │   ├── entities/
│           │   │   └── lead.entity.ts        ← Aggregate root
│           │   ├── value-objects/
│           │   │   └── lead-status.vo.ts     ← Status transitions
│           │   ├── events/
│           │   │   ├── lead-created.event.ts
│           │   │   ├── lead-allocated.event.ts
│           │   │   └── lead-status-changed.event.ts
│           │   └── interfaces/
│           │       └── lead-repository.interface.ts
│           └── __tests__/
│               └── unit/
│                   ├── lead.entity.spec.ts       ← 19 tests ✓
│                   └── lead-status.vo.spec.ts    ← 22 tests ✓
└── test/
    └── jest-e2e.json
```

**Total: 81 tests across 7 test files**
