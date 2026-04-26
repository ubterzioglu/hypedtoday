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

describe('LinkedinPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        apiMocks.getLinkedinProfiles.mockResolvedValue([]);
    });

    it('renders validation errors and does not submit an empty form', async () => {
        render(<LinkedinPage />);

        await userEvent.click(screen.getByRole('button', { name: 'linkedin.submit' }));

        expect(await screen.findByText('linkedin.form.firstNameRequired')).toBeInTheDocument();
        expect(screen.getByText('linkedin.form.lastNameRequired')).toBeInTheDocument();
        expect(apiMocks.submitLinkedinProfile).not.toHaveBeenCalled();
    });

    it('rejects non-LinkedIn profile URLs', async () => {
        render(<LinkedinPage />);

        await userEvent.type(screen.getByLabelText('linkedin.firstName'), 'Ada');
        await userEvent.type(screen.getByLabelText('linkedin.lastName'), 'Lovelace');
        await userEvent.type(screen.getByLabelText('linkedin.profileUrl'), 'https://example.com/ada');
        await userEvent.click(screen.getByRole('button', { name: 'linkedin.submit' }));

        expect(await screen.findByText('linkedin.form.linkedinProfileUrl')).toBeInTheDocument();
        expect(apiMocks.submitLinkedinProfile).not.toHaveBeenCalled();
    });

    it('submits, clears the form, and prepends the returned profile', async () => {
        apiMocks.submitLinkedinProfile.mockResolvedValue({
            profile: {
                id: 'profile-1',
                first_name: 'Ada',
                last_name: 'Lovelace',
                linkedin_url: 'https://www.linkedin.com/in/ada',
                created_at: '2026-04-26T10:00:00Z',
            },
        });
        render(<LinkedinPage />);

        const firstName = screen.getByLabelText('linkedin.firstName') as HTMLInputElement;
        const lastName = screen.getByLabelText('linkedin.lastName') as HTMLInputElement;
        const profileUrl = screen.getByLabelText('linkedin.profileUrl') as HTMLInputElement;

        await userEvent.type(firstName, 'Ada');
        await userEvent.type(lastName, 'Lovelace');
        await userEvent.type(profileUrl, 'https://www.linkedin.com/in/ada');
        await userEvent.click(screen.getByRole('button', { name: 'linkedin.submit' }));

        await waitFor(() => {
            expect(apiMocks.submitLinkedinProfile).toHaveBeenCalledWith({
                first_name: 'Ada',
                last_name: 'Lovelace',
                linkedin_url: 'https://www.linkedin.com/in/ada',
            });
        });
        expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument();
        expect(firstName.value).toBe('');
        expect(lastName.value).toBe('');
        expect(profileUrl.value).toBe('');
    });

    it('shows loaded profiles in the list', async () => {
        apiMocks.getLinkedinProfiles.mockResolvedValue([
            {
                id: 'profile-2',
                first_name: 'Grace',
                last_name: 'Hopper',
                linkedin_url: 'https://www.linkedin.com/in/grace',
                created_at: '2026-04-26T11:00:00Z',
            },
        ]);

        render(<LinkedinPage />);

        expect(await screen.findByText('Grace Hopper')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /linkedin.openProfile/ })).toHaveAttribute(
            'href',
            'https://www.linkedin.com/in/grace',
        );
    });
});
