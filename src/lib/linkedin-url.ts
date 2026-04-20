const LINKEDIN_POST_PATH_PREFIX = '/posts/';
const LINKEDIN_FEED_UPDATE_PREFIX = '/feed/update/urn:li:';
const LINKEDIN_FEED_UPDATE_TYPES = new Set(['activity', 'share']);

export function isLinkedInPostUrl(value: string): boolean {
    try {
        const url = new URL(value.trim());
        const hostname = url.hostname.toLowerCase();
        const pathname = url.pathname;

        if (url.protocol !== 'https:' && url.protocol !== 'http:') return false;
        if (hostname !== 'linkedin.com' && hostname !== 'www.linkedin.com') return false;

        if (pathname.startsWith(LINKEDIN_POST_PATH_PREFIX) && pathname.length > LINKEDIN_POST_PATH_PREFIX.length) {
            return true;
        }

        if (!pathname.startsWith(LINKEDIN_FEED_UPDATE_PREFIX)) {
            return false;
        }

        const urnParts = pathname.slice(LINKEDIN_FEED_UPDATE_PREFIX.length).split(':');
        return LINKEDIN_FEED_UPDATE_TYPES.has(urnParts[0]) && Boolean(urnParts[1]);
    } catch {
        return false;
    }
}
