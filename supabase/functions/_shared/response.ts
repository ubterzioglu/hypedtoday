import { corsHeaders } from './cors.ts';

export function successResponse(req: Request, data: unknown, status = 200, extraHeaders?: Record<string, string>): Response {
    return new Response(JSON.stringify({ data }), {
        status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders(req, extraHeaders) },
    });
}

export function errorResponse(req: Request, message: string, status = 400, code?: string, extraHeaders?: Record<string, string>): Response {
    return new Response(JSON.stringify({ error: { message, code } }), {
        status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders(req, extraHeaders) },
    });
}
