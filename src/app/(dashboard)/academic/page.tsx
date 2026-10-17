'use client';

import { useEffect, useMemo, useState } from 'react';

type Level = 'MTs' | 'MA' | 'Pra-Univ';
type AcademicLevel = 'JUNIOR_HIGH' | 'SENIOR_HIGH' | 'PRE_UNIVERSITY';
type Program = { id: string; programCode: string; programName: string; academicYear: string; academicPeriod: string; academicLevel: AcademicLevel | null; isActive: boolean };
type ClassSlot = { id: string; displayName: string; suffix: string; capacity: number | null; isActive: boolean };
type ClassDefinition = { id: string; grade: number; gradeLabel: string; slots: ClassSlot[] };

const levelMap: Record<Level, AcademicLevel> = { MTs: 'JUNIOR_HIGH', MA: 'SENIOR_HIGH', 'Pra-Univ': 'PRE_UNIVERSITY' };
const levelMeta: Record<Level, { subtitle: string; accent: string; icon: string }> = {
  MTs: { subtitle: 'Madrasah Tsanawiyah', accent: 'violet', icon: 'M' },
  MA: { subtitle: 'Madrasah Aliyah', accent: 'teal', icon: 'A' },
  'Pra-Univ': { subtitle: 'Pre-University · Negara', accent: 'amber', icon: 'P' },
};

export default function AcademicPage() {
  const [level, setLevel] = useState<Level>('MTs');
  const [period, setPeriod] = useState('2025/2026');
  const [programs, setPrograms] = useState<Program[]>([]);
  const [newYear, setNewYear] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [catalogProgram, setCatalogProgram] = useState<Program | null>(null);
  const [catalog, setCatalog] = useState<ClassDefinition[]>([]);
  const [slotSuffix, setSlotSuffix] = useState('');
  const [countryCatalog, setCountryCatalog] = useState<{ id: string; code: string; name: string;  }[]>([]);
  const [countryForm, setCountryForm] = useState({ code: '', name: '' });

  async function openCountryCatalog(program: Program) { setError(''); const response = await fetch(`/api/v1/pre-university-programs?programId=${program.id}`, { cache: 'no-store' }); const data = await response.json(); if (!response.ok || !data.success) { setError(data.error?.message || 'Country Catalog gagal dimuat.'); return; } setCountryCatalog(data.data || []); setCatalogProgram(program); }
  async function saveCountry() { if (!catalogProgram) return; setError(''); const response = await fetch('/api/v1/pre-university-programs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ programId: catalogProgram.id, code: countryForm.code, name: countryForm.name,  }) }); const data = await response.json(); if (!response.ok || !data.success) { setError(data.error?.message || 'Country Catalog gagal disimpan.'); return; } setCountryForm({ code: '', name: '' }); await openCountryCatalog(catalogProgram); }


  const periods = useMemo(() => Array.from(new Set(programs.map((p) => p.academicYear))).sort().reverse(), [programs]);
  const filtered = useMemo(() => programs.filter((item) => item.academicLevel === levelMap[level] && item.isActive && item.academicYear === period), [programs, level, period]);
  const totalSlots = filtered.reduce((sum, program) => sum + (program.id === catalogProgram?.id ? catalog.reduce((n, def) => n + def.slots.length, 0) : 0), 0);

  async function refreshPrograms() {
    const response = await fetch('/api/v1/programs', { cache: 'no-store' });
    const data = await response.json();
    if (data.success !== false) setPrograms(data.data || []);
  }

  useEffect(() => { (async () => { try { const [programResponse, yearResponse] = await Promise.all([fetch('/api/v1/programs', { cache: 'no-store' }), fetch('/api/v1/academic-years/active', { cache: 'no-store' })]); const programData = await programResponse.json(); const yearData = await yearResponse.json(); if (programData.success !== false) setPrograms(programData.data || []); if (yearData.success && yearData.active) setPeriod(yearData.active); } catch { setError('Gagal memuat data akademik'); } finally { setLoading(false); } })(); }, []);

  async function saveAcademicYear() {
    const code = newYear.trim();
    if (!/^\d{4}\/\d{4}$/.test(code)) { setError('Gunakan format tahun YYYY/YYYY, contoh 2026/2027.'); return; }
    setError(''); setNotice(''); setSaving(true);
    try {
      const response = await fetch('/api/v1/academic-years/active', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code }) });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error?.message || 'Gagal menyimpan tahun akademik.');
      setPeriod(code); setNewYear(''); setNotice('Tahun akademik dan seluruh Program Catalog berhasil disinkronkan.'); await refreshPrograms();
    } catch (err) { setError(err instanceof Error ? err.message : 'Gagal menyimpan tahun akademik.'); } finally { setSaving(false); }
  }

  async function activateYear(code: string) { setNewYear(''); setError(''); setNotice(''); setSaving(true); try { const response = await fetch('/api/v1/academic-years/active', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code }) }); const data = await response.json(); if (!response.ok || !data.success) throw new Error(data.error?.message || 'Gagal mengaktifkan tahun.'); setPeriod(code); setNotice('Academic Year aktif diperbarui.'); await refreshPrograms(); } catch (err) { setError(err instanceof Error ? err.message : 'Gagal mengaktifkan tahun.'); } finally { setSaving(false); } }

  async function openCatalog(program: Program) { if (program.academicLevel === 'PRE_UNIVERSITY') return; setError(''); const response = await fetch(`/api/v1/class-definitions?programId=${program.id}`, { cache: 'no-store' }); const data = await response.json(); if (!response.ok || !data.success) { setError(data.error?.message || 'Catalog gagal dimuat.'); return; } setCatalog(data.data || []); setCatalogProgram(program); }
  async function addSlot(definitionId: string) { const suffix = slotSuffix.trim().toUpperCase(); if (!suffix) return; const response = await fetch(`/api/v1/class-definitions/${definitionId}/slots`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ suffix }) }); const data = await response.json(); if (!response.ok || !data.success) { setError(data.error?.message || 'Rombel gagal ditambah.'); return; } setSlotSuffix(''); if (catalogProgram) await openCatalog(catalogProgram); }

  const meta = levelMeta[level];
  return <main className="academic-page academic-redesign">
    <section className="academic-hero">
      <div className="hero-copy"><span className="eyebrow"><i /> ACADEMIC CENTER</span><h1>Academic Master</h1><p>Kelola program, periode, dan catalog kelas dalam satu workspace terintegrasi.</p></div>
      <div className="hero-year"><span>ACADEMIC YEAR AKTIF</span><strong>{period}</strong><small>Semua jenjang tersinkronisasi</small></div>
    </section>

    <section className="academic-control-bar"><div><span className="section-kicker">CURRENT WORKSPACE</span><h2>Program Catalog <em>·</em> {period}</h2></div><div className="year-actions"><input aria-label="Tahun akademik baru" value={newYear} onChange={(event) => setNewYear(event.target.value)} placeholder="2026/2027" /><button className="primary-button" disabled={saving} onClick={() => void saveAcademicYear()}>{saving ? 'Menyinkronkan...' : '+ Tahun Akademik'}</button></div></section>

    {notice && <div className="academic-notice success"><span>OK</span>{notice}</div>}{error && <div className="academic-notice error"><span>!</span>{error}</div>}

    <section className="academic-overview"><div className="overview-stat"><span>PROGRAM AKTIF</span><strong>{programs.filter((p) => p.academicYear === period && p.isActive).length}</strong><small>pada {period}</small></div><div className="overview-stat"><span>JENJANG</span><strong>03</strong><small>MTs · MA · Pra-Univ</small></div><div className="overview-stat highlight"><span>SYNC STATUS</span><strong><i /> Ready</strong><small>Catalog siap digunakan</small></div></section>

    <section className="level-tabs" aria-label="Pilih jenjang">{(['MTs', 'MA', 'Pra-Univ'] as Level[]).map((item) => <button key={item} className={level === item ? `active ${levelMeta[item].accent}` : ''} onClick={() => { setLevel(item); setCatalogProgram(null); setCatalog([]); }}><span>{levelMeta[item].icon}</span><b>{item}</b><small>{levelMeta[item].subtitle}</small></button>)}</section>

    <section className="catalog-layout"><div className="program-panel"><div className="panel-heading"><div><span className="section-kicker">PROGRAM CATALOG</span><h2>{level} <em>·</em> {period}</h2></div><span className={`level-pill ${meta.accent}`}>{filtered.length} program</span></div>{loading ? <p className="empty-state">Memuat program...</p> : filtered.length === 0 ? <p className="empty-state">Belum ada program untuk periode ini.</p> : filtered.map((program, index) => <button className={`program-row ${catalogProgram?.id === program.id ? 'selected' : ''}`} key={program.id} onClick={() => void (program.academicLevel === 'PRE_UNIVERSITY' ? openCountryCatalog(program) : openCatalog(program))}><span className="row-index">{String(index + 1).padStart(2, '0')}</span><span className="program-main"><strong>{program.programName}</strong><small>{program.programCode} · Master program</small></span><span className="program-period"><small>PERIODE</small><b>{program.academicPeriod}</b></span><span className="row-arrow">→</span></button>)}</div>
      <aside className="catalog-panel"><div className="panel-heading"><div><span className="section-kicker">{level === 'Pra-Univ' ? 'COUNTRY CATALOG' : 'CLASS CATALOG'}</span><h2>{catalogProgram ? catalogProgram.programName : 'Pilih program'}</h2></div>{catalogProgram && <button className="close-catalog" onClick={() => setCatalogProgram(null)}>x</button>}</div>{level === 'Pra-Univ' && catalogProgram ? <div className="country-editor"><div className="country-list">{countryCatalog.map((country) => <div className="country-item" key={country.id}><div><strong>{country.name}</strong><small>{country.code}</small></div></div>)}</div><div className="country-form"><input aria-label="Kode negara" value={countryForm.code} onChange={(event) => setCountryForm({ ...countryForm, code: event.target.value })} placeholder="Kode, contoh UK" /><input aria-label="Nama negara" value={countryForm.name} onChange={(event) => setCountryForm({ ...countryForm, name: event.target.value })} placeholder="Nama negara" /><button onClick={() => void saveCountry()}>+ Simpan negara</button></div></div> : catalogProgram ? <div className="class-list">{catalog.map((definition) => <div className="class-row" key={definition.id}><span className="grade-mark">{definition.grade}</span><div><strong>{definition.gradeLabel}</strong><small>{definition.slots.length} rombel aktif</small></div><div className="slot-badges">{definition.slots.map((slot) => <span key={slot.id}>{slot.displayName}</span>)}</div><input aria-label={`Tambah rombel ${definition.gradeLabel}`} value={slotSuffix} onChange={(event) => setSlotSuffix(event.target.value)} placeholder="B" /><button onClick={() => void addSlot(definition.id)}>+</button></div>)}</div> : <div className="catalog-empty"><span>~</span><strong>Pilih program catalog</strong><p>Pilih baris program untuk melihat Kelas 7-9 atau Kelas 10-12.</p></div>}</aside></section>

    <section className="history-panel"><div className="panel-heading"><div><span className="section-kicker">ACADEMIC HISTORY</span><h2>Riwayat Tahun Akademik</h2></div><span className="history-caption">Satu tahun utama · semua jenjang</span></div><div className="history-list">{periods.map((year) => <div className={`history-row ${period === year ? 'current' : ''}`} key={year}><span className="history-dot" /><strong>{year}</strong><small>{period === year ? 'Sedang aktif' : 'Tersedia untuk digunakan'}</small><button disabled={saving || period === year} onClick={() => void activateYear(year)}>{period === year ? 'Aktif' : 'Jadikan aktif'}</button></div>)}</div></section>
  </main>;
}
