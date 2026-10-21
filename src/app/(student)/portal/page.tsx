import Link from 'next/link';

const kpis = [
  { label: 'Kehadiran', value: '94%', trend: '+2.4%', note: 'dari bulan lalu', tone: 'mint', icon: '◒' },
  { label: 'Hafalan Qur’an', value: '12', suffix: ' Juz', trend: '76%', note: 'target semester', tone: 'amber', icon: '✦' },
  { label: 'Pelanggaran', value: '0', trend: 'Bersih', note: 'catatan disiplin', tone: 'lilac', icon: '✓' },
  { label: 'Prestasi', value: '04', trend: '+1 baru', note: 'tahun ini', tone: 'sky', icon: '★' },
];

const notifications = [
  { type: 'Penting', title: 'Pengumuman kegiatan tengah semester', text: 'Briefing siswa Senin, 07.30 WIB di aula utama.', time: '09.12', tone: 'urgent' },
  { type: 'Ujian', title: 'Jadwal ujian tahfidz diperbarui', text: 'Cek jadwal dan ruang ujian pada menu akademik.', time: 'Kemarin', tone: 'exam' },
  { type: 'Jadwal', title: 'Perubahan jadwal mentoring', text: 'Sesi mentoring dipindahkan ke Rabu sore.', time: '18 Okt', tone: 'schedule' },
];

export default function StudentPortalPage() {
  return (
    <main className="student-portal-page">
      <aside className="student-portal-sidebar">
        <Link href="/portal" className="student-portal-brand"><span className="student-portal-mark">M</span><span><strong>M-CORE</strong><small>STUDENT SPACE</small></span></Link>
        <div className="student-portal-sidebar-label">MENU UTAMA</div>
        <nav className="student-portal-nav" aria-label="Navigasi portal siswa">
          <Link className="active" href="/portal"><span>⌂</span>Overview</Link><Link href="/portal/profile"><span>◎</span>Profil saya</Link><Link href="/portal/academic-record"><span>▣</span>Akademik</Link><Link href="/portal/attendance"><span>◷</span>Presensi</Link><Link href="/portal/payments"><span>▤</span>Pembayaran</Link>
        </nav>
        <div className="student-portal-sidebar-help"><span>?</span><div><strong>Butuh bantuan?</strong><small>Hubungi admin akademik</small></div></div>
        <div className="student-portal-sidebar-footer"><span className="student-avatar">AR</span><span><strong>Ahmad Rasyid</strong><small>Siswa aktif</small></span><Link href="/login" aria-label="Keluar">↗</Link></div>
      </aside>
      <section className="student-portal-content">
        <header className="student-portal-topbar"><div><p className="student-portal-eyebrow">SENIN, 20 OKTOBER 2026</p><h1>Selamat pagi, Ahmad <span>✦</span></h1></div><div className="student-topbar-actions"><button className="student-search-button" aria-label="Cari">⌕</button><button className="student-notification-button" aria-label="Notifikasi">♧<i>3</i></button></div></header>
        <section className="student-welcome-card"><div className="student-welcome-copy"><p className="student-portal-eyebrow">RINGKASAN SISWA · SEMESTER GANJIL</p><h2>Terus bertumbuh,<br/><em>terus melangkah.</em></h2><p>Jaga ritme belajarmu hari ini. Setiap langkah kecil membawa kamu lebih dekat pada target.</p><div className="student-welcome-actions"><Link href="/portal/academic-record">Lihat progres <span>→</span></Link><span className="student-live-status"><i/> Sistem berjalan normal</span></div></div><div className="student-welcome-orb"><div><strong>94%</strong><span>kehadiran</span></div></div></section>
        <section className="student-kpi-section"><div className="student-section-heading"><div><p className="student-portal-eyebrow">YOUR PROGRESS</p><h2>Performa semester ini</h2></div><Link href="/portal/academic-record" className="student-text-button">Lihat detail ↗</Link></div><div className="student-kpi-grid">{kpis.map((kpi) => <article className={`student-kpi-card ${kpi.tone}`} key={kpi.label}><div className="student-kpi-top"><span className="student-kpi-label">{kpi.label}</span><span className="student-kpi-icon">{kpi.icon}</span></div><div className="student-kpi-value"><strong>{kpi.value}</strong>{kpi.suffix && <span>{kpi.suffix}</span>}</div><small><b>{kpi.trend}</b> {kpi.note}</small><div className="student-kpi-progress"><span style={{ width: kpi.label === 'Kehadiran' ? '94%' : kpi.label === 'Hafalan Qur’an' ? '76%' : kpi.label === 'Pelanggaran' ? '100%' : '62%' }}/></div></article>)}</div></section>
        <section className="student-lower-grid"><div className="student-notifications-section"><div className="student-section-heading"><div><p className="student-portal-eyebrow">STAY UPDATED</p><h2>Pusat notifikasi</h2></div><button className="student-text-button">Tandai dibaca</button></div><div className="student-notification-list">{notifications.map((notification) => <article className="student-notification-item" key={notification.title}><span className={`student-notification-dot ${notification.tone}`}/><div><div className="student-notification-meta"><b>{notification.type}</b><time>{notification.time}</time></div><h3>{notification.title}</h3><p>{notification.text}</p></div><span className="student-notification-arrow">↗</span></article>)}</div></div><aside className="student-today-card"><div className="student-section-heading"><div><p className="student-portal-eyebrow">AGENDA HARI INI</p><h2>Jadwal belajar</h2></div><span className="student-calendar-icon">20</span></div><div className="student-agenda-item"><time>07:30</time><div><strong>Bahasa Arab</strong><small>Kelas 3A · Ruang 204</small></div></div><div className="student-agenda-item current"><time>10:15</time><div><strong>Tahfidz Qur’an</strong><small>Ust. Muhammad · Masjid</small></div><span>Berlangsung</span></div><div className="student-agenda-item"><time>13:00</time><div><strong>Mentoring</strong><small>Kelompok Ahmad · Aula</small></div></div><Link href="/portal/academic-record" className="student-agenda-link">Lihat kalender lengkap →</Link></aside></section>
      </section>
    </main>
  );
}
