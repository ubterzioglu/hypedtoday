import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { getAuthRedirectUrl } from '@/lib/auth-redirect';
import type { User, Session } from '@supabase/supabase-js';

export type UserRole = 'user' | 'admin';

export interface AuthUser {
    id: string;
    email: string | undefined;
    role: UserRole;
    displayName: string | null;
    avatarUrl: string | null;
}

export interface LinkedinSignupData {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    whatsapp_number: string;
    linkedin_url: string;
}

interface AuthContextValue {
    user: AuthUser | null;
    session: Session | null;
    loading: boolean;
    profileResolved: boolean;
    signInWithGoogle: (nextPath?: string) => Promise<void>;
    signInWithGitHub: (nextPath?: string) => Promise<void>;
    signInWithMagicLink: (email: string, nextPath?: string) => Promise<void>;
    signUpWithLinkedinProfile: (data: LinkedinSignupData, nextPath?: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const PROFILE_CACHE_TTL_MS = 5 * 60 * 1000;

interface CachedProfileRole {
    userId: string;
    role: UserRole;
    display_name: string | null;
    avatar_url: string | null;
    cached_at: number;
}

function readCachedProfileRole(userId: string): CachedProfileRole | null {
    if (typeof window === 'undefined') return null;

    try {
        const raw = window.sessionStorage.getItem('auth-profile-role-cache');
        if (!raw) return null;

        const parsed = JSON.parse(raw) as CachedProfileRole;
        const isExpired = Date.now() - parsed.cached_at > PROFILE_CACHE_TTL_MS;
        if (parsed.userId !== userId || isExpired) {
            window.sessionStorage.removeItem('auth-profile-role-cache');
            return null;
        }

        return parsed;
    } catch {
        return null;
    }
}

function writeCachedProfileRole(userId: string, profileData: { role: UserRole; display_name: string | null; avatar_url: string | null } | null): void {
    if (typeof window === 'undefined') return;

    try {
        if (!profileData) {
            window.sessionStorage.removeItem('auth-profile-role-cache');
            return;
        }

        const payload: CachedProfileRole = {
            userId,
            role: profileData.role,
            display_name: profileData.display_name,
            avatar_url: profileData.avatar_url,
            cached_at: Date.now(),
        };

        window.sessionStorage.setItem('auth-profile-role-cache', JSON.stringify(payload));
    } catch {
        // Ignore storage failures and fall back to live fetches.
    }
}

function clearCachedProfileRole(): void {
    if (typeof window === 'undefined') return;

    try {
        window.sessionStorage.removeItem('auth-profile-role-cache');
    } catch {
        // Ignore storage failures.
    }
}

async function withTimeout<T>(promise: PromiseLike<T>, timeoutMs: number): Promise<T | null> {
    return await Promise.race([
        promise,
        new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs)),
    ]);
}

async function fetchProfileRole(userId: string): Promise<{ role: UserRole; display_name: string | null; avatar_url: string | null } | null> {
    try {
        const result = await withTimeout(
            supabase
                .from('profiles')
                .select('role, display_name, avatar_url')
                .eq('id', userId)
                .maybeSingle(),
            5000,
        );

        return result?.data ?? null;
    } catch {
        return null;
    }
}

function buildAuthUser(session: Session | null, profileData: { role: UserRole; display_name: string | null; avatar_url: string | null } | null): AuthUser | null {
    if (!session?.user) return null;
    return {
        id: session.user.id,
        email: session.user.email,
        role: profileData?.role ?? 'user',
        displayName: profileData?.display_name ?? null,
        avatarUrl: profileData?.avatar_url ?? null,
    };
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [profileResolved, setProfileResolved] = useState(false);

    const loadProfile = useCallback(async (currentSession: Session | null) => {
        setSession(currentSession);
        if (!currentSession?.user) {
            setUser(null);
            setProfileResolved(true);
            clearCachedProfileRole();
            return;
        }

        const cachedProfile = readCachedProfileRole(currentSession.user.id);
        if (cachedProfile) {
            setUser(buildAuthUser(currentSession, cachedProfile));
            setProfileResolved(true);
        } else {
            setProfileResolved(false);
        }

        const profileData = await fetchProfileRole(currentSession.user.id);
        if (profileData) {
            writeCachedProfileRole(currentSession.user.id, profileData);
            setUser(buildAuthUser(currentSession, profileData));
            setProfileResolved(true);
            return;
        }

        if (!cachedProfile) {
            setUser(buildAuthUser(currentSession, null));
            setProfileResolved(false);
        }
    }, []);

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const { data: { session: currentSession } } = await supabase.auth.getSession();
                await loadProfile(currentSession);
            } catch {
                // Supabase not configured yet or session fetch failed
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
            await loadProfile(newSession);
        });

        return () => subscription.unsubscribe();
    }, [loadProfile]);

    const signInWithGoogle = async (nextPath = '/') => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: getAuthRedirectUrl(nextPath),
            },
        });
    };

    const signInWithGitHub = async (nextPath = '/') => {
        await supabase.auth.signInWithOAuth({
            provider: 'github',
            options: {
                redirectTo: getAuthRedirectUrl(nextPath),
            },
        });
    };

    const signInWithMagicLink = async (email: string, nextPath = '/') => {
        await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: getAuthRedirectUrl(nextPath),
            },
        });
    };

    const signUpWithLinkedinProfile = async (data: LinkedinSignupData, nextPath = '/') => {
        const fullName = `${data.first_name} ${data.last_name}`.trim();
        const { error } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
                emailRedirectTo: getAuthRedirectUrl(nextPath),
                data: {
                    first_name: data.first_name,
                    last_name: data.last_name,
                    full_name: fullName,
                    display_name: fullName,
                    whatsapp_number: data.whatsapp_number,
                    linkedin_url: data.linkedin_url,
                },
            },
        });

        if (error) {
            throw error;
        }
    };

    const signOut = async () => {
        clearCachedProfileRole();
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ user, session, loading, profileResolved, signInWithGoogle, signInWithGitHub, signInWithMagicLink, signUpWithLinkedinProfile, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextValue => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
