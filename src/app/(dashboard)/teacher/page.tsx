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
  const [selectedTeacher, setSelectedTeacher] = useState<Record<string, unknown> | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);
  const [nikStatus, setNikStatus] = useState<'idle' | 'checking' | 'available' | 'duplicate'>('idle');
  const [stepWarning, setStepWarning] = useState('');

  const validateStep = (currentStep: number) => {
    if (currentStep === 0) {
      const requiredFields: Array<[string, string]> = [
        ['Nama lengkap', form.displayName], ['Jenis kelamin', form.gender], ['Tempat lahir', form.birthPlace],
        ['Tanggal lahir', form.birthDate], ['NIK', form.nik], ['Nomor KK', form.familyCardNumber],
        ['Email aktif', form.email], ['Nomor HP', form.phone], ['Nomor WhatsApp', form.whatsapp],
        ['Status pernikahan', form.maritalStatus], ['Status guru', form.status]
      ];
      if (form.maritalStatus === 'MARRIED') requiredFields.push(['Jumlah anak', form.childrenCount]);
      const missing = requiredFields.find(([, fieldValue]) => !fieldValue.trim());
      if (missing) return `${missing[0]} pada Profil Guru wajib diisi.`;
      if (!/^\d{16}$/.test(form.nik)) return 'NIK harus terdiri dari 16 digit angka.';
      if (!/^\d{16}$/.test(form.familyCardNumber)) return 'Nomor KK harus terdiri dari 16 digit angka.';
      if (nikStatus === 'duplicate') return 'NIK sudah terdaftar pada Daftar Teacher.';
      if (nikStatus === 'checking') return 'Tunggu sampai pemeriksaan NIK selesai.';
    }
    return '';
  };

  const goToStep = (nextStep: number) => {
    const warning = validateStep(step);
    if (warning) {
      setStepWarning(warning);
      window.setTimeout(() => setStepWarning(''), 3500);
      return;
    }
    setStep(nextStep);
  };

  useEffect(() => {
    const nik = form.nik.trim();
    if (nik.length !== 16) {
      setNikStatus('idle');
      return;
    }
    let cancelled = false;
    setNikStatus('checking');
    fetch(`/api/v1/teachers?nik=${encodeURIComponent(nik)}`, { cache: 'no-store' })
      .then((response) => response.json())
      .then((json) => {
        if (!cancelled) setNikStatus(json.success && json.available ? 'available' : 'duplicate');
      })
      .catch(() => {
        if (!cancelled) setNikStatus('idle');
      });
    return () => { cancelled = true; };
  }, [form.nik]);

  const openTeacherDetail = async (teacherId: string) => {
    try {
      const response = await fetch(`/api/v1/teachers/${teacherId}`, { cache: 'no-store' });
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.error?.message ?? 'Gagal memuat detail guru.');
      setSelectedTeacher(json.data);
      setDetailOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat detail guru.');
    }
  };

  const editTeacher = async (teacherId: string) => {
    try {
      const response = await fetch(`/api/v1/teachers/${teacherId}`, { cache: 'no-store' });
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.error?.message ?? 'Gagal memuat data guru.');
      const teacher = json.data;
      const profile = teacher.profile ?? {};
      const address = teacher.address ?? {};
      const employment = teacher.employment ?? {};
      setEditingTeacherId(teacher.id);
      setForm({
        ...empty,
        employeeCode: teacher.employeeCode ?? '',
        displayName: teacher.displayName ?? '',
        gender: profile.gender ?? empty.gender,
        birthPlace: profile.birthPlace ?? '',
        birthDate: profile.birthDate ?? '',
        nik: profile.nik ?? '',
        familyCardNumber: profile.familyCardNumber ?? '',
        email: profile.email ?? '', phone: profile.phone ?? '', whatsapp: profile.whatsapp ?? '',
        maritalStatus: profile.maritalStatus ?? 'SINGLE', childrenCount: String(profile.childrenCount ?? 0),
        status: teacher.isActive ? 'ACTIVE' : 'INACTIVE',
        address: address.address ?? '', village: address.village ?? '', rt: address.rt ?? '', rw: address.rw ?? '',
        district: address.district ?? '', city: address.city ?? '', province: address.province ?? '', postalCode: address.postalCode ?? '',
        employmentStatus: employment.employmentStatus ?? 'PERMANENT', employmentStartedAt: employment.employmentStartedAt ?? '',
        assignments: teacher.assignments?.length ? teacher.assignments.map((item: Record<string, unknown>) => ({ unit: String(item.unit ?? ''), position: String(item.position ?? ''), startedAt: String(item.startedAt ?? '').slice(0, 10), endedAt: item.endedAt ? String(item.endedAt).slice(0, 10) : '', notes: String(item.notes ?? ''), documentFileName: '' })) : empty.assignments,
        educations: teacher.educationHistories?.length ? teacher.educationHistories.map((item: Record<string, unknown>) => ({ level: String(item.level ?? 'S1'), institutionName: String(item.institutionName ?? ''), studyProgram: String(item.studyProgram ?? ''), institutionCity: String(item.city ?? ''), startedYear: String(item.startedYear ?? ''), graduatedYear: String(item.graduatedYear ?? ''), status: String(item.status ?? 'GRADUATED'), notes: String(item.notes ?? ''), certificateFileName: '' })) : empty.educations,
        spouseIsStaff: 'false', spousePartnerId: '', spouseRelationship: 'HUSBAND', spouseManualName: '', fatherName: '', motherName: '', motherNik: '', motherPhone: '', ktpFile: '', kkFile: '', employmentDocFile: '', otherDocFile: ''
      });
      setStep(0);
      setError('');
      setOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data guru.');
    }
  };

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
      const requiredProfileFields: Array<[string, string]> = [
        ['Nama lengkap', form.displayName], ['Tempat lahir', form.birthPlace], ['Tanggal lahir', form.birthDate],
        ['NIK', form.nik], ['Nomor KK', form.familyCardNumber], ['Email', form.email], ['Nomor HP', form.phone],
        ['Nomor WhatsApp', form.whatsapp], ['Jenis kelamin', form.gender], ['Status pernikahan', form.maritalStatus]
      ];
      const missingField = requiredProfileFields.find(([, fieldValue]) => !fieldValue.trim());
      if (missingField) throw new Error(`${missingField[0]} pada Profil Guru wajib diisi.`);
      if (!/^\d{16}$/.test(form.nik)) throw new Error('NIK harus terdiri dari 16 digit angka.');
      if (!/^\d{16}$/.test(form.familyCardNumber)) throw new Error('Nomor KK harus terdiri dari 16 digit angka.');
      if (nikStatus === 'duplicate' && !editingTeacherId) throw new Error('NIK sudah terdaftar pada Daftar Teacher.');
      if (nikStatus === 'checking') throw new Error('Tunggu sampai pemeriksaan NIK selesai.');

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

      const res = await fetch(editingTeacherId ? `/api/v1/teachers/${editingTeacherId}` : '/api/v1/teachers', {
        method: editingTeacherId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const body = await res.json();
      if (!res.ok || !body.success) throw new Error(body.error?.message ?? 'Gagal menyimpan profil guru.');
      const teacherId = editingTeacherId ?? body.data.id;

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
      setEditingTeacherId(null);
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
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => openTeacherDetail(t.id)}
                    style={{ border: '1px solid #bae6fd', background: '#f0f9ff', color: '#0369a1', borderRadius: '8px', padding: '7px 10px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                  >
                    Lihat
                  </button>
                  <button
                    type="button"
                    onClick={() => editTeacher(t.id)}
                    style={{ border: '1px solid #a7f3d0', background: '#ecfdf5', color: '#047857', borderRadius: '8px', padding: '7px 10px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                  >
                    Edit
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {detailOpen && selectedTeacher && (() => {
        const profile = (selectedTeacher.profile ?? {}) as Record<string, unknown>;
        const address = (selectedTeacher.address ?? {}) as Record<string, unknown>;
        const employment = (selectedTeacher.employment ?? {}) as Record<string, unknown>;
        const assignments = Array.isArray(selectedTeacher.assignments) ? selectedTeacher.assignments as Array<Record<string, unknown>> : [];
        const educations = Array.isArray(selectedTeacher.educationHistories) ? selectedTeacher.educationHistories as Array<Record<string, unknown>> : [];
        const documents = Array.isArray(selectedTeacher.documentRecords) ? selectedTeacher.documentRecords as Array<Record<string, unknown>> : [];
        const value = (source: Record<string, unknown>, key: string, fallback = '-') => String(source[key] ?? fallback);
        const Field = ({ label, text }: { label: string; text: string }) => (
          <div style={{ minWidth: 0 }}>
            <small style={{ display: 'block', color: '#94a3b8', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>{label}</small>
            <span style={{ display: 'block', color: '#1e293b', fontSize: '13px', fontWeight: '650', overflowWrap: 'anywhere' }}>{text || '-'}</span>
          </div>
        );
        const Section = ({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) => (
          <section style={{ border: '1px solid #e2e8f0', borderRadius: '16px', padding: '18px', background: '#fff', boxShadow: '0 6px 18px rgba(15,23,42,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <span style={{ width: '32px', height: '32px', display: 'grid', placeItems: 'center', borderRadius: '10px', background: '#ecfdf5', fontSize: '16px' }}>{icon}</span>
              <h3 style={{ margin: 0, color: '#0f172a', fontSize: '14px', fontWeight: '850' }}>{title}</h3>
            </div>
            {children}
          </section>
        );
        return (
          <div className="teacher-modal" role="presentation" style={{ overflowY: 'auto', padding: '20px', background: 'rgba(15,23,42,0.58)', backdropFilter: 'blur(8px)' }}>
            <section className="teacher-dialog" role="dialog" aria-modal="true" aria-labelledby="teacher-detail-title" style={{ maxWidth: '860px', width: '100%', maxHeight: 'calc(100vh - 40px)', overflowY: 'auto', padding: 0, borderRadius: '24px', background: '#f8fafc', boxShadow: '0 24px 80px rgba(15,23,42,0.25)' }}>
              <header style={{ position: 'sticky', top: 0, zIndex: 2, padding: '24px 28px', background: 'linear-gradient(135deg, #0f766e 0%, #0f4c5c 100%)', color: '#fff', borderRadius: '24px 24px 0 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '18px', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center', minWidth: 0 }}>
                    <div style={{ width: '58px', height: '58px', flexShrink: 0, display: 'grid', placeItems: 'center', borderRadius: '18px', background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.28)', fontSize: '20px', fontWeight: '850' }}>{String(selectedTeacher.displayName ?? 'G').slice(0, 2).toUpperCase()}</div>
                    <div style={{ minWidth: 0 }}>
                      <span style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '0.12em', opacity: 0.78 }}>TEACHER DETAIL</span>
                      <h2 id="teacher-detail-title" style={{ margin: '5px 0 4px', fontSize: '23px', lineHeight: 1.15, overflowWrap: 'anywhere' }}>{String(selectedTeacher.displayName ?? 'Detail Guru')}</h2>
                      <span style={{ fontSize: '12px', opacity: 0.82 }}>{String(selectedTeacher.employeeCode ?? 'Kode belum diisi')}</span>
                    </div>
                  </div>
                  <button type="button" aria-label="Tutup detail teacher" onClick={() => setDetailOpen(false)} style={{ flexShrink: 0, border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.12)', color: '#fff', borderRadius: '10px', padding: '8px 12px', cursor: 'pointer', fontWeight: '750' }}>✕</button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '18px' }}>
                  <span style={{ padding: '6px 10px', borderRadius: '999px', background: selectedTeacher.isActive ? '#d1fae5' : '#e2e8f0', color: selectedTeacher.isActive ? '#047857' : '#475569', fontSize: '11px', fontWeight: '800' }}>{selectedTeacher.isActive ? '● Aktif' : '● Nonaktif'}</span>
                  <span style={{ padding: '6px 10px', borderRadius: '999px', background: 'rgba(255,255,255,0.14)', fontSize: '11px' }}>ID: {String(selectedTeacher.id).slice(0, 12)}…</span>
                </div>
              </header>
              <div style={{ display: 'grid', gap: '14px', padding: '20px 28px 28px' }}>
                <Section icon="👤" title="A. Profil Guru">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '16px' }}>
                    <Field label="Kode Guru" text={String(selectedTeacher.employeeCode ?? '-')} /><Field label="Nama Lengkap" text={String(selectedTeacher.displayName ?? '-')} /><Field label="Jenis Kelamin" text={value(profile, 'gender')} /><Field label="Tempat Lahir" text={value(profile, 'birthPlace')} /><Field label="Tanggal Lahir" text={value(profile, 'birthDate')} /><Field label="NIK" text={value(profile, 'nik')} /><Field label="Nomor KK" text={value(profile, 'familyCardNumber')} /><Field label="Email" text={value(profile, 'email')} /><Field label="Nomor HP" text={value(profile, 'phone')} /><Field label="WhatsApp" text={value(profile, 'whatsapp')} /><Field label="Status Pernikahan" text={value(profile, 'maritalStatus')} /><Field label="Jumlah Anak" text={value(profile, 'childrenCount', '0')} /><Field label="Status Guru" text={selectedTeacher.isActive ? 'Aktif' : 'Nonaktif'} />
                  </div>
                </Section>
                <Section icon="📍" title="B. Alamat">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '16px' }}><Field label="Alamat" text={value(address, 'address')} /><Field label="Desa / Kelurahan" text={value(address, 'village')} /><Field label="RT" text={value(address, 'rt')} /><Field label="RW" text={value(address, 'rw')} /><Field label="Kecamatan" text={value(address, 'district')} /><Field label="Kota" text={value(address, 'city')} /><Field label="Provinsi" text={value(address, 'province')} /><Field label="Kode Pos" text={value(address, 'postalCode')} /></div>
                </Section>
                <Section icon="💼" title="C. Kepegawaian">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '16px', marginBottom: assignments.length ? '16px' : 0 }}><Field label="Status Kepegawaian" text={value(employment, 'employmentStatus')} /><Field label="Tanggal Mulai Bekerja" text={value(employment, 'employmentStartedAt')} /></div>
                  {assignments.length ? <div style={{ display: 'grid', gap: '10px' }}>{assignments.map((item, index) => <div key={String(item.id ?? index)} style={{ padding: '13px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0' }}><strong style={{ display: 'block', color: '#0f766e', fontSize: '12px', marginBottom: '10px' }}>Unit/Jabatan #{index + 1}</strong><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}><Field label="Unit / Departemen" text={value(item, 'unit')} /><Field label="Jabatan" text={value(item, 'position')} /><Field label="Mulai Jabatan" text={value(item, 'startedAt').slice(0, 10)} /><Field label="Selesai Jabatan" text={value(item, 'endedAt').slice(0, 10)} /><Field label="Catatan" text={value(item, 'notes')} /></div></div>)}</div> : <span style={{ color: '#64748b', fontSize: '13px' }}>Belum ada unit atau jabatan.</span>}
                </Section>
                <Section icon="🎓" title="D. Riwayat Pendidikan">
                  {educations.length ? <div style={{ display: 'grid', gap: '10px' }}>{educations.map((item, index) => <div key={String(item.id ?? index)} style={{ padding: '13px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0' }}><strong style={{ display: 'block', color: '#0f766e', fontSize: '12px', marginBottom: '10px' }}>{value(item, 'level', 'Pendidikan')} · {value(item, 'institutionName')}</strong><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}><Field label="Nama Institusi" text={value(item, 'institutionName')} /><Field label="Program Studi" text={value(item, 'studyProgram')} /><Field label="Kota / Daerah" text={value(item, 'city')} /><Field label="Tahun Masuk" text={value(item, 'startedYear')} /><Field label="Tahun Lulus" text={value(item, 'graduatedYear')} /><Field label="Status Pendidikan" text={value(item, 'status')} /><Field label="Catatan" text={value(item, 'notes')} /></div></div>)}</div> : <span style={{ color: '#64748b', fontSize: '13px' }}>Belum ada riwayat pendidikan.</span>}
                </Section>
                <Section icon="💍" title="E. Data Pasangan">
                  {Array.isArray(selectedTeacher.spouseLinks) && selectedTeacher.spouseLinks.length ? <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '16px' }}>{(() => { const spouse = (selectedTeacher.spouseLinks as Array<Record<string, unknown>>)[0]; const partner = (spouse.partnerTeacher ?? {}) as Record<string, unknown>; return <><Field label="Hubungan" text={value(spouse, 'relationship')} /><Field label="Guru/Staff Mumtaza" text={spouse.isMumtazaStaff ? 'Ya' : 'Tidak'} /><Field label="Nama Pasangan" text={value(spouse, 'manualName', value(partner, 'displayName'))} /><Field label="Kode Pasangan" text={value(partner, 'employeeCode')} /></>; })()}</div> : <span style={{ color: '#64748b', fontSize: '13px' }}>Belum ada data pasangan.</span>}
                </Section>
                <Section icon="👪" title="F. Data Keluarga">
                  {Array.isArray(selectedTeacher.familyMembers) && selectedTeacher.familyMembers.length ? <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '16px' }}>{(selectedTeacher.familyMembers as Array<Record<string, unknown>>).map((item, index) => <Field key={String(item.id ?? index)} label={value(item, 'relation')} text={value(item, 'fullName')} />)}</div> : <span style={{ color: '#64748b', fontSize: '13px' }}>Belum ada data keluarga.</span>}
                </Section>
                <Section icon="📄" title="G. Dokumen">
                  {documents.length ? <div style={{ display: 'grid', gap: '8px' }}>{documents.map((doc, index) => <a key={String(doc.id ?? index)} href={String(doc.fileUrl ?? '#')} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '12px 14px', borderRadius: '11px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#0369a1', textDecoration: 'none', fontSize: '12px', fontWeight: '700' }}><span style={{ overflowWrap: 'anywhere' }}>📎 {String(doc.title ?? 'Dokumen')}</span><span>{String(doc.type ?? 'OTHER')} ↗</span></a>)}</div> : <span style={{ color: '#64748b', fontSize: '13px' }}>Belum ada dokumen.</span>}
                </Section>
              </div>
            </section>
          </div>
        );
      })()}

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
                    onClick={() => goToStep(idx)}
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

            {stepWarning && (
              <div role="alert" style={{ position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)', zIndex: 100, width: 'min(92vw, 520px)', display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px 16px', borderRadius: '14px', background: '#fff7ed', border: '1px solid #fdba74', color: '#9a3412', boxShadow: '0 16px 40px rgba(154,52,18,0.2)', animation: 'teacher-warning-in 180ms ease-out' }}>
                <span style={{ fontSize: '20px', lineHeight: 1 }}>⚠️</span>
                <div style={{ flex: 1 }}><strong style={{ display: 'block', fontSize: '13px', marginBottom: '3px' }}>Data belum lengkap</strong><span style={{ fontSize: '12px' }}>{stepWarning}</span></div>
                <button type="button" aria-label="Tutup peringatan" onClick={() => setStepWarning('')} style={{ border: 'none', background: 'transparent', color: '#9a3412', fontSize: '18px', cursor: 'pointer', padding: 0 }}>✕</button>
              </div>
            )}
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
                    <input required placeholder="Sesuai identitas resmi" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} />
                  </label>
                  <label>
                    <span>Jenis Kelamin *</span>
                    <select required value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                      <option value="">Pilih jenis kelamin</option><option value="MALE">Laki-laki</option><option value="FEMALE">Perempuan</option>
                    </select>
                  </label>
                  <label><span>Tempat Lahir *</span><input required placeholder="Kota/Tempat kelahiran" value={form.birthPlace} onChange={(e) => setForm({ ...form, birthPlace: e.target.value })} /></label>
                  <label><span>Tanggal Lahir *</span><input required type="date" value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} /></label>
                  <label>
                    <span>NIK *</span>
                    <input required minLength={16} maxLength={16} pattern="[0-9]{16}" inputMode="numeric" placeholder="16 digit NIK" value={form.nik} onChange={(e) => { const nik = e.target.value.replace(/\D/g, '').slice(0, 16); setForm({ ...form, nik }); setNikStatus(nik.length === 16 ? 'checking' : 'idle'); }} />
                    {nikStatus === 'checking' && <small style={{ color: '#64748b' }}>Memeriksa NIK...</small>}
                    {nikStatus === 'duplicate' && <small style={{ color: '#dc2626', fontWeight: 700 }}>NIK sudah terdaftar pada Daftar Teacher.</small>}
                    {nikStatus === 'available' && <small style={{ color: '#059669', fontWeight: 700 }}>NIK tersedia.</small>}
                  </label>
                  <label><span>Nomor KK *</span><input required minLength={16} maxLength={16} pattern="[0-9]{16}" inputMode="numeric" placeholder="Nomor Kartu Keluarga" value={form.familyCardNumber} onChange={(e) => setForm({ ...form, familyCardNumber: e.target.value.replace(/\D/g, '').slice(0, 16) })} /></label>
                  <label><span>Email Aktif *</span><input required type="email" placeholder="contoh@mumtaza.sch.id" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
                  <label><span>Nomor HP *</span><input required pattern="[0-9+ -]{8,}" inputMode="tel" placeholder="08xxxxxxxxxx" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
                  <label><span>Nomor WhatsApp *</span><input required pattern="[0-9+ -]{8,}" inputMode="tel" placeholder="Jika berbeda dari Nomor HP" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} /></label>
                  <label>
                    <span>Status Pernikahan *</span>
                    <select required value={form.maritalStatus} onChange={(e) => setForm({ ...form, maritalStatus: e.target.value })}>
                      <option value="">Pilih status pernikahan</option><option value="SINGLE">Belum Menikah</option><option value="MARRIED">Menikah</option><option value="DIVORCED">Cerai</option>
                    </select>
                  </label>
                  {form.maritalStatus === 'MARRIED' && <label><span>Jumlah Anak *</span><input required type="number" min="0" value={form.childrenCount} onChange={(e) => setForm({ ...form, childrenCount: e.target.value })} /></label>}
                  <label>
                    <span>Status Guru *</span>
                    <select required value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
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
                  onClick={() => goToStep(step + 1)}
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