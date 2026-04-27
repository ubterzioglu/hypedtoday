import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import AdminLinkedinProfiles from '@/pages/admin/AdminLinkedinProfiles';
import type { ReactNode } from 'react';

const selectMock = vi.fn();
const orderMock = vi.fn();
const eqQueryMock = vi.fn();
const rangeMock = vi.fn();
const updateMock = vi.fn();
const eqMock = vi.fn();

vi.mock('@/lib/auth', () => ({
    useAuth: () => ({
        user: { id: 'admin-1', email: 'admin@test.com', role: 'admin' },
    }),
}));

vi.mock('@/lib/supabase', () => ({
    supabase: {
        from: vi.fn(() => ({
            select: selectMock,
            update: updateMock,
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
        rangeMock.mockResolvedValue({
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
            ],
            error: null,
        });
        eqQueryMock.mockReturnValue({
            range: rangeMock,
        });
        selectMock.mockReturnValue({
            order: orderMock,
        });
        orderMock.mockReturnValue({
            eq: eqQueryMock,
            range: rangeMock,
        });
        updateMock.mockReturnValue({
            eq: eqMock,
        });
        eqMock.mockResolvedValue({ error: null });
    });

    it('renders raw phone numbers and creates whatsapp links for local TR and international numbers', async () => {
        render(<AdminLinkedinProfiles />);

        await waitFor(() => {
            expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
        });

        expect(eqQueryMock).toHaveBeenCalledWith('approval_status', 'pending');
        expect(screen.getByRole('link', { name: /05302404995/i })).toHaveAttribute(
            'href',
            expect.stringContaining('https://wa.me/905302404995?text='),
        );
    });

    it('optimistically updates approval_status on approve without refetching', async () => {
        render(<AdminLinkedinProfiles />);

        await waitFor(() => {
            expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
        });

        expect(screen.getByText('Onay bekliyor')).toBeInTheDocument();

        const approveButtons = screen.getAllByRole('button', { name: /onayla/i });
        fireEvent.click(approveButtons[0]);

        await waitFor(() => {
            expect(screen.queryByText('Onay bekliyor')).not.toBeInTheDocument();
        });

        expect(updateMock).toHaveBeenCalledWith(
            expect.objectContaining({ approval_status: 'approved' }),
        );
        expect(selectMock).toHaveBeenCalledTimes(1);
        expect(screen.queryByText('Ada Lovelace')).not.toBeInTheDocument();
    });

    it('rolls back optimistic update on error', async () => {
        eqMock.mockResolvedValue({ error: { message: 'RLS denied' } });

        render(<AdminLinkedinProfiles />);

        await waitFor(() => {
            expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
        });

        const approveButtons = screen.getAllByRole('button', { name: /onayla/i });
        fireEvent.click(approveButtons[0]);

        await waitFor(() => {
            expect(screen.getByText('Onay bekliyor')).toBeInTheDocument();
        });

        const { toast } = await import('sonner');
        expect(toast.error).toHaveBeenCalled();
        expect(selectMock).toHaveBeenCalledTimes(1);
    });

    it('loads approved profiles when the status filter changes', async () => {
        rangeMock
            .mockResolvedValueOnce({
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
                ],
                error: null,
            })
            .mockResolvedValueOnce({
                data: [
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

        render(<AdminLinkedinProfiles />);

        await waitFor(() => {
            expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
        });

        fireEvent.change(screen.getByLabelText('Durum'), { target: { value: 'approved' } });

        await waitFor(() => {
            expect(screen.getByText('Grace Hopper')).toBeInTheDocument();
        });

        expect(eqQueryMock).toHaveBeenLastCalledWith('approval_status', 'approved');
    });
});
