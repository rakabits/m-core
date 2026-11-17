'use client';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

type Parent = { id?: string; role?: string; fullName: string; nik?: string | null; phone?: string | null; education?: string | null; educationOther?: string | null; occupation?: string | null; occupationOther?: string | null; monthlyIncome?: number | null; relationship?: string | null };
type Guardian = { guardianIsDifferent: boolean; guardianSource: 'father' | 'mother' | 'other'; otherParent?: Parent | null };
type Student = {
  student_id: string; student_number?: string; mts_student_id?: string | null; alumni_destination?: { status?: string | null; name?: string | null; program?: string | null; city?: string | null; year?: number | null }; ma_student_id?: string | null; photo_url?: string | null; full_name: string; gender: string; birth_place?: string | null; birth_date?: string | null; status: string; email?: string | null; nik?: string | null; nisn?: string | null; family_card_number?: string | null; passport_number?: string | null; phone?: string | null; whatsapp?: string | null; telegram_username?: string | null; address?: { line?: string | null; rt?: string | null; rw?: string | null; village?: string | null; district?: string | null; city_regency?: string | null; province?: string | null; postal_code?: string | null }; physical?: { height_cm?: number | string | null; weight_kg?: number | string | null; sibling_count?: number | null; birth_order?: number | null }; education_histories?: Array<{ id: string; level: string; institutionName: string; cityRegency?: string | null; province?: string | null; graduationYear?: number | null; degreeLevel?: string | null }>; parents?: Parent[]; guardian?: Guardian | null;
  active_program?: { program_id?: string; program_name: string; class_name?: string | null; academic_year?: string | null } | null;
  program_histories?: Array<{ id: string; academicYear: string; level?: string | null; className?: string | null; status: string; program: { programName: string; programCode?: string; academicLevel?: string | null }; class?: { name: string; code?: string; homeRoomTeacher?: { displayName: string } | null } | null }>;
};

async function loadAcademicClasses(programId: string, academicYear: string) {
  const response = await fetch(`/api/v1/academic-classes?programId=${encodeURIComponent(programId)}&academicYear=${encodeURIComponent(academicYear)}`);
  const payload = await parseResponse<{ data?: Array<{ id: string; code: string; name: string; grade?: number }> }>(response);
  if (!response.ok) throw new Error('Gagal memuat kelas dari Academic Center');
  return payload.data || [];
}

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
  const [student, setStudent] = useState<Student | null>(null);
  const [edit, setEdit] = useState(false);
  const [pendingPhoto, setPendingPhoto] = useState<File | null>(null);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Student>>({});
  const [parents, setParents] = useState<{ father: Parent; mother: Parent; other: Parent }>({ father: { fullName: '' }, mother: { fullName: '' }, other: { fullName: '' } });
  const [guardian, setGuardian] = useState<Guardian>({ guardianIsDifferent: false, guardianSource: 'father' });
  const [showClassModal, setShowClassModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [academicClasses, setAcademicClasses] = useState<Array<{ id: string; code: string; name: string; grade?: number }>>([]);
  const [classesLoading, setClassesLoading] = useState(false);
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
    fetch(`/api/v1/students/${id}`)
      .then(async (studentResponse) => {
        const studentJson = await parseResponse<{
          data: Student;
          error?: { code?: string };
        }>(studentResponse);
        if (!studentResponse.ok)
          throw new Error(studentJson.error?.code || 'Gagal memuat siswa');
        setStudent(studentJson.data);
        setForm({ ...studentJson.data, birth_date: studentJson.data.birth_date ? new Date(studentJson.data.birth_date).toISOString().slice(0, 10) : '' });
        const parentRows = studentJson.data.parents || [];
        setParents({ father: parentRows.find((row) => row.role === 'father') || { fullName: '' }, mother: parentRows.find((row) => row.role === 'mother') || { fullName: '' }, other: parentRows.find((row) => row.role === 'other') || { fullName: '' } });
        setGuardian(studentJson.data.guardian || { guardianIsDifferent: false, guardianSource: 'father' });
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Gagal memuat siswa'))
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
        alumniDestinationStatus: form.alumni_destination?.status || null,
        alumniDestinationName: form.alumni_destination?.name || null,
        alumniDestinationProgram: form.alumni_destination?.program || null,
        alumniDestinationCity: form.alumni_destination?.city || null,
        alumniDestinationYear: form.alumni_destination?.year || null,
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
        <div className="state">Memuat profil siswa...</div>
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
      <button className="detail-button" onClick={() => window.history.back()}>
        Kembali
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
          <div className="student-id-status-row">
            <p className="subtitle student-id-highlight">
              Student ID: {student.student_number || student.student_id}
            </p>
            <span className={`status status-${student.status} profile-header-status`}>{student.status}</span>
          </div>
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
                <option value="pending_review">Perlu ditinjau</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="alumni">Alumni</option>
              </select>
            </label>
            {form.status === 'alumni' && <>
              <label>Status tujuan alumni<select value={form.alumni_destination?.status || ''} onChange={e => setForm({ ...form, alumni_destination: { ...form.alumni_destination, status: e.target.value } })}><option value="">Belum diketahui</option><option value="education">Melanjutkan pendidikan</option><option value="work">Bekerja</option><option value="entrepreneur">Wirausaha</option><option value="not_continuing">Tidak melanjutkan</option></select></label>
              <label>Nama institusi / perusahaan<input value={form.alumni_destination?.name || ''} onChange={e => setForm({ ...form, alumni_destination: { ...form.alumni_destination, name: e.target.value } })} /></label>
              <label>Program studi / pekerjaan<input value={form.alumni_destination?.program || ''} onChange={e => setForm({ ...form, alumni_destination: { ...form.alumni_destination, program: e.target.value } })} /></label>
              <label>Kota<input value={form.alumni_destination?.city || ''} onChange={e => setForm({ ...form, alumni_destination: { ...form.alumni_destination, city: e.target.value } })} /></label>
              <label>Tahun mulai<input type="number" min="1900" max="2200" value={form.alumni_destination?.year || ''} onChange={e => setForm({ ...form, alumni_destination: { ...form.alumni_destination, year: e.target.value ? Number(e.target.value) : null } })} /></label>
            </>}
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
                {([['Student Number', student.student_number], ['ID Siswa MTs', student.mts_student_id], ['ID Siswa MA', student.ma_student_id], ['Nama lengkap', student.full_name], ['Jenis kelamin', student.gender === 'male' ? 'Laki-laki' : 'Perempuan'], ['Tempat lahir', student.birth_place], ['Tanggal lahir', student.birth_date ? new Date(student.birth_date).toLocaleDateString('id-ID') : null], ['NIK', student.nik], ['NISN', student.nisn], ['Nomor KK', student.family_card_number], ['Nomor paspor', student.passport_number], ['Status', student.status]] as const).map(([label, value]) => <p key={label}><span>{label}</span><b>:</b><strong>{value || 'Belum diisi'}</strong></p>)}
              </div>
              <div>
                <span className="section-kicker">KONTAK</span>
                {([['Email', student.email], ['Nomor telepon', student.phone], ['WhatsApp', student.whatsapp], ['Username Telegram', student.telegram_username]] as const).map(([label, value]) => <p key={label}><span>{label}</span><b>:</b><strong>{value || 'Belum diisi'}</strong></p>)}
                <span className={`status status-${student.status} profile-status contact-status-legacy`}>{student.status}</span>
              </div>
            </div>
            <hr />
            <div className="profile-grid">
              <div><span className="section-kicker">ALAMAT SISWA</span>{([['Alamat lengkap', student.address?.line], ['RT / RW', student.address ? `${student.address.rt || 'Ã¢â‚¬â€'} / ${student.address.rw || 'Ã¢â‚¬â€'}` : null], ['Desa/Kelurahan', student.address?.village], ['Kecamatan', student.address?.district], ['Kota/Kabupaten', student.address?.city_regency], ['Provinsi', student.address?.province], ['Kode Pos', student.address?.postal_code]] as const).map(([label, value]) => <p key={label}><span>{label}</span><b>:</b><strong>{value || 'Belum diisi'}</strong></p>)}</div>
              <div><span className="section-kicker">DATA FISIK</span>{([['Tinggi badan', student.physical?.height_cm ? `${student.physical.height_cm} cm` : null], ['Berat badan', student.physical?.weight_kg ? `${student.physical.weight_kg} kg` : null], ['Jumlah saudara', student.physical?.sibling_count], ['Anak ke-', student.physical?.birth_order]] as const).map(([label, value]) => <p key={label}><span>{label}</span><b>:</b><strong>{value ?? 'Belum diisi'}</strong></p>)}</div>
            </div>
            <hr />
            <div className="profile-grid">
              <div><span className="section-kicker">DATA ORANG TUA / WALI</span>{(student.parents || []).map((parent) => <div key={parent.id || parent.role} className="parent-summary"><h3>{parent.role === 'father' ? 'Ayah' : parent.role === 'mother' ? 'Ibu' : 'Wali'} Ã¢â‚¬â€ {parent.fullName}</h3>{parent.role === 'other' && <p><span>Hubungan dengan siswa</span><b>:</b><strong>{parent.relationship || 'Belum diisi'}</strong></p>}<p><span>NIK</span><b>:</b><strong>{parent.nik || 'Belum diisi'}</strong></p><p><span>Telepon</span><b>:</b><strong>{parent.phone || 'Belum diisi'}</strong></p><p><span>Pendidikan</span><b>:</b><strong>{parent.educationOther || parent.education || 'Belum diisi'}</strong></p><p><span>Pekerjaan</span><b>:</b><strong>{parent.occupationOther || parent.occupation || 'Belum diisi'}</strong></p><p><span>Penghasilan</span><b>:</b><strong>{parent.monthlyIncome != null ? `Rp ${parent.monthlyIncome.toLocaleString('id-ID')}` : 'Belum diisi'}</strong></p></div>)}</div>
              <div><span className="section-kicker">RIWAYAT PENDIDIKAN</span>{student.education_histories?.length ? student.education_histories.map((education) => { const educationLevelLabels: Record<string, string> = { elementary: 'SD', junior_high: 'SMP', senior_high: 'SMA', university: 'Universitas', university_s1: 'S1', university_s2: 'S2', university_s3: 'S3' }; const normalizedLevel = education.level.toLowerCase(); const degreeLabel = education.degreeLevel?.trim().toUpperCase(); const educationLevel = normalizedLevel === 'university' && ['S1', 'S2', 'S3'].includes(degreeLabel || '') ? degreeLabel : educationLevelLabels[normalizedLevel] || education.level; const isMajorLevel = ['senior_high', 'university', 'university_s1', 'university_s2', 'university_s3', 'sma', 's1', 's2', 's3'].includes(normalizedLevel); return <div className="parent-summary" key={education.id}><h3>{educationLevel}</h3><p><span>Institusi</span><b>:</b><strong>{education.institutionName}</strong></p><p><span>Kota / Provinsi</span><b>:</b><strong>{[education.cityRegency, education.province].filter(Boolean).join(' / ') || 'Belum diisi'}</strong></p>{isMajorLevel && <p><span>Jurusan</span><b>:</b><strong>{education.degreeLevel || 'Belum diisi'}</strong></p>}<p><span>Tahun</span><b>:</b><strong>{education.graduationYear || 'Belum diisi'}</strong></p></div>; }) : <p className="muted">Belum ada riwayat pendidikan.</p>}</div>
            </div>
            <hr />
            <div className="profile-grid">
              <div><span className="section-kicker">RIWAYAT PROGRAM</span>{student.program_histories?.length ? student.program_histories.map((history) => <article className="parent-summary" key={history.id}><p><span>Tahun Ajaran</span><b>:</b><strong>{history.academicYear}</strong></p><p><span>Program</span><b>:</b><strong>{history.program.programName}</strong></p>{history.program.academicLevel === 'PRE_UNIVERSITY' ? <><p><span>Kampus</span><b>:</b><strong>Data menyusul</strong></p><p><span>Jurusan</span><b>:</b><strong>Data menyusul</strong></p></> : <><p><span>Kelas</span><b>:</b><strong>{history.class?.name ?? history.className ?? 'Belum tersedia'}</strong></p><p><span>Wali Kelas</span><b>:</b><strong>{history.class?.homeRoomTeacher?.displayName ?? 'Belum tersedia'}</strong></p></>}</article>) : <p className="muted">Belum ada riwayat program.</p>}</div>
            </div>
          </section>{showClassModal && <div className="class-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowClassModal(false); }}><section className="class-modal" role="dialog" aria-modal="true" aria-labelledby="class-modal-title"><div className="class-modal-header"><div><span className="section-kicker">PROGRAM CATALOG</span><h2 id="class-modal-title">Pilih kelas aktif</h2><p>Tahun ajaran dan program mengikuti data pada profil siswa.</p></div><button type="button" className="class-modal-close" aria-label="Tutup" onClick={() => setShowClassModal(false)}>Ãƒâ€”</button></div><div className="class-modal-form"><label>Kelas<select value={selectedClass} onChange={(event) => setSelectedClass(event.target.value)}><option value="">Pilih kelas dari Program Catalog</option>{classesLoading ? <option value="">Memuat kelas...</option> : academicClasses.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}</select></label></div><div className="class-modal-actions"><button type="button" className="detail-button" onClick={() => setShowClassModal(false)}>Batal</button><button type="button" className="primary-button" disabled={!selectedClass} onClick={() => setShowClassModal(false)}>Simpan kelas</button></div></section></div>}</>
      )}
    </main>
  );
}
