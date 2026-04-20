import { vi } from 'vitest';

const _capturedHandlers: Map<string, (req: Request) => Promise<Response>> = new Map();
let _nextFnName = '';

(globalThis as any).Deno = {
    serve: (handlerOrOpts: any, maybeHandler?: any) => {
        const fn = typeof handlerOrOpts === 'function' ? handlerOrOpts : maybeHandler;
        if (fn && _nextFnName) {
            _capturedHandlers.set(_nextFnName, fn);
        }
    },
    env: {
        get: (key: string) => {
            const env: Record<string, string> = {
                SUPABASE_URL: 'http://localhost:54321',
                SUPABASE_ANON_KEY: 'test-anon-key',
                SUPABASE_SERVICE_ROLE_KEY: 'test-service-key',
            };
            return env[key];
        },
    },
};

export function setNextFnName(name: string) {
    _nextFnName = name;
}

export function getHandler(name: string) {
    return _capturedHandlers.get(name);
}

export function resetHandlers() {
    _capturedHandlers.clear();
}
