'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const email = identifier.trim();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) setError('Identifier atau password tidak valid.');
    else router.push('/dashboard');
    setLoading(false);
  }

  return <main><h1>Masuk ke M-CORE</h1><form onSubmit={handleSubmit}>
    <label htmlFor="login-identifier">Email / ID / NIK</label>
    <input id="login-identifier" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required autoComplete="username" />
    <label htmlFor="login-password">Password</label>
    <input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
    {error && <p role="alert">{error}</p>}
    <button id="login-submit" type="submit" disabled={loading}>{loading ? 'Memproses…' : 'Masuk'}</button>
  </form></main>;
}
