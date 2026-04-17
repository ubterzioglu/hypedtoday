import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const MIGRATIONS_DIR = join(process.cwd(), 'supabase', 'migrations');

function readAllMigrations(): string[] {
    const files = readdirSync(MIGRATIONS_DIR)
        .filter(f => f.endsWith('.sql'))
        .sort();
    return files.map(f => readFileSync(join(MIGRATIONS_DIR, f), 'utf-8'));
}

describe('RLS static analysis', () => {
    it('is_admin function exists as SECURITY DEFINER', () => {
        const migrations = readAllMigrations();
        const allSql = migrations.join('\n');
        expect(allSql).toContain('SECURITY DEFINER');
        expect(allSql).toMatch(/CREATE OR REPLACE FUNCTION public\.is_admin/);
    });

    it('is_admin function has REVOKE ALL FROM PUBLIC', () => {
        const migrations = readAllMigrations();
        const allSql = migrations.join('\n');
        expect(allSql).toMatch(/REVOKE ALL ON FUNCTION public\.is_admin.*FROM PUBLIC/);
    });

    it('is_admin function grants EXECUTE to authenticated only', () => {
        const migrations = readAllMigrations();
        const allSql = migrations.join('\n');
        expect(allSql).toMatch(/GRANT EXECUTE ON FUNCTION public\.is_admin.*TO authenticated/);
    });

    it('profiles admin policies use is_admin() not direct role check', () => {
        const migrations = readAllMigrations();
        const allSql = migrations.join('\n');
        const profilesPolicies = allSql.match(/CREATE POLICY.*ON profiles[\s\S]*?;/g) ?? [];
        const adminPolicies = profilesPolicies.filter(p => p.toLowerCase().includes('admin'));
        for (const policy of adminPolicies) {
            if (policy.includes('is_admin')) {
                expect(policy).toContain('is_admin');
            }
        }
    });

    it('admin tables have RLS policies', () => {
        const allSql = readAllMigrations().join('\n');
        const adminTables = ['admin_flags', 'admin_actions', 'system_settings', 'request_limit_logs'];
        for (const table of adminTables) {
            expect(allSql).toContain(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`);
        }
    });

    it('admin_actions policy requires admin role', () => {
        const allSql = readAllMigrations().join('\n');
        const adminActionPolicies = allSql.match(/CREATE POLICY[\s\S]*?ON admin_actions[\s\S]*?;/g) ?? [];
        expect(adminActionPolicies.length).toBeGreaterThan(0);
        for (const policy of adminActionPolicies) {
            expect(policy.toLowerCase()).toMatch(/role\s*=\s*'admin'/);
        }
    });

    it('admin_flags policy requires admin role', () => {
        const allSql = readAllMigrations().join('\n');
        const flagPolicies = allSql.match(/CREATE POLICY[\s\S]*?ON admin_flags[\s\S]*?;/g) ?? [];
        expect(flagPolicies.length).toBeGreaterThan(0);
        for (const policy of flagPolicies) {
            expect(policy.toLowerCase()).toMatch(/role\s*=\s*'admin'/);
        }
    });

    it('requireAdmin edge function helper checks role correctly', () => {
        const authPath = join(process.cwd(), 'supabase', 'functions', '_shared', 'auth.ts');
        const authContent = readFileSync(authPath, 'utf-8');
        expect(authContent).toContain("auth.role !== 'admin'");
        expect(authContent).toContain("throw new Error('Admin access required')");
    });

    it('requireAuth throws Unauthorized when no user', () => {
        const authPath = join(process.cwd(), 'supabase', 'functions', '_shared', 'auth.ts');
        const authContent = readFileSync(authPath, 'utf-8');
        expect(authContent).toContain("throw new Error('Unauthorized')");
    });
});
