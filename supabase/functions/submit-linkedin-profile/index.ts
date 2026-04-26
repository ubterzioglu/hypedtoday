import { handleCors, originCheck } from '../_shared/cors.ts';
import { successResponse, errorResponse } from '../_shared/response.ts';
import { getSupabaseServiceClient } from '../_shared/supabase.ts';
import { checkRateLimit, getRateLimitIdentifier, rateLimitHeaders } from '../_shared/rate-limit.ts';
import { validateRequired, validateMaxLength, validateUrl, collectErrors } from '../_shared/validation.ts';

const LINKEDIN_PROFILE_PATTERN = /^https?:\/\/([a-z]{2,3}\.)?(www\.)?linkedin\.com\/in\/[^/?#]+\/?/i;

function cleanText(value: unknown): string {
    return typeof value === 'string' ? value.trim() : '';
}

Deno.serve(async (req) => {
    const cors = handleCors(req);
    if (cors) return cors;

    try {
        if (!originCheck(req)) return errorResponse(req, 'Forbidden', 403);

        if (req.method !== 'POST') {
            return errorResponse(req, 'Method not allowed', 405);
        }

        const identifier = await getRateLimitIdentifier(req);
        const rl = await checkRateLimit(identifier, 'submit_linkedin_profile');
        if (!rl.allowed) {
            return errorResponse(req, 'Rate limit exceeded', 429, 'RATE_LIMITED', rateLimitHeaders(rl));
        }

        const body = await req.json();
        const firstName = cleanText(body.first_name);
        const lastName = cleanText(body.last_name);
        const linkedinUrl = cleanText(body.linkedin_url);

        const validationError = collectErrors(
            validateRequired(firstName, 'first_name'),
            validateRequired(lastName, 'last_name'),
            validateRequired(linkedinUrl, 'linkedin_url'),
            validateMaxLength(firstName, 'first_name', 80),
            validateMaxLength(lastName, 'last_name', 80),
            validateMaxLength(linkedinUrl, 'linkedin_url', 300),
            validateUrl(linkedinUrl, 'linkedin_url'),
        );
        if (validationError) {
            return errorResponse(req, validationError, 400, 'VALIDATION_ERROR');
        }

        if (!LINKEDIN_PROFILE_PATTERN.test(linkedinUrl)) {
            return errorResponse(req, 'LinkedIn profile URL must be a linkedin.com/in/... URL.', 400, 'INVALID_LINKEDIN_PROFILE_URL');
        }

        const supabase = getSupabaseServiceClient();
        const { data: profile, error: insertError } = await supabase
            .from('linkedin_profiles')
            .insert({
                first_name: firstName,
                last_name: lastName,
                linkedin_url: linkedinUrl,
            })
            .select()
            .single();

        if (insertError) {
            return errorResponse(req, 'Failed to submit LinkedIn profile: ' + insertError.message, 500);
        }

        return successResponse(req, { profile }, 201, rateLimitHeaders(rl));
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return errorResponse(req, message, 500);
    }
});
