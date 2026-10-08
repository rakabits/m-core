'use client';

import { useEffect, useMemo, useState } from 'react';

type Period = { id: string; name: string; registrationFee: number; status: string; program: { id: string; programName: string; programCode: string } };
type Student = { id: string; studentNumber: number; fullName: string; nik?: string | null; email?: string | null; programHistories?: { program?: { programName: string } }[] };
type Generated = { registrationNo: string; publicToken: string; fullName?: string | null; nationalId?: string | null; program: { programName: string }; enrollmentPeriod: { registrationFee: number; name: string } };

const formatMoney = (value: number) => `Rp ${value.toLocaleString('id-ID')}`;

export default function GenerateLinkPage() {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [periodId, setPeriodId] = useState('');
  const [studentType, setStudentType] = useState<'new' | 'existing'>('new');
  const [query, setQuery] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [selected, setSelected] = useState<Student | null>(null);
  const [step, setStep] = useState(1);
  const [generated, setGenerated] = useState<Generated | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const selectedPeriod = useMemo(() => periods.find((period) => period.id === periodId), [periods, periodId]);

  useEffect(() => {
    fetch('/api/v1/enrollment-periods').then((response) => response.json()).then((json) => {
      const available = (json.data || []).filter((period: Period) => period.status === 'OPEN');
      setPeriods(available);
      if (available[0]) setPeriodId(available[0].id);
    }).catch(() => setMessage('Periode pendaftaran gagal dimuat.'));
  }, []);

  useEffect(() => {
    if (studentType !== 'existing' || query.trim().length < 2) { setStudents([]); return; }
    const timer = window.setTimeout(() => {
      fetch(`/api/v1/students/search?q=${encodeURIComponent(query.trim())}`).then((response) => response.json()).then((json) => setStudents(json.data || [])).catch(() => setStudents([]));
    }, 250);
    return () => window.clearTimeout(timer);
  }, [query, studentType]);

  function continueToConfirmation() {
    setMessage('');
    if (!periodId) return setMessage('Pilih program/periode terlebih dahulu.');
    if (studentType === 'existing' && !selected) return setMessage('Pilih siswa lama dari hasil pencarian.');
    setStep(2);
  }

  async function generate() {
    setLoading(true); setMessage('');
    try {
      const response = await fetch('/api/v1/generate-links', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ enrollmentPeriodId: periodId, studentId: studentType === 'existing' ? selected?.id : undefined }) });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error?.message || 'Link gagal dibuat.');
      setGenerated(json.data); setStep(3);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Link gagal dibuat.'); } finally { setLoading(false); }
  }

  const publicLink = generated && typeof window !== 'undefined' ? `${window.location.origin}/register/${generated.publicToken}` : '';
  async function copyLink() { if (!publicLink) return; await navigator.clipboard.writeText(publicLink); setMessage('Link berhasil disalin.'); }

  return <main className="students-page academic-page generate-link-page">
    <header className="students-header academic-hero"><div><p className="eyebrow">M-CORE / PROGRAM ENROLLMENT</p><h1>Generate Registration Link</h1><p className="subtitle">Buat link pendaftaran terarah untuk siswa baru maupun siswa lama.</p></div></header>
    <section className="student-card academic-card generate-link-card">
      <div className="wizard-steps">{['Pilih program', 'Konfirmasi', 'Link siap'].map((label, index) => <div className={step === index + 1 ? 'wizard-step active' : step > index + 1 ? 'wizard-step complete' : 'wizard-step'} key={label}><span>{index + 1}</span><strong>{label}</strong></div>)}</div>
      {step === 1 && <div className="wizard-panel"><h2>Pilih program dan tipe siswa</h2><label>Program / periode pendaftaran<select value={periodId} onChange={(event) => setPeriodId(event.target.value)}><option value="">Pilih periode</option>{periods.map((period) => <option value={period.id} key={period.id}>{period.program.programName} · {period.name} · {formatMoney(period.registrationFee)}</option>)}</select></label><div className="choice-grid"><button className={studentType === 'new' ? 'choice-card selected' : 'choice-card'} onClick={() => { setStudentType('new'); setSelected(null); }}><strong>Siswa baru</strong><span>Formulir akan diisi dari awal.</span></button><button className={studentType === 'existing' ? 'choice-card selected' : 'choice-card'} onClick={() => setStudentType('existing')}><strong>Siswa lama</strong><span>Prefill berdasarkan data siswa.</span></button></div>{studentType === 'existing' && <div className="student-search"><label>Cari ID siswa, nama, atau NIK<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Contoh: Ahmad atau 123456" /></label>{students.length > 0 && <div className="search-results">{students.map((student) => <button key={student.id} className={selected?.id === student.id ? 'search-result selected' : 'search-result'} onClick={() => { setSelected(student); setQuery(student.fullName); setStudents([]); }}><strong>{student.fullName}</strong><span>ID: {student.studentNumber} · NIK: {student.nik || 'Belum tersedia'}</span></button>)}</div>}{selected && <div className="selected-student"><strong>{selected.fullName}</strong><span>ID {selected.studentNumber} · NIK {selected.nik || 'Belum tersedia'}</span></div>}</div>}<button className="primary-button" onClick={continueToConfirmation}>Lanjutkan ke konfirmasi</button></div>}
      {step === 2 && selectedPeriod && <div className="wizard-panel"><h2>Konfirmasi pendaftaran</h2><div className="confirmation-card"><span className="confirmation-kicker">Program yang dipilih</span><h3>{selectedPeriod.program.programName}</h3><p>{selectedPeriod.name}</p><strong>{formatMoney(selectedPeriod.registrationFee)}</strong></div>{selected && <div className="student-summary"><span>Data siswa lama</span><strong>{selected.fullName}</strong><p>ID: {selected.studentNumber} · NIK: {selected.nik || 'Belum tersedia'}</p></div>}{!selected && <div className="student-summary"><span>Data pendaftar</span><strong>Siswa baru</strong><p>Detail akan dilengkapi melalui link.</p></div>}<div className="wizard-actions"><button className="secondary-button" onClick={() => setStep(1)}>Kembali</button><button className="primary-button" onClick={generate} disabled={loading}>{loading ? 'Membuat link...' : 'Generate link'}</button></div></div>}
      {step === 3 && generated && <div className="wizard-panel success-panel"><div className="success-icon">✓</div><h2>Link pendaftaran siap</h2><p>Nomor registrasi otomatis masuk ke Enrollment Data.</p><div className="generated-summary"><strong>{generated.registrationNo}</strong><span>{generated.program.programName} · {formatMoney(generated.enrollmentPeriod.registrationFee)}</span>{generated.fullName && <span>{generated.fullName} · NIK {generated.nationalId || 'Belum tersedia'}</span>}</div><div className="link-box"><input readOnly value={publicLink} aria-label="Link pendaftaran" /><button className="primary-button" onClick={copyLink}>Copy link</button></div><button className="secondary-button" onClick={() => { setStep(1); setGenerated(null); setSelected(null); setQuery(''); setMessage(''); }}>Buat link baru</button></div>}
      {message && <p className="state error">{message}</p>}
    </section>
  </main>;
}