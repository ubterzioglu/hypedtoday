import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Dashboard from '@/pages/Dashboard';

const apiMocks = vi.hoisted(() => ({
    getDashboardData: vi.fn(),
    createTrackedPost: vi.fn(),
    updateTrackingStatus: vi.fn(),
    closeTrackedPost: vi.fn(),
}));

vi.mock('@/lib/api', () => ({
    api: apiMocks,
}));

vi.mock('@/lib/auth', () => ({
    useAuth: () => ({
        user: { id: 'user-1', email: 'user@test.com', role: 'user', displayName: 'Ada', avatarUrl: null },
        signOut: vi.fn(),
    }),
}));

vi.mock('@/components/Header', () => ({
    default: () => <header data-testid="header" />,
}));

vi.mock('@/components/Footer', () => ({
    default: () => <footer data-testid="footer" />,
}));

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

describe('Dashboard page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        apiMocks.getDashboardData.mockResolvedValue({
            summary: {
                open_posts: 1,
                my_pending_actions: 1,
                my_posts_liked: 2,
                approved_members: 18,
            },
            my_posts: [
                {
                    id: 'post-1',
                    owner_user_id: 'user-1',
                    linkedin_url: 'https://www.linkedin.com/posts/example',
                    published_at: '2026-04-27T10:00:00Z',
                    note: 'Launch post',
                    status: 'open',
                    created_at: '2026-04-27T10:00:00Z',
                    tracking: [
                        {
                            tracking_id: 'tracking-owner-1',
                            member_user_id: 'user-2',
                            member_name: 'Grace Hopper',
                            member_linkedin_url: 'https://www.linkedin.com/in/grace',
                            status: 'liked',
                            marked_at: '2026-04-27T10:15:00Z',
                            note: null,
                        },
                    ],
                    counts: {
                        pending: 0,
                        liked: 1,
                        not_yet: 0,
                        skipped: 0,
                    },
                },
            ],
            my_tasks: [
                {
                    tracking_id: 'tracking-1',
                    post_id: 'post-2',
                    status: 'pending',
                    marked_at: null,
                    note: null,
                    linkedin_url: 'https://www.linkedin.com/posts/other',
                    published_at: '2026-04-27T12:00:00Z',
                    post_note: 'Please support',
                    owner_user_id: 'user-2',
                    owner_name: 'Grace Hopper',
                    owner_linkedin_url: 'https://www.linkedin.com/in/grace',
                    created_at: '2026-04-27T12:00:00Z',
                },
            ],
        });
        apiMocks.updateTrackingStatus.mockResolvedValue({ tracking: {} });
        apiMocks.closeTrackedPost.mockResolvedValue({ post: { id: 'post-1' } });
        apiMocks.createTrackedPost.mockResolvedValue({ post: { id: 'post-3' } });
    });

    it('renders the dashboard sections from payload', async () => {
        render(<Dashboard />);

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument();
        });

        expect(screen.getByRole('heading', { name: 'Benim Postlarim' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Benden Beklenenler' })).toBeInTheDocument();
        expect(screen.getAllByText('Grace Hopper').length).toBeGreaterThan(0);
        expect(screen.getByText('Launch post')).toBeInTheDocument();
    });

    it('updates a task status when the user marks it as liked', async () => {
        render(<Dashboard />);

        await waitFor(() => {
            expect(screen.getAllByText('Grace Hopper').length).toBeGreaterThan(0);
        });

        await userEvent.click(screen.getByRole('button', { name: /begendim/i }));

        await waitFor(() => {
            expect(apiMocks.updateTrackingStatus).toHaveBeenCalledWith({
                tracking_id: 'tracking-1',
                status: 'liked',
            });
        });
    });
});
