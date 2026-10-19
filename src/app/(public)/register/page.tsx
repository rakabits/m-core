'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Template = {
  id: string;
  name: string;
  selectedFields: string[];
};

type EnrollmentPeriod = {
  id: string;
  name: string;
  status: 'DRAFT' | 'OPEN' | 'CLOSED' | 'ARCHIVED';
  registrationFee: number;
  currency: string;
  startsAt: string;
  endsAt: string;
  notes?: string | null;
  formTemplate?: Template | null;
  program: {
    id: string;
    programName: string;
    programCode: string;
  };
};

type ParsedNotes = {
  description: string;
  facilities: string[];
  bookletUrl: string;
  thumbnailUrl: string;
};

const money = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

function parseNotes(raw?: string | null): ParsedNotes {
  if (!raw) {
    return { description: '', facilities: [], bookletUrl: '', thumbnailUrl: '' };
  }
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === 'object' && parsed !== null) {
      return {
        description: parsed.description || parsed.notes || '',
        facilities: Array.isArray(parsed.facilities)
          ? parsed.facilities
          : parsed.facilities
            ? String(parsed.facilities).split('\n').filter(Boolean)
            : [],
        bookletUrl: parsed.bookletUrl || '',
        thumbnailUrl: parsed.thumbnailUrl || '',
      };
    }
  } catch {
    // fallback plain text
  }
  return { description: raw, facilities: [], bookletUrl: '', thumbnailUrl: '' };
}

// Program level badge and styling helper
function getProgramMeta(programCode: string, programName: string) {
  const code = (programCode || '').toUpperCase();
  const name = (programName || '').toUpperCase();
  if (code.includes('MTS') || name.includes('MTS') || name.includes('JUNIOR')) {
    return {
      category: 'Junior High School',
      badgeClass: 'badge-mts',
      defaultCover: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=800&auto=format&fit=crop',
    };
  }
  if (code.includes('MA') || name.includes('MA') || name.includes('SENIOR')) {
    return {
      category: 'Senior High School',
      badgeClass: 'badge-ma',
      defaultCover: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop',
    };
  }
  return {
    category: 'Pre-University',
    badgeClass: 'badge-preuniv',
    defaultCover: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=800&auto=format&fit=crop',
  };
}

export default function VisitorRegistrationCatalogPage() {
  const router = useRouter();
  const [periods, setPeriods] = useState<EnrollmentPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [startingPeriodId, setStartingPeriodId] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');

  useEffect(() => {
    async function fetchPeriods() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/v1/enrollment-periods', { cache: 'no-store' });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message || 'Gagal memuat daftar program pendaftaran');
        // Filter only OPEN enrollment periods for visitor registration
        const all: EnrollmentPeriod[] = json.data || [];
        const openPeriods = all.filter((p) => p.status === 'OPEN');
        setPeriods(openPeriods);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal memuat program pendaftaran.');
      } finally {
        setLoading(false);
      }
    }
    fetchPeriods();
  }, []);

  async function handleStartRegistration(period: EnrollmentPeriod) {
    setStartingPeriodId(period.id);
    setError('');
    try {
      const res = await fetch('/api/v1/public-registration/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enrollmentPeriodId: period.id }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || 'Gagal membuka form pendaftaran mandiri');
      }
      if (json.data?.redirectUrl) {
        router.push(json.data.redirectUrl);
      } else if (json.data?.publicToken) {
        router.push(`/register/${json.data.publicToken}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kendala saat memulai pendaftaran');
      setStartingPeriodId(null);
    }
  }

  const filteredPeriods = periods.filter((item) => {
    if (selectedFilter === 'ALL') return true;
    const meta = getProgramMeta(item.program.programCode, item.program.programName);
    return meta.category.toUpperCase().includes(selectedFilter);
  });

  const [whatsappOpen, setWhatsappOpen] = useState(false);

  const whatsappAdmins = [
    {
      name: 'Pon-Pes Mumtaza',
      phone: '6281133333451',
      displayPhone: '+62 811-3333-3451',
      desc: 'Info pendaftaran MTs & MA Mumtaza',
      message: 'Halo Admin Pon-Pes Mumtaza, saya ingin menanyakan informasi pendaftaran dan program di Mumtaza.',
    },
    {
      name: 'Al-Azhar Mesir',
      phone: '6281133333410',
      displayPhone: '+62 811-3333-3410',
      desc: 'Konsultasi Pra-Universitas Al-Azhar Mesir',
      message: 'Halo Admin Al-Azhar Mesir, saya ingin menanyakan informasi pendaftaran program studi ke Al-Azhar Mesir.',
    },
    {
      name: 'Turki',
      phone: '6281133333411',
      displayPhone: '+62 811-3333-3411',
      desc: 'Konsultasi Studi & Kuliah di Turki',
      message: 'Halo Admin Program Turki, saya ingin menanyakan informasi pendaftaran kuliah dan persiapan studi ke Turki.',
    },
    {
      name: 'Jordan',
      phone: '6281133333451',
      displayPhone: '+62 811-3333-3451',
      desc: 'Konsultasi Studi ke Yordania / Jordan',
      message: 'Halo Admin Program Jordan, saya ingin menanyakan informasi pendaftaran program studi ke Yordania.',
    },
    {
      name: 'Pakistan',
      phone: '6281133333451',
      displayPhone: '+62 811-3333-3451',
      desc: 'Konsultasi Studi ke Pakistan',
      message: 'Halo Admin Program Pakistan, saya ingin menanyakan informasi pendaftaran program studi ke Pakistan.',
    },
    {
      name: 'China',
      phone: '6281133333410',
      displayPhone: '+62 811-3333-3410',
      desc: 'Konsultasi Studi & Beasiswa ke China',
      message: 'Halo Admin Program China, saya ingin menanyakan informasi pendaftaran dan persiapan studi ke China.',
    },
    {
      name: 'Timur Tengah',
      phone: '6281133333410',
      displayPhone: '+62 811-3333-3410',
      desc: 'Konsultasi Studi Kawasan Timur Tengah',
      message: 'Halo Admin Program Timur Tengah, saya ingin berkonsultasi mengenai program pendidikan ke Timur Tengah.',
    },
  ];

  return (
    <main className="visitor-catalog-page">
      {/* Top Navbar */}
      <header className="landing-nav">
        <div className="landing-container landing-nav-inner">
          <Link href="/" className="landing-brand">
            <span className="landing-logo">M</span>
            <span>
              <b>M-CORE</b>
              <small>PENDAFTARAN SISWA BARU</small>
            </span>
          </Link>
          <nav>
            <Link href="/">Beranda</Link>
            <a href="#program-list">Daftar Program</a>
            <a href="#alur">Alur Pendaftaran</a>
            <a href="#faq">Bantuan</a>
          </nav>
          <Link href="/login" className="landing-button landing-button-small landing-button-ghost">
            Masuk Portal
          </Link>
        </div>
      </header>

      {/* Hero Header Section */}
      <section className="catalog-hero">
        <div className="landing-container">
          <div className="catalog-hero-content">
            <span className="landing-pill">PENERIMAAN PESERTA DIDIK BARU (PPDB)</span>
            <h1>
              Pilih Program Pendidikan Impian &amp; <em>Daftar Mandiri</em>.
            </h1>
            <p>
              Selamat datang di portal pendaftaran resmi Mumtaza Core. Silakan pilih program dan periode
              aktif di bawah ini untuk memulai pengisian formulir pendaftaran secara online langsung dari perangkat Anda.
            </p>
          </div>
        </div>
      </section>

      {/* Main Catalog Section */}
      <section id="program-list" className="catalog-content-section">
        <div className="landing-container">
          {/* Filter Bar */}
          <div className="catalog-filter-bar">
            <div>
              <span className="section-kicker">PERIODE PENDAFTARAN AKTIF</span>
              <h2>Pilihan Program Tersedia</h2>
            </div>
            <div className="catalog-tabs">
              <button
                type="button"
                className={`catalog-tab ${selectedFilter === 'ALL' ? 'active' : ''}`}
                onClick={() => setSelectedFilter('ALL')}
              >
                Semua Jenjang ({periods.length})
              </button>
              <button
                type="button"
                className={`catalog-tab ${selectedFilter === 'JUNIOR' ? 'active' : ''}`}
                onClick={() => setSelectedFilter('JUNIOR')}
              >
                MTs (SMP)
              </button>
              <button
                type="button"
                className={`catalog-tab ${selectedFilter === 'SENIOR' ? 'active' : ''}`}
                onClick={() => setSelectedFilter('SENIOR')}
              >
                MA (SMA)
              </button>
              <button
                type="button"
                className={`catalog-tab ${selectedFilter === 'PRE-UNIVERSITY' ? 'active' : ''}`}
                onClick={() => setSelectedFilter('PRE-UNIVERSITY')}
              >
                Pra-Universitas
              </button>
            </div>
          </div>

          {error && <div className="state error catalog-error-box">{error}</div>}

          {/* Cards Grid */}
          {loading ? (
            <div className="catalog-loading">
              <div className="spinner-ring" />
              <p>Memuat daftar periode aktif pendaftaran...</p>
            </div>
          ) : filteredPeriods.length === 0 ? (
            <div className="catalog-empty-card">
              <div className="empty-icon">📂</div>
              <h3>Belum Ada Periode Pendaftaran yang Dibuka</h3>
              <p>
                Saat ini belum ada periode pendaftaran berstatus <strong>OPEN</strong>. Silakan hubungi
                pihak akademik atau kembali berkala untuk melihat jadwal pembukaan pendaftaran berikutnya.
              </p>
              <Link href="/" className="landing-button" style={{ marginTop: '16px' }}>
                Kembali ke Beranda
              </Link>
            </div>
          ) : (
            <div className="program-cards-grid">
              {filteredPeriods.map((period) => {
                const parsed = parseNotes(period.notes);
                const meta = getProgramMeta(period.program.programCode, period.program.programName);
                const coverImage = parsed.thumbnailUrl || meta.defaultCover;
                const isStarting = startingPeriodId === period.id;

                const startDate = new Date(period.startsAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                });
                const endDate = new Date(period.endsAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                });

                return (
                  <article className="program-card-box" key={period.id}>
                    {/* Thumbnail Box */}
                    <div className="program-card-thumb">
                      <img src={coverImage} alt={period.name} loading="lazy" />
                      <div className="card-thumb-overlay" />
                      <div className="card-badge-row">
                        <span className={`program-level-badge ${meta.badgeClass}`}>{meta.category}</span>
                        <span className="program-status-pill">
                          <span className="live-dot" /> DIBUKA
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="program-card-body">
                      <div className="program-card-header">
                        <h3 className="program-title">{period.name}</h3>
                      </div>

                      {/* Schedule info */}
                      <div className="period-schedule-info">
                        <span className="schedule-icon">📅</span>
                        <span>
                          {startDate} &ndash; {endDate}
                        </span>
                      </div>

                      {/* Description if any */}
                      {parsed.description && (
                        <p className="program-desc">{parsed.description}</p>
                      )}

                      {/* Fee Badge */}
                      <div className="program-fee-section">
                        <span className="fee-label">Biaya Pendaftaran</span>
                        <div className="fee-amount">
                          {period.registrationFee === 0 ? (
                            <strong className="free-text">Gratis / Bebas Biaya</strong>
                          ) : (
                            <strong>{money.format(period.registrationFee)}</strong>
                          )}
                        </div>
                      </div>

                      {/* Facilities List */}
                      <div className="program-facilities-section">
                        <span className="facilities-heading">Fasilitas &amp; Keunggulan:</span>
                        {parsed.facilities.length > 0 ? (
                          <ul className="facilities-list">
                            {parsed.facilities.map((facility, idx) => (
                              <li key={idx}>
                                <span className="facility-check">✓</span>
                                <span>{facility}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <ul className="facilities-list">
                            <li>
                              <span className="facility-check">✓</span>
                              <span>Kurikulum Terpadu &amp; Berstandar Internasional</span>
                            </li>
                            <li>
                              <span className="facility-check">✓</span>
                              <span>Tenaga Pengajar Profesional &amp; Berpengalaman</span>
                            </li>
                            <li>
                              <span className="facility-check">✓</span>
                              <span>Fasilitas Penunjang Pembelajaran Modern</span>
                            </li>
                          </ul>
                        )}
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="program-card-footer">
                      {parsed.bookletUrl ? (
                        <a
                          href={parsed.bookletUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-booklet"
                          title="Unduh Booklet / Brosur Resmi"
                        >
                          <span>📖 Unduh Booklet</span>
                        </a>
                      ) : null}

                      <button
                        type="button"
                        className="btn-enroll-now"
                        disabled={isStarting}
                        onClick={() => handleStartRegistration(period)}
                      >
                        {isStarting ? (
                          <>
                            <span className="btn-spinner" />
                            <span>Menyiapkan Formulir...</span>
                          </>
                        ) : (
                          <>
                            <span>Daftar Sekarang</span>
                            <span className="arrow-icon">→</span>
                          </>
                        )}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Alur Pendaftaran Section */}
      <section id="alur" className="catalog-steps-section">
        <div className="landing-container">
          <div className="landing-section-heading">
            <span>ALUR PENDAFTARAN MANDIRI</span>
            <h2>Mudah, Cepat, dan Terintegrasi</h2>
          </div>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h4>Pilih Program</h4>
              <p>Tentukan program pendidikan dan periode yang sesuai kebutuhan Anda pada kartu di atas.</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h4>Isi Formulir Online</h4>
              <p>Lengkapi data calon siswa, kontak, keluarga, dan dokumen sesuai template resmi yang aktif.</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h4>Upload &amp; Verifikasi</h4>
              <p>Unggah bukti administrasi. Sistem akan mencatat pendaftaran dan memberikan nomor registrasi resmi.</p>
            </div>
            <div className="step-card">
              <div className="step-number">4</div>
              <h4>Konfirmasi &amp; Selesai</h4>
              <p>Dapatkan konfirmasi pendaftaran instan melalui WhatsApp dan pantau status kelulusan berkala.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="faq" className="landing-footer">
        <div className="landing-container landing-footer-inner">
          <div>
            <b>M-CORE · MUMTAZA CORE</b>
            <p>Pusat Informasi &amp; Pendaftaran Siswa Baru Terpadu</p>
          </div>
          <p>© 2026 Mumtaza Core. Hak Cipta Dilindungi.</p>
        </div>
      </footer>

      {/* Floating WhatsApp CTA & Program Admin Picker */}
      <aside className="whatsapp-floating-container" aria-label="Bantuan WhatsApp">
        {whatsappOpen && (
          <div className="whatsapp-popup-menu" role="dialog" aria-modal="true" aria-label="Pilih Admin WhatsApp Program">
            <div className="whatsapp-popup-header">
              <div className="whatsapp-popup-header-info">
                <div className="whatsapp-header-avatar">
                  <svg viewBox="0 0 24 24" width="22" height="22">
                    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z" />
                  </svg>
                </div>
                <div>
                  <h4>Konsultasi WhatsApp</h4>
                  <p>Hubungi admin program resmi</p>
                </div>
              </div>
              <button
                type="button"
                className="whatsapp-popup-close"
                onClick={() => setWhatsappOpen(false)}
                aria-label="Tutup menu WhatsApp"
              >
                ×
              </button>
            </div>

            <div className="whatsapp-popup-body">
              <p className="whatsapp-popup-note">Silakan pilih admin program yang ingin Anda hubungi:</p>
              <div className="whatsapp-admin-list">
                {whatsappAdmins.map((adm) => (
                  <a
                    key={adm.name}
                    href={`https://wa.me/${adm.phone}?text=${encodeURIComponent(adm.message)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="whatsapp-admin-item"
                    onClick={() => setWhatsappOpen(false)}
                  >
                    <div className="whatsapp-admin-info">
                      <strong>{adm.name}</strong>
                      <small>{adm.desc}</small>
                    </div>
                    <span className="whatsapp-admin-action" title="Buka chat WhatsApp">
                      💬
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        <button
          type="button"
          className="whatsapp-floating-btn"
          onClick={() => setWhatsappOpen(!whatsappOpen)}
          aria-expanded={whatsappOpen}
          aria-label="Bantuan WhatsApp Pendaftaran"
        >
          <span className="whatsapp-pulse-ring" />
          <span className="whatsapp-btn-icon">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="#ffffff">
              <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z" />
            </svg>
          </span>
          <span className="whatsapp-btn-text">
            {whatsappOpen ? 'Tutup Konsultasi' : 'Konsultasi Sekarang'}
          </span>
        </button>
      </aside>
    </main>
  );
}

