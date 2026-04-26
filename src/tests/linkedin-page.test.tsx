import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { HTMLAttributes, ReactNode } from 'react';
import LinkedinPage from '@/pages/Linkedin';

const apiMocks = vi.hoisted(() => ({
    submitLinkedinProfile: vi.fn(),
}));

vi.mock('@/lib/api', () => ({
    api: {
        submitLinkedinProfile: apiMocks.submitLinkedinProfile,
    },
}));

vi.mock('@/components/Header', () => ({
    default: () => <header data-testid="header" />,
}));

vi.mock('@/components/Footer', () => ({
    default: () => <footer data-testid="footer" />,
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock('framer-motion', () => ({
    motion: {
        section: ({ children, ...props }: { children?: ReactNode } & HTMLAttributes<HTMLElement>) => (
            <section {...props}>{children}</section>
        ),
    },
}));

vi.mock('sonner', () => ({
    toast: {
        error: vi.fn(),
        success: vi.fn(),
    },
}));

async function unlockPage() {
    await userEvent.type(screen.getByLabelText('linkedin.passwordLabel'), 'spindora*2026');
    await userEvent.click(screen.getByRole('button', { name: 'linkedin.passwordSubmit' }));
}

describe('LinkedinPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubEnv('VITE_LINKEDIN_PAGE_PASSWORD', 'spindora*2026');
        window.localStorage.clear();
    });

    it('keeps the form hidden when the password is wrong', async () => {
        render(<LinkedinPage />);

        await userEvent.type(screen.getByLabelText('linkedin.passwordLabel'), 'wrong-password');
        await userEvent.click(screen.getByRole('button', { name: 'linkedin.passwordSubmit' }));

        expect(screen.getByText('linkedin.passwordError')).toBeInTheDocument();
        expect(screen.queryByText('linkedin.formTitle')).not.toBeInTheDocument();
    });

    it('shows the form when the password is correct', async () => {
        render(<LinkedinPage />);

        await unlockPage();

        expect(screen.getByText('linkedin.formTitle')).toBeInTheDocument();
        expect(screen.getByLabelText('linkedin.whatsappNumber')).toBeInTheDocument();
    });

    it('renders validation errors and does not submit an empty form', async () => {
        render(<LinkedinPage />);
        await unlockPage();

        await userEvent.click(screen.getByRole('button', { name: 'linkedin.submit' }));

        expect(await screen.findByText('linkedin.form.firstNameRequired')).toBeInTheDocument();
        expect(screen.getByText('linkedin.form.lastNameRequired')).toBeInTheDocument();
        expect(screen.getByText('linkedin.form.whatsappRequired')).toBeInTheDocument();
        expect(apiMocks.submitLinkedinProfile).not.toHaveBeenCalled();
    });

    it('rejects non-LinkedIn profile URLs', async () => {
        render(<LinkedinPage />);
        await unlockPage();

        await userEvent.type(screen.getByLabelText('linkedin.firstName'), 'Ada');
        await userEvent.type(screen.getByLabelText('linkedin.lastName'), 'Lovelace');
        await userEvent.type(screen.getByLabelText('linkedin.whatsappNumber'), '+905551112233');
        await userEvent.type(screen.getByLabelText('linkedin.profileUrl'), 'https://example.com/ada');
        await userEvent.click(screen.getByRole('button', { name: 'linkedin.submit' }));

        expect(await screen.findByText('linkedin.form.linkedinProfileUrl')).toBeInTheDocument();
        expect(apiMocks.submitLinkedinProfile).not.toHaveBeenCalled();
    });

    it('rejects invalid WhatsApp number formats', async () => {
        render(<LinkedinPage />);
        await unlockPage();

        await userEvent.type(screen.getByLabelText('linkedin.firstName'), 'Ada');
        await userEvent.type(screen.getByLabelText('linkedin.lastName'), 'Lovelace');
        await userEvent.type(screen.getByLabelText('linkedin.whatsappNumber'), '0555 111 22 33');
        await userEvent.type(screen.getByLabelText('linkedin.profileUrl'), 'https://www.linkedin.com/in/ada');
        await userEvent.click(screen.getByRole('button', { name: 'linkedin.submit' }));

        expect(await screen.findByText('linkedin.form.whatsappFormat')).toBeInTheDocument();
        expect(apiMocks.submitLinkedinProfile).not.toHaveBeenCalled();
    });

    it('submits the form with WhatsApp number and clears it', async () => {
        apiMocks.submitLinkedinProfile.mockResolvedValue({
            profile: {
                id: 'profile-1',
                first_name: 'Ada',
                last_name: 'Lovelace',
                whatsapp_number: '+905551112233',
                linkedin_url: 'https://www.linkedin.com/in/ada',
                created_at: '2026-04-26T10:00:00Z',
            },
        });
        render(<LinkedinPage />);
        await unlockPage();

        const firstName = screen.getByLabelText('linkedin.firstName') as HTMLInputElement;
        const lastName = screen.getByLabelText('linkedin.lastName') as HTMLInputElement;
        const whatsappNumber = screen.getByLabelText('linkedin.whatsappNumber') as HTMLInputElement;
        const profileUrl = screen.getByLabelText('linkedin.profileUrl') as HTMLInputElement;

        await userEvent.type(firstName, 'Ada');
        await userEvent.type(lastName, 'Lovelace');
        await userEvent.type(whatsappNumber, '+905551112233');
        await userEvent.type(profileUrl, 'https://www.linkedin.com/in/ada');
        await userEvent.click(screen.getByRole('button', { name: 'linkedin.submit' }));

        await waitFor(() => {
            expect(apiMocks.submitLinkedinProfile).toHaveBeenCalledWith({
                first_name: 'Ada',
                last_name: 'Lovelace',
                whatsapp_number: '+905551112233',
                linkedin_url: 'https://www.linkedin.com/in/ada',
            });
        });
        expect(firstName.value).toBe('');
        expect(lastName.value).toBe('');
        expect(whatsappNumber.value).toBe('');
        expect(profileUrl.value).toBe('');
    });

    it('does not render the profile list or support rules', async () => {
        render(<LinkedinPage />);
        await unlockPage();

        expect(screen.queryByText('Destek Kuralları')).not.toBeInTheDocument();
        expect(screen.queryByText('linkedin.listTitle')).not.toBeInTheDocument();
    });
});
