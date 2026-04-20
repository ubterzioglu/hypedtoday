import { describe, expect, it } from 'vitest';
import { corsHeaders, handleCors, originCheck } from '../cors.ts';

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

    it('allows http://localhost:8080 origin (Vite dev server)', () => {
        const req = new Request('https://hyped.today/api/test', {
            headers: { Origin: 'http://localhost:8080' },
        });
        const headers = corsHeaders(req);
        expect(headers['Access-Control-Allow-Origin']).toBe('http://localhost:8080');
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

    it('returns 204 for OPTIONS from http://localhost:8080', () => {
        const req = new Request('https://hyped.today/api/test', {
            method: 'OPTIONS',
            headers: { Origin: 'http://localhost:8080' },
        });
        const res = handleCors(req);
        expect(res).not.toBeNull();
        expect(res!.status).toBe(204);
        expect(res!.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:8080');
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

    it('returns true for http://localhost:8080', () => {
        const req = new Request('https://hyped.today/api/test', {
            headers: { Origin: 'http://localhost:8080' },
        });
        expect(originCheck(req)).toBe(true);
    });
});
