import '@testing-library/jest-dom';
import { vi } from 'vitest';

const mockSupabase = {
    auth: {
        getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
        refreshSession: vi.fn().mockResolvedValue({ data: { session: null } }),
        onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
        signInWithOAuth: vi.fn(),
        signInWithOtp: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
        exchangeCodeForSession: vi.fn().mockResolvedValue({ data: { session: null } }),
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    },
    from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        neq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        not: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
    }),
    functions: {
        invoke: vi.fn().mockResolvedValue({ data: null, error: null }),
    },
};

vi.mock('@/lib/supabase', () => ({
    supabase: mockSupabase,
    isSupabaseConfigured: true,
}));

export { mockSupabase };
