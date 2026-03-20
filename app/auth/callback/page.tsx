'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCodeVerifier, clearCodeVerifier, setSession } from '@/lib/auth';

function AuthCallback() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('Completing sign-in…');

  useEffect(() => {
    const error       = searchParams.get('error');
    const code        = searchParams.get('code');
    const verifier    = getCodeVerifier();
    const redirectUri = `${window.location.origin}/auth/callback`;

    if (error) {
      setStatus(`Sign-in failed: ${searchParams.get('error_description') ?? error}`);
      setTimeout(() => router.replace('/'), 3000);
      return;
    }

    if (!code || !verifier) {
      setStatus('Sign-in failed. Missing code or verifier.');
      setTimeout(() => router.replace('/'), 2000);
      return;
    }

    clearCodeVerifier();

    void (async () => {
      try {
        const res  = await fetch('/api/auth/token', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ code, codeVerifier: verifier, redirectUri }),
        });
        const data = await res.json() as { accessToken?: string; email?: string; error?: unknown };

        if (!res.ok || !data.accessToken) {
          console.error('[auth/callback] token error', data.error);
          setStatus('Sign-in failed. Please try again.');
          setTimeout(() => router.replace('/'), 2000);
          return;
        }

        setSession(data.accessToken, data.email ?? 'User');
        setStatus('Signed in! Redirecting…');
        router.replace('/');
      } catch (err) {
        console.error('[auth/callback]', err);
        setStatus('Sign-in failed. Please try again.');
        setTimeout(() => router.replace('/'), 2000);
      }
    })();
  }, [router, searchParams]);

  return (
    <section className="mx-auto mt-16 max-w-xl rounded-2xl border border-border bg-bg-surface p-6 text-center text-text-secondary">
      {status}
    </section>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <section className="mx-auto mt-16 max-w-xl rounded-2xl border border-border bg-bg-surface p-6 text-center text-text-secondary">
        Completing sign-in…
      </section>
    }>
      <AuthCallback />
    </Suspense>
  );
}
