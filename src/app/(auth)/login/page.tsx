'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (authError) {
        setError('Email atau password tidak valid.');
        return;
      }
      router.replace('/dashboard');
      router.refresh();
    } catch {
      setError('Login tidak dapat diproses. Periksa konfigurasi Supabase.');
    } finally {
      setLoading(false);
    }
  }

  return <main><h1>Masuk ke M-CORE</h1><form onSubmit={handleSubmit}>
    <label htmlFor="login-email">Email</label>
    <input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="username" />
    <label htmlFor="login-password">Password</label>
    <input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
    {error && <p role="alert">{error}</p>}
    <button id="login-submit" type="submit" disabled={loading}>{loading ? 'Memproses…' : 'Masuk'}</button>
  </form></main>;
}

