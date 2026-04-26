import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { HTMLAttributes, ReactNode } from 'react';
import LinkedinPage from '@/pages/Linkedin';

const apiMocks = vi.hoisted(() => ({
    getLinkedinProfiles: vi.fn(),
    submitLinkedinProfile: vi.fn(),
}));

vi.mock('@/lib/api', () => ({
    api: {
        getLinkedinProfiles: apiMocks.getLinkedinProfiles,
        submitLinkedinProfile: apiMocks.submitLinkedinProfile,
    },
}));

const stableT = (key: string) => key;

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: stableT,
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

describe('LinkedinPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        apiMocks.getLinkedinProfiles.mockResolvedValue([]);
        window.localStorage.clear();
    });

    it('shows the profile form when the route is rendered', async () => {
        render(<LinkedinPage />);

        expect(screen.getByText('linkedin.formTitle')).toBeInTheDocument();
        expect(screen.getByLabelText('linkedin.whatsappNumber')).toBeInTheDocument();
        expect(await screen.findByText('linkedin.emptyTitle')).toBeInTheDocument();
    });

    it('renders validation errors and does not submit an empty form', async () => {
        render(<LinkedinPage />);

        await userEvent.click(screen.getByRole('button', { name: 'linkedin.submit' }));

        expect(await screen.findByText('linkedin.form.firstNameRequired')).toBeInTheDocument();
        expect(screen.getByText('linkedin.form.lastNameRequired')).toBeInTheDocument();
        expect(screen.getByText('linkedin.form.whatsappRequired')).toBeInTheDocument();
        expect(apiMocks.submitLinkedinProfile).not.toHaveBeenCalled();
    });

    it('rejects non-LinkedIn profile URLs', async () => {
        render(<LinkedinPage />);

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

        await userEvent.type(screen.getByLabelText('linkedin.firstName'), 'Ada');
        await userEvent.type(screen.getByLabelText('linkedin.lastName'), 'Lovelace');
        await userEvent.type(screen.getByLabelText('linkedin.whatsappNumber'), '0555 111 22 33');
        await userEvent.type(screen.getByLabelText('linkedin.profileUrl'), 'https://www.linkedin.com/in/ada');
        await userEvent.click(screen.getByRole('button', { name: 'linkedin.submit' }));

        expect(await screen.findByText('linkedin.form.whatsappFormat')).toBeInTheDocument();
        expect(apiMocks.submitLinkedinProfile).not.toHaveBeenCalled();
    });

    it('accepts Turkish mobile numbers starting with 05', async () => {
        apiMocks.submitLinkedinProfile.mockResolvedValue({
            profile: {
                id: 'profile-1',
                first_name: 'Ada',
                last_name: 'Lovelace',
                whatsapp_number: '05302404995',
                linkedin_url: 'https://www.linkedin.com/in/ada',
                approval_status: 'pending',
                created_at: '2026-04-26T10:00:00Z',
            },
        });

        render(<LinkedinPage />);

        await userEvent.type(screen.getByLabelText('linkedin.firstName'), 'Ada');
        await userEvent.type(screen.getByLabelText('linkedin.lastName'), 'Lovelace');
        await userEvent.type(screen.getByLabelText('linkedin.whatsappNumber'), '05302404995');
        await userEvent.type(screen.getByLabelText('linkedin.profileUrl'), 'https://www.linkedin.com/in/ada');
        await userEvent.click(screen.getByRole('button', { name: 'linkedin.submit' }));

        await waitFor(() => {
            expect(apiMocks.submitLinkedinProfile).toHaveBeenCalledWith({
                first_name: 'Ada',
                last_name: 'Lovelace',
                whatsapp_number: '05302404995',
                linkedin_url: 'https://www.linkedin.com/in/ada',
            });
        });
    });

    it('loads saved profiles', async () => {
        apiMocks.getLinkedinProfiles.mockResolvedValue([
            {
                id: 'profile-1',
                first_name: 'Ada',
                last_name: 'Lovelace',
                whatsapp_number: '+905551112233',
                linkedin_url: 'https://www.linkedin.com/in/ada',
                approval_status: 'approved',
                created_at: '2026-04-26T10:00:00Z',
            },
        ]);

        render(<LinkedinPage />);

        expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument();
        expect(screen.getByText('+905****2233')).toBeInTheDocument();
        expect(screen.getByText('linkedin.com/in/ada')).toBeInTheDocument();
        expect(screen.getByText('Onaylı kullanıcı')).toBeInTheDocument();
    });

    it('submits the form with WhatsApp number, adds it to the list, and clears it', async () => {
        apiMocks.submitLinkedinProfile.mockResolvedValue({
            profile: {
                id: 'profile-1',
                first_name: 'Ada',
                last_name: 'Lovelace',
                whatsapp_number: '+905551112233',
                linkedin_url: 'https://www.linkedin.com/in/ada',
                approval_status: 'pending',
                created_at: '2026-04-26T10:00:00Z',
            },
        });
        render(<LinkedinPage />);

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
        expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument();
        expect(screen.getByText('+905****2233')).toBeInTheDocument();
        expect(screen.getByText('linkedin.com/in/ada')).toBeInTheDocument();
        expect(screen.getByText('Onay bekleniyor')).toBeInTheDocument();
        expect(firstName.value).toBe('');
        expect(lastName.value).toBe('');
        expect(whatsappNumber.value).toBe('');
        expect(profileUrl.value).toBe('');
    });

    it('renders the empty profile list', async () => {
        render(<LinkedinPage />);

        expect(screen.queryByText('Destek Kuralları')).not.toBeInTheDocument();
        expect(screen.getByText('linkedin.listTitle')).toBeInTheDocument();
        expect(await screen.findByText('linkedin.emptyTitle')).toBeInTheDocument();
    });
});
