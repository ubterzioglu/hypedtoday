import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import LinkStatusPage from '@/pages/LinkStatus';

const apiMocks = vi.hoisted(() => ({
    getLinkedinProfiles: vi.fn(),
}));

vi.mock('@/lib/api', () => ({
    api: {
        getLinkedinProfiles: apiMocks.getLinkedinProfiles,
    },
}));

const stableT = (key: string) => key;

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: stableT,
    }),
}));

vi.mock('sonner', () => ({
    toast: {
        error: vi.fn(),
    },
}));

describe('LinkStatusPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        apiMocks.getLinkedinProfiles.mockResolvedValue([]);
    });

    it('shows only the user status list without the Linkedin submit form', async () => {
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

        render(<LinkStatusPage />);

        expect(screen.getByRole('heading', { name: 'linkStatus.title' })).toBeInTheDocument();
        expect(screen.queryByLabelText('linkedin.firstName')).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'linkedin.submit' })).not.toBeInTheDocument();
        expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument();
        expect(screen.getByText('+905****2233')).toBeInTheDocument();
        expect(screen.getByText('linkedin.com/in/ada')).toBeInTheDocument();
        expect(screen.getByText('linkStatus.status.approved')).toBeInTheDocument();
        expect(screen.getByText('Bilgi')).toBeInTheDocument();
        expect(screen.getByText('Kurallar')).toBeInTheDocument();
        expect(screen.getByText('Yeni kanalımızı devreye aldık.')).toBeInTheDocument();
        expect(screen.getByText('🔹 Herkes LinkedIn profil linkini paylaşır')).toBeInTheDocument();
    });

    it('renders an empty state when there are no users', async () => {
        render(<LinkStatusPage />);

        expect(await screen.findByText('linkStatus.emptyTitle')).toBeInTheDocument();
        expect(screen.getByText('linkStatus.emptyDesc')).toBeInTheDocument();
    });
});
