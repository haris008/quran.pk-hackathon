'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCodeVerifier, clearCodeVerifier, setSession } from '@/lib/auth';

function AuthCallback() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('Completing sign-in…');
  const hasRun = useRef(false);

  useEffect(() => {
    // StrictMode runs effects twice — only handle the callback once
    if (hasRun.current) return;

    const error    = searchParams.get('error');
    const code     = searchParams.get('code');
    const verifier = getCodeVerifier();

    // Params not yet available — wait for next render
    if (!error && !code) return;

    hasRun.current = true;

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
    const redirectUri = `${window.location.origin}/auth/callback`;

    void (async () => {
      try {
        const res  = await fetch('/api/auth/token', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ code, codeVerifier: verifier, redirectUri }),
        });
        const data = await res.json() as { accessToken?: string; email?: string; error?: unknown };

        if (!res.ok || !data.accessToken) {
          const errMsg = typeof data.error === 'object' && data.error !== null
            ? JSON.stringify(data.error)
            : String(data.error ?? 'unknown');
          console.error('[auth/callback] token error', errMsg);
          setStatus(`Sign-in failed: ${errMsg}`);
          setTimeout(() => router.replace('/'), 4000);
          return;
        }

        setSession(data.accessToken, data.email ?? 'User');
        const returnUrl = sessionStorage.getItem('qf_return_url') ?? '/';
        sessionStorage.removeItem('qf_return_url');
        setStatus('Signed in! Redirecting…');
        router.replace(returnUrl);
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
