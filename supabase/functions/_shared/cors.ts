const ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://hyped.today',
    'https://www.hyped.today',
];

export function corsHeaders(req: Request, extra?: Record<string, string>): Record<string, string> {
    const origin = req.headers.get('Origin') ?? '';
    const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : '';

    return {
        'Access-Control-Allow-Origin': allowed,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type, X-Client-Info',
        'Access-Control-Max-Age': '86400',
        ...extra,
    };
}

export function handleCors(req: Request): Response | null {
    if (req.method === 'OPTIONS') {
        const origin = req.headers.get('Origin') ?? '';
        if (!ALLOWED_ORIGINS.includes(origin)) {
            return new Response('Forbidden', { status: 403 });
        }
        return new Response(null, { status: 204, headers: corsHeaders(req) });
    }
    return null;
}

export function originCheck(req: Request): boolean {
    const origin = req.headers.get('Origin');
    if (!origin) return true;
    return ALLOWED_ORIGINS.includes(origin);
}
