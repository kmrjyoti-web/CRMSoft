#!/usr/bin/env ts-node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const child_process_1 = require("child_process");
const ROOT = path.resolve(__dirname, '../..');
const SAVE = process.argv.includes('--save');
const BOUNDARIES = {
    vendor: {
        paths: [
            'src/modules/softwarevendor',
            'src/modules/plugins',
            'src/modules/marketplace',
            'src/modules/core/platform',
        ],
        importPatterns: [
            'softwarevendor',
            'plugins',
            'marketplace',
            'core/platform',
        ],
    },
    identity: {
        paths: [
            'src/core/auth',
            'src/core/permissions',
            'src/modules/core/identity',
        ],
        importPatterns: [
            'core/auth',
            'core/permissions',
            'core/identity',
        ],
    },
    work: {
        paths: [
            'src/modules/customer',
            'src/core/workflow',
            'src/modules/core/work',
        ],
        importPatterns: [
            'modules/customer',
            'core/workflow',
            'core/work',
        ],
    },
};
const INFRASTRUCTURE_PATTERNS = [
    'require-permissions.decorator',
    'jwt-auth.guard',
    'super-admin.guard',
    'super-admin-route.decorator',
    'roles.decorator',
    'current-user.decorator',
    'public.decorator',
    'vendor.guard',
    'ubac.engine',
    'audit-skip.decorator',
    'audit-log.decorator',
    '.module',
    'data-masking.interceptor',
];
function classifyImport(importedFrom, sourceFile) {
    if (sourceFile.endsWith('.module.ts')) {
        return 'infrastructure';
    }
    if (INFRASTRUCTURE_PATTERNS.some((p) => importedFrom.includes(p))) {
        return 'infrastructure';
    }
    if (importedFrom.includes('seed-data') || importedFrom.includes('seed_data')) {
        return 'seed-data';
    }
    return 'business-logic';
}
function grepImports(sourcePaths, targetPatterns) {
    const pattern = targetPatterns.map((p) => `from '.*${p}`).join('\\|');
    const pathStr = sourcePaths.filter((p) => fs.existsSync(path.join(ROOT, p))).join(' ');
    if (!pathStr)
        return '';
    try {
        return (0, child_process_1.execSync)(`grep -rn "${pattern}" ${pathStr} --include="*.ts" --exclude="*.spec.ts" 2>/dev/null || true`, { cwd: ROOT, encoding: 'utf-8' });
    }
    catch {
        return '';
    }
}
const fileCache = new Map();
function isAnnotated(file) {
    try {
        if (!fileCache.has(file)) {
            fileCache.set(file, fs.readFileSync(path.join(ROOT, file), 'utf-8'));
        }
        return fileCache.get(file).includes('@CrossService(');
    }
    catch {
        return false;
    }
}
function collectDeps() {
    const deps = [];
    const services = ['vendor', 'identity', 'work'];
    for (const source of services) {
        for (const target of services) {
            if (source === target)
                continue;
            const output = grepImports([...BOUNDARIES[source].paths], [...BOUNDARIES[target].importPatterns]);
            for (const line of output.split('\n').filter(Boolean)) {
                const match = line.match(/^(.+):(\d+):.+from '(.+)'/);
                if (!match)
                    continue;
                const [, rawFile, lineStr, importedFrom] = match;
                const sourceFile = rawFile.replace(/^\/.*?\/API\//, '');
                const lineNumber = parseInt(lineStr, 10);
                const category = classifyImport(importedFrom, sourceFile);
                deps.push({
                    sourceService: source,
                    targetService: target,
                    sourceFile,
                    importedFrom,
                    lineNumber,
                    isAnnotated: category === 'business-logic' ? isAnnotated(sourceFile) : true,
                    category,
                });
            }
        }
    }
    return deps;
}
function buildReport(deps) {
    const summary = {};
    for (const d of deps) {
        const key = `${d.sourceService} → ${d.targetService}`;
        if (!summary[key])
            summary[key] = { total: 0, infrastructure: 0, businessLogic: 0, annotated: 0 };
        summary[key].total++;
        if (d.category === 'infrastructure')
            summary[key].infrastructure++;
        else
            summary[key].businessLogic++;
        if (d.isAnnotated)
            summary[key].annotated++;
    }
    const businessLogicDeps = deps.filter((d) => d.category !== 'infrastructure');
    const annotationCoverage = businessLogicDeps.length > 0
        ? Math.round((businessLogicDeps.filter((d) => d.isAnnotated).length / businessLogicDeps.length) * 100)
        : 100;
    return {
        generatedAt: new Date().toISOString(),
        annotationCoverage: `${annotationCoverage}%`,
        total: deps.length,
        totalBusinessLogic: businessLogicDeps.length,
        totalAnnotated: businessLogicDeps.filter((d) => d.isAnnotated).length,
        summary,
        legend: {
            infrastructure: 'Shared decorator/guard — will live in shared-lib, not an API call',
            'business-logic': 'Substantive service dependency — must become API call or event when extracted',
            'seed-data': 'Static constant import — will become shared-lib or configuration',
        },
        deps,
    };
}
function main() {
    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║   CROSS-SERVICE DEPENDENCY REPORT — CRM-SOFT API         ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');
    const deps = collectDeps();
    const report = buildReport(deps);
    console.log('DIRECTION SUMMARY');
    console.log('─'.repeat(70));
    for (const [direction, counts] of Object.entries(report.summary).sort((a, b) => b[1].total - a[1].total)) {
        const { total, infrastructure, businessLogic, annotated } = counts;
        const unannotated = businessLogic - annotated;
        console.log(`  ${direction.padEnd(25)} total: ${String(total).padStart(3)}  ` +
            `infra: ${String(infrastructure).padStart(2)}  ` +
            `biz: ${String(businessLogic).padStart(2)}  ` +
            `annotated: ${String(annotated).padStart(2)}` +
            (unannotated > 0 ? `  ⚠ unannotated: ${unannotated}` : '  ✓'));
    }
    console.log('\n' + '─'.repeat(70));
    console.log(`  Total cross-boundary imports:     ${report.total}`);
    console.log(`  Business-logic dependencies:      ${report.totalBusinessLogic}`);
    console.log(`  @CrossService annotation coverage: ${report.annotationCoverage}`);
    const unannotated = deps.filter((d) => d.category === 'business-logic' && !d.isAnnotated);
    if (unannotated.length > 0) {
        console.log(`\n⚠  UNANNOTATED BUSINESS-LOGIC DEPS (${unannotated.length}):`);
        for (const d of unannotated) {
            console.log(`  [${d.sourceService}→${d.targetService}] ${d.sourceFile}:${d.lineNumber} ← ${d.importedFrom}`);
        }
    }
    const annotatedBiz = deps.filter((d) => d.category === 'business-logic' && d.isAnnotated);
    if (annotatedBiz.length > 0) {
        console.log(`\n✅ ANNOTATED BUSINESS-LOGIC DEPS (${annotatedBiz.length}):`);
        for (const d of annotatedBiz) {
            console.log(`  [${d.sourceService}→${d.targetService}] ${d.sourceFile}:${d.lineNumber}`);
        }
    }
    if (SAVE) {
        const outPath = path.join(ROOT, 'docs/microservice/cross-service-deps.json');
        fs.mkdirSync(path.dirname(outPath), { recursive: true });
        fs.writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf-8');
        console.log(`\nSaved: docs/microservice/cross-service-deps.json`);
    }
    console.log('');
}
main();
//# sourceMappingURL=cross-service-report.js.map