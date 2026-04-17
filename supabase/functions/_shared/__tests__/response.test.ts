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

function successResponse(req: Request, data: unknown, status = 200, extraHeaders?: Record<string, string>): Response {
    return new Response(JSON.stringify({ data }), {
        status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders(req, extraHeaders) },
    });
}

function errorResponse(req: Request, message: string, status = 400, code?: string, extraHeaders?: Record<string, string>): Response {
    return new Response(JSON.stringify({ error: { message, code } }), {
        status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders(req, extraHeaders) },
    });
}

describe('successResponse', () => {
    const req = new Request('https://hyped.today/api/test', {
        headers: { Origin: 'https://hyped.today' },
    });

    it('returns correct status 200 by default', async () => {
        const res = successResponse(req, { id: '1' });
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body).toEqual({ data: { id: '1' } });
    });

    it('returns custom status when provided', () => {
        const res = successResponse(req, { created: true }, 201);
        expect(res.status).toBe(201);
    });

    it('sets Content-Type to application/json', () => {
        const res = successResponse(req, {});
        expect(res.headers.get('Content-Type')).toBe('application/json');
    });

    it('wraps data in { data } envelope', async () => {
        const res = successResponse(req, { items: [1, 2, 3] });
        const body = await res.json();
        expect(body).toEqual({ data: { items: [1, 2, 3] } });
    });
});

describe('errorResponse', () => {
    const req = new Request('https://hyped.today/api/test', {
        headers: { Origin: 'https://hyped.today' },
    });

    it('returns correct status 400 by default', () => {
        const res = errorResponse(req, 'Bad request');
        expect(res.status).toBe(400);
    });

    it('returns custom status', () => {
        const res = errorResponse(req, 'Unauthorized', 401);
        expect(res.status).toBe(401);
    });

    it('wraps message in error envelope', async () => {
        const res = errorResponse(req, 'Something went wrong', 500, 'INTERNAL_ERROR');
        const body = await res.json();
        expect(body).toEqual({ error: { message: 'Something went wrong', code: 'INTERNAL_ERROR' } });
    });

    it('omits code when not provided', async () => {
        const res = errorResponse(req, 'Error without code');
        const body = await res.json();
        expect(body.error.code).toBeUndefined();
        expect(body.error.message).toBe('Error without code');
    });

    it('sets Content-Type to application/json', () => {
        const res = errorResponse(req, 'err');
        expect(res.headers.get('Content-Type')).toBe('application/json');
    });
});
