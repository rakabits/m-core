'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type Parent = { id?: string; role?: string; fullName: string; nik?: string | null; phone?: string | null; education?: string | null; educationOther?: string | null; occupation?: string | null; occupationOther?: string | null; monthlyIncome?: number | null; relationship?: string | null };
type Guardian = { guardianIsDifferent: boolean; guardianSource: 'father' | 'mother' | 'other'; otherParent?: Parent | null };
type Student = {
  student_id: string; student_number?: string; photo_url?: string | null; full_name: string; gender: string; birth_place?: string | null; birth_date?: string | null; status: string; email?: string | null; nik?: string | null; phone?: string | null; whatsapp?: string | null; parents?: Parent[]; guardian?: Guardian | null;
  active_program?: { program_name: string; class_name?: string | null; academic_year?: string | null } | null;
};

type History = {
  history_id: string;
  program_name: string;
  program_code?: string;
  academic_year: string;
  class_name?: string | null;
  status: string;
  start_date?: string | null;
  end_date?: string | null;
};

async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!text.trim()) return {} as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`Respons server tidak valid (HTTP ${response.status})`);
  }
}

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [history, setHistory] = useState<History[]>([]);
  const [edit, setEdit] = useState(false);
  const [pendingPhoto, setPendingPhoto] = useState<File | null>(null);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Student>>({});
  const [parents, setParents] = useState<{ father: Parent; mother: Parent; other: Parent }>({ father: { fullName: '' }, mother: { fullName: '' }, other: { fullName: '' } });
  const [guardian, setGuardian] = useState<Guardian>({ guardianIsDifferent: false, guardianSource: 'father' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function uploadPhoto(file: File) {
    const body = new FormData();
    body.append('file', file);
    const response = await fetch(`/api/v1/students/${id}/photo`, {
      method: 'POST',
      body,
    });
    const payload = await parseResponse<{
      data?: { photo_url?: string };
      error?: { code?: string };
    }>(response);
    if (!response.ok) {
      setError(payload.error?.code || 'Gagal mengunggah foto');
      return false;
    }
    setStudent((current) =>
      current ? { ...current, photo_url: payload.data?.photo_url } : current
    );
    return true;
  }

  async function removePhoto() {
    const response = await fetch(`/api/v1/students/${id}/photo`, {
      method: 'DELETE',
    });
    if (response.ok)
      setStudent((current) =>
        current ? { ...current, photo_url: null } : current
      );
  }

  useEffect(() => {
    Promise.all([
      fetch(`/api/v1/students/${id}`),
      fetch(`/api/v1/students/${id}/program-history`),
    ])
      .then(async ([studentResponse, historyResponse]) => {
        const studentJson = await parseResponse<{
          data: Student;
          error?: { code?: string };
        }>(studentResponse);
        if (!studentResponse.ok)
          throw new Error(
            studentJson.error?.code || 'Gagal memuat siswa'
          );
        setStudent(studentJson.data);
        setForm({ ...studentJson.data, birth_date: studentJson.data.birth_date ? new Date(studentJson.data.birth_date).toISOString().slice(0, 10) : '' });
        const parentRows = studentJson.data.parents || [];
        setParents({ father: parentRows.find((row) => row.role === 'father') || { fullName: '' }, mother: parentRows.find((row) => row.role === 'mother') || { fullName: '' }, other: parentRows.find((row) => row.role === 'other') || { fullName: '' } });
        setGuardian(studentJson.data.guardian || { guardianIsDifferent: false, guardianSource: 'father' });
        if (historyResponse.ok) {
          const historyJson = await parseResponse<{ data: History[] }>(
            historyResponse
          );
          setHistory(historyJson.data || []);
        }
      })
      .catch((e) =>
        setError(e instanceof Error ? e.message : 'Gagal memuat siswa')
      )
      .finally(() => setLoading(false));
  }, [id]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const r = await fetch(`/api/v1/students/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: form.full_name,
        gender: form.gender,
        birthPlace: form.birth_place,
        birthDate: form.birth_date || null,
        nik: form.nik || null,
        status: form.status,
        email: form.email || null,
        phone: form.phone || null,
        whatsapp: form.whatsapp || null,
        parents: { father: parents.father, mother: parents.mother },
        guardian: { ...guardian, ...(guardian.guardianSource === 'other' ? { other: parents.other } : {}) },
      }),
    });
    try {
      const j = await parseResponse<{
        data?: Partial<Student>;
        error?: { code?: string };
      }>(r);
      if (!r.ok) {
        setError(j.error?.code || `Gagal menyimpan siswa (HTTP ${r.status})`);
        return;
      }
      setStudent((current) =>
        current
          ? {
              ...current,
              student_id: current.student_id,
              full_name: j.data?.full_name ?? current.full_name,
              status: j.data?.status ?? current.status,
            }
          : current
      );
      if (pendingPhoto) {
        const uploaded = await uploadPhoto(pendingPhoto);
        if (!uploaded) return;
        setPendingPhoto(null);
        setPendingUrl(null);
      }
      setEdit(false);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : `Gagal menyimpan siswa (HTTP ${r.status})`
      );
    }
  }

  if (loading)
    return (
      <main className="students-page">
        <div className="state">Memuat profil siswa…</div>
      </main>
    );
  if (error && !student)
    return (
      <main className="students-page">
        <div className="state error">{error}</div>
      </main>
    );
  if (!student) return null;

  return (
    <main className="students-page student-profile-page">
      <button className="detail-button" onClick={() => router.back()}>
        ← Kembali
      </button>
      <header className="students-header">
        <div>
          {student.photo_url ? (
            <img
              className={pendingUrl ? 'profile-photo preview' : 'profile-photo'}
              src={pendingUrl || student.photo_url}
              alt={`Foto ${student.full_name}`}
            />
          ) : (
            <div className="profile-photo profile-photo-fallback">
              {student.full_name.slice(0, 1).toUpperCase()}
            </div>
          )}
          <p className="eyebrow">STUDENT PROFILE</p>
          <h1>{student.full_name}</h1>
          <p className="subtitle student-id-highlight">
            Student ID: {student.student_number || student.student_id}
          </p>
        </div>
        <div className="form-actions">
          {!edit && (
            <button className="primary-button" onClick={() => setEdit(true)}>
              Edit profil
            </button>
          )}
          {edit && (
            <>
              <label
                className="detail-button photo-picker"
                htmlFor="student-photo"
              >
                {student.photo_url ? 'Ganti foto' : 'Tambah foto'}
              </label>
              <input
                id="student-photo"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
                    setError('Format foto harus JPG, PNG, atau WEBP');
                    return;
                  }
                  if (file.size > 5 * 1024 * 1024) {
                    setError('Ukuran foto maksimal 5 MB');
                    return;
                  }
                  const url = URL.createObjectURL(file);
                  setPendingPhoto(file);
                  setPendingUrl(url);
                  setError('');
                }}
              />
            </>
          )}
        </div>
      </header>

      {edit ? (
        <form className="student-card student-form" onSubmit={save}>
          <div className="form-grid">
            <label>
              Nama lengkap
              <input
                required
                value={form.full_name || ''}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              />
            </label>
            <label>
              Gender
              <select
                value={form.gender || 'male'}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
              >
                <option value="male">Laki-laka</option>
                <option value="female">Perempuan</option>
              </select>
            </label>
            <label>
              Tempat lahir
              <input
                value={form.birth_place || ''}
                onChange={(e) =>
                  setForm({ ...form, birth_place: e.target.value })
                }
              />
            </label>
            <label>
              Tanggal lahir
              <input
                type="date"
                value={form.birth_date || ''}
                onChange={(e) =>
                  setForm({ ...form, birth_date: e.target.value })
                }
              />
            </label>
            <label>
              NIK
              <input
                inputMode="numeric"
                maxLength={16}
                value={form.nik || ''}
                onChange={(e) => setForm({ ...form, nik: e.target.value })}
              />
            </label>
            <label>
              Email
              <input
                type="email"
                value={form.email || ''}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </label>
            <label>
              Telepon
              <input
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                maxLength={20}
                value={form.phone || ''}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </label>
            <label>
              Nomor WhatsApp
              <input
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                maxLength={20}
                value={form.whatsapp || ''}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              />
            </label>
            <label>
              Status
              <select
                value={form.status || 'active'}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="alumni">Alumni</option>
              </select>
            </label>
          </div>
          <div className="parent-grid">
            {(['father', 'mother'] as const).map((role) => <fieldset className="parent-fieldset" key={role}><legend>{role === 'father' ? 'Ayah' : 'Ibu'}</legend><label>Nama lengkap<input required value={parents[role].fullName} onChange={(e) => setParents((current) => ({ ...current, [role]: { ...current[role], fullName: e.target.value } }))} /></label><label>Nomor HP<input type="tel" value={parents[role].phone || ''} onChange={(e) => setParents((current) => ({ ...current, [role]: { ...current[role], phone: e.target.value } }))} /></label><label>Pekerjaan<input value={parents[role].occupation || ''} onChange={(e) => setParents((current) => ({ ...current, [role]: { ...current[role], occupation: e.target.value } }))} /></label><label>Penghasilan bulanan (Rp)<input type="number" min="0" step="1" value={parents[role].monthlyIncome ?? ''} onChange={(e) => setParents((current) => ({ ...current, [role]: { ...current[role], monthlyIncome: e.target.value ? Number(e.target.value) : null } }))} /></label></fieldset>)}
          </div>
          <label className="checkbox-row"><input type="checkbox" checked={guardian.guardianIsDifferent} onChange={(e) => setGuardian((current) => ({ ...current, guardianIsDifferent: e.target.checked }))} /> Wali berbeda dari Ayah/Ibu</label>
          {guardian.guardianIsDifferent && <div className="guardian-section"><p>Wali bersumber dari:</p>{(['father', 'mother', 'other'] as const).map((source) => <label key={source}><input type="radio" name="editGuardianSource" checked={guardian.guardianSource === source} onChange={() => setGuardian((current) => ({ ...current, guardianSource: source }))} /> {source === 'father' ? 'Ayah' : source === 'mother' ? 'Ibu' : 'Berbeda'}</label>)}{guardian.guardianSource === 'other' && <fieldset className="parent-fieldset"><legend>Data wali</legend><label>Hubungan dengan siswa<input required value={parents.other.relationship || ''} onChange={(e) => setParents((current) => ({ ...current, other: { ...current.other, relationship: e.target.value } }))} /></label><label>Nama lengkap<input required value={parents.other.fullName} onChange={(e) => setParents((current) => ({ ...current, other: { ...current.other, fullName: e.target.value } }))} /></label><label>Nomor HP<input type="tel" value={parents.other.phone || ''} onChange={(e) => setParents((current) => ({ ...current, other: { ...current.other, phone: e.target.value } }))} /></label></fieldset>}</div>}
          {error && <p className="state error">{error}</p>}
          <div className="form-actions">
            <button
              type="button"
              className="detail-button neutral-button"
              onClick={() => setEdit(false)}
            >
              Batal
            </button>
            <button type="submit" className="primary-button">
              Simpan perubahan
            </button>
          </div>
        </form>
      ) : (
        <>
          <section className="student-card">
            <div className="profile-grid">
              <div>
                <span className="section-kicker">IDENTITAS SISWA</span>
                <p>
                  <span>Gender</span>
                  <b>:</b>
                  <strong>
                    {student.gender === 'male' ? 'Laki-laki' : 'Perempuan'}
                  </strong>
                </p>
                <p>
                  <span>Tempat lahir</span>
                  <b>:</b>
                  <strong>{student.birth_place || 'Belum diisi'}</strong>
                </p>
                <p>
                  <span>Tanggal lahir</span>
                  <b>:</b>
                  <strong>
                    {student.birth_date
                      ? new Date(student.birth_date).toLocaleDateString('id-ID')
                      : 'Belum diisi'}
                  </strong>
                </p>
                <p>
                  <span>NIK</span>
                  <b>:</b>
                  <strong>{student.nik || 'Belum diisi'}</strong>
                </p>
              </div>
              <div>
                <span className="section-kicker">KONTAK</span>
                <p>
                  <span>Email</span>
                  <b>:</b>
                  <strong>{student.email || 'Belum diisi'}</strong>
                </p>
                <p>
                  <span>Telepon</span>
                  <b>:</b>
                  <strong>{student.phone || 'Belum diisi'}</strong>
                </p>
                <p>
                  <span>WhatsApp</span>
                  <b>:</b>
                  <strong>{student.whatsapp || 'Belum diisi'}</strong>
                </p>
                <span
                  className={`status status-${student.status} profile-status`}
                >
                  {student.status}
                </span>
              </div>
            </div>
            <hr />
            <div className="profile-grid">
              <div>
                <span className="section-kicker">PROGRAM AKTIF</span>
                <p
                  className={`active-program-name${
                    student.active_program?.program_name ? '' : ' is-empty'
                  }`}
                >
                  <strong>
                    {student.active_program?.program_name ||
                      'Belum ada program aktif'}
                  </strong>
                </p>
                <div className="program-summary">
                  <p>
                    <span>Kelas</span>
                    <b>:</b>
                    <strong>
                      {student.active_program?.class_name || 'Belum tersedia'}
                    </strong>
                  </p>
                  <p>
                    <span>Tahun ajaran</span>
                    <b>:</b>
                    <strong>
                      {student.active_program?.academic_year ||
                        'Belum tersedia'}
                    </strong>
                  </p>
                </div>
              </div>
            </div>
          </section>
          <section className="student-card">
            <div className="profile-grid">
              <div>
                <span className="section-kicker">PROGRAM HISTORY</span>
                <h2>Perjalanan pendidikan</h2>
              </div>
              <div className="form-actions">
                <button
                  className="detail-button"
                  onClick={() =>
                    router.push(`/program-history?student_id=${id}`)
                  }
                >
                  Lihat semua
                </button>
                <button
                  className="primary-button"
                  onClick={() =>
                    router.push(`/program-history?student_id=${id}`)
                  }
                >
                  Kelola program
                </button>
              </div>
            </div>
            {history.length === 0 ? (
              <p className="muted">Belum ada riwayat program.</p>
            ) : (
              <div className="timeline">
                {history.map((row) => (
                  <article className="timeline-item" key={row.history_id}>
                    <div className="timeline-dot" />
                    <div>
                      <p className="eyebrow">{row.academic_year}</p>
                      <h3>
                        {row.program_name}
                        {row.class_name ? ` — ${row.class_name}` : ''}
                      </h3>
                      <span className={`status-badge status-${row.status}`}>
                        {row.status}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
