import { getSupabaseClient, getSupabaseServiceClient } from './supabase.ts';

export interface AuthResult {
    userId: string;
    email: string;
    role: 'user' | 'admin';
}

export async function requireAuth(req: Request): Promise<AuthResult> {
    const supabase = getSupabaseClient(req);
    const serviceSupabase = getSupabaseServiceClient();

    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
        throw new Error('Unauthorized');
    }

    const { data: profile } = await serviceSupabase
        .from('profiles')
        .select('role, email')
        .eq('id', user.id)
        .single();

    return {
        userId: user.id,
        email: profile?.email ?? user.email ?? '',
        role: profile?.role ?? 'user',
    };
}

export async function requireAdmin(req: Request): Promise<AuthResult> {
    const auth = await requireAuth(req);
    if (auth.role !== 'admin') {
        throw new Error('Admin access required');
    }
    return auth;
}
