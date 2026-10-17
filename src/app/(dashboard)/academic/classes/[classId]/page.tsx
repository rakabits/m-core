'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

type Teacher = { id: string; displayName: string; employeeCode: string | null };
type Student = { id: string; studentNumber: number; fullName: string; gender: 'male' | 'female'; status: string };
type Enrollment = { id: string; assignedAt: string; student: Student };
type ClassDetail = {
  id: string;
  code: string;
  name: string;
  capacity: number | null;
  isActive: boolean;
  program: { id: string; programCode: string; programName: string; academicLevel: string | null };
  academicYear: { id: string; code: string };
  homeRoomTeacher: Teacher | null;
  enrollments: Enrollment[];
};

const genderLabel = { male: 'L', female: 'P' };

export default function ClassDetailPage() {
  const params = useParams<{ classId: string }>();
  const classId = params.classId;

  const [detail, setDetail] = useState<ClassDetail | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [search, setSearch] = useState('');

  async function loadDetail() {
    const res = await fetch(`/api/v1/academic-classes/${classId}`, { cache: 'no-store' });
    const data = await res.json() as { success: boolean; data?: ClassDetail; error?: { message: string } };
    if (data.success && data.data) {
      setDetail(data.data);
      setSelectedTeacher(data.data.homeRoomTeacher?.id ?? '');
    } else {
      setError(data.error?.message ?? 'Gagal memuat detail kelas.');
    }
  }

  async function loadTeachers() {
    const res = await fetch('/api/v1/users?role=TEACHER&isActive=true', { cache: 'no-store' });
    const data = await res.json() as { success: boolean; data?: Teacher[] };
    if (data.success) setTeachers(data.data ?? []);
  }

  useEffect(() => {
    void (async () => {
      try {
        await Promise.all([loadDetail(), loadTeachers()]);
      } finally {
        setLoading(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId]);

  async function saveHomeRoom() {
    if (!detail) return;
    setSaving(true); setError(''); setNotice('');
    try {
      const res = await fetch(`/api/v1/academic-classes/${classId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ homeRoomTeacherId: selectedTeacher || null }),
      });
      const data = await res.json() as { success: boolean; error?: { message: string } };
      if (!res.ok || !data.success) throw new Error(data.error?.message ?? 'Gagal menyimpan wali kelas.');
      setNotice('Wali kelas berhasil diperbarui.');
      await loadDetail();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan wali kelas.');
    } finally {
      setSaving(false);
    }
  }

  const filteredStudents = detail?.enrollments.filter((en) =>
    search === '' || en.student.fullName.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  if (loading) return <main className="class-detail-page"><div className="class-empty"><span>⋯</span><strong>Memuat...</strong></div></main>;
  if (!detail) return <main className="class-detail-page"><div className="class-empty"><span>⚠</span><strong>{error || 'Kelas tidak ditemukan.'}</strong><Link href="/academic/classes">← Kembali</Link></div></main>;

  const enrolledCount = detail.enrollments.length;

  return (
    <main className="class-detail-page">
      {/* ── BREADCRUMB ── */}
      <nav className="class-breadcrumb" aria-label="Navigasi balik">
        <Link href="/academic/classes">← Manajemen Kelas</Link>
        <span>/</span>
        <span>{detail.name}</span>
      </nav>

      {/* ── HERO ── */}
      <section className="class-detail-hero">
        <div className="detail-hero-left">
          <span className="class-code-badge">{detail.code}</span>
          <div>
            <h1>{detail.name}</h1>
            <p>{detail.program.programName} · Tahun Akademik {detail.academicYear.code}</p>
          </div>
        </div>
        <div className="detail-hero-stats">
          <div className="detail-stat">
            <span>SISWA</span>
            <strong>{enrolledCount}</strong>
            {detail.capacity && <small>/ {detail.capacity}</small>}
          </div>
          <div className="detail-stat">
            <span>WALI KELAS</span>
            <strong>{detail.homeRoomTeacher ? detail.homeRoomTeacher.displayName : '—'}</strong>
          </div>
        </div>
      </section>

      {notice && <div className="academic-notice success"><span>OK</span>{notice}</div>}
      {error && <div className="academic-notice error"><span>!</span>{error}</div>}

      <div className="class-detail-layout">
        {/* ── PANEL KIRI: WALI KELAS ── */}
        <aside className="homeroom-panel">
          <div className="panel-heading">
            <div>
              <span className="section-kicker">WALI KELAS</span>
              <h2>Penetapan Wali Kelas</h2>
            </div>
          </div>

          {detail.homeRoomTeacher ? (
            <div className="current-homeroom">
              <div className="teacher-avatar">{detail.homeRoomTeacher.displayName.slice(0, 2).toUpperCase()}</div>
              <div>
                <strong>{detail.homeRoomTeacher.displayName}</strong>
                {detail.homeRoomTeacher.employeeCode && <small>NIP: {detail.homeRoomTeacher.employeeCode}</small>}
              </div>
            </div>
          ) : (
            <div className="homeroom-empty">
              <span>~</span>
              <p>Belum ada wali kelas yang ditetapkan.</p>
            </div>
          )}

          <div className="homeroom-form">
            <label htmlFor="homeroom-select">Pilih Wali Kelas</label>
            <select
              id="homeroom-select"
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
            >
              <option value="">— Tidak ada wali kelas —</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>{t.displayName}</option>
              ))}
            </select>
            <button
              className="primary-button"
              disabled={saving}
              onClick={() => void saveHomeRoom()}
            >
              {saving ? 'Menyimpan...' : 'Simpan Wali Kelas'}
            </button>
          </div>

          {/* Quick info */}
          <div className="class-quick-info">
            <div className="info-row"><span>Program</span><strong>{detail.program.programName}</strong></div>
            <div className="info-row"><span>Kode Kelas</span><strong>{detail.code}</strong></div>
            <div className="info-row"><span>Kapasitas</span><strong>{detail.capacity ?? '—'}</strong></div>
            <div className="info-row"><span>Tahun Akademik</span><strong>{detail.academicYear.code}</strong></div>
          </div>
        </aside>

        {/* ── PANEL KANAN: DAFTAR SISWA ── */}
        <section className="student-panel">
          <div className="panel-heading">
            <div>
              <span className="section-kicker">DAFTAR SISWA</span>
              <h2>Siswa Terdaftar <em>·</em> {enrolledCount} orang</h2>
            </div>
            <Link href={`/academic/classes/${classId}/add-student`} className="primary-button">
              + Tambah Siswa
            </Link>
          </div>

          <input
            className="class-search"
            type="search"
            placeholder="Cari nama siswa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Cari siswa"
          />

          {filteredStudents.length === 0 ? (
            <div className="class-empty small">
              <span>~</span>
              <strong>{search ? 'Siswa tidak ditemukan.' : 'Belum ada siswa di kelas ini.'}</strong>
            </div>
          ) : (
            <div className="student-list">
              <div className="student-list-header">
                <span>#</span>
                <span>No.</span>
                <span>Nama Siswa</span>
                <span>L/P</span>
                <span>Status</span>
                <span>Terdaftar</span>
              </div>
              {filteredStudents.map((en, idx) => (
                <Link href={`/students/${en.student.id}`} key={en.id} className="student-row">
                  <span className="row-index">{String(idx + 1).padStart(2, '0')}</span>
                  <span className="student-num">{en.student.studentNumber}</span>
                  <span className="student-name">{en.student.fullName}</span>
                  <span className={`gender-badge ${en.student.gender}`}>{genderLabel[en.student.gender]}</span>
                  <span className={`status-badge ${en.student.status}`}>{en.student.status}</span>
                  <span className="enrolled-date">
                    {new Date(en.assignedAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
