import { describe, expect, it } from 'vitest';
import { isLinkedInPostUrl } from '@/lib/linkedin-url';

describe('isLinkedInPostUrl', () => {
    it('accepts LinkedIn posts URLs', () => {
        expect(isLinkedInPostUrl('https://www.linkedin.com/posts/example_activity-123')).toBe(true);
        expect(isLinkedInPostUrl('https://linkedin.com/posts/example_activity-123?utm_source=share')).toBe(true);
    });

    it('accepts LinkedIn feed update activity URLs', () => {
        expect(isLinkedInPostUrl('https://www.linkedin.com/feed/update/urn:li:activity:1234567890/')).toBe(true);
        expect(isLinkedInPostUrl('https://www.linkedin.com/feed/update/urn:li:share:1234567890')).toBe(true);
    });

    it('rejects profile and non-LinkedIn URLs', () => {
        expect(isLinkedInPostUrl('https://www.linkedin.com/in/ubterzioglu/')).toBe(false);
        expect(isLinkedInPostUrl('https://linkedin.com/company/example')).toBe(false);
        expect(isLinkedInPostUrl('https://linkedin.com.evil.test/posts/example')).toBe(false);
    });
});
