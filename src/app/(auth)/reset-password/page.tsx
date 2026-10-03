'use client';

import { FormEvent, Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setReady(Boolean(token));
    if (!token) setError('Link reset password tidak valid atau sudah kedaluwarsa.');
  }, [token]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setMessage('');
    if (password.length < 8) return setError('Password minimal 8 karakter.');
    if (password !== confirmation) return setError('Konfirmasi password tidak sama.');
    setLoading(true);
    const response = await fetch('/api/v1/auth/reset-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password }) });
    if (!response.ok) setError('Link reset password tidak valid atau sudah kedaluwarsa.');
    else { setMessage('Password berhasil diperbarui.'); setTimeout(() => router.replace('/login'), 1200); }
    setLoading(false);
  }

  return <main className="login-page"><section className="login-shell"><div className="login-brand-panel"><div className="login-brand-content"><span className="login-badge">M-CORE · MUMTAZA CORE</span><h1>Atur Password Baru</h1><p>Gunakan password baru untuk mengamankan akses ke portal M-CORE.</p></div></div><div className="login-form-panel"><div className="login-heading"><span className="login-kicker">ACCOUNT RECOVERY</span><h2>Reset Password</h2><p>{ready ? 'Masukkan password baru Anda.' : 'Memeriksa link reset password…'}</p></div><form onSubmit={handleSubmit} className="login-form"><label htmlFor="new-password">Password baru<input id="new-password" type="password" value={password} onChange={event => setPassword(event.target.value)} required autoComplete="new-password" /></label><label htmlFor="confirm-password">Konfirmasi password<input id="confirm-password" type="password" value={confirmation} onChange={event => setConfirmation(event.target.value)} required autoComplete="new-password" /></label>{error && <p className="login-error" role="alert">{error}</p>}{message && <p role="status">{message}</p>}<button id="reset-password-submit" type="submit" disabled={!ready || loading}>{loading ? 'Menyimpan…' : 'Simpan Password'}</button></form></div></section></main>;
}

export default function ResetPasswordPage() {
  return <Suspense fallback={<main className="login-page" aria-busy="true" /> }><ResetPasswordForm /></Suspense>;
}

