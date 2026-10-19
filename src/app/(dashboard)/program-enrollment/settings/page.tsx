'use client';
import { useEffect, useState } from 'react';

type Template = { id: string; name: string; selectedFields: string[] };
type Period = {
  id: string;
  name: string;
  status: 'DRAFT' | 'OPEN' | 'CLOSED' | 'ARCHIVED';
  registrationFee: number;
  startsAt: string;
  endsAt: string;
  notes?: string | null;
  formTemplate?: Template | null;
  program: { id: string; programName: string; programCode: string };
};
type Program = {
  id: string;
  programName: string;
  programCode: string;
  academicYear?: string;
  academicLevel?: 'JUNIOR_HIGH' | 'SENIOR_HIGH' | 'PRE_UNIVERSITY' | null;
};

const money = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

const fieldGroups = [
  { label: 'Identitas siswa', fields: [{ key: 'nisn', label: 'NISN' }, { key: 'familyCardNumber', label: 'Nomor Kartu Keluarga' }, { key: 'passportNumber', label: 'Nomor paspor' }] },
  { label: 'Data kontak', fields: [{ key: 'phone', label: 'Nomor telepon' }, { key: 'telegramUsername', label: 'Username Telegram' }] },
  { label: 'Alamat', fields: [{ key: 'addressLine', label: 'Alamat rumah lengkap' }, { key: 'addressRt', label: 'RT' }, { key: 'addressRw', label: 'RW' }, { key: 'village', label: 'Desa/Kelurahan' }, { key: 'district', label: 'Kecamatan' }, { key: 'cityRegency', label: 'Kota/Kabupaten' }, { key: 'province', label: 'Provinsi' }, { key: 'postalCode', label: 'Kode pos' }] },
  { label: 'Data fisik', fields: [{ key: 'heightCm', label: 'Tinggi badan' }, { key: 'weightKg', label: 'Berat badan' }, { key: 'siblingCount', label: 'Jumlah saudara' }, { key: 'birthOrder', label: 'Anak ke-' }] },
  { label: 'Data ayah', fields: [{ key: 'fatherFullName', label: 'Nama lengkap ayah' }, { key: 'fatherNik', label: 'NIK ayah' }, { key: 'fatherBirthPlace', label: 'Tempat lahir ayah' }, { key: 'fatherBirthDate', label: 'Tanggal lahir ayah' }, { key: 'fatherPhone', label: 'Nomor telepon ayah' }, { key: 'fatherEducation', label: 'Pendidikan terakhir ayah' }, { key: 'fatherOccupation', label: 'Pekerjaan ayah' }, { key: 'fatherMonthlyIncome', label: 'Penghasilan bulanan ayah' }] },
  { label: 'Data ibu', fields: [{ key: 'motherFullName', label: 'Nama lengkap ibu' }, { key: 'motherNik', label: 'NIK ibu' }, { key: 'motherBirthPlace', label: 'Tempat lahir ibu' }, { key: 'motherBirthDate', label: 'Tanggal lahir ibu' }, { key: 'motherPhone', label: 'Nomor telepon ibu' }, { key: 'motherEducation', label: 'Pendidikan terakhir ibu' }, { key: 'motherOccupation', label: 'Pekerjaan ibu' }, { key: 'motherMonthlyIncome', label: 'Penghasilan bulanan ibu' }] },
  { label: 'Riwayat pendidikan', fields: [{ key: 'educationSd', label: 'Riwayat pendidikan SD' }, { key: 'educationSmp', label: 'Riwayat pendidikan SMP' }, { key: 'educationSma', label: 'Riwayat pendidikan SMA' }, { key: 'educationS1', label: 'Riwayat pendidikan S1' }, { key: 'educationS2', label: 'Riwayat pendidikan S2' }, { key: 'educationS3', label: 'Riwayat pendidikan S3' }] },
  { label: 'Data lain', fields: [{ key: 'guardianData', label: 'Data wali' }, { key: 'notes', label: 'Catatan tambahan' }] }
];

const fields = fieldGroups.flatMap(group => group.fields);
const requiredFields = ['Nama lengkap', 'Jenis kelamin', 'NIK', 'Tempat lahir', 'Tanggal lahir', 'Email', 'Nomor HP siswa', 'WhatsApp siswa', 'Nomor HP orang tua', 'Bukti pembayaran', 'Jenis pembayaran', 'Foto siswa'];

const initialForm = {
  programId: '',
  formTemplateId: '',
  name: '',
  status: 'DRAFT',
  registrationFee: '',
  startsAt: '',
  endsAt: '',
  notes: '',
  facilities: '',
  bookletUrl: '',
  thumbnailUrl: '',
};

export default function RegistrationSettingsPage() {
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [templateListOpen, setTemplateListOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [templateSearch, setTemplateSearch] = useState('');
  const [templatePage, setTemplatePage] = useState(1);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [activeYears, setActiveYears] = useState<Record<string, string>>({});
  const [templates, setTemplates] = useState<Template[]>([]);
  const [form, setForm] = useState(initialForm);
  const [templateName, setTemplateName] = useState('');
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<Period | null>(null);

  async function readJson(response: Response) {
    const text = await response.text();
    if (!text.trim()) throw new Error(`API mengembalikan response kosong (${response.status})`);
    try {
      return JSON.parse(text);
    } catch {
      throw new Error(`API mengembalikan response tidak valid (${response.status})`);
    }
  }

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [a, b, c, j, s, u] = await Promise.all([
        fetch('/api/v1/enrollment-periods', { cache: 'no-store' }),
        fetch('/api/v1/programs', { cache: 'no-store' }),
        fetch('/api/v1/registration-form-templates', { cache: 'no-store' }),
        fetch('/api/v1/academic-years/active?academicLevel=JUNIOR_HIGH', { cache: 'no-store' }),
        fetch('/api/v1/academic-years/active?academicLevel=SENIOR_HIGH', { cache: 'no-store' }),
        fetch('/api/v1/academic-years/active?academicLevel=PRE_UNIVERSITY', { cache: 'no-store' })
      ]);
      const [pj, pr, tj, jy, sy, uy] = await Promise.all([
        readJson(a),
        readJson(b),
        readJson(c),
        readJson(j),
        readJson(s),
        readJson(u)
      ]);
      if (!a.ok || !b.ok || !c.ok) {
        throw new Error(pj.error?.message || pr.error?.message || tj.error?.message || 'Gagal memuat pengaturan pendaftaran');
      }
      setPeriods(pj.data || []);
      setPrograms((pr.data || []).filter((x: Program & { isActive?: boolean }) => x.isActive !== false));
      setTemplates(tj.data || []);
      setActiveYears({
        JUNIOR_HIGH: jy.active || '',
        SENIOR_HIGH: sy.active || '',
        PRE_UNIVERSITY: uy.active || ''
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function setField(key: string, value: string) {
    setForm(x => ({ ...x, [key]: value }));
  }

  async function uploadThumbnail(file: File) {
    setUploadingThumb(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/v1/upload-thumbnail', { method: 'POST', body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Gagal mengunggah thumbnail');
      setField('thumbnailUrl', json.data?.url || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengunggah thumbnail');
    } finally {
      setUploadingThumb(false);
    }
  }

  async function saveTemplate(e: React.FormEvent) {
    e.preventDefault();
    if (!templateName.trim()) return setError('Nama template wajib diisi');
    setSaving(true);
    try {
      const r = await fetch('/api/v1/registration-form-templates', {
        method: editingTemplate ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingTemplate?.id, name: templateName, selectedFields })
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error?.message || 'Gagal menyimpan template');
      setTemplates(x => editingTemplate ? x.map(item => item.id === j.data.id ? j.data : item) : [j.data, ...x]);
      setTemplateName('');
      setSelectedFields([]);
      setEditingTemplate(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menyimpan template');
    } finally {
      setSaving(false);
    }
  }

  function parseNotes(raw?: string | null) {
    if (!raw) return { description: '', facilities: '', bookletUrl: '', thumbnailUrl: '' };
    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'object' && parsed !== null) {
        return {
          description: parsed.description || parsed.notes || '',
          facilities: Array.isArray(parsed.facilities) ? parsed.facilities.join('\n') : (parsed.facilities || ''),
          bookletUrl: parsed.bookletUrl || '',
          thumbnailUrl: parsed.thumbnailUrl || ''
        };
      }
    } catch {
      // plain text fallback
    }
    return { description: raw, facilities: '', bookletUrl: '', thumbnailUrl: '' };
  }

  function openNewPeriodModal() {
    setEditingPeriod(null);
    setForm(initialForm);
    setError('');
    setModalOpen(true);
  }

  function openEditPeriodModal(period: Period) {
    setEditingPeriod(period);
    const parsed = parseNotes(period.notes);
    setForm({
      programId: period.program.id,
      formTemplateId: period.formTemplate?.id || '',
      name: period.name,
      status: period.status,
      registrationFee: String(period.registrationFee),
      startsAt: period.startsAt ? new Date(period.startsAt).toISOString().slice(0, 16) : '',
      endsAt: period.endsAt ? new Date(period.endsAt).toISOString().slice(0, 16) : '',
      notes: parsed.description,
      facilities: parsed.facilities,
      bookletUrl: parsed.bookletUrl,
      thumbnailUrl: parsed.thumbnailUrl
    });
    setError('');
    setModalOpen(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const facilitiesArray = form.facilities
        .split('\n')
        .map(f => f.trim())
        .filter(Boolean);

      const notesPayload = JSON.stringify({
        description: form.notes.trim(),
        facilities: facilitiesArray,
        bookletUrl: form.bookletUrl.trim(),
        thumbnailUrl: form.thumbnailUrl.trim()
      });

      const url = editingPeriod
        ? `/api/v1/enrollment-periods/${editingPeriod.id}`
        : '/api/v1/enrollment-periods';
      const method = editingPeriod ? 'PATCH' : 'POST';

      const r = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          programId: form.programId,
          formTemplateId: form.formTemplateId || null,
          name: form.name.trim(),
          status: form.status,
          registrationFee: Number(form.registrationFee),
          startsAt: form.startsAt,
          endsAt: form.endsAt,
          notes: notesPayload
        })
      });

      const j = await r.json();
      if (!r.ok) throw new Error(j.error?.message || j.error?.code || 'Gagal menyimpan periode');
      setForm(initialForm);
      setEditingPeriod(null);
      setModalOpen(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menyimpan periode');
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(id: string, status: Period['status']) {
    await fetch(`/api/v1/enrollment-periods/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    load();
  }

  const filteredTemplates = templates.filter(template => template.name.toLowerCase().includes(templateSearch.trim().toLowerCase()));
  const templatePageCount = Math.max(1, Math.ceil(filteredTemplates.length / 10));
  const visibleTemplates = filteredTemplates.slice((templatePage - 1) * 10, templatePage * 10);

  useEffect(() => {
    if (templatePage > templatePageCount) setTemplatePage(templatePageCount);
  }, [templatePage, templatePageCount]);

  const preUnivProgram = programs.find((p) => p.academicLevel === 'PRE_UNIVERSITY' && p.academicYear === activeYears['PRE_UNIVERSITY']) || programs.find((p) => p.academicLevel === 'PRE_UNIVERSITY' || p.programCode === 'PRE-UNIV');
  const mtsProgram = programs.find((p) => p.academicLevel === 'JUNIOR_HIGH' && p.academicYear === activeYears['JUNIOR_HIGH']) || programs.find((p) => p.academicLevel === 'JUNIOR_HIGH' || p.programCode === 'MTS');
  const maProgram = programs.find((p) => p.academicLevel === 'SENIOR_HIGH' && p.academicYear === activeYears['SENIOR_HIGH']) || programs.find((p) => p.academicLevel === 'SENIOR_HIGH' || p.programCode === 'MA');

  const programDropdownList = [
    ...(mtsProgram ? [{ key: 'mts', label: 'MTs - JUNIOR HIGH SCHOOL', programId: mtsProgram.id }] : []),
    ...(maProgram ? [{ key: 'ma', label: 'MA - SENIOR HIGH SCHOOL', programId: maProgram.id }] : []),
    ...(preUnivProgram ? [
      { key: 'preuniv-mesir', label: 'Mesir - Pre-University', programId: preUnivProgram.id },
      { key: 'preuniv-turki', label: 'Turki - Pre-University', programId: preUnivProgram.id },
      { key: 'preuniv-jordan', label: 'Jordan - Pre-University', programId: preUnivProgram.id },
      { key: 'preuniv-pakistan', label: 'Pakistan - Pre-University', programId: preUnivProgram.id },
      { key: 'preuniv-cina', label: 'Cina - Pre-University', programId: preUnivProgram.id },
    ] : []),
  ];

  return (
    <main className="students-page academic-page">
      <header className="students-header academic-hero">
        <div>
          <p className="eyebrow">M-CORE / PROGRAM ENROLLMENT</p>
          <h1>Registration Settings</h1>
          <p className="subtitle">Kelola template formulir reusable dan periode pendaftaran mandiri visitor.</p>
        </div>
      </header>

      <section className="academic-grid">
        <div className="registration-action-card">
          <section className="student-card academic-card registration-summary-card">
            <div>
              <span className="section-kicker">FORM BUILDER DINAMIS</span>
              <h2>Template formulir</h2>
              <button
                type="button"
                className="template-history-link"
                onClick={() => { setTemplateSearch(''); setTemplatePage(1); setTemplateListOpen(true); }}
              >
                Lihat template yang pernah dibuat ({templates.length})
              </button>
            </div>
            <button
              type="button"
              className="primary-button"
              onClick={() => { setError(''); setTemplateName(''); setSelectedFields([]); setTemplateModalOpen(true); }}
            >
              + Buat template formulir
            </button>
          </section>

          <section className="student-card academic-card registration-summary-card">
            <div>
              <span className="section-kicker">NEW REGISTRATION PERIOD</span>
              <h2>Kelola periode pendaftaran</h2>
            </div>
            <button
              type="button"
              className="primary-button"
              onClick={openNewPeriodModal}
            >
              + Tambah periode
            </button>
          </section>
        </div>

        <section className="student-card academic-card roster-card">
          <div className="card-heading">
            <div>
              <span className="section-kicker">REGISTRATION WINDOWS</span>
              <h2>Periode aktif &amp; Publik</h2>
            </div>
            <span className="count-pill">{periods.length} periode</span>
          </div>

          {loading ? (
            <p className="state">Memuat...</p>
          ) : (
            <div className="roster-table">
              {periods.map(item => {
                const parsed = parseNotes(item.notes);
                return (
                  <article className="roster-row" key={item.id} style={{ alignItems: 'center' }}>
                    <div className="avatar-dot" style={{ overflow: 'hidden' }}>
                      {parsed.thumbnailUrl ? (
                        <img src={parsed.thumbnailUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        item.program.programCode.slice(0, 2)
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong>{item.program.programName}</strong>
                        {parsed.bookletUrl && (
                          <a
                            href={parsed.bookletUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontSize: '10px', color: 'var(--teal)', textDecoration: 'none', background: '#e0f5f2', padding: '2px 6px', borderRadius: '4px' }}
                          >
                            Booklet ↗
                          </a>
                        )}
                      </div>
                      <small style={{ display: 'block', color: 'var(--muted)', marginTop: '2px' }}>
                        {item.name} · {item.formTemplate?.name || 'Template bawaan'}
                        {parsed.facilities && ` · ${parsed.facilities.split('\n').filter(Boolean).length} fasilitas`}
                      </small>
                    </div>
                    <span>{money.format(item.registrationFee)}</span>
                    <button
                      type="button"
                      className="detail-button"
                      style={{ padding: '6px 12px', fontSize: '11px' }}
                      onClick={() => openEditPeriodModal(item)}
                    >
                      Edit Detail
                    </button>
                    <select
                      value={item.status}
                      aria-label={`Status ${item.name}`}
                      onChange={e => changeStatus(item.id, e.target.value as Period['status'])}
                    >
                      <option>DRAFT</option>
                      <option>OPEN</option>
                      <option>CLOSED</option>
                      <option>ARCHIVED</option>
                    </select>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </section>

      {/* Modal Preview / Edit Template */}
      {selectedTemplate && (
        <div className="registration-modal-backdrop" role="presentation">
          <section className="registration-modal template-history-modal" role="dialog" aria-modal="true">
            <button className="registration-modal-close" type="button" onClick={() => setSelectedTemplate(null)}>×</button>
            <div className="registration-modal-heading">
              <span className="section-kicker">TEMPLATE FORMULIR</span>
              <h2>{selectedTemplate.name}</h2>
              <p>Preview kolom template yang dipilih.</p>
              <button
                type="button"
                className="primary-button"
                onClick={() => {
                  setTemplateName(selectedTemplate.name);
                  setSelectedFields(selectedTemplate.selectedFields);
                  setEditingTemplate(selectedTemplate);
                  setSelectedTemplate(null);
                  setTemplateModalOpen(true);
                }}
              >
                Edit template
              </button>
            </div>
            <div className="template-preview">
              <div className="template-preview-required">
                <h4>Kolom wajib</h4>
                <ul>{requiredFields.map(field => <li key={field}>{field}</li>)}</ul>
              </div>
              {fieldGroups.map(group => {
                const selectedGroup = group.fields.filter(field => selectedTemplate.selectedFields.includes(field.key));
                return selectedGroup.length > 0 ? (
                  <div className="template-preview-group" key={group.label}>
                    <h4>{group.label}</h4>
                    <ul>{selectedGroup.map(field => <li key={field.key}>{field.label}</li>)}</ul>
                  </div>
                ) : null;
              })}
            </div>
          </section>
        </div>
      )}

      {/* Modal Template History */}
      {templateListOpen && (
        <div className="registration-modal-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) setTemplateListOpen(false); }}>
          <section className="registration-modal template-history-modal" role="dialog" aria-modal="true" aria-labelledby="template-history-title">
            <button className="registration-modal-close" type="button" aria-label="Tutup daftar template" onClick={() => setTemplateListOpen(false)}>×</button>
            <div className="registration-modal-heading">
              <span className="section-kicker">FORM BUILDER DINAMIS</span>
              <h2 id="template-history-title">Template yang pernah dibuat</h2>
              <p>Pilih template dari daftar yang tersimpan. Maksimal 10 template per halaman.</p>
            </div>
            <input
              className="template-history-search"
              type="search"
              value={templateSearch}
              placeholder="Cari nama template..."
              aria-label="Cari template"
              onChange={e => { setTemplateSearch(e.target.value); setTemplatePage(1); }}
            />
            {visibleTemplates.length === 0 ? (
              <p className="state">Template tidak ditemukan.</p>
            ) : (
              <div className="template-history-list">
                {visibleTemplates.map(template => (
                  <button
                    type="button"
                    className="template-history-item"
                    key={template.id}
                    onClick={() => { setSelectedTemplate(template); setTemplateListOpen(false); }}
                  >
                    <span>
                      <strong>{template.name}</strong>
                      <small>{template.selectedFields.length} kolom tambahan</small>
                    </span>
                    <span aria-hidden="true">→</span>
                  </button>
                ))}
              </div>
            )}
            <div className="template-history-pagination">
              <span>Halaman {templatePage} dari {templatePageCount}</span>
              <div>
                <button type="button" className="detail-button" disabled={templatePage === 1} onClick={() => setTemplatePage(page => page - 1)}>Sebelumnya</button>
                <button type="button" className="detail-button" disabled={templatePage === templatePageCount} onClick={() => setTemplatePage(page => page + 1)}>Berikutnya</button>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Modal Create/Edit Template */}
      {templateModalOpen && (
        <div className="registration-modal-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) setTemplateModalOpen(false); }}>
          <section className="registration-modal" role="dialog" aria-modal="true" aria-labelledby="template-modal-title">
            <button className="registration-modal-close" type="button" aria-label="Tutup template" onClick={() => setTemplateModalOpen(false)}>×</button>
            <div className="registration-modal-heading">
              <span className="section-kicker">FORM BUILDER DINAMIS</span>
              <h2 id="template-modal-title">{editingTemplate ? 'Edit template formulir' : 'Buat template formulir'}</h2>
              <p>Pilih kolom tambahan. Kolom wajib selalu ditampilkan.</p>
            </div>
            <form className="form-grid" onSubmit={async e => { await saveTemplate(e); setTemplateModalOpen(false); }}>
              <label className="form-span-full">
                Nama template
                <input required value={templateName} onChange={e => setTemplateName(e.target.value)} placeholder="Form Pendaftaran Lengkap" />
              </label>
              <div className="form-span-full">
                <div className="template-picker-toolbar">
                  <h3 className="template-picker-title">Pilih kolom yang ditampilkan</h3>
                  <button
                    type="button"
                    className="detail-button"
                    onClick={() => setSelectedFields(selectedFields.length === fields.length ? [] : fields.map(field => field.key))}
                  >
                    {selectedFields.length === fields.length ? 'Batalkan semua' : 'Pilih semua'}
                  </button>
                </div>
                {fieldGroups.map(group => (
                  <div className="template-field-group" key={group.label}>
                    <h4 className="template-field-group-title">{group.label}</h4>
                    <div className="template-field-list">
                      {group.fields.map(field => (
                        <label className="template-field-row" key={field.key}>
                          <input
                            type="checkbox"
                            checked={selectedFields.includes(field.key)}
                            onChange={e => setSelectedFields(current => e.target.checked ? [...current, field.key] : current.filter(key => key !== field.key))}
                          />
                          <strong>{field.label}</strong>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="form-span-full template-preview">
                <span className="section-kicker">PREVIEW</span>
                <div className="template-preview-required">
                  <h4>Kolom wajib</h4>
                  <ul>{requiredFields.map(field => <li key={field}>{field}</li>)}</ul>
                </div>
                {fieldGroups.map(group => {
                  const selectedGroup = group.fields.filter(field => selectedFields.includes(field.key));
                  return selectedGroup.length > 0 ? (
                    <div className="template-preview-group" key={group.label}>
                      <h4>{group.label}</h4>
                      <ul>{selectedGroup.map(field => <li key={field.key}>{field.label}</li>)}</ul>
                    </div>
                  ) : null;
                })}
              </div>
              <div className="registration-modal-actions">
                <button type="button" className="detail-button" onClick={() => setTemplateModalOpen(false)}>Batal</button>
                <button className="primary-button" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan template'}</button>
              </div>
            </form>
            {error && <p className="state error">{error}</p>}
          </section>
        </div>
      )}

      {/* Modal New / Edit Registration Period */}
      {modalOpen && (
        <div className="registration-modal-backdrop" role="presentation">
          <section className="registration-modal" role="dialog" aria-modal="true" style={{ maxWidth: '680px' }}>
            <button className="registration-modal-close" type="button" onClick={() => { setModalOpen(false); setEditingPeriod(null); }}>×</button>
            <div className="registration-modal-heading" style={{ marginBottom: '16px' }}>
              <span className="section-kicker">PERIODE PENDAFTARAN</span>
              <h2>{editingPeriod ? 'Edit Periode Pendaftaran' : 'New Registration Period'}</h2>
              <p>Atur detail periode, biaya, fasilitas, booklet, dan thumbnail kartu box publik.</p>
            </div>
            <form className="form-grid" onSubmit={submit}>
              <label>Program
                <select required value={form.programId} onChange={e => setField('programId', e.target.value)}>
                  <option value="">Pilih program</option>
                  {programDropdownList.map(item => (
                    <option key={item.key} value={item.programId}>{item.label}</option>
                  ))}
                </select>
              </label>

              <label>Template form
                <select required value={form.formTemplateId} onChange={e => setField('formTemplateId', e.target.value)}>
                  <option value="">Pilih template</option>
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </label>

              <label>Nama periode
                <input required value={form.name} onChange={e => setField('name', e.target.value)} placeholder="Gelombang 1 2026/2027" />
              </label>

              <label>Status
                <select value={form.status} onChange={e => setField('status', e.target.value)}>
                  <option>DRAFT</option>
                  <option>OPEN</option>
                  <option>CLOSED</option>
                  <option>ARCHIVED</option>
                </select>
              </label>

              <label>Biaya pendaftaran (IDR)
                <input required min="0" type="number" value={form.registrationFee} onChange={e => setField('registrationFee', e.target.value)} placeholder="350000" />
              </label>

              <label>Mulai
                <input required type="datetime-local" value={form.startsAt} onChange={e => setField('startsAt', e.target.value)} />
              </label>

              <label>Akhir
                <input required type="datetime-local" value={form.endsAt} onChange={e => setField('endsAt', e.target.value)} />
              </label>

              <label>Link Booklet (PDF / Brosur)
                <input
                  type="url"
                  value={form.bookletUrl}
                  onChange={e => setField('bookletUrl', e.target.value)}
                  placeholder="https://example.com/booklet-program.pdf"
                />
              </label>

              {/* Thumbnail Customization */}
              <div className="form-span-full" style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid var(--line)' }}>
                <span className="section-kicker" style={{ display: 'block', marginBottom: '6px' }}>THUMBNAIL KARTU PROGRAM</span>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  {form.thumbnailUrl ? (
                    <div style={{ width: '100px', height: '70px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--line)', flexShrink: 0 }}>
                      <img src={form.thumbnailUrl} alt="Thumbnail preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ) : (
                    <div style={{ width: '100px', height: '70px', borderRadius: '8px', background: '#e2e8f0', display: 'grid', placeItems: 'center', fontSize: '10px', color: '#64748b', flexShrink: 0 }}>
                      No Image
                    </div>
                  )}
                  <div style={{ flex: 1, display: 'grid', gap: '8px' }}>
                    <input
                      type="url"
                      value={form.thumbnailUrl}
                      onChange={e => setField('thumbnailUrl', e.target.value)}
                      placeholder="Atau masukkan URL gambar https://..."
                      style={{ fontSize: '12px' }}
                    />
                    <label style={{ fontSize: '11px', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <span>Upload gambar baru:</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        style={{ display: 'inline-block', width: 'auto', padding: '4px' }}
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) void uploadThumbnail(file);
                        }}
                      />
                    </label>
                    {uploadingThumb && <small style={{ color: 'var(--teal)' }}>Mengunggah thumbnail...</small>}
                  </div>
                </div>
              </div>

              {/* Fasilitas */}
              <label className="form-span-full">
                Fasilitas Program (1 baris per fasilitas)
                <textarea
                  value={form.facilities}
                  onChange={e => setField('facilities', e.target.value)}
                  placeholder={'Gedung Asrama AC\nMakan 3x Sehari & Laundry\nBimbingan Kitab & Bahasa Arab\nLab Komputer & Perpustakaan Digital\nSertifikat Resmi Kelulusan'}
                  rows={4}
                />
              </label>

              <label className="form-span-full">
                Catatan / Deskripsi Singkat
                <textarea
                  value={form.notes}
                  onChange={e => setField('notes', e.target.value)}
                  placeholder="Informasi pengantar program untuk calon siswa..."
                  rows={2}
                />
              </label>

              <div className="registration-modal-actions">
                <button type="button" className="detail-button" onClick={() => { setModalOpen(false); setEditingPeriod(null); }}>Batal</button>
                <button className="primary-button" disabled={saving || uploadingThumb}>
                  {saving ? 'Menyimpan...' : (editingPeriod ? 'Simpan Perubahan' : 'Simpan Periode')}
                </button>
              </div>
            </form>
            {error && <p className="state error">{error}</p>}
          </section>
        </div>
      )}

      {error && !modalOpen && <p className="state error">{error}</p>}
    </main>
  );
}
