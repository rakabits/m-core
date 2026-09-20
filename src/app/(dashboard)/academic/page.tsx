'use client';

import { useState } from 'react';

type Level = { title: string; kicker: string; icon: string; year: string; classes: { name: string; count: number }[] };

const initialLevels: Level[] = [
  { title: 'Junior High', kicker: 'JENJANG SMP', icon: 'J', year: 'TA 2026-2027', classes: [{ name: 'Kelas 7', count: 0 }, { name: 'Kelas 8', count: 0 }, { name: 'Kelas 9', count: 0 }] },
  { title: 'Senior High', kicker: 'JENJANG SMA', icon: 'S', year: 'TA 2026-2027', classes: [{ name: 'Kelas 10', count: 0 }, { name: 'Kelas 11', count: 0 }, { name: 'Kelas 12', count: 0 }] },
];

export default function AcademicMasterPage() {
  const [levels, setLevels] = useState(initialLevels);
  const [countries, setCountries] = useState(['Jordan', 'Mesir', 'Pakistan', 'Turki']);
  const [drawer, setDrawer] = useState<'junior' | 'senior' | 'countries' | null>(null);
  const [country, setCountry] = useState('');
  const [year, setYear] = useState('');

  function updateLevel(index: number, updates: Partial<Level>) { setLevels(current => current.map((item, i) => i === index ? { ...item, ...updates } : item)); }
  function updateClass(index: number, classIndex: number, key: 'name' | 'count', value: string) {
    setLevels(current => current.map((item, i) => i === index ? { ...item, classes: item.classes.map((row, j) => j === classIndex ? { ...row, [key]: key === 'count' ? Math.max(0, Number(value)) : value } : row) } : item));
  }
  function addCountry(event: React.FormEvent) { event.preventDefault(); const value = country.trim(); if (value && !countries.includes(value)) setCountries([...countries, value]); setCountry(''); }

  return <main className="students-page academic-page">
    <header className="students-header academic-header"><div><p className="eyebrow">M-CORE / ACADEMIC</p><h1>Academic Master</h1><p className="subtitle">Kelola fondasi akademik berdasarkan jenjang pendidikan.</p></div><span className="local-badge"><i /> Data lokal</span></header>
    <section className="academic-master-grid" aria-label="Academic Master cards">
      {levels.map((level, index) => <article className={`academic-level-card level-${index}`} key={level.title}><div className="academic-card-top"><div className="academic-title"><span className="academic-card-icon">{level.icon}</span><div><p className="section-kicker">{level.kicker}</p><h2>{level.title}</h2></div></div><button className="academic-icon-button" id={`edit-${index === 0 ? 'junior' : 'senior'}-button`} aria-label={`Edit ${level.title}`} onClick={() => { setYear(level.year); setDrawer(index === 0 ? 'junior' : 'senior'); }}>✎</button></div><div className="active-year"><span>Tahun ajaran aktif</span><strong>{level.year}</strong></div><div className="class-list">{level.classes.map((row, classIndex) => <div className="class-line" key={row.name}><span>{row.name}</span><b>{row.count} rombel</b></div>)}</div><div className="academic-card-actions"><button className="detail-button" onClick={() => { setYear(level.year); setDrawer(index === 0 ? 'junior' : 'senior'); }}>Edit data</button></div></article>)}
      <article className="academic-level-card level-pre"><div className="academic-card-top"><div className="academic-title"><span className="academic-card-icon">P</span><div><p className="section-kicker">JENJANG PRA-UNIVERSITAS</p><h2>Pre-University</h2></div></div><button className="academic-icon-button" aria-label="Edit daftar negara" onClick={() => setDrawer('countries')}>✎</button></div><div className="country-list">{countries.map(item => <span key={item}>{item}</span>)}</div><div className="academic-card-actions"><button className="primary-button" onClick={() => setDrawer('countries')}>Tambah negara</button></div></article>
    </section>
    {drawer && <div className="academic-drawer-backdrop" onClick={() => setDrawer(null)}><aside className="academic-drawer" onClick={event => event.stopPropagation()}><button className="drawer-close" aria-label="Tutup editor" onClick={() => setDrawer(null)}>×</button>{drawer === 'countries' ? <><p className="section-kicker">PRE-UNIVERSITY</p><h2>Tambah negara</h2><p className="drawer-copy">Daftar ini hanya tersimpan di browser selama sesi ini.</p><form className="drawer-form" onSubmit={addCountry}><label htmlFor="country-name">Nama negara<input id="country-name" value={country} onChange={event => setCountry(event.target.value)} placeholder="Contoh: Malaysia" required /></label><button className="primary-button" type="submit">Tambah negara</button></form></> : <form className="editor-form" onSubmit={event => { event.preventDefault(); setLevels(current => current.map((item, i) => i === (drawer === 'junior' ? 0 : 1) ? { ...item, year } : item)); setDrawer(null); }}><p className="section-kicker">EDIT DATA LOKAL</p><h2>Edit {drawer === 'junior' ? 'Junior' : 'Senior'} High</h2><label htmlFor="academic-year">Tahun ajaran<input id="academic-year" value={year} onChange={event => setYear(event.target.value)} /></label><div className="editor-class-header"><div><h3>Kelas & rombel</h3><p>Jumlah rombel untuk setiap tingkatan.</p></div></div>{levels[drawer === 'junior' ? 0 : 1].classes.map((row, classIndex) => <div className="editor-class-row" key={row.name}><input aria-label={`Nama ${row.name}`} value={row.name} onChange={event => updateClass(drawer === 'junior' ? 0 : 1, classIndex, 'name', event.target.value)} /><input aria-label={`Jumlah ${row.name}`} type="number" min="0" value={row.count} onChange={event => updateClass(drawer === 'junior' ? 0 : 1, classIndex, 'count', event.target.value)} /><span>rombel</span></div>)}<button className="primary-button" type="submit">Simpan perubahan</button></form>}</aside></div>}
  </main>;
}
