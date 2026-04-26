import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminLinkedinPage from '@/pages/AdminLinkedinPage';
import type { ReactNode } from 'react';

vi.mock('@/lib/auth', () => ({
    useAuth: () => ({
        user: { id: 'admin-1', email: 'admin@test.com', role: 'admin' },
        signOut: vi.fn(),
    }),
}));

vi.mock('@/pages/admin/AdminLinkedinProfiles', () => ({
    default: () => <div data-testid="linkedin-approval-module">LinkedIn approvals</div>,
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

describe('AdminLinkedinPage', () => {
    it('renders standalone linkedin approval page with back link to admin', () => {
        render(
            <MemoryRouter>
                <AdminLinkedinPage />
            </MemoryRouter>,
        );

        expect(screen.getByRole('heading', { name: /adminlink/i })).toBeInTheDocument();
        expect(screen.getByTestId('linkedin-approval-module')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /admin'e don/i })).toHaveAttribute('href', '/admin');
    });
});
