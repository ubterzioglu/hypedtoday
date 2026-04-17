import { describe, expect, it } from 'vitest';

const ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://hyped.today',
    'https://www.hyped.today',
];

function corsHeaders(req: Request, extra?: Record<string, string>): Record<string, string> {
    const origin = req.headers.get('Origin') ?? '';
    const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : '';
    return {
        'Access-Control-Allow-Origin': allowed,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, accept, origin',
        'Access-Control-Max-Age': '86400',
        ...extra,
    };
}

function handleCors(req: Request): Response | null {
    if (req.method === 'OPTIONS') {
        const origin = req.headers.get('Origin') ?? '';
        if (!ALLOWED_ORIGINS.includes(origin)) {
            return new Response('Forbidden', { status: 403 });
        }
        return new Response(null, { status: 204, headers: corsHeaders(req) });
    }
    return null;
}

function originCheck(req: Request): boolean {
    const origin = req.headers.get('Origin');
    if (!origin) return true;
    return ALLOWED_ORIGINS.includes(origin);
}

describe('corsHeaders', () => {
    it('sets Access-Control-Allow-Origin for allowed origin', () => {
        const req = new Request('https://hyped.today/api/test', {
            headers: { Origin: 'https://hyped.today' },
        });
        const headers = corsHeaders(req);
        expect(headers['Access-Control-Allow-Origin']).toBe('https://hyped.today');
    });

    it('returns empty string for unknown origin', () => {
        const req = new Request('https://hyped.today/api/test', {
            headers: { Origin: 'https://evil.com' },
        });
        const headers = corsHeaders(req);
        expect(headers['Access-Control-Allow-Origin']).toBe('');
    });

    it('merges extra headers', () => {
        const req = new Request('https://hyped.today/api/test', {
            headers: { Origin: 'https://hyped.today' },
        });
        const headers = corsHeaders(req, { 'X-Custom': 'value' });
        expect(headers['X-Custom']).toBe('value');
    });
});

describe('handleCors', () => {
    it('returns 204 for OPTIONS with allowed origin', () => {
        const req = new Request('https://hyped.today/api/test', {
            method: 'OPTIONS',
            headers: { Origin: 'http://localhost:5173' },
        });
        const res = handleCors(req);
        expect(res).not.toBeNull();
        expect(res!.status).toBe(204);
        expect(res!.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:5173');
    });

    it('returns 403 for OPTIONS with unknown origin', () => {
        const req = new Request('https://hyped.today/api/test', {
            method: 'OPTIONS',
            headers: { Origin: 'https://evil.com' },
        });
        const res = handleCors(req);
        expect(res).not.toBeNull();
        expect(res!.status).toBe(403);
    });

    it('returns null for non-OPTIONS requests', () => {
        const req = new Request('https://hyped.today/api/test', {
            method: 'GET',
            headers: { Origin: 'https://hyped.today' },
        });
        expect(handleCors(req)).toBeNull();
    });
});

describe('originCheck', () => {
    it('returns true when no origin header', () => {
        const req = new Request('https://hyped.today/api/test');
        expect(originCheck(req)).toBe(true);
    });

    it('returns true for allowed origin', () => {
        const req = new Request('https://hyped.today/api/test', {
            headers: { Origin: 'https://hyped.today' },
        });
        expect(originCheck(req)).toBe(true);
    });

    it('returns false for unknown origin', () => {
        const req = new Request('https://hyped.today/api/test', {
            headers: { Origin: 'https://evil.com' },
        });
        expect(originCheck(req)).toBe(false);
    });
});
