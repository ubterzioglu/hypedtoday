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

interface AuthContextValue {
    user: AuthUser | null;
    session: Session | null;
    loading: boolean;
    signInWithGoogle: (nextPath?: string) => Promise<void>;
    signInWithGitHub: (nextPath?: string) => Promise<void>;
    signInWithMagicLink: (email: string, nextPath?: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T | null> {
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

    const loadProfile = useCallback(async (currentSession: Session | null) => {
        setSession(currentSession);
        if (!currentSession?.user) {
            setUser(null);
            return;
        }
        const profileData = await fetchProfileRole(currentSession.user.id);
        setUser(buildAuthUser(currentSession, profileData));
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

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ user, session, loading, signInWithGoogle, signInWithGitHub, signInWithMagicLink, signOut }}>
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
