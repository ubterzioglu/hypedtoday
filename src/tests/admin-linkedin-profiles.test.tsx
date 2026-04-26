import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import AdminLinkedinProfiles from '@/pages/admin/AdminLinkedinProfiles';
import type { ReactNode } from 'react';

const selectMock = vi.fn();
const orderMock = vi.fn();

vi.mock('@/lib/auth', () => ({
    useAuth: () => ({
        user: { id: 'admin-1', email: 'admin@test.com', role: 'admin' },
    }),
}));

vi.mock('@/lib/supabase', () => ({
    supabase: {
        from: vi.fn(() => ({
            select: selectMock,
        })),
    },
}));

vi.mock('sonner', () => ({
    toast: {
        error: vi.fn(),
        success: vi.fn(),
    },
}));

vi.mock('@/components/ui/brutal-button', () => ({
    BrutalButton: ({ children, ...props }: { children?: ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) => (
        <button {...props}>{children}</button>
    ),
}));

describe('AdminLinkedinProfiles', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        orderMock.mockResolvedValue({
            data: [
                {
                    id: 'profile-1',
                    first_name: 'Ada',
                    last_name: 'Lovelace',
                    whatsapp_number: '05302404995',
                    linkedin_url: 'https://www.linkedin.com/in/ada',
                    approval_status: 'pending',
                    created_at: '2026-04-26T10:00:00Z',
                    reviewed_at: null,
                },
                {
                    id: 'profile-2',
                    first_name: 'Grace',
                    last_name: 'Hopper',
                    whatsapp_number: '+491234567890',
                    linkedin_url: 'https://www.linkedin.com/in/grace',
                    approval_status: 'approved',
                    created_at: '2026-04-26T11:00:00Z',
                    reviewed_at: null,
                },
            ],
            error: null,
        });
        selectMock.mockReturnValue({
            order: orderMock,
        });
    });

    it('renders raw phone numbers and creates whatsapp links for local TR and international numbers', async () => {
        render(<AdminLinkedinProfiles />);

        await waitFor(() => {
            expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
        });

        expect(screen.getByRole('link', { name: /05302404995/i })).toHaveAttribute(
            'href',
            expect.stringContaining('https://wa.me/905302404995?text='),
        );
        expect(screen.getByRole('link', { name: /\+491234567890/i })).toHaveAttribute(
            'href',
            expect.stringContaining('https://wa.me/491234567890?text='),
        );
    });
});
