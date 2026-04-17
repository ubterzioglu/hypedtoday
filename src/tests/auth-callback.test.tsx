import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, waitFor, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { mockSupabase } from '@/test/setup';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('AuthCallback', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('calls exchangeCodeForSession', async () => {
        const { default: AuthCallback } = await import('@/pages/AuthCallback');
        await act(async () => {
            render(
                <MemoryRouter initialEntries={['/auth/callback']}>
                    <Routes>
                        <Route path="/auth/callback" element={<AuthCallback />} />
                    </Routes>
                </MemoryRouter>,
            );
        });
        expect(mockSupabase.auth.exchangeCodeForSession).toHaveBeenCalled();
    });

    it('navigates to / when next param is missing', async () => {
        const { default: AuthCallback } = await import('@/pages/AuthCallback');
        await act(async () => {
            render(
                <MemoryRouter initialEntries={['/auth/callback']}>
                    <Routes>
                        <Route path="/auth/callback" element={<AuthCallback />} />
                    </Routes>
                </MemoryRouter>,
            );
        });
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
        });
    });

    it('navigates to / when next is external URL (security)', async () => {
        const { default: AuthCallback } = await import('@/pages/AuthCallback');
        Object.defineProperty(window, 'location', {
            value: {
                href: 'https://hyped.today/auth/callback?next=https://evil.com',
                pathname: '/auth/callback',
                search: '?next=https://evil.com',
                origin: 'https://hyped.today',
            },
            writable: true,
            configurable: true,
        });
        await act(async () => {
            render(
                <MemoryRouter initialEntries={['/auth/callback']}>
                    <Routes>
                        <Route path="/auth/callback" element={<AuthCallback />} />
                    </Routes>
                </MemoryRouter>,
            );
        });
        await waitFor(() => {
            const call = mockNavigate.mock.calls[mockNavigate.mock.calls.length - 1];
            expect(call?.[0]).not.toBe('https://evil.com');
        });
    });
});
