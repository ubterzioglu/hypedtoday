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
    signInWithGoogle: () => Promise<void>;
    signInWithGitHub: () => Promise<void>;
    signInWithMagicLink: (email: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function fetchProfileRole(userId: string): Promise<{ role: UserRole; display_name: string | null; avatar_url: string | null } | null> {
    const { data } = await supabase
        .from('profiles')
        .select('role, display_name, avatar_url')
        .eq('id', userId)
        .single();
    return data;
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

    const signInWithGoogle = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: getAuthRedirectUrl(),
            },
        });
    };

    const signInWithGitHub = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'github',
            options: {
                redirectTo: getAuthRedirectUrl(),
            },
        });
    };

    const signInWithMagicLink = async (email: string) => {
        await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: getAuthRedirectUrl(),
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
