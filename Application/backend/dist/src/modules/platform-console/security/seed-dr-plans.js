"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDRPlans = seedDRPlans;
const DR_PLANS = [
    {
        service: 'API',
        rto: 15,
        rpo: 5,
        runbook: '1. Check PM2 status\n2. Restart: pm2 restart api\n3. If DB issue: check pg_isready\n4. Failover: switch to read replica',
    },
    {
        service: 'POSTGRES',
        rto: 30,
        rpo: 60,
        runbook: '1. Check: pg_isready -h localhost\n2. Check logs: tail /var/log/postgresql/\n3. Restart: systemctl restart postgresql\n4. Restore: pg_restore from latest R2 backup',
    },
    {
        service: 'REDIS',
        rto: 5,
        rpo: 0,
        runbook: '1. Check: redis-cli ping\n2. Restart: systemctl restart redis\n3. Clear: redis-cli FLUSHDB (if corrupt)\n4. Sessions regenerate automatically',
    },
    {
        service: 'R2_STORAGE',
        rto: 60,
        rpo: 0,
        runbook: '1. Check Cloudflare status page\n2. Test: wrangler r2 object list\n3. Failover: switch to local /tmp storage\n4. Sync back when R2 recovers',
    },
    {
        service: 'BULLMQ',
        rto: 10,
        rpo: 5,
        runbook: '1. Check Redis (BullMQ depends on it)\n2. Restart workers: pm2 restart workers\n3. Check queue: bull-board dashboard\n4. Retry failed jobs',
    },
    {
        service: 'CRM_PORTAL',
        rto: 10,
        rpo: 0,
        runbook: '1. Check: curl http://localhost:3005\n2. Rebuild: cd Customer/frontend && npm run build\n3. Restart: pm2 restart crm-portal\n4. Check .next/ cache',
    },
    {
        service: 'MARKETHUB',
        rto: 10,
        rpo: 0,
        runbook: '1. Check: curl http://localhost:3007\n2. Rebuild: cd Application/frontend && npm run build\n3. Restart: pm2 restart markethub',
    },
];
async function seedDRPlans(db) {
    for (const plan of DR_PLANS) {
        await db.dRPlan.upsert({
            where: { service: plan.service },
            update: {
                rto: plan.rto,
                rpo: plan.rpo,
                runbook: plan.runbook,
            },
            create: {
                service: plan.service,
                rto: plan.rto,
                rpo: plan.rpo,
                runbook: plan.runbook,
            },
        });
    }
}
//# sourceMappingURL=seed-dr-plans.js.map