'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setLoading(true);
    try {
      const response = await fetch('/api/v1/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ identifier, password }) });
      if (!response.ok) throw new Error('INVALID_CREDENTIALS');
      if (remember) localStorage.setItem('m-core-remember-login', 'true'); else localStorage.removeItem('m-core-remember-login');
      router.replace('/dashboard'); router.refresh();
    } catch { setError('Kredensial tidak valid. Periksa Email, ID, NIK, dan password Anda.'); }
    finally { setLoading(false); }
  }

  return <main className="login-page"><section className="login-shell"><div className="login-brand-panel"><div className="login-orb login-orb-one"/><div className="login-orb login-orb-two"/><div className="login-brand-content"><span className="login-badge">M-CORE · MUMTAZA CORE</span><h1>Selamat Datang di Portal Terpusat</h1><p>Central Student &amp; Education Management System. Kelola data siswa, program pendidikan, dan informasi akademik secara efisien dan terintegrasi.</p></div><p className="login-help">Butuh bantuan? <a href="mailto:admin@m-core.id">Hubungi Administrator</a></p></div><div className="login-form-panel"><div className="login-heading"><span className="login-kicker">SECURE ACCESS</span><h2>Masuk Sistem</h2><p>Silakan masukkan kredensial akun Anda.</p></div><form onSubmit={handleSubmit} className="login-form"><label htmlFor="login-identity">Email, ID Siswa/Guru, atau NIK<input id="login-identity" type="text" value={identifier} onChange={e=>setIdentifier(e.target.value)} placeholder="Masukkan email, ID, atau NIK Anda" required autoComplete="username" /></label><label htmlFor="login-password"><span className="login-label-row">Password <a href="/reset-password">Lupa password?</a></span><input id="login-password" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required autoComplete="current-password" /></label><label className="remember-row"><input id="remember" type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)} /><span>Ingat saya di perangkat ini</span></label>{error&&<p className="login-error" role="alert">{error}</p>}<button id="login-submit" type="submit" disabled={loading}>{loading?'Memproses…':'Masuk M-CORE'}</button></form><p className="login-footer">Kendala akses sistem? <a href="mailto:admin@m-core.id">Pusat Bantuan</a></p></div></section></main>;
}