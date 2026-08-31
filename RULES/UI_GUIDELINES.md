# M-CORE

## MUMTAZA CORE

### Central Student & Education Management System

**Document:** `UI_GUIDELINES.md`
**Version:** `1.0.0`
**Status:** Active
**Purpose:** UI/UX Design System & Frontend Implementation Guide

---

# 1. TUJUAN

`UI_GUIDELINES.md` menjadi standar visual dan interaksi untuk seluruh aplikasi M-CORE.

Dokumen ini memastikan:

* seluruh halaman memiliki tampilan konsisten;
* coder pemula dapat membuat halaman baru tanpa menebak desain;
* warna M-CORE digunakan secara konsisten;
* komponen UI dapat digunakan kembali;
* dashboard, tabel, form, modal, dan detail siswa memiliki pola yang sama;
* UI tetap nyaman digunakan pada desktop maupun mobile;
* warna tidak hanya digunakan untuk dekorasi, tetapi juga memiliki fungsi yang jelas;
* accessibility tetap diperhatikan.

---

# 2. BRAND IDENTITY

Nama sistem:

```text
M-CORE
MUMTAZA CORE
Central Student & Education Management System
```

Karakter visual:

```text
Modern
Clean
Professional
Educational
Trusted
Friendly
Minimal
Structured
```

M-CORE bukan menggunakan desain yang terlalu ramai.

Prioritas:

```text
Clarity > Decoration
Usability > Visual Effect
Consistency > Creativity
```

---

# 3. COLOR SYSTEM

## 3.1 Primary Color

### M-CORE Teal

```text
Primary:
#18A89B
```

Digunakan untuk:

* primary button;
* active navigation;
* link utama;
* focus state;
* icon utama;
* selected state;
* progress;
* highlight penting;
* elemen branding M-CORE.

Contoh:

```text
Primary
████████
#18A89B
```

---

# 3.2 Secondary Color

### M-CORE Gold

```text
Secondary:
#EAB71C
```

Digunakan untuk:

* accent;
* highlight;
* badge tertentu;
* informasi penting;
* statistik;
* decorative accent;
* secondary action.

Jangan menggunakan `#EAB71C` untuk seluruh tombol utama karena kontras teks harus diperhatikan.

---

# 3.3 Neutral Colors

Warna ketiga menggunakan neutral palette.

## White

```text
#FFFFFF
```

Digunakan untuk:

* background card;
* modal;
* form;
* table;
* navbar pada mode tertentu.

---

## Gray 50

```text
#F8FAFC
```

Digunakan sebagai:

* page background;
* dashboard background;
* area kosong.

---

## Gray 100

```text
#F1F5F9
```

Digunakan untuk:

* section background;
* hover ringan;
* divider area.

---

## Gray 200

```text
#E2E8F0
```

Digunakan untuk:

* border;
* table separator;
* input border.

---

## Gray 300

```text
#CBD5E1
```

Digunakan untuk:

* disabled border;
* secondary divider.

---

## Gray 500

```text
#64748B
```

Digunakan untuk:

* secondary text;
* description;
* metadata.

---

## Gray 700

```text
#334155
```

Digunakan untuk:

* body text;
* navigation text;
* label.

---

## Gray 900

```text
#0F172A
```

Digunakan untuk:

* heading;
* primary text;
* important information.

---

# 4. SEMANTIC COLORS

Warna semantic digunakan berdasarkan makna, bukan berdasarkan selera.

## Success

```text
#16A34A
```

Digunakan untuk:

```text
Aktif
Berhasil
Lunas
Selesai
Terverifikasi
```

---

## Warning

```text
#EAB71C
```

M-CORE menggunakan warna Secondary sebagai warna warning utama.

Digunakan untuk:

```text
Perhatian
Menunggu
Perlu tindakan
Data belum lengkap
```

---

## Danger

```text
#DC2626
```

Digunakan untuk:

```text
Error
Hapus
Ditolak
Tidak aktif karena masalah
Validasi gagal
```

---

## Info

```text
#2563EB
```

Digunakan untuk:

```text
Informasi
Help
Informasi tambahan
System message
```

---

# 5. COLOR USAGE RULE

Jangan menggunakan terlalu banyak warna dalam satu halaman.

Prioritas:

```text
Primary
   ↓
Secondary
   ↓
Neutral
   ↓
Semantic
```

Contoh dashboard:

```text
Background     → #F8FAFC
Card            → #FFFFFF
Primary action  → #18A89B
Accent          → #EAB71C
Text            → #0F172A
Secondary text  → #64748B
Border          → #E2E8F0
```

---

# 6. COLOR ACCESSIBILITY

Warna tidak boleh menjadi satu-satunya indikator informasi.

Contoh buruk:

```text
Hijau = aktif
Merah = tidak aktif
```

Lebih baik:

```text
● Aktif
● Nonaktif
```

atau:

```text
[ AKTIF ]
[ NONAKTIF ]
```

Gunakan kombinasi:

```text
Color
+
Text
+
Icon jika diperlukan
```

---

# 7. TYPOGRAPHY

Gunakan font modern dan mudah dibaca.

Recommended:

```text
Inter
```

Fallback:

```text
system-ui
sans-serif
```

Hierarchy:

```text
H1 → 32px
H2 → 24px
H3 → 20px
H4 → 18px

Body → 14–16px
Small → 12–13px
Caption → 11–12px
```

Untuk dashboard administratif, jangan menggunakan heading terlalu besar.

---

# 8. FONT WEIGHT

```text
Regular     → 400
Medium      → 500
Semibold    → 600
Bold        → 700
```

Default:

```text
Body       → 400
Label      → 500
Heading    → 600
Important  → 600/700
```

---

# 9. SPACING SYSTEM

Gunakan kelipatan 4px.

```text
4px
8px
12px
16px
20px
24px
32px
40px
48px
64px
```

Contoh:

```text
Input gap       → 16px
Card padding    → 20–24px
Section gap     → 24–32px
Page padding    → 24–32px
```

Hindari spacing random:

```text
13px
17px
23px
29px
```

kecuali ada alasan desain khusus.

---

# 10. BORDER RADIUS

Gunakan radius yang konsisten.

```text
Small:
6px

Default:
8px

Card:
12px

Large:
16px

Pill:
9999px
```

Recommended:

```text
Input       → 8px
Button      → 8px
Card        → 12px
Modal       → 16px
Badge       → 9999px
```

---

# 11. SHADOW

Gunakan shadow secara ringan.

Default card:

```text
none
```

atau:

```text
subtle shadow
```

Jangan semua elemen menggunakan shadow berat.

Prioritas:

```text
Border > Shadow
```

untuk UI administratif.

Shadow lebih cocok untuk:

* modal;
* dropdown;
* popover;
* floating panel.

---

# 12. LAYOUT

M-CORE menggunakan struktur:

```text
┌─────────────────────────────────────────┐
│ Header                                  │
├──────────────┬──────────────────────────┤
│              │                          │
│ Sidebar      │ Main Content             │
│              │                          │
│              │                          │
│              │                          │
└──────────────┴──────────────────────────┘
```

Desktop:

```text
Sidebar
+
Main Content
```

Mobile:

```text
Header
   ↓
Content
   ↓
Mobile Navigation
```

---

# 13. SIDEBAR

Sidebar digunakan untuk navigasi utama.

Struktur:

```text
M-CORE
────────────────
Dashboard

STUDENT
  Students
  Program History

ACADEMIC
  Classes
  Schedule
  Attendance
  Grades

SYSTEM
  Users
  Roles
  Permissions
  Settings
```

Menu harus mengikuti permission user.

---

# 14. SIDEBAR RULE

Jangan hanya menyembunyikan menu.

Contoh:

User tidak memiliki:

```text
student.delete
```

maka:

```text
Delete Student
```

tidak ditampilkan.

Tetapi backend tetap melakukan authorization.

---

# 15. HEADER

Header minimal:

```text
Breadcrumb
Page title / context
Notification jika diperlukan
User menu
```

Contoh:

```text
Student Management / Students

                         Admin ▼
```

---

# 16. BREADCRUMB

Gunakan breadcrumb untuk halaman bertingkat.

Contoh:

```text
Dashboard
  /
Students
  /
Student Detail
```

Jangan menggunakan breadcrumb pada halaman sederhana jika tidak diperlukan.

---

# 17. PAGE HEADER

Pattern:

```text
┌─────────────────────────────────────────┐
│ Students                     [+ Add]    │
│ Manage student information              │
└─────────────────────────────────────────┘
```

Judul:

```text
H1
```

Description:

```text
Secondary text
```

Action:

```text
Primary button
```

---

# 18. BUTTON SYSTEM

## Primary

```text
Background:
#18A89B
```

Digunakan untuk action utama:

```text
+ Add Student
Save
Create
Continue
```

---

## Secondary

Background:

```text
#FFFFFF
```

Border:

```text
#E2E8F0
```

Digunakan untuk:

```text
Cancel
Back
Filter
Export
```

---

## Accent

```text
#EAB71C
```

Gunakan untuk action yang membutuhkan perhatian tetapi bukan destructive.

---

## Danger

```text
#DC2626
```

Digunakan untuk:

```text
Delete
Deactivate
Remove
Reject
```

Action destructive harus memiliki confirmation.

---

# 19. BUTTON RULE

Satu area tidak boleh memiliki terlalu banyak primary button.

Contoh:

```text
[ + Add Student ]
```

sebagai primary.

Sedangkan:

```text
[ Export ]
[ Filter ]
[ Refresh ]
```

sebagai secondary.

---

# 20. BUTTON STATES

Setiap button harus memiliki:

```text
Default
Hover
Active
Focus
Disabled
Loading
```

Contoh loading:

```text
[ Saving... ]
```

Jangan memungkinkan user mengirim form berkali-kali saat request sedang berjalan.

---

# 21. FORM DESIGN

Form harus:

```text
Label
Input
Helper text jika diperlukan
Validation message
```

Contoh:

```text
Nama Lengkap *
[________________________]

Masukkan nama lengkap sesuai dokumen resmi.
```

---

# 22. FORM RULE

Required field diberi:

```text
*
```

Jangan hanya mengandalkan warna merah.

---

# 23. INPUT

Input default:

```text
Height:
40–44px
```

Border:

```text
#E2E8F0
```

Focus:

```text
#18A89B
```

---

# 24. INPUT VALIDATION

Validation ditampilkan dekat field.

Contoh:

```text
NIK *
[ ........................ ]

⚠ NIK sudah digunakan.
```

Error:

```text
#DC2626
```

Jangan menampilkan error hanya di bagian paling atas halaman.

---

# 25. STUDENT FORM

Form Student minimal:

```text
Nama Lengkap
Gender
Tempat Lahir
Tanggal Lahir
NIK
Email
Nomor HP
WhatsApp
Status
```

Field sensitif seperti NIK harus mendapatkan perhatian khusus.

---

# 26. STUDENT LIST

Pattern:

```text
┌─────────────────────────────────────────┐
│ Students                     [+ Add]    │
│                                         │
│ [ Search............................ ]  │
│ [Status ▼] [Program ▼] [Filter]        │
├─────────────────────────────────────────┤
│ Student ID │ Name │ Program │ Status    │
├─────────────────────────────────────────┤
│ STU-001    │ ...  │ MTs     │ Active    │
│ STU-002    │ ...  │ MA      │ Alumni    │
└─────────────────────────────────────────┘
```

---

# 27. TABLE RULE

Table harus memiliki:

```text
Header
Row
Hover
Empty state
Loading state
Pagination
```

---

# 28. TABLE COLUMN RULE

Jangan menampilkan semua field database.

Database:

```text
student_id
full_name
gender
birth_place
birth_date
nik
email
phone
whatsapp
status
```

Table dapat hanya menampilkan:

```text
Student ID
Nama
Gender
Program Aktif
Status
Action
```

Detail lengkap berada di Student Detail.

---

# 29. TABLE ACTION

Action yang sering digunakan:

```text
View
Edit
More
```

Action destructive jangan dibuat terlalu mudah diklik.

---

# 30. EMPTY STATE

Jika tidak ada data:

```text
No students found
```

Tambahkan context:

```text
Belum ada data siswa yang sesuai dengan filter.
```

Jika relevan:

```text
[ + Add Student ]
```

---

# 31. LOADING STATE

Jangan menampilkan halaman kosong.

Gunakan:

```text
Skeleton
Spinner
Loading indicator
```

Untuk table gunakan skeleton row jika memungkinkan.

---

# 32. ERROR STATE

Contoh:

```text
Something went wrong.

Data siswa tidak dapat dimuat.

[ Try Again ]
```

Jangan menampilkan:

```text
SQLSTATE[42P01]
relation "students" does not exist
```

kepada user.

---

# 33. CONFIRMATION MODAL

Gunakan modal untuk action penting:

```text
Delete
Deactivate
Transfer Program
Graduate
```

Pattern:

```text
┌──────────────────────────────┐
│ Confirm Action               │
│                              │
│ Apakah Anda yakin?           │
│                              │
│ [ Cancel ] [ Confirm ]       │
└──────────────────────────────┘
```

Destructive action:

```text
[ Cancel ] [ Delete ]
```

---

# 34. STUDENT DETAIL

Student Detail menjadi halaman penting M-CORE.

Pattern:

```text
┌─────────────────────────────────────────┐
│ ← Students                             │
│                                         │
│ Ahmad Example                 [Edit]     │
│ STU-0001                                │
│                                         │
│ [Active]                                │
└─────────────────────────────────────────┘
```

---

# 35. STUDENT DETAIL SECTIONS

Gunakan card/section:

```text
Profile
Contact
Current Program
Program History
Academic
```

---

# 36. PROGRAM HISTORY UI

Riwayat program harus mudah dipahami.

Gunakan timeline:

```text
2024
│
├── MTs
│   └── Kelas VII
│
2025
│
├── MTs
│   └── Kelas VIII
│
2026
│
├── MTs
│   └── Kelas IX
│
2027
│
└── Pra-Univ
```

Informasi historis harus tetap terlihat.

---

# 37. ACTIVE PROGRAM

Program aktif harus memiliki indikator yang jelas.

Contoh:

```text
Current Program

MTs
Kelas IX

[ AKTIF ]
```

Jangan membuat user harus membaca seluruh timeline untuk mengetahui program aktif.

---

# 38. STATUS BADGE

Gunakan badge.

```text
[ AKTIF ]
[ ALUMNI ]
[ NONAKTIF ]
```

Warna:

```text
ACTIVE
→ Success

ALUMNI
→ Primary / Info

INACTIVE
→ Neutral / Danger sesuai konteks
```

Status harus tetap memiliki text.

---

# 39. DASHBOARD

Dashboard M-CORE harus berfokus pada informasi yang actionable.

Contoh:

```text
┌────────────┐ ┌────────────┐ ┌────────────┐
│ Total      │ │ Active     │ │ Alumni     │
│ Students   │ │ Students   │ │            │
│ 1,250      │ │ 1,020      │ │ 180        │
└────────────┘ └────────────┘ └────────────┘
```

Kemudian:

```text
Program Distribution
Recent Activity
Academic Summary
```

---

# 40. DASHBOARD CARD

Card statistik:

```text
Label
Value
Trend jika relevan
Icon jika diperlukan
```

Contoh:

```text
Active Students

1,020

+4.2%
```

Jangan membuat terlalu banyak statistik.

---

# 41. ICON

Gunakan satu icon library secara konsisten.

Recommended:

```text
Lucide Icons
```

Style:

```text
Simple
Outline
Consistent
```

Jangan mencampur banyak icon style.

---

# 42. ICON RULE

Icon tidak boleh menggantikan label pada action penting.

Buruk:

```text
[ 🗑 ]
```

Lebih baik:

```text
[ 🗑 Delete ]
```

atau icon dengan accessible label jika ruang terbatas.

---

# 43. TOAST / NOTIFICATION

Gunakan toast untuk feedback singkat.

Success:

```text
Student berhasil diperbarui.
```

Error:

```text
Data siswa gagal diperbarui.
```

Warning:

```text
NIK sudah terdaftar.
```

Jangan menggunakan toast untuk informasi yang membutuhkan keputusan user.

---

# 44. RESPONSIVE DESIGN

M-CORE harus responsive.

## Desktop

```text
≥ 1024px
```

## Tablet

```text
768px – 1023px
```

## Mobile

```text
< 768px
```

---

# 45. MOBILE RULE

Pada mobile:

```text
Sidebar
↓
Mobile navigation / drawer
```

Table besar tidak boleh memaksa halaman menjadi horizontal tanpa kontrol.

Gunakan:

```text
Card view
Horizontal scroll
Prioritized columns
```

sesuai kebutuhan.

---

# 46. RESPONSIVE TABLE

Desktop:

```text
Student ID | Name | Program | Status | Action
```

Mobile dapat menjadi:

```text
Ahmad Example
STU-001
MTs — IX
[ ACTIVE ]

[ View ]
```

---

# 47. MODAL RULE

Modal digunakan untuk:

```text
Confirmation
Short form
Quick action
```

Jangan menggunakan modal untuk halaman kompleks.

Untuk proses kompleks gunakan halaman dedicated.

---

# 48. NOTIFICATION RULE

Notification harus:

```text
Relevant
Short
Actionable
```

Jangan membuat notification berlebihan.

---

# 49. ACCESSIBILITY

M-CORE harus memperhatikan:

```text
Keyboard navigation
Focus state
Color contrast
Screen reader label
Form label
Button label
Error message
```

Interactive element harus dapat diakses menggunakan keyboard.

---

# 50. FOCUS STATE

Semua interactive element harus memiliki focus state yang jelas.

Primary focus:

```text
#18A89B
```

Jangan menghilangkan:

```text
outline
```

tanpa menyediakan pengganti yang jelas.

---

# 51. DARK MODE

Dark mode **belum menjadi requirement MVP**.

Jika nanti diimplementasikan:

```text
Jangan sekadar membalik warna.
```

Buat semantic color tokens:

```text
background
surface
text
muted
border
primary
secondary
danger
success
```

sehingga dark mode dapat dikembangkan tanpa mengubah seluruh component.

---

# 52. DESIGN TOKENS

Frontend sebaiknya memiliki central color tokens.

Konsep:

```text
primary
secondary
background
surface
text
muted
border
success
warning
danger
info
```

Jangan menulis hex color berulang-ulang di banyak component.

---

# 53. RECOMMENDED TOKEN

```text
primary        = #18A89B
secondary      = #EAB71C

background     = #F8FAFC
surface        = #FFFFFF

text           = #0F172A
text-muted     = #64748B

border         = #E2E8F0

success        = #16A34A
warning        = #EAB71C
danger         = #DC2626
info           = #2563EB
```

---

# 54. COMPONENT STRUCTURE

Komponen UI harus reusable.

Contoh:

```text
components/
├── ui/
│   ├── Button
│   ├── Input
│   ├── Select
│   ├── Modal
│   ├── Badge
│   ├── Table
│   ├── Pagination
│   ├── Card
│   ├── Toast
│   └── Skeleton
│
├── layout/
│   ├── Sidebar
│   ├── Header
│   └── PageContainer
│
└── student/
    ├── StudentTable
    ├── StudentForm
    ├── StudentProfile
    └── ProgramTimeline
```

---

# 55. COMPONENT RULE

Jika component digunakan minimal dua kali, pertimbangkan membuat reusable component.

Contoh:

```text
Button
Badge
Card
Table
Modal
Input
```

Tidak perlu membuat abstraction terlalu cepat.

---

# 56. PAGE STRUCTURE

Standard page:

```text
Page
├── PageHeader
├── Filters
├── MainContent
└── Pagination
```

Contoh:

```text
StudentsPage
├── PageHeader
├── StudentFilters
├── StudentTable
└── Pagination
```

---

# 57. DATA FETCHING UI

Setiap data-driven page harus memiliki:

```text
Loading
Success
Empty
Error
```

State:

```text
LOADING
SUCCESS
EMPTY
ERROR
```

Jangan hanya membuat state:

```text
SUCCESS
```

---

# 58. FORM SUBMISSION FLOW

Pattern:

```text
User Input
   ↓
Client Validation
   ↓
Submit
   ↓
Loading
   ↓
API
   ↓
Server Validation
   ↓
Authorization
   ↓
Business Rule
   ↓
Database
   ↓
Success/Error
```

Frontend tidak boleh menganggap request valid hanya karena client validation berhasil.

---

# 59. DESTRUCTIVE ACTION

Untuk action:

```text
Delete
Deactivate
Transfer
Graduate
```

UI harus:

```text
Explicit
Clear
Confirmable
```

Contoh:

```text
Transfer Program

Program saat ini:
MTs — IX

Program tujuan:
[ Pra-Univ ▼ ]

[ Cancel ] [ Continue ]
```

---

# 60. NO VISUAL OVERLOAD

Jangan:

```text
10 cards
8 colors
20 icons
5 charts
```

dalam satu dashboard.

Gunakan visual hierarchy.

Prioritas:

```text
What is important?
What needs action?
What is informational?
```

---

# 61. EMPTY / ERROR / LOADING STANDARD

Setiap module wajib memiliki:

```text
Loading State
Empty State
Error State
Success State
```

Contoh Student:

```text
Loading:
Loading students...

Empty:
Belum ada siswa.

Error:
Data siswa gagal dimuat.

Success:
1,250 students loaded.
```

---

# 62. SECURITY UI RULE

UI tidak boleh menampilkan informasi yang tidak dibutuhkan user.

Contoh:

User hanya memiliki:

```text
student.view
```

tidak perlu menampilkan:

```text
Edit
Delete
Transfer
Promote
```

jika permission tersebut tidak tersedia.

Namun:

> **UI visibility bukan security mechanism.**

Backend tetap wajib melakukan authorization.

---

# 63. SENSITIVE INFORMATION DISPLAY

NIK dan informasi personal lainnya harus ditampilkan sesuai permission.

Jika diperlukan masking:

```text
320*************
```

atau pola masking yang ditentukan application policy.

Jangan membuat masking hanya di frontend jika data tersebut seharusnya tidak boleh diterima client.

---

# 64. SEARCH UI

Search harus jelas.

Placeholder:

```text
Cari nama, Student ID, atau NIK...
```

Tetapi jika user tidak memiliki permission untuk mencari berdasarkan NIK:

```text
Cari nama atau Student ID...
```

---

# 65. FILTER UI

Filter yang relevan:

```text
Status
Program
Academic Year
Class
```

Jangan menampilkan filter yang tidak memiliki data.

---

# 66. PAGINATION UI

Pattern:

```text
Showing 1–20 of 1,250

[ Previous ] 1 2 3 ... 63 [ Next ]
```

Atau compact mobile:

```text
[ ← ]  Page 3 of 63  [ → ]
```

---

# 67. DATE FORMAT

Gunakan format konsisten.

Untuk Indonesia:

```text
DD MMM YYYY
```

Contoh:

```text
31 Aug 2026
```

atau format Indonesia:

```text
31 Agustus 2026
```

Untuk API/database tetap gunakan format standar ISO sesuai `API_SPEC.md`.

---

# 68. NUMBER FORMAT

Gunakan locale sesuai kebutuhan aplikasi.

Contoh:

```text
1.250
```

bukan:

```text
1250
```

jika konteks UI menggunakan locale Indonesia.

---

# 69. LANGUAGE

Default UI:

```text
Bahasa Indonesia
```

Istilah teknis internal tetap dapat menggunakan:

```text
Student
Program
Enrollment
Role
Permission
Scope
```

jika istilah tersebut sudah menjadi standard system.

---

# 70. UX COPY

Gunakan bahasa:

```text
Singkat
Jelas
Profesional
Tidak teknis
```

Buruk:

```text
Mutation failed because foreign key constraint violated.
```

Lebih baik:

```text
Data program tidak dapat diproses.
Silakan periksa kembali data yang dipilih.
```

---

# 71. SUCCESS MESSAGE

Jangan:

```text
Success!
```

Gunakan:

```text
Data siswa berhasil disimpan.
```

atau:

```text
Program siswa berhasil dipindahkan.
```

---

# 72. ERROR MESSAGE

Error harus menjelaskan:

```text
Apa yang terjadi
Apa yang dapat dilakukan user
```

Contoh:

```text
NIK sudah terdaftar.

Periksa kembali NIK yang dimasukkan atau buka data siswa yang sudah ada.
```

---

# 73. CONFIRMATION COPY

Gunakan bahasa jelas.

Contoh:

```text
Pindahkan Program?

Siswa akan dipindahkan dari MTs Kelas IX
ke Program Pra-Univ.

Perubahan ini akan dicatat sebagai riwayat program.

[ Batal ] [ Lanjutkan ]
```

---

# 74. DATA INTEGRITY UX

Jika action memiliki konsekuensi terhadap history, UI harus memberi tahu user.

Contoh:

```text
Perhatian

Pemindahan program akan membuat riwayat program baru
dan menutup program aktif sebelumnya.
```

---

# 75. MOBILE-FIRST CONSIDERATION

Walaupun M-CORE kemungkinan digunakan terutama melalui desktop, setiap component harus memiliki behavior mobile yang jelas.

Jangan menunggu tahap akhir untuk memikirkan responsive design.

---

# 76. UI DEVELOPMENT RULE

Coder harus:

```text
1. Cari component existing
2. Reuse jika tersedia
3. Gunakan design token
4. Ikuti spacing system
5. Ikuti typography
6. Ikuti responsive behavior
7. Ikuti permission
```

---

# 77. DO NOT

Coder/AI dilarang:

```text
[ ] Membuat warna baru tanpa alasan
[ ] Menggunakan gradient berlebihan
[ ] Menggunakan shadow berlebihan
[ ] Membuat button style baru sembarangan
[ ] Menggunakan font berbeda
[ ] Mengubah primary color
[ ] Membuat layout berbeda untuk module yang sama
[ ] Menaruh business logic di UI
[ ] Mengandalkan frontend untuk security
```

---

# 78. COLOR EXTENSION RULE

Warna tambahan diperbolehkan hanya jika memiliki fungsi.

Contoh:

```text
Success
Warning
Danger
Info
```

Jangan menambahkan warna hanya karena:

> "supaya lebih ramai."

Jika warna baru diperlukan:

```text
PROPOSAL:
Color:
Purpose:
Where used:
Why existing colors are insufficient:
```

---

# 79. UI CHANGE RULE

Jika ingin mengubah:

```text
Primary color
Typography
Spacing system
Button style
Sidebar structure
```

periksa dampaknya terhadap seluruh system.

Perubahan global tidak boleh dilakukan hanya untuk satu halaman.

---

# 80. DESIGN SYSTEM HIERARCHY

Gunakan urutan:

```text
Design Tokens
      ↓
UI Components
      ↓
Feature Components
      ↓
Pages
      ↓
Application
```

Contoh:

```text
Color Token
    ↓
Button
    ↓
StudentForm
    ↓
StudentPage
    ↓
M-CORE
```

---

# 81. FINAL UI CHECKLIST

Sebelum halaman dianggap selesai:

```text
LAYOUT
[ ] Responsive
[ ] Consistent spacing
[ ] Clear hierarchy

COLOR
[ ] Primary #18A89B
[ ] Secondary #EAB71C
[ ] Neutral colors
[ ] Semantic colors
[ ] Contrast acceptable

TYPOGRAPHY
[ ] Correct hierarchy
[ ] Consistent font
[ ] Readable size

COMPONENT
[ ] Reusable
[ ] Consistent states
[ ] Hover
[ ] Focus
[ ] Disabled
[ ] Loading

FORM
[ ] Labels
[ ] Validation
[ ] Error state
[ ] Loading state

DATA
[ ] Loading
[ ] Empty
[ ] Error
[ ] Success

SECURITY
[ ] Permission-aware UI
[ ] Sensitive data controlled
[ ] Backend authorization exists

MOBILE
[ ] Mobile layout
[ ] Touch-friendly
[ ] Table behavior

UX
[ ] Clear copy
[ ] Confirmation for destructive action
[ ] No unnecessary complexity
```

---

# 82. M-CORE VISUAL PRINCIPLE

Visual identity M-CORE:

```text
          M-CORE
             │
     ┌───────┴───────┐
     │               │
  #18A89B         #EAB71C
  PRIMARY         ACCENT
     │               │
     └───────┬───────┘
             │
        NEUTRAL UI
             │
      White / Gray
             │
             ▼
      CLEAN INTERFACE
```

Gunakan:

```text
#18A89B
```

sebagai identitas utama.

Gunakan:

```text
#EAB71C
```

sebagai accent.

Gunakan:

```text
White + Gray
```

sebagai fondasi interface.

Semantic colors hanya digunakan ketika memiliki makna khusus.

---

# 83. GOLDEN RULE

> **M-CORE harus terlihat sederhana, profesional, dan terstruktur.**

Jangan mengejar desain yang terlihat "wah" tetapi sulit digunakan.

Target utama:

```text
Easy to Understand
Easy to Navigate
Easy to Operate
Easy to Maintain
Easy to Develop
```

---

# 84. CODER-BEGINNER RULE

Coder pemula yang membuat halaman baru harus dapat mengikuti pola:

```text
1. Copy structure page existing
2. Reuse components
3. Use design tokens
4. Follow spacing
5. Follow typography
6. Follow responsive rules
7. Follow permission rules
8. Test loading/empty/error state
```

Tidak perlu membuat design system baru.

---

# 85. FINAL DESIGN TOKENS

Reference utama M-CORE:

```text
PRIMARY
#18A89B

SECONDARY
#EAB71C

BACKGROUND
#F8FAFC

SURFACE
#FFFFFF

TEXT
#0F172A

TEXT MUTED
#64748B

BORDER
#E2E8F0

SUCCESS
#16A34A

WARNING
#EAB71C

DANGER
#DC2626

INFO
#2563EB
```

---

# 86. FINAL UI COMMANDMENT

```text
USE THE DESIGN SYSTEM.

REUSE COMPONENTS.

KEEP THE UI SIMPLE.

KEEP THE HIERARCHY CLEAR.

DO NOT INVENT RANDOM COLORS.

DO NOT DUPLICATE COMPONENTS.

DO NOT PUT SECURITY ONLY IN THE UI.

ALWAYS SUPPORT LOADING, EMPTY, ERROR, AND SUCCESS STATES.

DESIGN FOR THE USER,
BUILD FOR THE DEVELOPER,
PROTECT THE DATA.
```

---

**End of `UI_GUIDELINES.md`**

