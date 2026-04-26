import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AdminLogin from '@/pages/AdminLogin';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

const mockSignInWithGoogle = vi.fn();
const mockSignInWithGitHub = vi.fn();
const mockSignInWithMagicLink = vi.fn();

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => vi.fn(),
    };
});

vi.mock('@/lib/auth', () => ({
    useAuth: () => ({
        signInWithGoogle: mockSignInWithGoogle,
        signInWithGitHub: mockSignInWithGitHub,
        signInWithMagicLink: mockSignInWithMagicLink,
        user: null,
        session: null,
        profileResolved: true,
    }),
}));

vi.mock('@/components/Header', () => ({
    default: () => <header data-testid="site-header" />,
}));

vi.mock('@/components/Footer', () => ({
    default: () => <footer data-testid="site-footer" />,
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: { language: 'en', changeLanguage: vi.fn() },
    }),
}));

vi.mock('framer-motion', () => ({
    AnimatePresence: ({ children }: { children: ReactNode }) => <>{children}</>,
    motion: {
        div: ({
            children,
            initial,
            animate,
            exit,
            transition,
            ...props
        }: ComponentPropsWithoutRef<'div'> & {
            initial?: unknown;
            animate?: unknown;
            exit?: unknown;
            transition?: unknown;
        }) => <div {...props}>{children}</div>,
    },
}));

vi.mock('sonner', () => ({
    toast: {
        error: vi.fn(),
        success: vi.fn(),
    },
}));

function renderLogin(route = '/admin/login') {
    return render(
        <MemoryRouter initialEntries={[route]}>
            <Routes>
                <Route path="/admin/login" element={<AdminLogin />} />
            </Routes>
        </MemoryRouter>,
    );
}

describe('AdminLogin', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders Google, GitHub and magic link form', () => {
        renderLogin();
        expect(screen.getByText('auth.google')).toBeInTheDocument();
        expect(screen.getByText('auth.github')).toBeInTheDocument();
        expect(screen.getByText('auth.sendMagicLink')).toBeInTheDocument();
    });

    it('renders a bare auth page for the LinkedIn gate', () => {
        renderLogin('/admin/login?next=/linkedin');
        expect(screen.getByText('auth.google')).toBeInTheDocument();
        expect(screen.getByText('auth.github')).toBeInTheDocument();
        expect(screen.queryByTestId('site-header')).not.toBeInTheDocument();
        expect(screen.queryByTestId('site-footer')).not.toBeInTheDocument();
        expect(screen.queryByText('auth.title')).not.toBeInTheDocument();
    });

    it('resolves nextPath from URL params', async () => {
        renderLogin('/admin/login?next=/admin');
        const googleBtn = screen.getByText('auth.google');
        await userEvent.click(googleBtn);
        expect(mockSignInWithGoogle).toHaveBeenCalledWith('/admin');
    });

    it('calls signInWithMagicLink on valid email submit', async () => {
        renderLogin();
        const input = screen.getByPlaceholderText('you@example.com');
        await userEvent.type(input, 'test@example.com');
        const submitBtn = screen.getByText('auth.sendMagicLink');
        await userEvent.click(submitBtn);
        expect(mockSignInWithMagicLink).toHaveBeenCalledWith('test@example.com', '/');
    });

    it('does not call signInWithMagicLink on empty email submit', async () => {
        const { toast } = await import('sonner');
        renderLogin();
        const submitBtn = screen.getByText('auth.sendMagicLink');
        await userEvent.click(submitBtn);
        expect(mockSignInWithMagicLink).not.toHaveBeenCalled();
        expect(toast.error).toHaveBeenCalled();
    });
});
