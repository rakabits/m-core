'use client';

import { useEffect, useState } from 'react';

type Backup = { id: string; period: string; status: string; totalStudents: number | null; spreadsheetName: string | null; spreadsheetUrl: string | null; errorMessage: string | null; attempts: number; createdAt: string; completedAt: string | null };
type TriggerResponse = { data?: Backup; error?: { code?: string }; success?: boolean; reused?: boolean; message?: string };

export default function BackupsPage() {
  const [rows, setRows] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [message, setMessage] = useState('');
  async function readBody(response: Response): Promise<{ data?: Backup[]; error?: { code?: string }; success?: boolean }> {
    const text = await response.text();
    if (!text.trim()) return { error: { code: `HTTP_${response.status}` } };
    try { return JSON.parse(text) as { data?: Backup[]; error?: { code?: string }; success?: boolean }; }
    catch { return { error: { code: `HTTP_${response.status}` } }; }
  }
  async function load() { setLoading(true); try { const response = await fetch('/api/v1/backups', { cache: 'no-store' }); const body = await readBody(response); if (!response.ok) throw new Error(body.error?.code || 'Gagal memuat riwayat backup'); setRows(body.data || []); } catch (error) { setMessage(error instanceof Error ? error.message : 'Gagal memuat riwayat backup'); } finally { setLoading(false); } }
  async function trigger() { setTriggering(true); setMessage('Menghubungi Google Apps Script...'); try { const response = await fetch('/api/v1/backups/trigger?force=true', { method: 'POST' }); const text = await response.text(); let body: TriggerResponse = {}; try { body = JSON.parse(text) as TriggerResponse; } catch { body = { error: { code: `HTTP_${response.status}` } }; } if (!response.ok) throw new Error(body.error?.code || `HTTP_${response.status}`); setMessage(body.reused ? 'Backup periode ini sudah selesai.' : 'Backup sedang diproses oleh Google Apps Script.'); await new Promise(resolve => setTimeout(resolve, 2000)); await load(); } catch (error) { setMessage(error instanceof Error ? error.message : 'Gagal memproses backup'); } finally { setTriggering(false); } }
  // The initial request synchronizes this page with the backup API.
  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  useEffect(() => { void load(); }, []);
  return <main className="students-page"><header className="class-hero students-feature-hero"><div className="class-hero-copy"><span className="eyebrow"><i />BACKUP CENTER</span><h1>Riwayat Backup</h1><p>Kelola snapshot data Master Students ke Google Sheets.</p></div><button className="primary-button" type="button" onClick={trigger} disabled={triggering}>{triggering ? 'Menyiapkan...' : 'Backup Sekarang'}</button></header><section className="student-card directory-card"><div className="card-heading"><div><span className="section-kicker">GOOGLE SHEETS</span><h2>Riwayat backup</h2></div><span className="count-pill">{rows.length} riwayat</span></div>{message && <div className="state">{message}</div>}{loading ? <div className="state">Memuat riwayat...</div> : rows.length === 0 ? <div className="state">Belum ada riwayat backup.</div> : <div className="backup-history-table"><div className="backup-history-header"><span>Periode</span><span>Status</span><span>Data</span><span>Percobaan</span><span>Waktu</span><span>Link</span></div>{rows.map(row => <div className="backup-history-row" key={row.id}><strong>{row.period}</strong><span className={`status status-${row.status}`}>{row.status}</span><span>{row.totalStudents ?? '-'}</span><span>{row.attempts}</span><span>{row.completedAt ? new Date(row.completedAt).toLocaleString('id-ID') : new Date(row.createdAt).toLocaleString('id-ID')}</span>{row.spreadsheetUrl ? <a href={row.spreadsheetUrl} target="_blank" rel="noreferrer">Buka Google Sheet</a> : row.errorMessage ? <span title={row.errorMessage}>Lihat error</span> : <span>-</span>}</div>)}</div>}</section></main>;
}
