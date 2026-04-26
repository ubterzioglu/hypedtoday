import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminAccessDenied from '@/pages/AdminAccessDenied';

const mockUseAuth = vi.fn();

vi.mock('@/lib/auth', () => ({
    useAuth: () => mockUseAuth(),
}));

const LoginPageProbe = () => {
    const location = useLocation();
    return <div data-testid="login-page">{location.search}</div>;
};

function renderWithRouter(ui: React.ReactElement, { route = '/protected' } = {}) {
    return render(
        <MemoryRouter initialEntries={[route]}>
            <Routes>
                <Route path="/protected" element={ui} />
                <Route path="/admin/login" element={<LoginPageProbe />} />
                <Route path="/admin/no-access" element={<AdminAccessDenied />} />
                <Route path="/" element={<div data-testid="home-page" />} />
            </Routes>
        </MemoryRouter>,
    );
}

describe('ProtectedRoute', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('shows spinner when loading with no session', () => {
        mockUseAuth.mockReturnValue({
            user: null,
            session: null,
            loading: true,
            profileResolved: false,
        });
        renderWithRouter(
            <ProtectedRoute>
                <div data-testid="child" />
            </ProtectedRoute>,
        );
        expect(screen.queryByTestId('child')).not.toBeInTheDocument();
        expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('redirects to /admin/login?next=... when user is null', () => {
        mockUseAuth.mockReturnValue({
            user: null,
            session: null,
            loading: false,
            profileResolved: true,
        });
        renderWithRouter(
            <ProtectedRoute>
                <div data-testid="child" />
            </ProtectedRoute>,
            { route: '/protected' },
        );
        expect(screen.getByTestId('login-page')).toHaveTextContent('?next=%2Fprotected');
    });

    it('renders children when user exists and requireAdmin is false', () => {
        mockUseAuth.mockReturnValue({
            user: { id: '1', email: 'test@test.com', role: 'user' },
            session: { user: { id: '1' } },
            loading: false,
            profileResolved: true,
        });
        renderWithRouter(
            <ProtectedRoute>
                <div data-testid="child" />
            </ProtectedRoute>,
        );
        expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('shows spinner when requireAdmin and profileResolved is false', () => {
        mockUseAuth.mockReturnValue({
            user: null,
            session: { user: { id: '1' } },
            loading: false,
            profileResolved: false,
        });
        renderWithRouter(
            <ProtectedRoute requireAdmin>
                <div data-testid="child" />
            </ProtectedRoute>,
        );
        expect(screen.queryByTestId('child')).not.toBeInTheDocument();
        expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('renders children when requireAdmin and user is admin', () => {
        mockUseAuth.mockReturnValue({
            user: { id: '1', email: 'admin@test.com', role: 'admin' },
            session: { user: { id: '1' } },
            loading: false,
            profileResolved: true,
        });
        renderWithRouter(
            <ProtectedRoute requireAdmin>
                <div data-testid="child" />
            </ProtectedRoute>,
        );
        expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('shows admin access denied page when requireAdmin and user is not admin', () => {
        mockUseAuth.mockReturnValue({
            user: { id: '1', email: 'user@test.com', role: 'user' },
            session: { user: { id: '1' } },
            loading: false,
            profileResolved: true,
        });
        renderWithRouter(
            <ProtectedRoute requireAdmin>
                <div data-testid="child" />
            </ProtectedRoute>,
        );
        expect(screen.getByRole('heading', { name: /admin yetkiniz yok/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /linkedin sayfasına git/i })).toHaveAttribute('href', '/linkedin');
    });
});
