'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

type Teacher = { id: string; displayName: string; employeeCode: string | null };
type Student = { id: string; studentNumber: number; fullName: string; gender: 'male' | 'female'; status: string };
type Enrollment = { id: string; assignedAt: string; student: Student; history: { id: string; academicYear: string; status: string } };
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
  const [addStudentOpen, setAddStudentOpen] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [studentResults, setStudentResults] = useState<Array<{ id: string; studentNumber: number; fullName: string; email: string | null }>>([]);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollmentError, setEnrollmentError] = useState('');
  const [enrollmentNotice, setEnrollmentNotice] = useState('');
  const [promotion, setPromotion] = useState<{ studentId: string; historyId: string; name: string } | null>(null);
  const [promotionAction, setPromotionAction] = useState<'promote' | 'transfer' | 'drop'>('promote');
  const [promotionClassId, setPromotionClassId] = useState('');
  const [promotionNote, setPromotionNote] = useState('');
  const [promotionSaving, setPromotionSaving] = useState(false);
  const [promotionClasses, setPromotionClasses] = useState<Array<{ id: string; name: string; code: string }>>([]);
  const [promotionEndDate, setPromotionEndDate] = useState(new Date().toISOString().slice(0, 10));

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
    const res = await fetch('/api/v1/teachers', { cache: 'no-store' });
    const data = await res.json() as { success: boolean; data?: Array<{ id: string; displayName: string; employeeCode: string | null; isActive: boolean }> };
    if (data.success) {
      setTeachers((data.data ?? [])
        .filter((item) => item.isActive)
        .map((item) => ({ id: item.id, displayName: item.displayName, employeeCode: item.employeeCode })));
    }
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

  async function searchStudents(value: string) {
    setStudentSearch(value);
    setSelectedStudent(null);
    if (value.trim().length < 2 && value.trim().length > 0) { setStudentResults([]); return; }
    if (!detail?.program.id) { setStudentResults([]); return; }
    try {
      const response = await fetch(`/api/v1/students/search?q=${encodeURIComponent(value)}&programId=${encodeURIComponent(detail.program.id)}`, { cache: 'no-store' });
      const body = await response.json() as { success: boolean; data?: typeof studentResults; error?: { message?: string } };
      if (!response.ok || !body.success) throw new Error(body.error?.message ?? 'Gagal memuat daftar siswa.');
      setStudentResults(body.data ?? []);
    } catch (err) {
      setStudentResults([]);
      setEnrollmentError(err instanceof Error ? err.message : 'Gagal memuat daftar siswa.');
    }
  }

  async function enrollSelectedStudent() {
    if (!selectedStudent) return;
    setEnrolling(true); setEnrollmentError('');
    try {
      const response = await fetch(`/api/v1/academic-classes/${classId}/enrollments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentId: selectedStudent }) });
      const body = await response.json() as { success: boolean; error?: { message: string } };
      if (!response.ok || !body.success) throw new Error(body.error?.message ?? 'Gagal menambahkan siswa.');
      setAddStudentOpen(false); setStudentSearch(''); setStudentResults([]); setSelectedStudent(null); setEnrollmentNotice('Siswa berhasil ditambahkan ke kelas.');
      await loadDetail();
    } catch (err) { setEnrollmentError(err instanceof Error ? err.message : 'Gagal menambahkan siswa.'); } finally { setEnrolling(false); }
  }

  async function openPromotion(student: Enrollment) {
    setPromotion({ studentId: student.student.id, historyId: student.history.id, name: student.student.fullName });
    setPromotionAction('promote'); setPromotionClassId(''); setPromotionNote(''); setPromotionEndDate(new Date().toISOString().slice(0, 10)); setError('');
    try {
      const response = await fetch(`/api/v1/academic-classes?programId=${encodeURIComponent(detail?.program.id ?? '')}&academicYear=${encodeURIComponent(detail?.academicYear.code ?? '')}`, { cache: 'no-store' });
      const body = await response.json() as { success: boolean; data?: Array<{ id: string; name: string; code: string }> };
      if (body.success) setPromotionClasses((body.data ?? []).filter((item) => item.id !== detail?.id));
    } catch { setPromotionClasses([]); }
  }

  async function submitPromotion() {
    if (!promotion) return;
    setPromotionSaving(true); setError('');
    try {
      const response = await fetch(`/api/v1/students/${promotion.studentId}/promote`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fromHistoryId: promotion.historyId, action: promotionAction === 'promote' ? 'correct-class' : promotionAction, toClassId: promotionAction === 'promote' ? promotionClassId : undefined, endDate: promotionEndDate, notes: promotionNote || undefined }) });
      const body = await response.json() as { success: boolean; error?: { message: string } };
      if (!response.ok || !body.success) throw new Error(body.error?.message ?? 'Gagal memproses aksi siswa.');
      setPromotion(null); setPromotionClassId(''); setPromotionNote(''); setPromotionEndDate(new Date().toISOString().slice(0, 10)); setNotice(promotionAction === 'promote' ? 'Kelas siswa berhasil dikoreksi.' : promotionAction === 'transfer' ? 'Siswa berhasil ditandai pindah.' : 'Siswa berhasil dikeluarkan.'); await loadDetail();
    } catch (err) { setError(err instanceof Error ? err.message : 'Gagal memproses aksi siswa.'); } finally { setPromotionSaving(false); }
  }

  const filteredStudents = detail?.enrollments.filter((en) => search === '' || en.student.fullName.toLowerCase().includes(search.toLowerCase())) ?? [];

  if (loading) return <main className="class-detail-page"><div className="class-empty"><span>â‹¯</span><strong>Memuat...</strong></div></main>;
  if (!detail) return <main className="class-detail-page"><div className="class-empty"><span>âš </span><strong>{error || 'Kelas tidak ditemukan.'}</strong><Link href="/academic/classes">â† Kembali</Link></div></main>;

  const enrolledCount = detail.enrollments.length;

  return (
    <main className="class-detail-page">
      {/* â”€â”€ BREADCRUMB â”€â”€ */}
      <nav className="class-breadcrumb" aria-label="Navigasi balik">
        <Link href="/academic/classes">â† Manajemen Kelas</Link>
        <span>/</span>
        <span>{detail.name}</span>
      </nav>

      {/* â”€â”€ HERO â”€â”€ */}
      <section className="class-detail-hero">
        <div className="detail-hero-left">
          <span className="class-code-badge">{detail.code}</span>
          <div>
            <h1>{detail.name}</h1>
            <p>{detail.program.programName} Â· Tahun Akademik {detail.academicYear.code}</p>
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
            <strong>{detail.homeRoomTeacher ? detail.homeRoomTeacher.displayName : 'â€”'}</strong>
          </div>
        </div>
      </section>

      {notice && <div className="academic-notice success"><span>OK</span>{notice}</div>}
      {error && <div className="academic-notice error"><span>!</span>{error}</div>}

      <div className="class-detail-layout">
        {/* â”€â”€ PANEL KIRI: WALI KELAS â”€â”€ */}
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
              <option value="">â€” Tidak ada wali kelas â€”</option>
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
            <div className="info-row"><span>Kapasitas</span><strong>{detail.capacity ?? 'â€”'}</strong></div>
            <div className="info-row"><span>Tahun Akademik</span><strong>{detail.academicYear.code}</strong></div>
          </div>
        </aside>

        {/* â”€â”€ PANEL KANAN: DAFTAR SISWA â”€â”€ */}
        <section className="student-panel">
          <div className="panel-heading">
            <div>
              <span className="section-kicker">DAFTAR SISWA</span>
              <h2>Siswa Terdaftar <em>Â·</em> {enrolledCount} orang</h2>
            </div>
            <button type="button" className="primary-button" onClick={() => { setAddStudentOpen(true); setEnrollmentError(''); setEnrollmentNotice(''); setStudentSearch(''); setSelectedStudent(null); void searchStudents(''); }}>
              + Tambah Siswa
            </button>
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
                  <span className="enrolled-date">{new Date(en.assignedAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  <button type="button" className="roster-action" onClick={(event) => { event.preventDefault(); void openPromotion(en); }} aria-label={`Kelola ${en.student.fullName}`}>â€¢â€¢â€¢</button>
                </Link>
              ))}
             </div>
           )}
         </section>
       </div>

       {promotion && <div className="enrollment-modal-backdrop" role="presentation" onClick={() => setPromotion(null)}><section className="enrollment-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}><div className="enrollment-modal-header"><div><span className="section-kicker">STUDENT LIFECYCLE</span><h2>Kelola {promotion.name}</h2></div><button type="button" className="modal-close" onClick={() => setPromotion(null)}>Ã—</button></div><p className="modal-description">Edit kelas untuk memindahkan siswa ke kelas lain, atau kelola status enrollment siswa.</p><div className="promotion-tabs">{(['promote', 'transfer', 'drop'] as const).map((action) => <button type="button" className={promotionAction === action ? 'active' : ''} key={action} onClick={() => setPromotionAction(action)}>{action === 'promote' ? 'Edit Kelas' : action === 'transfer' ? 'Pindah' : 'Keluarkan'}</button>)}</div>{promotionAction === 'promote' && <label className="promotion-field">Kelas tujuan<select value={promotionClassId} onChange={(event) => setPromotionClassId(event.target.value)}><option value="">Pilih kelas tujuan</option>{promotionClasses.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.code})</option>)}</select></label>}<label className="promotion-field">Tanggal efektif<input type="date" value={promotionEndDate} onChange={(event) => setPromotionEndDate(event.target.value)} /></label><label className="promotion-field">Catatan<textarea value={promotionNote} onChange={(event) => setPromotionNote(event.target.value)} placeholder="Opsional" /></label>{promotionAction !== 'promote' && <div className={`lifecycle-warning ${promotionAction}`}><strong>{promotionAction === 'transfer' ? 'Siswa akan ditandai pindah.' : 'Siswa akan dikeluarkan dari kelas.'}</strong><span>Enrollment aktif akan ditutup dan tindakan ini tercatat pada histori siswa.</span></div>}<div className="modal-actions"><button type="button" className="detail-button" onClick={() => setPromotion(null)}>Batal</button><button type="button" className={`primary-button ${promotionAction === 'drop' ? 'danger-action' : ''}`} disabled={promotionSaving || !promotionEndDate || (promotionAction === 'promote' && !promotionClassId)} onClick={() => void submitPromotion()}>{promotionSaving ? 'Memproses...' : 'Simpan tindakan'}</button></div></section></div>}

      {addStudentOpen && <div className="enrollment-modal-backdrop" role="presentation" onClick={() => setAddStudentOpen(false)}>
        <section className="enrollment-modal" role="dialog" aria-modal="true" aria-labelledby="add-student-title" onClick={(event) => event.stopPropagation()}>
          <div className="enrollment-modal-header"><div><span className="section-kicker">ENROLLMENT</span><h2 id="add-student-title">Tambah Siswa ke Kelas</h2></div><button type="button" className="modal-close" onClick={() => setAddStudentOpen(false)} aria-label="Tutup">Ã—</button></div>
          <p className="modal-description">Cari siswa dari Master Student berdasarkan nama, NIK, atau nomor siswa.</p>
          <input autoFocus className="class-search" type="search" placeholder="Ketik minimal 2 karakter..." value={studentSearch} onChange={(event) => void searchStudents(event.target.value)} />
          {enrollmentError && <div className="academic-notice error"><span>!</span>{enrollmentError}</div>}
           <div className="student-picker-table-wrap"><table className="student-picker-table"><thead><tr><th>Nama Siswa</th><th>No. Siswa</th><th>Program</th><th>Pilih</th></tr></thead><tbody>{studentResults.length === 0 ? <tr><td colSpan={4} className="picker-empty">{enrollmentError || 'Tidak ada siswa dari program ini.'}</td></tr> : studentResults.map((student) => <tr key={student.id} className={selectedStudent === student.id ? 'selected' : ''} onClick={() => setSelectedStudent(student.id)}><td><strong>{student.fullName}</strong></td><td>{student.studentNumber}</td><td>{detail.program.programName}</td><td><button type="button" className="picker-select-button" onClick={(event) => { event.stopPropagation(); setSelectedStudent(student.id); }}>{selectedStudent === student.id ? '✓ Dipilih' : 'Pilih'}</button></td></tr>)}</tbody></table></div>
          <div className="modal-actions"><button type="button" className="detail-button" onClick={() => setAddStudentOpen(false)}>Batal</button><button type="button" className="primary-button" disabled={!selectedStudent || enrolling} onClick={() => void enrollSelectedStudent()}>{enrolling ? 'Menambahkan...' : 'Tambahkan ke Kelas'}</button></div>
        </section>
      </div>}
    </main>
  );
}

