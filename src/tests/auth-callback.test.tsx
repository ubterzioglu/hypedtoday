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
        window.history.replaceState({}, '', '/auth/callback?code=test-code&next=%2Fadd-project');
    });

    it('calls exchangeCodeForSession with the auth code', async () => {
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
        expect(mockSupabase.auth.exchangeCodeForSession).toHaveBeenCalledWith('test-code');
    });

    it('navigates to the sanitized next path', async () => {
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
            expect(mockNavigate).toHaveBeenCalledWith('/add-project', { replace: true });
        });
    });

    it('navigates to / when next is external URL (security)', async () => {
        const { default: AuthCallback } = await import('@/pages/AuthCallback');
        window.history.replaceState({}, '', '/auth/callback?next=https://evil.com');
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
