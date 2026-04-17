/**
 * Track 18 Step 222: Regression test ensuring no hardcoded admin password remains.
 * Also covers Step 190: Verify client bundle contains no privileged logic.
 */
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const SRC_DIR = join(process.cwd(), 'src');

function getAllTsFiles(dir: string): string[] {
    const results: string[] = [];
    for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) {
            // skip test directories to avoid self-matching
            if (entry === '__tests__' || entry === 'tests' || entry === 'test') continue;
            results.push(...getAllTsFiles(full));
        } else if (/\.(ts|tsx)$/.test(entry) && !entry.includes('.test.') && !entry.includes('.spec.')) {
            results.push(full);
        }
    }
    return results;
}

const FORBIDDEN_PATTERNS = [
    { pattern: /admin123|password123|hardcoded.*password|admin.*pass/i, label: 'hardcoded admin password' },
    { pattern: /localStorage.*admin|adminToken.*=.*["'][^"']+["']/i, label: 'localStorage admin gate' },
    { pattern: /service_role.*key.*=.*eyJ/i, label: 'hardcoded service_role key' },
];

describe('Security regression', () => {
    const files = getAllTsFiles(SRC_DIR);

    it('has TypeScript source files to check', () => {
        expect(files.length).toBeGreaterThan(0);
    });

    for (const { pattern, label } of FORBIDDEN_PATTERNS) {
        it(`contains no ${label} in src/`, () => {
            const violations: string[] = [];
            for (const file of files) {
                const content = readFileSync(file, 'utf-8');
                if (pattern.test(content)) {
                    violations.push(file.replace(SRC_DIR, '').replace(/\\/g, '/'));
                }
            }
            expect(violations).toEqual([]);
        });
    }

    it('has no direct service_role usage in client code', () => {
        const violations: string[] = [];
        for (const file of files) {
            if (file.includes('__tests__') || file.includes('tests')) continue;
            const content = readFileSync(file, 'utf-8');
            if (/createClient.*service_role|supabaseAdmin.*key/.test(content)) {
                violations.push(file.replace(SRC_DIR, '').replace(/\\/g, '/'));
            }
        }
        expect(violations).toEqual([]);
    });
});
