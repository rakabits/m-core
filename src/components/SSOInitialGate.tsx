'use client';

import { useEffect, useState, type ReactNode } from 'react';

export function SSOInitialGate({ children }: { children: ReactNode }) {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const key = 'm-core-sso-verified';
    if (window.sessionStorage.getItem(key) === 'true') {
      setChecking(false);
      return;
    }

    const timer = window.setTimeout(() => {
      window.sessionStorage.setItem(key, 'true');
      setChecking(false);
    }, 2000);
    return () => window.clearTimeout(timer);
  }, []);

  return <>{checking && <div className="sso-loading" aria-live="polite" aria-busy="true"><div className="sso-loading-card"><div className="sso-loading-mark" aria-hidden="true"><span /><span /><span /></div><p className="sso-loading-kicker">M-CORE SECURE ACCESS</p><h1>Menghubungkan ke SSO M-Core...</h1><p className="sso-loading-copy">Memverifikasi sesi login Anda. Mohon tunggu sebentar.</p><div className="sso-loading-progress" aria-hidden="true"><span /></div></div></div>}<div aria-hidden={checking}>{children}</div></>;
}

