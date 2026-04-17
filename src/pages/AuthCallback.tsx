import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const url = new URL(window.location.href);
    const next = url.searchParams.get('next');
    const nextPath = next && next.startsWith('/') ? next : '/';

    supabase.auth.exchangeCodeForSession(window.location.href).finally(() => {
      window.history.replaceState({}, document.title, url.pathname + url.search);
      navigate(nextPath, { replace: true });
    });
  }, [navigate]);

  return null;
}
