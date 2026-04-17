import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, waitFor, screen, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/lib/auth';
import { mockSupabase } from '@/test/setup';
import ProtectedRoute from '@/components/ProtectedRoute';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: { language: 'en', changeLanguage: vi.fn() },
    }),
}));

function renderWithAuth(ui: React.ReactElement, { route = '/protected' } = {}) {
    return render(
        <MemoryRouter initialEntries={[route]}>
            <AuthProvider>
                <Routes>
                    <Route path="/protected" element={ui} />
                    <Route path="/admin" element={
                        <ProtectedRoute requireAdmin>
                            <div data-testid="admin-content">Admin Panel</div>
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/login" element={<div data-testid="login-page">Login</div>} />
                    <Route path="/" element={<div data-testid="home-page">Home</div>} />
                </Routes>
            </AuthProvider>
        </MemoryRouter>
    );
}

describe('AuthProvider + ProtectedRoute integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('redirects to login when no session', async () => {
        mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null } });
        mockSupabase.auth.onAuthStateChange.mockReturnValue({
            data: { subscription: { unsubscribe: vi.fn() } },
        });
        mockSupabase.from.mockReturnValue({
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        });

        renderWithAuth(
            <ProtectedRoute>
                <div data-testid="child">Protected</div>
            </ProtectedRoute>
        );

        await waitFor(() => {
            expect(screen.getByTestId('login-page')).toBeTruthy();
        });
    });

    it('renders admin route for admin user', async () => {
        const userId = 'admin-user-id';
        mockSupabase.auth.getSession.mockResolvedValue({
            data: { session: { user: { id: userId }, access_token: 'admin-tok' } },
        });
        mockSupabase.auth.onAuthStateChange.mockReturnValue({
            data: { subscription: { unsubscribe: vi.fn() } },
        });
        mockSupabase.from.mockReturnValue({
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({
                data: { role: 'admin', display_name: 'Admin', avatar_url: null },
                error: null,
            }),
        });

        renderWithAuth(
            <ProtectedRoute requireAdmin>
                <div data-testid="admin-child">Admin</div>
            </ProtectedRoute>,
            { route: '/protected' }
        );

        await waitFor(() => {
            expect(screen.getByTestId('admin-child')).toBeTruthy();
        });
    });

    it('redirects non-admin away from admin route', async () => {
        const userId = 'normal-user-id';
        mockSupabase.auth.getSession.mockResolvedValue({
            data: { session: { user: { id: userId }, access_token: 'user-tok' } },
        });
        mockSupabase.auth.onAuthStateChange.mockReturnValue({
            data: { subscription: { unsubscribe: vi.fn() } },
        });
        mockSupabase.from.mockReturnValue({
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({
                data: { role: 'user', display_name: 'User', avatar_url: null },
                error: null,
            }),
        });

        renderWithAuth(
            <ProtectedRoute requireAdmin>
                <div data-testid="admin-child">Admin</div>
            </ProtectedRoute>,
            { route: '/admin' }
        );

        await waitFor(() => {
            expect(screen.getByTestId('home-page')).toBeTruthy();
        });
    });

    it('handles onAuthStateChange callback', async () => {
        let stateCallback: ((event: string, session: any) => Promise<void>) | null = null;
        mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null } });
        mockSupabase.auth.onAuthStateChange.mockImplementation((cb: any) => {
            stateCallback = cb;
            return { data: { subscription: { unsubscribe: vi.fn() } } };
        });
        mockSupabase.from.mockReturnValue({
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({
                data: { role: 'user', display_name: 'User', avatar_url: null },
                error: null,
            }),
        });

        renderWithAuth(
            <ProtectedRoute>
                <div data-testid="child">Protected</div>
            </ProtectedRoute>
        );

        await waitFor(() => {
            expect(mockSupabase.auth.onAuthStateChange).toHaveBeenCalled();
        });

        if (stateCallback) {
            await act(async () => {
                await stateCallback!('SIGNED_IN', {
                    user: { id: 'new-user' },
                    access_token: 'new-tok',
                });
            });
        }

        expect(mockSupabase.from).toHaveBeenCalled();
    });
});
