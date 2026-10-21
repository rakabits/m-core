# Feature Page Header Standard

Untuk setiap halaman fitur dashboard M-CORE, gunakan header utama dengan pola visual yang sama seperti halaman **Manajemen Kelas** (`class-hero`):

- Gunakan satu header hero di bagian atas content.
- Header memakai layout dua sisi: copy halaman di kiri dan konteks/status utama di kanan.
- Copy wajib berisi:
  - eyebrow uppercase dengan aksen titik/ikon kecil.
  - satu `h1` sebagai judul halaman.
  - subtitle singkat yang menjelaskan tujuan fitur.
- Panel kanan wajib menampilkan konteks penting halaman, misalnya tahun akademik aktif, status, jumlah, atau filter utama.
- Pertahankan visual premium: gradient teal gelap, radius besar, border/transparansi halus, aksen cyan/amber, dan spacing responsif.
- Pada mobile, ubah menjadi satu kolom; panel konteks tetap terlihat di bawah copy.
- Jangan membuat header halaman baru dengan struktur visual berbeda tanpa alasan desain yang jelas.
- Untuk implementasi baru, utamakan komponen bersama `FeaturePageHeader` jika tersedia; props minimal: `eyebrow`, `title`, `description`, dan `context`.
- Pastikan hanya ada satu `h1` per halaman dan pertahankan semantic HTML serta ID interaktif yang unik.

## Reference

Implementasi visual saat ini dapat dilihat pada:
`src/app/(dashboard)/academic/classes/page.tsx` — section `class-hero`.

Saat refactor bertahap, halaman lama boleh tetap memakai class kompatibilitas (`students-header`, `academic-hero`, atau `directory-header`) selama hasil visual mengikuti standar ini.
