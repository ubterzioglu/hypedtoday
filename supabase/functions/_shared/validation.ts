const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const URL_PATTERN = /^https?:\/\/.+/i;
const UNSAFE_URL_SCHEMES = /^(javascript|data|vbscript):/i;

export function validateUuid(value: string, field: string): string | null {
    if (!UUID_PATTERN.test(value)) return `${field} must be a valid UUID`;
    return null;
}

export function validateRequired(value: unknown, field: string): string | null {
    if (value === undefined || value === null || value === '') return `${field} is required`;
    return null;
}

export function validateMaxLength(value: string | undefined, field: string, max: number): string | null {
    if (value && value.length > max) return `${field} must be at most ${max} characters`;
    return null;
}

export function validateMinLength(value: string | undefined, field: string, min: number): string | null {
    if (value && value.trim().length < min) return `${field} must be at least ${min} characters`;
    return null;
}

export function validateUrl(value: string | undefined, field: string): string | null {
    if (!value) return null;
    if (UNSAFE_URL_SCHEMES.test(value.trim())) return `${field} contains an unsafe URL scheme`;
    if (!URL_PATTERN.test(value.trim())) return `${field} must be a valid URL`;
    return null;
}

export function validateEnum(value: string, field: string, allowed: string[]): string | null {
    if (!allowed.includes(value)) return `${field} must be one of: ${allowed.join(', ')}`;
    return null;
}

export function collectErrors(...errors: (string | null)[]): string | null {
    const filtered = errors.filter((e): e is string => e !== null);
    return filtered.length > 0 ? filtered.join('; ') : null;
}
