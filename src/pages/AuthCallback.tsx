import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    const completeAuth = async () => {
      const url = new URL(window.location.href);
      const next = url.searchParams.get('next');
      const nextPath = next && next.startsWith('/') ? next : '/dashboard';
      let redirectPath = nextPath;
      const code = url.searchParams.get('code');

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session && code) {
          await supabase.auth.exchangeCodeForSession(code);
        }

        const { data: { session: resolvedSession } } = await supabase.auth.getSession();
        if (resolvedSession?.user?.id && nextPath === '/dashboard') {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', resolvedSession.user.id)
            .maybeSingle();

          if (profile?.role === 'admin') {
            redirectPath = '/admin';
          }
        }
      } finally {
        url.searchParams.delete('code');
        url.searchParams.delete('error');
        url.searchParams.delete('error_code');
        url.searchParams.delete('error_description');
        window.history.replaceState({}, document.title, `${url.pathname}${url.search}`);

        if (active) {
          navigate(redirectPath, { replace: true });
        }
      }
    };

    void completeAuth();

    return () => {
      active = false;
    };
  }, [navigate]);

  return null;
}
