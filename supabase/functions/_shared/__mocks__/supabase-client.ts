import { vi } from 'vitest';

function createChainBuilder() {
    const chain: Record<string, any> = {};
    chain.select = vi.fn(() => chain);
    chain.insert = vi.fn(() => chain);
    chain.update = vi.fn(() => chain);
    chain.delete = vi.fn(() => chain);
    chain.upsert = vi.fn(() => ({ error: null }));
    chain.eq = vi.fn(() => chain);
    chain.neq = vi.fn(() => chain);
    chain.in = vi.fn(() => chain);
    chain.not = vi.fn(() => chain);
    chain.gte = vi.fn(() => chain);
    chain.lte = vi.fn(() => chain);
    chain.limit = vi.fn(() => chain);
    chain.order = vi.fn(() => chain);
    chain.single = vi.fn(() => Promise.resolve({ data: null, error: null }));
    chain.maybeSingle = vi.fn(() => Promise.resolve({ data: null, error: null }));
    return chain;
}

function createMockClient() {
    return {
        auth: {
            getUser: vi.fn(() => Promise.resolve({ data: { user: { id: 'mock-user-id', email: 'test@test.com' } }, error: null })),
        },
        from: vi.fn(() => createChainBuilder()),
    };
}

const _mockClient = createMockClient();

export function createClient() {
    return _mockClient;
}

export { _mockClient as mockSupabaseClient };

export function __resetMock() {
    _mockClient.auth.getUser.mockResolvedValue({ data: { user: { id: 'mock-user-id', email: 'test@test.com' } }, error: null });
    _mockClient.from.mockReturnValue(createChainBuilder());
}
