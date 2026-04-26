import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminDashboard from '@/pages/AdminDashboard';
import type { ReactNode } from 'react';

vi.mock('@/lib/auth', () => ({
    useAuth: () => ({
        user: { id: 'admin-1', email: 'admin@test.com', role: 'admin' },
        signOut: vi.fn(),
    }),
}));

vi.mock('@/lib/api', () => ({
    api: {
        getAdminDashboard: vi.fn().mockResolvedValue({
            total_users: 10,
            total_posts: 5,
            total_claims: 7,
            pending_approvals: 2,
            approved_claims: 4,
            rejected_claims: 1,
            approval_rate: 80,
            rejection_rate: 20,
            total_points_distributed: 100,
            open_flags: 0,
            limit_rejections_today: 0,
        }),
    },
}));

vi.mock('@/components/ui/brutal-button', async () => {
    const actual = await vi.importActual<typeof import('@/components/ui/brutal-button')>('@/components/ui/brutal-button');
    return {
        ...actual,
        BrutalButton: ({ children, ...props }: { children?: ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) => (
            <button {...props}>{children}</button>
        ),
    };
});

vi.mock('@/pages/admin/AdminUsers', () => ({ default: () => <div /> }));
vi.mock('@/pages/admin/AdminPosts', () => ({ default: () => <div /> }));
vi.mock('@/pages/admin/AdminClaims', () => ({ default: () => <div /> }));
vi.mock('@/pages/admin/AdminSettings', () => ({ default: () => <div /> }));
vi.mock('@/pages/admin/AdminScores', () => ({ default: () => <div /> }));
vi.mock('@/pages/admin/AdminFlags', () => ({ default: () => <div /> }));
vi.mock('@/pages/admin/AdminAudit', () => ({ default: () => <div /> }));

describe('AdminDashboard', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('shows a dedicated link to the standalone linkedin approval page', async () => {
        render(
            <MemoryRouter>
                <AdminDashboard />
            </MemoryRouter>,
        );

        await waitFor(() => {
            expect(screen.getByText('Total Users')).toBeInTheDocument();
        });

        expect(screen.getByRole('link', { name: /linkedin onay/i })).toHaveAttribute('href', '/adminlink');
        expect(screen.queryByRole('button', { name: /^linkedin$/i })).not.toBeInTheDocument();
    });
});
