import { describe, expect, it } from 'vitest';
import {
    validateUuid,
    validateRequired,
    validateMaxLength,
    validateMinLength,
    validateUrl,
    validateEnum,
    collectErrors,
} from '../validation.ts';

describe('validateRequired', () => {
    it('returns null for non-empty string', () => {
        expect(validateRequired('hello', 'field')).toBeNull();
    });

    it('returns error for undefined', () => {
        expect(validateRequired(undefined, 'field')).toBe('field is required');
    });

    it('returns error for null', () => {
        expect(validateRequired(null, 'field')).toBe('field is required');
    });

    it('returns error for empty string', () => {
        expect(validateRequired('', 'field')).toBe('field is required');
    });

    it('returns null for number 0', () => {
        expect(validateRequired(0, 'field')).toBeNull();
    });
});

describe('validateMaxLength', () => {
    it('returns null for short string', () => {
        expect(validateMaxLength('hi', 'field', 10)).toBeNull();
    });

    it('returns error for too long string', () => {
        expect(validateMaxLength('a'.repeat(11), 'field', 10)).toBe('field must be at most 10 characters');
    });

    it('returns null for undefined', () => {
        expect(validateMaxLength(undefined, 'field', 10)).toBeNull();
    });
});

describe('validateUrl', () => {
    it('returns null for valid https URL', () => {
        expect(validateUrl('https://example.com', 'field')).toBeNull();
    });

    it('returns null for valid http URL', () => {
        expect(validateUrl('http://example.com', 'field')).toBeNull();
    });

    it('returns null for undefined', () => {
        expect(validateUrl(undefined, 'field')).toBeNull();
    });

    it('returns error for invalid URL', () => {
        expect(validateUrl('not-a-url', 'field')).toBe('field must be a valid URL');
    });

    it('returns error for javascript: scheme', () => {
        expect(validateUrl('javascript:alert(1)', 'field')).toBe('field contains an unsafe URL scheme');
    });

    it('returns error for data: scheme', () => {
        expect(validateUrl('data:text/html,<h1>hi</h1>', 'field')).toBe('field contains an unsafe URL scheme');
    });
});

describe('validateEnum', () => {
    it('returns null for valid value', () => {
        expect(validateEnum('active', 'status', ['active', 'paused'])).toBeNull();
    });

    it('returns error for invalid value', () => {
        expect(validateEnum('unknown', 'status', ['active', 'paused'])).toBe('status must be one of: active, paused');
    });
});

describe('validateUuid', () => {
    it('returns null for valid UUID', () => {
        expect(validateUuid('550e8400-e29b-41d4-a716-446655440000', 'id')).toBeNull();
    });

    it('returns error for invalid UUID', () => {
        expect(validateUuid('not-a-uuid', 'id')).toBe('id must be a valid UUID');
    });
});

describe('validateMinLength', () => {
    it('returns null for long enough string', () => {
        expect(validateMinLength('hello', 'field', 3)).toBeNull();
    });

    it('returns error for too short string', () => {
        expect(validateMinLength('ab', 'field', 3)).toBe('field must be at least 3 characters');
    });

    it('returns null for undefined', () => {
        expect(validateMinLength(undefined, 'field', 3)).toBeNull();
    });
});

describe('collectErrors', () => {
    it('returns null when all errors are null', () => {
        expect(collectErrors(null, null, null)).toBeNull();
    });

    it('joins non-null errors', () => {
        expect(collectErrors(null, 'err1', null, 'err2')).toBe('err1; err2');
    });
});
