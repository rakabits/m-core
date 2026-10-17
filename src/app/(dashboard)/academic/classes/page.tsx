'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type AcademicLevel = 'JUNIOR_HIGH' | 'SENIOR_HIGH' | 'PRE_UNIVERSITY';
type HomeRoomTeacher = { id: string; displayName: string };
type Program = { id: string; programCode: string; programName: string; academicLevel: AcademicLevel | null };
type AcademicClass = {
  id: string;
  code: string;
  name: string;
  capacity: number | null;
  isActive: boolean;
  program: Program;
  homeRoomTeacher: HomeRoomTeacher | null;
  _count: { enrollments: number };
};

const levelLabel: Record<AcademicLevel, string> = {
  JUNIOR_HIGH: 'MTs',
  SENIOR_HIGH: 'MA',
  PRE_UNIVERSITY: 'Pra-Univ',
};

const levelAccent: Record<AcademicLevel, string> = {
  JUNIOR_HIGH: 'violet',
  SENIOR_HIGH: 'teal',
  PRE_UNIVERSITY: 'amber',
};

export default function ClassManagementPage() {
  const [classes, setClasses] = useState<AcademicClass[]>([]);
  const [activeYear, setActiveYear] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterLevel, setFilterLevel] = useState<AcademicLevel | 'ALL'>('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    void (async () => {
      try {
        const yearRes = await fetch('/api/v1/academic-years/active', { cache: 'no-store' });
        const yearData = await yearRes.json() as { success: boolean; active?: string };
        const year = yearData.active ?? '';
        setActiveYear(year);
        if (!year) { setLoading(false); return; }
        const classRes = await fetch(`/api/v1/academic-classes?academicYear=${encodeURIComponent(year)}`, { cache: 'no-store' });
        const classData = await classRes.json() as { success: boolean; data?: AcademicClass[]; error?: { message: string } };
        if (classData.success) setClasses(classData.data ?? []);
        else setError(classData.error?.message ?? 'Gagal memuat kelas.');
      } catch {
        setError('Gagal memuat data kelas.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = classes.filter((c) => {
    const matchLevel = filterLevel === 'ALL' || c.program.academicLevel === filterLevel;
    const matchSearch = search === '' || c.name.toLowerCase().includes(search.toLowerCase()) || c.program.programName.toLowerCase().includes(search.toLowerCase());
    return matchLevel && matchSearch;
  });

  // Group by program
  const grouped = filtered.reduce<Record<string, { program: Program; classes: AcademicClass[] }>>((acc, c) => {
    const key = c.program.id;
    if (!acc[key]) acc[key] = { program: c.program, classes: [] };
    acc[key]!.classes.push(c);
    return acc;
  }, {});

  const totalStudents = classes.reduce((sum, c) => sum + c._count.enrollments, 0);
  const totalWithHomeroom = classes.filter((c) => c.homeRoomTeacher).length;

  return (
    <main className="class-mgmt-page">
      {/* ── HERO ── */}
      <section className="class-hero">
        <div className="class-hero-copy">
          <span className="eyebrow"><i />CLASS MANAGEMENT</span>
          <h1>Manajemen Kelas</h1>
          <p>Kelola kelas aktif, wali kelas, dan daftar siswa per rombel.</p>
        </div>
        <div className="class-hero-year">
          <span>TAHUN AKADEMIK AKTIF</span>
          <strong>{activeYear || '—'}</strong>
          <small>MTs · MA</small>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="class-stats">
        <div className="stat-card">
          <span>TOTAL KELAS</span>
          <strong>{classes.length}</strong>
          <small>rombel aktif</small>
        </div>
        <div className="stat-card">
          <span>TOTAL SISWA</span>
          <strong>{totalStudents}</strong>
          <small>terdaftar di kelas</small>
        </div>
        <div className="stat-card highlight">
          <span>WALI KELAS</span>
          <strong>{totalWithHomeroom}/{classes.length}</strong>
          <small>sudah ditetapkan</small>
        </div>
      </section>

      {/* ── FILTER BAR ── */}
      <section className="class-filter-bar">
        <div className="filter-tabs">
          {(['ALL', 'JUNIOR_HIGH', 'SENIOR_HIGH'] as const).map((lv) => (
            <button
              key={lv}
              className={filterLevel === lv ? 'active' : ''}
              onClick={() => setFilterLevel(lv)}
            >
              {lv === 'ALL' ? 'Semua' : levelLabel[lv]}
            </button>
          ))}
        </div>
        <input
          className="class-search"
          type="search"
          placeholder="Cari kelas atau program..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Cari kelas"
        />
      </section>

      {/* ── CONTENT ── */}
      {error && <div className="academic-notice error"><span>!</span>{error}</div>}

      {loading ? (
        <div className="class-empty"><span>⋯</span><strong>Memuat kelas...</strong></div>
      ) : classes.length === 0 && !error ? (
        <div className="class-empty">
          <span>📂</span>
          <strong>Belum ada kelas aktif</strong>
          <p>Aktifkan tahun akademik di <Link href="/academic">Academic Center</Link> untuk membuat kelas otomatis.</p>
        </div>
      ) : (
        <div className="class-groups">
          {Object.values(grouped).map(({ program, classes: cls }) => {
            const level = program.academicLevel as AcademicLevel | null;
            const accent = level ? levelAccent[level] : 'violet';
            return (
              <div className="class-group" key={program.id}>
                <div className="class-group-header">
                  <span className={`level-pill ${accent}`}>{level ? levelLabel[level] : '—'}</span>
                  <h2>{program.programName}</h2>
                  <small>{cls.length} rombel</small>
                </div>
                <div className="class-grid">
                  {cls.map((c) => (
                    <Link href={`/academic/classes/${c.id}`} key={c.id} className="class-card">
                      <div className="class-card-top">
                        <span className={`class-badge ${accent}`}>{c.code}</span>
                        {c.homeRoomTeacher ? (
                          <span className="homeroom-tag">✓ Wali Kelas</span>
                        ) : (
                          <span className="homeroom-tag empty">Belum ada wali</span>
                        )}
                      </div>
                      <strong className="class-name">{c.name}</strong>
                      <div className="class-meta">
                        <span>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="8" r="3"/><path d="M5 21c.7-4 3-6 7-6s6.3 2 7 6"/></svg>
                          {c._count.enrollments} siswa
                        </span>
                        {c.capacity && (
                          <span className={c._count.enrollments >= c.capacity ? 'full' : ''}>
                            / {c.capacity} kapasitas
                          </span>
                        )}
                      </div>
                      {c.homeRoomTeacher && (
                        <div className="homeroom-name">{c.homeRoomTeacher.displayName}</div>
                      )}
                      <span className="class-card-arrow">→</span>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
