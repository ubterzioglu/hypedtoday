import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AdminLogin from '@/pages/AdminLogin';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

const mockSignInWithGoogle = vi.fn();
const mockSignInWithGitHub = vi.fn();
const mockSignInWithMagicLink = vi.fn();
const mockSignUpWithLinkedinProfile = vi.fn();

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
        signUpWithLinkedinProfile: mockSignUpWithLinkedinProfile,
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
        expect(screen.getByText('auth.createAccount')).toBeInTheDocument();
        expect(screen.getByLabelText('auth.firstName')).toBeInTheDocument();
        expect(screen.getByLabelText('auth.linkedinUrl')).toBeInTheDocument();
        expect(screen.queryByTestId('site-header')).not.toBeInTheDocument();
        expect(screen.queryByTestId('site-footer')).not.toBeInTheDocument();
        expect(screen.queryByText('auth.title')).not.toBeInTheDocument();
    });

    it('creates a Supabase membership with LinkedIn profile fields on the bare gate', async () => {
        renderLogin('/admin/login?next=/linkedin');

        await userEvent.type(screen.getByLabelText('auth.firstName'), 'Ada');
        await userEvent.type(screen.getByLabelText('auth.lastName'), 'Lovelace');
        await userEvent.type(screen.getByLabelText('auth.signupEmailLabel'), 'ada@example.com');
        await userEvent.type(screen.getByLabelText('auth.passwordLabel'), 'secret123');
        await userEvent.type(screen.getByLabelText('auth.whatsappNumber'), '05302404995');
        await userEvent.type(screen.getByLabelText('auth.linkedinUrl'), 'https://www.linkedin.com/in/ada');
        await userEvent.click(screen.getByText('auth.createAccount'));

        expect(mockSignUpWithLinkedinProfile).toHaveBeenCalledWith({
            email: 'ada@example.com',
            password: 'secret123',
            first_name: 'Ada',
            last_name: 'Lovelace',
            whatsapp_number: '05302404995',
            linkedin_url: 'https://www.linkedin.com/in/ada',
        }, '/linkedin');
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
