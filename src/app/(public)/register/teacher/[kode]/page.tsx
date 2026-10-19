'use client';
import { useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';

type FormState = {
  displayName: string; gender: string; birthPlace: string; birthDate: string; nik: string; familyCardNumber: string; email: string; phone: string; whatsapp: string; maritalStatus: string; childrenCount: string;
  address: string; village: string; rt: string; rw: string; district: string; city: string; province: string; postalCode: string;
  employmentStatus: string; employmentStartedAt: string; unit: string; position: string; assignmentStartedAt: string; assignmentNotes: string;
  educationLevel: string; institutionName: string; studyProgram: string; institutionCity: string; startedYear: string; graduatedYear: string; educationStatus: string; educationNotes: string;
  spouseIsStaff: string; spouseRelationship: string; spouseName: string; fatherName: string; motherName: string; motherNik: string; motherPhone: string;
  ktpFileName: string; kkFileName: string; employmentDocFileName: string; otherDocFileName: string;
};
const initialForm = (nik: string): FormState => ({ displayName: '', gender: 'MALE', birthPlace: '', birthDate: '', nik, familyCardNumber: '', email: '', phone: '', whatsapp: '', maritalStatus: 'SINGLE', childrenCount: '0', address: '', village: '', rt: '', rw: '', district: '', city: '', province: '', postalCode: '', employmentStatus: 'PERMANENT', employmentStartedAt: '', unit: '', position: '', assignmentStartedAt: '', assignmentNotes: '', educationLevel: 'S1', institutionName: '', studyProgram: '', institutionCity: '', startedYear: '', graduatedYear: '', educationStatus: 'GRADUATED', educationNotes: '', spouseIsStaff: 'false', spouseRelationship: 'HUSBAND', spouseName: '', fatherName: '', motherName: '', motherNik: '', motherPhone: '', ktpFileName: '', kkFileName: '', employmentDocFileName: '', otherDocFileName: '' });

export default function TeacherRegistrationPage() {
  const { kode } = useParams<{ kode: string }>();
  const params = useSearchParams();
  const [form, setForm] = useState(() => initialForm(params.get('nik') ?? ''));
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const update = (key: keyof FormState, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const field = (key: keyof FormState, label: string, props: Record<string, string> = {}) => <label>{label}<input {...props} value={form[key]} onChange={(event) => update(key, event.target.value)} /></label>;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!/^\d{16}$/.test(form.nik) || !/^\d{16}$/.test(form.familyCardNumber)) return setStatus('NIK dan Nomor KK wajib masing-masing 16 digit angka.');
    setSaving(true); setStatus('');
    try {
      const profile = { gender: form.gender, birthPlace: form.birthPlace, birthDate: form.birthDate, nik: form.nik, familyCardNumber: form.familyCardNumber, email: form.email, phone: form.phone, whatsapp: form.whatsapp, maritalStatus: form.maritalStatus, childrenCount: Number(form.childrenCount) || 0 };
      const response = await fetch('/api/v1/teachers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ displayName: form.displayName, profile, address: { address: form.address, village: form.village, rt: form.rt, rw: form.rw, district: form.district, city: form.city, province: form.province, postalCode: form.postalCode }, employment: { employmentStatus: form.employmentStatus, employmentStartedAt: form.employmentStartedAt } }) });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error?.message ?? 'Data guru gagal dikirim.');
      const teacherId = result.data.id;
      if (form.unit && form.position) await fetch(`/api/v1/teachers/${teacherId}/assignments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ unit: form.unit, position: form.position, startedAt: form.assignmentStartedAt || new Date().toISOString().slice(0, 10), notes: form.assignmentNotes || null }) });
      if (form.institutionName) await fetch(`/api/v1/teachers/${teacherId}/education`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ level: form.educationLevel, institutionName: form.institutionName, studyProgram: form.studyProgram || null, city: form.institutionCity || null, startedYear: form.startedYear ? Number(form.startedYear) : null, graduatedYear: form.graduatedYear ? Number(form.graduatedYear) : null, status: form.educationStatus, notes: form.educationNotes || null }) });
      if (form.maritalStatus === 'MARRIED' && form.spouseName) await fetch(`/api/v1/teachers/${teacherId}/spouse`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ relationship: form.spouseRelationship, isMumtazaStaff: form.spouseIsStaff === 'true', manualName: form.spouseName }) });
      if (form.fatherName) await fetch(`/api/v1/teachers/${teacherId}/family`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ relation: 'FATHER', fullName: form.fatherName }) });
      if (form.motherName) await fetch(`/api/v1/teachers/${teacherId}/family`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ relation: 'MOTHER', fullName: form.motherName, nik: form.motherNik || null, phone: form.motherPhone || null }) });
      setStatus('Data guru berhasil dikirim. Akun guru telah dibuat dengan password default Mumtaza2008.');
    } catch (error) { setStatus(error instanceof Error ? error.message : 'Data guru gagal dikirim.'); } finally { setSaving(false); }
  }

  return <main className="students-page academic-page"><header className="students-header academic-hero"><div><p className="eyebrow">M-CORE / TEACHER REGISTRATION</p><h1>Lengkapi Data Guru</h1><p className="subtitle">Kode registrasi: {kode}. Lengkapi seluruh data seperti formulir Tambah Teacher.</p></div></header><form onSubmit={submit} className="student-card academic-card form-grid">
    <div className="form-span-full"><span className="section-kicker">A. PROFIL GURU</span></div>{field('displayName','Nama lengkap',{required:'true'})}{field('nik','NIK',{required:'true',inputMode:'numeric',maxLength:'16'})}{field('familyCardNumber','Nomor KK',{required:'true',inputMode:'numeric',maxLength:'16'})}{field('email','Email aktif',{required:'true',type:'email'})}{field('phone','Nomor HP',{required:'true'})}{field('whatsapp','WhatsApp',{required:'true'})}{field('birthPlace','Tempat lahir',{required:'true'})}{field('birthDate','Tanggal lahir',{required:'true',type:'date'})}<label>Jenis kelamin<select value={form.gender} onChange={(event) => update('gender', event.target.value)}><option value="MALE">Laki-laki</option><option value="FEMALE">Perempuan</option></select></label><label>Status pernikahan<select value={form.maritalStatus} onChange={(event) => update('maritalStatus', event.target.value)}><option value="SINGLE">Belum menikah</option><option value="MARRIED">Menikah</option><option value="DIVORCED">Cerai</option></select></label>{form.maritalStatus === 'MARRIED' && field('childrenCount','Jumlah anak',{type:'number',min:'0'})}
    <div className="form-span-full"><span className="section-kicker">B. ALAMAT</span></div>{field('address','Alamat lengkap',{required:'true'})}{field('village','Desa/Kelurahan')}{field('rt','RT')}{field('rw','RW')}{field('district','Kecamatan')}{field('city','Kabupaten/Kota')}{field('province','Provinsi')}{field('postalCode','Kode pos')}
    <div className="form-span-full"><span className="section-kicker">C. KEPEGAWAIAN & JABATAN</span></div>{field('employmentStatus','Status kepegawaian')}{field('employmentStartedAt','Mulai bekerja',{type:'date'})}{field('unit','Unit kerja')}{field('position','Jabatan')}{field('assignmentStartedAt','Mulai jabatan',{type:'date'})}{field('assignmentNotes','Catatan jabatan')}
    <div className="form-span-full"><span className="section-kicker">D. PENDIDIKAN TERAKHIR</span></div>{field('institutionName','Nama institusi')}{field('studyProgram','Program studi')}{field('institutionCity','Kota institusi')}{field('startedYear','Tahun mulai',{type:'number'})}{field('graduatedYear','Tahun lulus',{type:'number'})}<label>Jenjang<select value={form.educationLevel} onChange={(event) => update('educationLevel', event.target.value)}><option>S1</option><option>S2</option><option>S3</option><option>D4</option><option>SMA</option></select></label>
    <div className="form-span-full"><span className="section-kicker">E. PASANGAN</span></div>{form.maritalStatus === 'MARRIED' && <>{field('spouseName','Nama pasangan')}{field('spouseRelationship','Hubungan')}</>}
    <div className="form-span-full"><span className="section-kicker">F. KELUARGA</span></div>{field('fatherName','Nama ayah')}{field('motherName','Nama ibu')}{field('motherNik','NIK ibu',{inputMode:'numeric'})}{field('motherPhone','Nomor HP ibu')}
    <div className="form-span-full"><span className="section-kicker">G. DOKUMEN</span><p className="subtitle">Dokumen dapat diserahkan kepada admin setelah data dikirim.</p></div>{field('ktpFileName','Nama file KTP')}{field('kkFileName','Nama file KK')}{field('employmentDocFileName','Nama file dokumen kepegawaian')}{field('otherDocFileName','Nama file dokumen lain')}
    {status && <p className={`form-span-full ${status.startsWith('Data guru berhasil') ? '' : 'form-error'}`} role="status">{status}</p>}<button className="primary-button form-span-full" id="teacher-registration-submit" type="submit" disabled={saving}>{saving ? 'Mengirim…' : 'Kirim Data Guru'}</button>
  </form></main>;
}
