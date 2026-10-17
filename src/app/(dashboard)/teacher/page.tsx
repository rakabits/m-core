'use client';
import { useEffect, useState } from 'react';

type Teacher = { id: string; displayName: string; employeeCode: string | null; isActive: boolean };

type Form = {
  // A. Profil Guru
  employeeCode: string;
  displayName: string;
  gender: string;
  birthPlace: string;
  birthDate: string;
  nik: string;
  familyCardNumber: string;
  email: string;
  phone: string;
  whatsapp: string;
  maritalStatus: string;
  childrenCount: string;
  status: string;
  // B. Alamat
  address: string;
  village: string;
  rt: string;
  rw: string;
  district: string;
  city: string;
  province: string;
  postalCode: string;
  // C. Kepegawaian
  employmentStatus: string;
  employmentStartedAt: string;
  assignments: Array<{
    unit: string;
    position: string;
    startedAt: string;
    endedAt: string;
    notes: string;
    documentFileName: string;
    documentFileUrl?: string;
  }>;
  // D. Pendidikan
  educations: Array<{
    level: string;
    institutionName: string;
    studyProgram: string;
    institutionCity: string;
    startedYear: string;
    graduatedYear: string;
    status: string;
    notes: string;
    certificateFileName: string;
    certificateFileUrl?: string;
  }>;
  // E. Pasangan
  spouseIsStaff: string;
  spousePartnerId: string;
  spouseRelationship: string;
  spouseManualName: string;
  // F. Keluarga
  fatherName: string;
  motherName: string;
  motherNik: string;
  motherPhone: string;
  // G. Dokumen
  ktpFile: string;
  ktpFileUrl?: string;
  kkFile: string;
  kkFileUrl?: string;
  employmentDocFile: string;
  employmentDocFileUrl?: string;
  otherDocFile: string;
  otherDocFileUrl?: string;
};

const empty: Form = {
  employeeCode: '', displayName: '', gender: 'MALE', birthPlace: '', birthDate: '', nik: '', familyCardNumber: '',
  email: '', phone: '', whatsapp: '', maritalStatus: 'SINGLE', childrenCount: '0', status: 'ACTIVE',
  address: '', village: '', rt: '', rw: '', district: '', city: '', province: '', postalCode: '',
  employmentStatus: 'PERMANENT', employmentStartedAt: '',
  assignments: [
    { unit: '', position: '', startedAt: '', endedAt: '', notes: '', documentFileName: '' }
  ],
  educations: [
    { level: 'S1', institutionName: '', studyProgram: '', institutionCity: '', startedYear: '', graduatedYear: '', status: 'GRADUATED', notes: '', certificateFileName: '' }
  ],
  spouseIsStaff: 'false', spousePartnerId: '', spouseRelationship: 'HUSBAND', spouseManualName: '',
  fatherName: '', motherName: '', motherNik: '', motherPhone: '',
  ktpFile: '', kkFile: '', employmentDocFile: '', otherDocFile: ''
};

const steps = [
  'A. Profil Guru',
  'B. Alamat',
  'C. Kepegawaian',
  'D. Pendidikan',
  'E. Pasangan',
  'F. Keluarga',
  'G. Dokumen'
];

export default function MasterTeacherPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>(empty);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // File upload state for Cloudinary
  const [uploadFiles, setUploadFiles] = useState<{
    ktp?: File | null;
    kk?: File | null;
    employmentDoc?: File | null;
    otherDoc?: File | null;
    assignments?: { [idx: number]: File };
    educations?: { [idx: number]: File };
  }>({});

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/teachers', { cache: 'no-store' });
      const json = await res.json();
      if (json.success) setTeachers(json.data ?? []);
    } catch {
      setError('Gagal memuat data guru.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        displayName: form.displayName,
        employeeCode: form.employeeCode || undefined,
        isActive: form.status === 'ACTIVE',
        profile: {
          gender: form.gender,
          birthPlace: form.birthPlace,
          birthDate: form.birthDate,
          nik: form.nik,
          familyCardNumber: form.familyCardNumber,
          email: form.email,
          phone: form.phone,
          whatsapp: form.whatsapp,
          maritalStatus: form.maritalStatus,
          childrenCount: Number(form.childrenCount) || 0,
          status: form.status
        },
        address: {
          address: form.address,
          village: form.village,
          rt: form.rt,
          rw: form.rw,
          district: form.district,
          city: form.city,
          province: form.province,
          postalCode: form.postalCode
        },
        employment: {
          employmentStatus: form.employmentStatus,
          employmentStartedAt: form.employmentStartedAt,
          status: form.status
        }
      };

      const res = await fetch('/api/v1/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const body = await res.json();
      if (!res.ok || !body.success) throw new Error(body.error?.message ?? 'Gagal menyimpan profil guru.');
      const teacherId = body.data.id;

      // Helper upload ke Cloudinary dengan folder kategori
      const uploadToCloudinary = async (file: File, type: string) => {
        const data = new FormData();
        data.append('file', file);
        data.append('type', type);
        data.append('teacherId', teacherId);
        const uploadRes = await fetch('/api/v1/teachers/documents/upload', {
          method: 'POST',
          body: data
        });
        const uploadJson = await uploadRes.json();
        if (uploadJson.success && uploadJson.data?.fileUrl) {
          // Rekam metadata dokumen ke database Supabase
          await fetch(`/api/v1/teachers/${teacherId}/documents`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: type === 'ASSIGNMENT' ? 'EMPLOYMENT' : type,
              title: file.name,
              fileUrl: uploadJson.data.fileUrl
            })
          });
          return uploadJson.data.fileUrl as string;
        }
        return null;
      };

      // C. Assignment/Jabatan (Multi-unit) & Upload Surat Tugas
      for (let i = 0; i < form.assignments.length; i++) {
        const item = form.assignments[i];
        if (item.unit && item.position) {
          let docUrl = item.documentFileUrl || null;
          const assignedFile = uploadFiles.assignments?.[i];
          if (assignedFile) {
            docUrl = await uploadToCloudinary(assignedFile, 'ASSIGNMENT');
          }

          const assignmentResponse = await fetch(`/api/v1/teachers/${teacherId}/assignments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              unit: item.unit,
              position: item.position,
              startedAt: item.startedAt || new Date().toISOString().slice(0, 10),
              endedAt: item.endedAt || null,
              notes: item.notes || null
            })
          });
          if (!assignmentResponse.ok) throw new Error('Gagal menyimpan unit atau jabatan guru.');

          if (docUrl && !assignedFile) {
            await fetch(`/api/v1/teachers/${teacherId}/documents`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ type: 'EMPLOYMENT', title: item.documentFileName || 'Surat Tugas / SK Jabatan', fileUrl: docUrl })
            });
          }
        }
      }

      // D. Riwayat Pendidikan (Multi-jenjang) & Upload Ijazah
      const edus = form.educations ?? [];
      for (let i = 0; i < edus.length; i++) {
        const edu = edus[i];
        if (edu.institutionName) {
          let certUrl = edu.certificateFileUrl || null;
          const certFile = uploadFiles.educations?.[i];
          if (certFile) {
            certUrl = await uploadToCloudinary(certFile, 'DIPLOMA');
          }

          const educationResponse = await fetch(`/api/v1/teachers/${teacherId}/education`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              level: edu.level,
              institutionName: edu.institutionName,
              studyProgram: edu.studyProgram || null,
              city: edu.institutionCity || null,
              startedYear: edu.startedYear ? Number(edu.startedYear) : null,
              graduatedYear: edu.graduatedYear ? Number(edu.graduatedYear) : null,
              status: edu.status || 'GRADUATED',
              notes: edu.notes || null
            })
          });
          if (!educationResponse.ok) throw new Error('Gagal menyimpan riwayat pendidikan guru.');

          if (certUrl && !certFile) {
            await fetch(`/api/v1/teachers/${teacherId}/documents`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ type: 'DIPLOMA', title: edu.certificateFileName || 'Ijazah / Sertifikat', fileUrl: certUrl })
            });
          }
        }
      }

      // G. Dokumen Identitas & Kepegawaian ke Cloudinary
      if (uploadFiles.ktp) await uploadToCloudinary(uploadFiles.ktp, 'ID_CARD');
      if (uploadFiles.kk) await uploadToCloudinary(uploadFiles.kk, 'FAMILY_CARD');
      if (uploadFiles.employmentDoc) await uploadToCloudinary(uploadFiles.employmentDoc, 'EMPLOYMENT');
      if (uploadFiles.otherDoc) await uploadToCloudinary(uploadFiles.otherDoc, 'OTHER');

      // E. Data Pasangan
      if (form.maritalStatus === 'MARRIED') {
        const isMumtazaStaff = form.spouseIsStaff === 'true';
        await fetch(`/api/v1/teachers/${teacherId}/spouse`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            relationship: form.spouseRelationship || 'SPOUSE',
            isMumtazaStaff,
            partnerTeacherId: isMumtazaStaff ? (form.spousePartnerId || null) : null,
            manualName: isMumtazaStaff ? null : (form.spouseManualName || null)
          })
        });
      }

      // F. Data Keluarga
      if (form.fatherName) {
        await fetch(`/api/v1/teachers/${teacherId}/family`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ relation: 'FATHER', fullName: form.fatherName })
        });
      }
      if (form.motherName) {
        await fetch(`/api/v1/teachers/${teacherId}/family`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ relation: 'MOTHER', fullName: form.motherName })
        });
      }

      setOpen(false);
      setForm(empty);
      setUploadFiles({});
      setStep(0);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan guru.');
    } finally {
      setSaving(false);
    }
  };

  const filtered = teachers.filter((t) => {
    const q = search.toLowerCase();
    const matchSearch = !q || t.displayName.toLowerCase().includes(q) || (t.employeeCode ?? '').toLowerCase().includes(q);
    const matchStatus = statusFilter === 'ALL' || (statusFilter === 'ACTIVE' ? t.isActive : !t.isActive);
    return matchSearch && matchStatus;
  });

  const activeCount = teachers.filter((t) => t.isActive).length;
  const inactiveCount = teachers.length - activeCount;

  return (
    <main className="students-page teacher-page">
      <header className="students-header directory-header teacher-header">
        <div>
          <p className="eyebrow">M-CORE / MANAGEMENT</p>
          <h1>Master Teacher</h1>
          <p className="subtitle">Kelola direktori guru, data profil, kepegawaian, dan dokumen pengajar.</p>
        </div>
        <button
          className="primary-button"
          type="button"
          onClick={() => {
            setForm(empty);
            setStep(0);
            setError('');
            setOpen(true);
          }}
        >
          + Guru baru
        </button>
      </header>

      {error && <div className="state error">{error}</div>}

      {/* ── STATS CARDS ── */}
      <section className="teacher-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <article className="teacher-stat-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px 20px', borderRadius: '16px', background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(15,23,42,0.04)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#e6fffa', color: '#0ea5a4', display: 'grid', placeItems: 'center', fontSize: '22px', fontWeight: '800' }}>
            👥
          </div>
          <div>
            <small style={{ color: '#64748b', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Teacher</small>
            <strong style={{ display: 'block', fontSize: '26px', color: '#0f172a', fontWeight: '800', lineHeight: 1.2 }}>{teachers.length}</strong>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>Terdaftar di sistem</span>
          </div>
        </article>

        <article className="teacher-stat-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px 20px', borderRadius: '16px', background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(15,23,42,0.04)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#ecfdf5', color: '#10b981', display: 'grid', placeItems: 'center', fontSize: '22px', fontWeight: '800' }}>
            ✓
          </div>
          <div>
            <small style={{ color: '#64748b', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Guru Aktif</small>
            <strong style={{ display: 'block', fontSize: '26px', color: '#0f172a', fontWeight: '800', lineHeight: 1.2 }}>{activeCount}</strong>
            <span style={{ fontSize: '11px', color: '#10b981', fontWeight: '600' }}>Siap mengajar</span>
          </div>
        </article>

        <article className="teacher-stat-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px 20px', borderRadius: '16px', background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(15,23,42,0.04)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f8fafc', color: '#94a3b8', display: 'grid', placeItems: 'center', fontSize: '22px', fontWeight: '800' }}>
            ⏸
          </div>
          <div>
            <small style={{ color: '#64748b', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nonaktif / Cuti</small>
            <strong style={{ display: 'block', fontSize: '26px', color: '#0f172a', fontWeight: '800', lineHeight: 1.2 }}>{inactiveCount}</strong>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>Tidak aktif mengajar</span>
          </div>
        </article>
      </section>

      {/* ── TOOLBAR: SEARCH & FILTER ── */}
      <section className="teacher-toolbar" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '8px', background: '#fff', padding: '4px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                background: statusFilter === st ? '#0ea5a4' : 'transparent',
                color: statusFilter === st ? '#fff' : '#64748b',
                fontWeight: statusFilter === st ? '700' : '500',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              {st === 'ALL' ? 'Semua' : st === 'ACTIVE' ? 'Aktif' : 'Nonaktif'}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', minWidth: '280px', flex: '1', maxWidth: '420px' }}>
          <input
            type="search"
            placeholder="Cari nama atau kode guru..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 36px',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              background: '#fff',
              fontSize: '13px',
              outline: 'none'
            }}
          />
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '14px' }}>
            ⌕
          </span>
        </div>
      </section>

      {/* ── DIRECTORY CARD ── */}
      <section className="student-card teacher-directory-card" style={{ borderRadius: '18px', padding: '24px', background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(15,23,42,0.03)' }}>
        <div className="card-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <span className="section-kicker" style={{ fontSize: '11px', color: '#0ea5a4', fontWeight: '800', letterSpacing: '0.08em' }}>TEACHER DIRECTORY</span>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: '4px 0 0 0' }}>Daftar Teacher</h2>
          </div>
          <span className="count-pill" style={{ background: '#f1f5f9', padding: '6px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: '700', color: '#475569' }}>
            {filtered.length} guru
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
            <span style={{ display: 'block', fontSize: '32px', marginBottom: '12px' }}>⏳</span>
            <strong style={{ fontSize: '15px' }}>Memuat direktori guru...</strong>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#f8fafc', borderRadius: '14px', border: '1px dashed #cbd5e1', margin: '10px 0' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: '#ecfdf5', color: '#0ea5a4', display: 'grid', placeItems: 'center', fontSize: '28px', margin: '0 auto 16px auto' }}>
              👨‍🏫
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0' }}>
              {search ? 'Tidak ada guru yang cocok' : 'Belum Ada Data Guru'}
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', maxWidth: '420px', margin: '0 auto 20px auto' }}>
              {search
                ? `Tidak ditemukan guru dengan pencarian "${search}". Silakan coba kata kunci lain.`
                : 'Mulai dengan menambahkan data guru baru untuk melengkapi direktori Master Teacher di sistem M-CORE.'}
            </p>
            {!search && (
              <button
                type="button"
                className="primary-button"
                style={{ padding: '10px 20px', borderRadius: '10px' }}
                onClick={() => {
                  setForm(empty);
                  setStep(0);
                  setError('');
                  setOpen(true);
                }}
              >
                + Tambah Guru Sekarang
              </button>
            )}
          </div>
        ) : (
          <div className="teacher-list" style={{ display: 'grid', gap: '8px' }}>
            {filtered.map((t) => (
              <article
                className="teacher-row"
                key={t.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border: '1px solid #f1f5f9',
                  background: '#fcfdfd',
                  transition: 'background 0.15s ease'
                }}
              >
                <div
                  className="teacher-avatar"
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: '#e6fffa',
                    color: '#0ea5a4',
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: '800',
                    fontSize: '14px',
                    flexShrink: 0
                  }}
                >
                  {t.displayName.slice(0, 2).toUpperCase()}
                </div>
                <div className="teacher-info" style={{ flex: '1', minWidth: 0 }}>
                  <strong style={{ fontSize: '14px', color: '#0f172a', display: 'block' }}>{t.displayName}</strong>
                  <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginTop: '2px' }}>
                    {t.employeeCode ?? 'Kode belum diisi'}
                  </span>
                </div>
                <span
                  className={`status ${t.isActive ? 'status-active' : 'status-inactive'}`}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '999px',
                    fontSize: '11px',
                    fontWeight: '700',
                    background: t.isActive ? '#ecfdf5' : '#f1f5f9',
                    color: t.isActive ? '#059669' : '#64748b'
                  }}
                >
                  {t.isActive ? 'Aktif' : 'Nonaktif'}
                </span>
              </article>
            ))}
          </div>
        )}
      </section>

      {open && (
        <div className="teacher-modal" role="presentation" style={{ overflowY: 'auto', padding: '20px' }}>
          <form
            className="teacher-dialog teacher-form"
            onSubmit={save}
            style={{
              maxWidth: '820px',
              width: '100%',
              maxHeight: 'calc(100vh - 40px)',
              display: 'flex',
              flexDirection: 'column',
              padding: '28px 32px',
              boxSizing: 'border-box',
              overflow: 'hidden'
            }}
          >
            <button type="button" className="teacher-close" onClick={() => setOpen(false)}>
              ×
            </button>
            <div style={{ flexShrink: 0 }}>
              <p className="eyebrow">FORM MASTER TEACHER</p>
              <h2 style={{ margin: '4px 0 16px 0', fontSize: '24px' }}>Tambah Teacher</h2>

              {/* Stepper Navigation */}
              <nav
                className="teacher-form-stepper"
                style={{
                  display: 'flex',
                  gap: '8px',
                  flexWrap: 'wrap',
                  margin: '0 0 18px 0',
                  padding: '6px',
                  background: '#f1f5f9',
                  borderRadius: '12px'
                }}
              >
                {steps.map((label, idx) => (
                  <button
                    type="button"
                    key={label}
                    className={step === idx ? 'active' : ''}
                    onClick={() => setStep(idx)}
                    style={{
                      padding: '8px 14px',
                      fontSize: '12px',
                      borderRadius: '8px',
                      border: 'none',
                      background: step === idx ? '#0ea5a4' : 'transparent',
                      color: step === idx ? '#ffffff' : '#64748b',
                      cursor: 'pointer',
                      fontWeight: step === idx ? '700' : '500',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {label}
                  </button>
                ))}
              </nav>
            </div>

            <div
              className="teacher-form-grid"
              style={{
                flex: '1 1 auto',
                overflowY: 'auto',
                paddingRight: '6px',
                paddingBottom: '10px'
              }}
            >
              {/* A. Data Profil Guru */}
              {step === 0 && (
                <>
                  <label>
                    <span>Nama Lengkap *</span>
                    <input
                      required
                      placeholder="Sesuai identitas resmi"
                      value={form.displayName}
                      onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                    />
                  </label>
                  <label>
                    <span>Jenis Kelamin</span>
                    <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                      <option value="MALE">Laki-laki</option>
                      <option value="FEMALE">Perempuan</option>
                    </select>
                  </label>
                  <label>
                    <span>Tempat Lahir</span>
                    <input
                      placeholder="Kota/Tempat kelahiran"
                      value={form.birthPlace}
                      onChange={(e) => setForm({ ...form, birthPlace: e.target.value })}
                    />
                  </label>
                  <label>
                    <span>Tanggal Lahir</span>
                    <input
                      type="date"
                      value={form.birthDate}
                      onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
                    />
                  </label>
                  <label>
                    <span>NIK</span>
                    <input
                      placeholder="16 digit NIK"
                      value={form.nik}
                      onChange={(e) => setForm({ ...form, nik: e.target.value })}
                    />
                  </label>
                  <label>
                    <span>Nomor KK</span>
                    <input
                      placeholder="Nomor Kartu Keluarga"
                      value={form.familyCardNumber}
                      onChange={(e) => setForm({ ...form, familyCardNumber: e.target.value })}
                    />
                  </label>
                  <label>
                    <span>Email Aktif</span>
                    <input
                      type="email"
                      placeholder="contoh@mumtaza.sch.id"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </label>
                  <label>
                    <span>Nomor HP</span>
                    <input
                      placeholder="08xxxxxxxxxx"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </label>
                  <label>
                    <span>Nomor WhatsApp</span>
                    <input
                      placeholder="Jika berbeda dari Nomor HP"
                      value={form.whatsapp}
                      onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                    />
                  </label>
                  <label>
                    <span>Status Pernikahan</span>
                    <select
                      value={form.maritalStatus}
                      onChange={(e) => setForm({ ...form, maritalStatus: e.target.value })}
                    >
                      <option value="SINGLE">Belum Menikah</option>
                      <option value="MARRIED">Menikah</option>
                      <option value="DIVORCED">Cerai</option>
                    </select>
                  </label>
                  {form.maritalStatus === 'MARRIED' && (
                    <label>
                      <span>Jumlah Anak</span>
                      <input
                        type="number"
                        min="0"
                        value={form.childrenCount}
                        onChange={(e) => setForm({ ...form, childrenCount: e.target.value })}
                      />
                    </label>
                  )}
                  <label>
                    <span>Status Guru</span>
                    <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                      <option value="ACTIVE">Aktif</option>
                      <option value="INACTIVE">Nonaktif</option>
                      <option value="ON_LEAVE">Cuti</option>
                      <option value="RETIRED">Pensiun</option>
                    </select>
                  </label>
                </>
              )}

              {/* B. Data Alamat */}
              {step === 1 && (
                <>
                  <label style={{ gridColumn: '1 / -1' }}>
                    <span>Alamat Lengkap</span>
                    <input
                      placeholder="Nama jalan, nomor rumah, perumahan"
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                    />
                  </label>
                  <label>
                    <span>Desa/Kelurahan</span>
                    <input value={form.village} onChange={(e) => setForm({ ...form, village: e.target.value })} />
                  </label>
                  <label>
                    <span>RT (Opsional)</span>
                    <input placeholder="Contoh: 003" value={form.rt} onChange={(e) => setForm({ ...form, rt: e.target.value })} />
                  </label>
                  <label>
                    <span>RW (Opsional)</span>
                    <input placeholder="Contoh: 005" value={form.rw} onChange={(e) => setForm({ ...form, rw: e.target.value })} />
                  </label>
                  <label>
                    <span>Kecamatan</span>
                    <input value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} />
                  </label>
                  <label>
                    <span>Kota/Kabupaten</span>
                    <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                  </label>
                  <label>
                    <span>Provinsi</span>
                    <input value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} />
                  </label>
                  <label>
                    <span>Kode Pos</span>
                    <input placeholder="5 digit kode pos" value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} />
                  </label>
                </>
              )}

              {/* C. Data Kepegawaian */}
              {step === 2 && (
                <>
                  <label>
                    <span>Status Kepegawaian</span>
                    <select
                      value={form.employmentStatus}
                      onChange={(e) => setForm({ ...form, employmentStatus: e.target.value })}
                    >
                      <option value="PERMANENT">Guru Tetap</option>
                      <option value="CONTRACT">Guru Kontrak</option>
                      <option value="HONORARY">Honorer</option>
                      <option value="OTHER">Lainnya</option>
                    </select>
                  </label>
                  <label>
                    <span>Tanggal Mulai Bekerja di Mumtaza</span>
                    <input
                      type="date"
                      value={form.employmentStartedAt}
                      onChange={(e) => setForm({ ...form, employmentStartedAt: e.target.value })}
                    />
                  </label>

                  <div style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>
                        Daftar Unit / Departemen & Jabatan ({(form.assignments ?? []).length})
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setForm({
                            ...form,
                            assignments: [
                              ...(form.assignments ?? []),
                              { unit: '', position: '', startedAt: '', endedAt: '', notes: '', documentFileName: '' }
                            ]
                          })
                        }
                        style={{
                          background: '#ecfdf5',
                          border: '1px solid #a7f3d0',
                          color: '#0ea5a4',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '11px',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        + Tambah Unit/Jabatan
                      </button>
                    </div>

                    <div style={{ display: 'grid', gap: '14px' }}>
                      {(form.assignments && form.assignments.length > 0
                        ? form.assignments
                        : [{ unit: '', position: '', startedAt: '', endedAt: '', notes: '', documentFileName: '' }]
                      ).map((item, aIdx) => {
                        const updateAssignment = (field: string, val: string) => {
                          const current = form.assignments && form.assignments.length > 0
                            ? [...form.assignments]
                            : [{ unit: '', position: '', startedAt: '', endedAt: '', notes: '', documentFileName: '' }];
                          if (!current[aIdx]) return;
                          current[aIdx] = { ...current[aIdx], [field]: val };
                          setForm({ ...form, assignments: current });
                        };

                        return (
                          <div
                            key={aIdx}
                            style={{
                              padding: '16px',
                              background: '#f8fafc',
                              borderRadius: '12px',
                              border: '1px solid #e2e8f0',
                              position: 'relative'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                              <strong style={{ fontSize: '12px', color: '#475569' }}>
                                Unit/Jabatan #{aIdx + 1}
                              </strong>
                              {(form.assignments ?? []).length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = (form.assignments ?? []).filter((_, i) => i !== aIdx);
                                    setForm({ ...form, assignments: updated });
                                  }}
                                  style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#ef4444',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                  }}
                                >
                                  ✕ Hapus
                                </button>
                              )}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                              <label>
                                <span>Unit/Departemen *</span>
                                <input
                                  placeholder="Contoh: SD, SMP, SMA, Pondok"
                                  value={item.unit || ''}
                                  onChange={(e) => updateAssignment('unit', e.target.value)}
                                />
                              </label>
                              <label>
                                <span>Jabatan *</span>
                                <input
                                  placeholder="Contoh: Guru Matematika, Wali Kelas"
                                  value={item.position || ''}
                                  onChange={(e) => updateAssignment('position', e.target.value)}
                                />
                              </label>
                              <label>
                                <span>Tanggal Mulai Jabatan</span>
                                <input
                                  type="date"
                                  value={item.startedAt || ''}
                                  onChange={(e) => updateAssignment('startedAt', e.target.value)}
                                />
                              </label>
                              <label>
                                <span>Tanggal Selesai Jabatan (Opsional)</span>
                                <input
                                  type="date"
                                  value={item.endedAt || ''}
                                  onChange={(e) => updateAssignment('endedAt', e.target.value)}
                                />
                              </label>
                              <label>
                                <span>Upload Surat Tugas / SK Jabatan</span>
                                <input
                                  key={`doc-assignment-${aIdx}`}
                                  type="file"
                                  accept="image/*,application/pdf"
                                  onChange={(e) => {
                                    const selectedFile = e.target.files?.[0] ?? null;
                                    const fileName = selectedFile?.name ?? '';
                                    updateAssignment('documentFileName', fileName);
                                    if (selectedFile) {
                                      setUploadFiles((prev) => ({
                                        ...prev,
                                        assignments: { ...(prev.assignments ?? {}), [aIdx]: selectedFile }
                                      }));
                                    }
                                  }}
                                />
                                {item.documentFileName && (
                                  <small style={{ fontSize: '11px', color: '#0ea5a4', display: 'block', marginTop: '4px' }}>
                                    ✓ File terpilih: {item.documentFileName}
                                  </small>
                                )}
                              </label>
                              <label style={{ gridColumn: '1 / -1' }}>
                                <span>Catatan</span>
                                <input
                                  placeholder="Catatan tugas atau keterangan jabatan"
                                  value={item.notes || ''}
                                  onChange={(e) => updateAssignment('notes', e.target.value)}
                                />
                              </label>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* D. Riwayat Pendidikan */}
              {step === 3 && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>
                      Daftar Riwayat Pendidikan ({(form.educations ?? []).length})
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          educations: [
                            ...(form.educations ?? []),
                            {
                              level: 'S1',
                              institutionName: '',
                              studyProgram: '',
                              institutionCity: '',
                              startedYear: '',
                              graduatedYear: '',
                              status: 'GRADUATED',
                              notes: '',
                              certificateFileName: ''
                            }
                          ]
                        })
                      }
                      style={{
                        background: '#ecfdf5',
                        border: '1px solid #a7f3d0',
                        color: '#0ea5a4',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      + Tambah Pendidikan
                    </button>
                  </div>

                  <div style={{ display: 'grid', gap: '16px' }}>
                    {(form.educations && form.educations.length > 0
                      ? form.educations
                      : [{
                          level: 'S1',
                          institutionName: '',
                          studyProgram: '',
                          institutionCity: '',
                          startedYear: '',
                          graduatedYear: '',
                          status: 'GRADUATED',
                          notes: '',
                          certificateFileName: ''
                        }]
                    ).map((edu, eIdx) => {
                      const updateEdu = (field: string, val: string) => {
                        const current = form.educations && form.educations.length > 0
                          ? [...form.educations]
                          : [{
                              level: 'S1',
                              institutionName: '',
                              studyProgram: '',
                              institutionCity: '',
                              startedYear: '',
                              graduatedYear: '',
                              status: 'GRADUATED',
                              notes: '',
                              certificateFileName: ''
                            }];
                        if (!current[eIdx]) return;
                        current[eIdx] = { ...current[eIdx], [field]: val };
                        setForm({ ...form, educations: current });
                      };

                      return (
                        <div
                          key={eIdx}
                          style={{
                            padding: '16px',
                            background: '#f8fafc',
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <strong style={{ fontSize: '12px', color: '#475569' }}>
                              Pendidikan #{eIdx + 1}
                            </strong>
                            {(form.educations ?? []).length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = (form.educations ?? []).filter((_, i) => i !== eIdx);
                                  setForm({ ...form, educations: updated });
                                }}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: '#ef4444',
                                  fontSize: '11px',
                                  fontWeight: '600',
                                  cursor: 'pointer'
                                }}
                              >
                                ✕ Hapus
                              </button>
                            )}
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                            <label>
                              <span>Jenjang Pendidikan</span>
                              <select
                                value={edu.level || 'S1'}
                                onChange={(e) => updateEdu('level', e.target.value)}
                              >
                                <option value="SD">SD/MI</option>
                                <option value="SMP">SMP/MTs</option>
                                <option value="SMA">SMA/MA/SMK</option>
                                <option value="D1">D1</option>
                                <option value="D2">D2</option>
                                <option value="D3">D3</option>
                                <option value="D4">D4</option>
                                <option value="S1">S1</option>
                                <option value="S2">S2</option>
                                <option value="S3">S3</option>
                                <option value="PESANTREN">Pondok Pesantren</option>
                                <option value="OTHER">Lainnya</option>
                              </select>
                            </label>
                            <label>
                              <span>Nama Institusi *</span>
                              <input
                                placeholder="Nama sekolah, madrasah, universitas, pesantren"
                                value={edu.institutionName || ''}
                                onChange={(e) => updateEdu('institutionName', e.target.value)}
                              />
                            </label>
                            <label>
                              <span>Jurusan / Program Studi</span>
                              <input
                                placeholder="Contoh: Pendidikan Matematika, PAI"
                                value={edu.studyProgram || ''}
                                onChange={(e) => updateEdu('studyProgram', e.target.value)}
                              />
                            </label>
                            <label>
                              <span>Kota/Daerah Institusi</span>
                              <input
                                placeholder="Lokasi kota institusi"
                                value={edu.institutionCity || ''}
                                onChange={(e) => updateEdu('institutionCity', e.target.value)}
                              />
                            </label>
                            <label>
                              <span>Tahun Masuk</span>
                              <input
                                type="number"
                                placeholder="Contoh: 2018"
                                value={edu.startedYear || ''}
                                onChange={(e) => updateEdu('startedYear', e.target.value)}
                              />
                            </label>
                            <label>
                              <span>Tahun Lulus</span>
                              <input
                                type="number"
                                placeholder="Contoh: 2022"
                                value={edu.graduatedYear || ''}
                                onChange={(e) => updateEdu('graduatedYear', e.target.value)}
                              />
                            </label>
                            <label>
                              <span>Status Pendidikan</span>
                              <select
                                value={edu.status || 'GRADUATED'}
                                onChange={(e) => updateEdu('status', e.target.value)}
                              >
                                <option value="GRADUATED">Lulus</option>
                                <option value="ONGOING">Sedang Berjalan</option>
                                <option value="INCOMPLETE">Tidak Selesai</option>
                              </select>
                            </label>
                            <label>
                              <span>Upload File Ijazah / Sertifikat</span>
                              <input
                                key={`doc-edu-${eIdx}`}
                                type="file"
                                accept="image/*,application/pdf"
                                onChange={(e) => {
                                  const selectedFile = e.target.files?.[0] ?? null;
                                  const fileName = selectedFile?.name ?? '';
                                  updateEdu('certificateFileName', fileName);
                                  if (selectedFile) {
                                    setUploadFiles((prev) => ({
                                      ...prev,
                                      educations: { ...(prev.educations ?? {}), [eIdx]: selectedFile }
                                    }));
                                  }
                                }}
                              />
                              {edu.certificateFileName && (
                                <small style={{ fontSize: '11px', color: '#0ea5a4', display: 'block', marginTop: '4px' }}>
                                  ✓ File terpilih: {edu.certificateFileName}
                                </small>
                              )}
                            </label>
                            <label style={{ gridColumn: '1 / -1' }}>
                              <span>Catatan Pendidikan</span>
                              <input
                                placeholder="Informasi tambahan terkait riwayat pendidikan"
                                value={edu.notes || ''}
                                onChange={(e) => updateEdu('notes', e.target.value)}
                              />
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* E. Data Pasangan */}
              {step === 4 && (
                <>
                  <label>
                    <span>Status Pasangan di Mumtaza</span>
                    <select
                      value={form.spouseIsStaff}
                      onChange={(e) => setForm({ ...form, spouseIsStaff: e.target.value })}
                    >
                      <option value="false">Pasangan BUKAN Guru/Staff Mumtaza</option>
                      <option value="true">Pasangan JUGA Guru/Staff Mumtaza</option>
                    </select>
                  </label>
                  <label>
                    <span>Hubungan dengan Pasangan</span>
                    <select
                      value={form.spouseRelationship}
                      onChange={(e) => setForm({ ...form, spouseRelationship: e.target.value })}
                    >
                      <option value="HUSBAND">Suami</option>
                      <option value="WIFE">Istri</option>
                      <option value="SPOUSE">Pasangan</option>
                    </select>
                  </label>
                  {form.spouseIsStaff === 'true' ? (
                    <label style={{ gridColumn: '1 / -1' }}>
                      <span>Pilih Pasangan Guru/Staff Terdaftar</span>
                      <select
                        value={form.spousePartnerId}
                        onChange={(e) => setForm({ ...form, spousePartnerId: e.target.value })}
                      >
                        <option value="">-- Pilih Guru/Staff --</option>
                        {teachers.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.displayName} ({t.employeeCode ?? 'tanpa kode'})
                          </option>
                        ))}
                      </select>
                    </label>
                  ) : (
                    <label style={{ gridColumn: '1 / -1' }}>
                      <span>Nama Lengkap Pasangan (Manual)</span>
                      <input
                        placeholder="Nama pasangan jika bukan staf Mumtaza"
                        value={form.spouseManualName}
                        onChange={(e) => setForm({ ...form, spouseManualName: e.target.value })}
                      />
                    </label>
                  )}
                </>
              )}

              {/* F. Data Keluarga Tambahan */}
              {step === 5 && (
                <>
                  <label>
                    <span>Nama Ayah</span>
                    <input
                      placeholder="Nama lengkap ayah kandung"
                      value={form.fatherName}
                      onChange={(e) => setForm({ ...form, fatherName: e.target.value })}
                    />
                  </label>
                  <label>
                    <span>Nama Ibu</span>
                    <input
                      placeholder="Nama lengkap ibu kandung"
                      value={form.motherName}
                      onChange={(e) => setForm({ ...form, motherName: e.target.value })}
                    />
                  </label>
                </>
              )}

              {/* G. Dokumen */}
              {step === 6 && (
                <>
                  <label>
                    <span>KTP (Dokumen Identitas Guru)</span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => {
                        const selectedFile = e.target.files?.[0] ?? null;
                        if (selectedFile) {
                          setForm({ ...form, ktpFile: selectedFile.name });
                          setUploadFiles((prev) => ({ ...prev, ktp: selectedFile }));
                        }
                      }}
                    />
                  </label>
                  <label>
                    <span>Kartu Keluarga (KK)</span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => {
                        const selectedFile = e.target.files?.[0] ?? null;
                        if (selectedFile) {
                          setForm({ ...form, kkFile: selectedFile.name });
                          setUploadFiles((prev) => ({ ...prev, kk: selectedFile }));
                        }
                      }}
                    />
                  </label>
                  <label>
                    <span>Dokumen Kepegawaian (SK / Kontrak Kerja)</span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => {
                        const selectedFile = e.target.files?.[0] ?? null;
                        if (selectedFile) {
                          setForm({ ...form, employmentDocFile: selectedFile.name });
                          setUploadFiles((prev) => ({ ...prev, employmentDoc: selectedFile }));
                        }
                      }}
                    />
                  </label>
                  <label style={{ gridColumn: '1 / -1' }}>
                    <span>Dokumen Lainnya (Opsional)</span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => {
                        const selectedFile = e.target.files?.[0] ?? null;
                        if (selectedFile) {
                          setForm({ ...form, otherDocFile: selectedFile.name });
                          setUploadFiles((prev) => ({ ...prev, otherDoc: selectedFile }));
                        }
                      }}
                    />
                  </label>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="teacher-form-actions" style={{ flexShrink: 0, marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
              <button
                type="button"
                onClick={() => (step === 0 ? setOpen(false) : setStep(step - 1))}
              >
                {step === 0 ? 'Batal' : 'Sebelumnya'}
              </button>
              {step < steps.length - 1 ? (
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => setStep(step + 1)}
                >
                  Berikutnya
                </button>
              ) : (
                <button className="primary-button" disabled={saving} type="submit">
                  {saving ? 'Menyimpan...' : 'Simpan Master Teacher'}
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </main>
  );
}