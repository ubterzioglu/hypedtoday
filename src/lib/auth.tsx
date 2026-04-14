import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

export type UserRole = 'user' | 'admin';

export interface AuthUser {
    id: string;
    email: string | undefined;
    role: UserRole;
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

function mapUser(session: Session | null, profileRole?: UserRole | null): AuthUser | null {
    if (!session?.user) return null;
    return {
        id: session.user.id,
        email: session.user.email,
        role: profileRole ?? ((session.user.app_metadata?.role as UserRole) || 'user'),
    };
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const { data: { session: currentSession } } = await supabase.auth.getSession();
                setSession(currentSession);
                setUser(mapUser(currentSession));
            } catch {
                // Supabase not configured yet or session fetch failed
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
            setSession(newSession);
            setUser(mapUser(newSession));
        });

        return () => subscription.unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        await supabase.auth.signInWithOAuth({ provider: 'google' });
    };

    const signInWithGitHub = async () => {
        await supabase.auth.signInWithOAuth({ provider: 'github' });
    };

    const signInWithMagicLink = async (email: string) => {
        await supabase.auth.signInWithOtp({ email });
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
