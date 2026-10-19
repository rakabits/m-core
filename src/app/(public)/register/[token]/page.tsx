'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type Program = { programName: string; programCode: string };
type FormTemplate = { selectedFields?: string[] };
type Period = { name: string; registrationFee: number; formTemplate?: FormTemplate | null };
type Applicant = { registrationNo: string; submittedAt?: string | null; fullName?: string | null; program: Program; enrollmentPeriod: Period };

type FieldGroup = { label: string; fields: Array<{ key: string; label: string }> };

const FIELD_GROUPS: FieldGroup[] = [
  { label: 'Identitas siswa', fields: [{ key: 'nisn', label: 'NISN' }, { key: 'familyCardNumber', label: 'Nomor Kartu Keluarga' }, { key: 'passportNumber', label: 'Nomor paspor' }] },
  { label: 'Data kontak', fields: [{ key: 'phone', label: 'Nomor telepon' }, { key: 'telegramUsername', label: 'Username Telegram' }] },
  { label: 'Alamat', fields: [{ key: 'addressLine', label: 'Alamat rumah lengkap' }, { key: 'addressRt', label: 'RT' }, { key: 'addressRw', label: 'RW' }, { key: 'village', label: 'Desa/Kelurahan' }, { key: 'district', label: 'Kecamatan' }, { key: 'cityRegency', label: 'Kota/Kabupaten' }, { key: 'province', label: 'Provinsi' }, { key: 'postalCode', label: 'Kode pos' }] },
  { label: 'Data fisik', fields: [{ key: 'heightCm', label: 'Tinggi badan' }, { key: 'weightKg', label: 'Berat badan' }, { key: 'siblingCount', label: 'Jumlah saudara' }, { key: 'birthOrder', label: 'Anak ke-' }] },
  { label: 'Data ayah', fields: [{ key: 'fatherFullName', label: 'Nama lengkap ayah' }, { key: 'fatherNik', label: 'NIK ayah' }, { key: 'fatherBirthPlace', label: 'Tempat lahir ayah' }, { key: 'fatherBirthDate', label: 'Tanggal lahir ayah' }, { key: 'fatherPhone', label: 'Nomor telepon ayah' }, { key: 'fatherEducation', label: 'Pendidikan terakhir ayah' }, { key: 'fatherOccupation', label: 'Pekerjaan ayah' }, { key: 'fatherMonthlyIncome', label: 'Penghasilan bulanan ayah' }] },
  { label: 'Data ibu', fields: [{ key: 'motherFullName', label: 'Nama lengkap ibu' }, { key: 'motherNik', label: 'NIK ibu' }, { key: 'motherBirthPlace', label: 'Tempat lahir ibu' }, { key: 'motherBirthDate', label: 'Tanggal lahir ibu' }, { key: 'motherPhone', label: 'Nomor telepon ibu' }, { key: 'motherEducation', label: 'Pendidikan terakhir ibu' }, { key: 'motherOccupation', label: 'Pekerjaan ibu' }, { key: 'motherMonthlyIncome', label: 'Penghasilan bulanan ibu' }] },
  { label: 'Data lain', fields: [{ key: 'guardianData', label: 'Data wali' }, { key: 'notes', label: 'Catatan tambahan' }] },
];

const GUARDIAN_FIELDS = [
  { key: 'guardianFullName', label: 'Nama lengkap wali' },
  { key: 'guardianNik', label: 'NIK wali' },
  { key: 'guardianBirthPlace', label: 'Tempat lahir wali' },
  { key: 'guardianBirthDate', label: 'Tanggal lahir wali' },
  { key: 'guardianPhone', label: 'Nomor telepon wali' },
  { key: 'guardianEducation', label: 'Pendidikan terakhir wali' },
  { key: 'guardianOccupation', label: 'Pekerjaan wali' },
  { key: 'guardianMonthlyIncome', label: 'Penghasilan bulanan wali' },
];

const EDUCATION_LEVELS = ['educationSd', 'educationSmp', 'educationSma', 'educationS1', 'educationS2', 'educationS3'];

export default function PublicRegistrationPage({ params }: { params: Promise<{ token: string }> }) {
  const [token, setToken] = useState('');
  const [item, setItem] = useState<Applicant | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [step, setStep] = useState<1 | 2>(1);
  const [guardianChoice, setGuardianChoice] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submittedInfo, setSubmittedInfo] = useState<{ registrationNo?: string; fullName?: string | null; program?: { programName: string; programCode: string }; submittedAt?: string } | null>(null);
  const [nikStatus, setNikStatus] = useState<{ checking: boolean; ok: boolean | null; message: string }>({ checking: false, ok: null, message: '' });
  const nikDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    params.then(({ token: tok }) => {
      setToken(tok);
      const submittedKey = `mcore-registration-submitted:${tok}`;
      const showSubmitted = (data: typeof submittedInfo) => {
        setSubmittedInfo(data || {});
        setItem(null);
        setForm({});
      };
      fetch(`/api/v1/public-registration/${tok}`, { cache: 'no-store' })
        .then(async (response) => {
          const result = await response.json();
          if (response.status === 410 && result.alreadySubmitted) {
            showSubmitted(result.data || {});
            setError(result.error?.message || 'Form Pendaftaran sudah diisi.');
            return;
          }
          if (!response.ok) throw new Error(result.error?.message || 'Link tidak ditemukan');
          if (result.data?.submittedAt || window.localStorage.getItem(submittedKey) === 'true') {
            showSubmitted(result.data || JSON.parse(window.localStorage.getItem(`${submittedKey}:info`) || '{}'));
            return;
          }
          if (result.data) { setItem(result.data); setForm(result.data); setGuardianChoice(result.data.guardianType || ''); }
          else setError(result.error?.message || 'Link tidak ditemukan');
        })
        .catch((err) => setError(err instanceof Error ? err.message : 'Form pendaftaran gagal dimuat.'));
    });
  }, [params]);

  const selectedFields = useMemo(
    () => item?.enrollmentPeriod.formTemplate?.selectedFields ?? [],
    [item],
  );

  const activeGroups = useMemo(
    () => FIELD_GROUPS.map((g) => ({ ...g, fields: g.fields.filter((f) => selectedFields.includes(f.key) && f.key !== 'guardianData') })).filter((g) => g.fields.length > 0),
    [selectedFields],
  );

  const hasGuardianField = selectedFields.includes('guardianData');

  const activeEducationLevels = useMemo(
    () => EDUCATION_LEVELS.filter((l) => selectedFields.includes(l)),
    [selectedFields],
  );

  const set = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const checkNik = useCallback((nik: string, tok: string) => {
    if (nikDebounceRef.current) clearTimeout(nikDebounceRef.current);
    const trimmed = nik.trim();
    if (!trimmed) { setNikStatus({ checking: false, ok: null, message: '' }); return; }
    setNikStatus({ checking: true, ok: null, message: 'Memeriksa NIK...' });
    nikDebounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/v1/public-registration/${tok}/check-nik?nik=${encodeURIComponent(trimmed)}`, { cache: 'no-store' });
        const result = await res.json() as { available: boolean; message?: string };
        if (result.available) {
          setNikStatus({ checking: false, ok: true, message: 'NIK tersedia.' });
        } else {
          setNikStatus({ checking: false, ok: false, message: result.message || 'NIK sudah digunakan.' });
        }
      } catch {
        setNikStatus({ checking: false, ok: null, message: '' });
      }
    }, 600);
  }, []);

  async function uploadFile(file: File, fieldKey: string) {
    if (!file.type.startsWith('image/')) return setError('File harus berupa gambar');
    setUploading(true);
    setError('');
    try {
      const body = new FormData();
      body.append('file', file);
      const res = await fetch(`/api/v1/public-registration/${token}/payment-proof`, { method: 'POST', body });
      const result = await res.json();
      if (!res.ok || !result.data?.url) throw new Error(result.error?.message || 'Upload gagal');
      set(fieldKey, result.data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload gagal');
    } finally {
      setUploading(false);
    }
  }

  const validateStudentSection = () => {
    const requiredFields = [
      ['fullName', 'Nama lengkap'],
      ['gender', 'Jenis kelamin'],
      ['nationalId', 'NIK'],
      ['birthPlace', 'Tempat lahir'],
      ['birthDate', 'Tanggal lahir'],
      ['email', 'Email'],
      ['studentPhone', 'Nomor HP siswa'],
      ['studentWhatsapp', 'WhatsApp siswa'],
      ['parentPhone', 'Nomor HP orang tua'],
    ] as const;

    const missingField = requiredFields.find(([key]) => !String(form[key] || '').trim());
    if (missingField) {
      setError(`${missingField[1]} wajib diisi sebelum melanjutkan.`);
      return false;
    }

    const email = String(form.email).trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Format email tidak valid.');
      return false;
    }

    if (nikStatus.checking) {
      setError('Sedang memeriksa NIK, harap tunggu sebentar.');
      return false;
    }
    if (nikStatus.ok === false) {
      setError(nikStatus.message || 'NIK tidak valid.');
      return false;
    }

    setError('');
    return true;
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.paymentProofUrl) return setError('Silakan upload bukti pembayaran');
    setError('');
    try {
      const res = await fetch(`/api/v1/public-registration/${token}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error?.message || 'Data gagal disimpan');
      const submittedAt = new Date().toISOString();
      const submittedInfo = { registrationNo: item?.registrationNo, fullName: form.fullName || item?.fullName || null, program: item?.program, submittedAt };
      window.localStorage.setItem(`mcore-registration-submitted:${token}`, 'true');
      window.localStorage.setItem(`mcore-registration-submitted:${token}:info`, JSON.stringify(submittedInfo));
      setSubmittedInfo(submittedInfo);
      setItem(null);
      setForm({});
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Data gagal disimpan');
    }
  }

  if (submittedInfo) return (
    <main className="public-registration">
      <section className="public-registration-card registration-form-card submitted-registration-card">
        <p className="eyebrow">M-CORE / REGISTRATION</p>
        <h1>Form Pendaftaran Sudah Diisi</h1>
        <div className="success-panel">
          <h2>Data berhasil dikirim</h2>
          <p>Link Form Pendaftaran ini sudah tidak berlaku untuk pengisian ulang.</p>
          <div className="submitted-registration-details">
            <p><span>No. registrasi</span><strong>{submittedInfo.registrationNo || '-'}</strong></p>
            <p><span>Nama pendaftar</span><strong>{submittedInfo.fullName || '-'}</strong></p>
            <p><span>Program</span><strong>{submittedInfo.program?.programName || '-'}{submittedInfo.program?.programCode ? ` (${submittedInfo.program.programCode})` : ''}</strong></p>
            {submittedInfo.submittedAt && <p><span>Waktu pengiriman</span><strong>{new Date(submittedInfo.submittedAt).toLocaleString('id-ID')}</strong></p>}
          </div>
          <p>Jika perlu perubahan data atau konfirmasi pendaftaran, silakan hubungi admin melalui WhatsApp.</p>
          <a className="primary-button whatsapp-confirmation-button" href={`https://wa.me/6281133333411?text=${encodeURIComponent(`Konfirmasi pendaftaran\nNO. REGISTRASI: ${submittedInfo.registrationNo || '-'}\nNama: ${submittedInfo.fullName || '-'}\nProgram: ${submittedInfo.program?.programName || '-'}`)}`} target="_blank" rel="noreferrer" id="submitted-registration-whatsapp">Hubungi WhatsApp Admin</a>
        </div>
      </section>
    </main>
  );

  if (!item) return <main className="public-registration"><p>{error || 'Memuat formulir...'}</p></main>;

  return (
    <main className="public-registration">
      <div className="registration-layout">

        {/* ── Form Card ─────────────────────────────────────── */}
        <section className="public-registration-card registration-form-card">
          <p className="eyebrow">M-CORE / REGISTRATION</p>
          <h1>Form Pendaftaran</h1>
          <div className="registration-number" aria-label="Status registrasi">
            <span>STATUS FORMULIR</span>
            <strong>{item.submittedAt ? item.registrationNo : 'PENDAFTARAN BARU'}</strong>
          </div>

          {done ? (
            <div className="success-panel">
              <h2>Data berhasil dikirim</h2>
              <p>Nomor registrasi resmi Anda: <strong>{item.registrationNo}</strong></p>
              <p>Form Pendaftaran ini sudah diisi dan link sudah tidak berlaku.</p>
              <a
                className="primary-button whatsapp-confirmation-button"
                href={`https://wa.me/6281133333411?text=${encodeURIComponent(`Konfirmasi pendaftaran\nNO. REGISTRASI: ${item.registrationNo}\nNama: ${form.fullName || item.fullName || '-'}\nProgram: ${item.program.programName}`)}`}
                target="_blank"
                rel="noreferrer"
                id="confirm-registration-whatsapp"
              >
                Konfirmasi via WhatsApp Admin
              </a>
            </div>
          ) : (

            <form className="public-form" onSubmit={onSubmit}>

              {/* Wizard indicator */}
              <div className="wizard-progress">
                <strong>Bagian {step} dari 2</strong>
                <span>{step === 1 ? 'Data siswa dan kontak' : 'Data keluarga dan pembayaran'}</span>
              </div>

              {/* ── BAGIAN 1: Data siswa ──────────────────────── */}
              {step === 1 && (
                <>
                  <div className="form-category-heading">
                    <span className="section-kicker">DATA SISWA</span>
                    <h3>Identitas dan kontak siswa</h3>
                  </div>

                  <label className="form-span-full">Nama lengkap
                    <input required value={form.fullName || ''} onChange={(e) => set('fullName', e.target.value)} />
                  </label>

                  <div className="two-fields">
                    <label>Jenis kelamin
                      <select required value={form.gender || ''} onChange={(e) => set('gender', e.target.value)}>
                        <option value="">Pilih</option>
                        <option value="male">Laki-laki</option>
                        <option value="female">Perempuan</option>
                      </select>
                    </label>
                    <label>NIK
                      <input
                        required
                        value={form.nationalId || ''}
                        onChange={(e) => { set('nationalId', e.target.value); checkNik(e.target.value, token); }}
                        aria-describedby="nik-status"
                        aria-invalid={nikStatus.ok === false}
                      />
                      {nikStatus.message && (
                        <small id="nik-status" style={{ color: nikStatus.ok === true ? 'var(--color-success, #16a34a)' : nikStatus.ok === false ? 'var(--color-error, #dc2626)' : 'var(--color-muted, #6b7280)' }}>
                          {nikStatus.message}
                        </small>
                      )}
                    </label>
                  </div>

                  <div className="two-fields">
                    <label>Tempat lahir
                      <input required value={form.birthPlace || ''} onChange={(e) => set('birthPlace', e.target.value)} />
                    </label>
                    <label>Tanggal lahir
                      <input required type="date" value={form.birthDate || ''} onChange={(e) => set('birthDate', e.target.value)} />
                    </label>
                  </div>

                  <label className="form-span-full">Email
                    <input required type="email" value={form.email || ''} onChange={(e) => set('email', e.target.value)} />
                  </label>

                  <div className="two-fields">
                    <label>Nomor HP siswa
                      <input required value={form.studentPhone || ''} onChange={(e) => set('studentPhone', e.target.value)} />
                    </label>
                    <label>WhatsApp siswa
                      <input required value={form.studentWhatsapp || ''} onChange={(e) => set('studentWhatsapp', e.target.value)} />
                    </label>
                  </div>

                  <label className="form-span-full">Nomor HP orang tua
                    <input required value={form.parentPhone || ''} onChange={(e) => set('parentPhone', e.target.value)} />
                  </label>
                </>
              )}

              {step === 2 && (
                <>

                  {/* Field tambahan dari template */}
                  {activeGroups.map((group) => (
                    <fieldset className="registration-field-group" key={group.label}>
                      <legend>{group.label}</legend>
                      {group.fields.map((field) => (
                        <label key={field.key}>{field.label}
                          <input value={form[field.key] || ''} onChange={(e) => set(field.key, e.target.value)} />
                        </label>
                      ))}
                    </fieldset>
                  ))}

                  {hasGuardianField && (
                    <fieldset className="registration-field-group guardian-field-group">
                      <legend>Data wali</legend>
                      <label className="form-span-full">Wali sama dengan
                        <select required value={guardianChoice} onChange={(e) => { const value = e.target.value; setGuardianChoice(value); set('guardianType', value); }}>
                          <option value="">Pilih</option>
                          <option value="father">Ayah</option>
                          <option value="mother">Ibu</option>
                          <option value="other">Lainnya</option>
                        </select>
                      </label>
                      {guardianChoice === 'other' && (
                        <>
                          {GUARDIAN_FIELDS.map((field) => (
                            <label key={field.key}>{field.label}
                              <input required value={form[field.key] || ''} onChange={(e) => set(field.key, e.target.value)} />
                            </label>
                          ))}
                          <label className="form-span-full">Hubungan dengan siswa
                            <input required value={form.guardianRelationship || ''} onChange={(e) => set('guardianRelationship', e.target.value)} placeholder="Contoh: paman, kakak, kakek" />
                          </label>
                        </>
                      )}
                    </fieldset>
                  )}

                  {/* Riwayat pendidikan */}
                  {activeEducationLevels.length > 0 && (
                    <>
                      <div className="form-category-heading">
                        <span className="section-kicker">RIWAYAT PENDIDIKAN</span>
                        <h3>Riwayat pendidikan</h3>
                      </div>
                      {activeEducationLevels.map((level) => (
                        <fieldset className="registration-field-group education-history-fieldset" key={level}>
                          <legend>{level.replace('education', 'Riwayat pendidikan ')}</legend>
                          <label>Nama sekolah/universitas
                            <input value={form[`${level}.institutionName`] || ''} onChange={(e) => set(`${level}.institutionName`, e.target.value)} />
                          </label>
                          <div className="two-fields">
                            <label>Kota/Kabupaten
                              <input value={form[`${level}.cityRegency`] || ''} onChange={(e) => set(`${level}.cityRegency`, e.target.value)} />
                            </label>
                            <label>Provinsi
                              <input value={form[`${level}.province`] || ''} onChange={(e) => set(`${level}.province`, e.target.value)} />
                            </label>
                          </div>
                          <div className="two-fields">
                            <label>Tahun lulus
                              <input type="number" value={form[`${level}.graduationYear`] || ''} onChange={(e) => set(`${level}.graduationYear`, e.target.value)} />
                            </label>
                            {!['educationSd', 'educationSmp'].includes(level) && (
                              <label>Jurusan
                                <input value={form[`${level}.degreeLevel`] || ''} onChange={(e) => set(`${level}.degreeLevel`, e.target.value)} />
                              </label>
                            )}
                          </div>
                        </fieldset>
                      ))}
                    </>
                  )}

                  {/* Upload & Pembayaran */}
                  <div className="form-category-heading">
                    <span className="section-kicker">DOKUMEN DAN PEMBAYARAN</span>
                    <h3>Upload dokumen dan pilih metode pembayaran</h3>
                  </div>

                  <label>Foto siswa
                    <input required type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => { const file = e.target.files?.[0]; if (file) void uploadFile(file, 'photoUrl'); }} />
                  </label>

                  <label>Bukti pembayaran
                    <input required type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => { const file = e.target.files?.[0]; if (file) void uploadFile(file, 'paymentProofUrl'); }} />
                    {uploading && <small>Mengunggah gambar...</small>}
                    {form.paymentProofUrl && <small>Bukti berhasil diunggah</small>}
                  </label>

                  <label>Jenis pembayaran
                    <select required value={form.paymentMethod || ''} onChange={(e) => set('paymentMethod', e.target.value)}>
                      <option value="">Pilih</option>
                      <option value="TRANSFER">Transfer</option>
                      <option value="CASH">Cash</option>
                    </select>
                  </label>
                </>
              )}

              {/* Tombol navigasi */}
              <div className="form-actions">
                {step === 1 ? (
                  <button type="button" className="primary-button" onClick={() => { if (validateStudentSection()) setStep(2); }}>Lanjut ke data keluarga</button>
                ) : (
                  <>
                    <button type="button" className="detail-button" onClick={() => { setError(''); setStep(1); }}>Kembali</button>
                    <button className="primary-button" disabled={uploading}>Kirim pendaftaran</button>
                  </>
                )}
              </div>

              {error && <p className="state error">{error}</p>}

            </form>
          )}
        </section>

        {/* ── Checkout Sidebar ──────────────────────────────── */}
        <aside className="checkout-summary" aria-label="Ringkasan pembayaran">
          <div className="checkout-summary-heading">
            <span className="eyebrow">CHECKOUT</span>
            <h2>Ringkasan pendaftaran</h2>
          </div>
          <div className="checkout-card checkout-package">
            <span className="checkout-label">PAKET YANG DIPILIH</span>
            <div className="checkout-card-heading">
              <div>
                <strong>{item.program.programName}</strong>
                <small>{item.program.programCode} · {item.enrollmentPeriod.name}</small>
              </div>
              <span className="checkout-check">✓</span>
            </div>
          </div>
          <div className="checkout-card checkout-total">
            <span className="checkout-label">TOTAL PEMBAYARAN</span>
            <strong className="checkout-price">Rp {item.enrollmentPeriod.registrationFee.toLocaleString('id-ID')}</strong>
            <small>Biaya pendaftaran sesuai paket yang dipilih</small>
          </div>
        </aside>

      </div>
    </main>
  );
}