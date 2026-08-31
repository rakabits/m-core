# M-CORE

## MUMTAZA CORE

### Central Student & Education Management System

**Document:** `BUSINESS_RULES.md`
**Version:** `1.0.0`
**Status:** Baseline Business Rules
**Related Documents:** `DATABASE.md`, `RBAC.md`, `API_SPEC.md`

> **One Student. One Identity. One Centralized System.**

---

# 1. Tujuan

`BUSINESS_RULES.md` mendefinisikan aturan bisnis yang harus dipatuhi oleh seluruh modul M-CORE.

Dokumen ini menjadi acuan untuk:

* Developer
* Backend
* Frontend
* API
* Database
* Admin
* Operator
* QA / Tester
* AI Coding Assistant

Tujuannya adalah agar seluruh bagian sistem memiliki pemahaman yang sama terhadap:

* identitas siswa
* status siswa
* program
* riwayat program
* kenaikan kelas
* perpindahan program
* kelulusan
* alumni
* program aktif
* duplikasi data
* perubahan data historis

---

# 2. Prinsip Bisnis Utama

M-CORE menggunakan prinsip:

> **One Student. One Identity. One Centralized System.**

Artinya:

```text
1 siswa
   ↓
1 student_id
   ↓
banyak riwayat pendidikan/program
```

Contoh:

```text
STU-00001
Ahmad Fulan
    │
    ├── 2024/2025 → MTs VII
    ├── 2025/2026 → MTs VIII
    ├── 2026/2027 → MTs IX
    └── 2027/2028 → Pra-Univ
```

`student_id` tidak berubah sepanjang perjalanan siswa.

---

# 3. Business Entity

M-CORE memiliki beberapa entitas utama.

```text
Student
   │
   ├── Program
   │
   ├── Program History
   │
   ├── Academic
   │
   └── Alumni
```

## 3.1 Student

Identitas utama seseorang dalam sistem.

## 3.2 Program

Master program yang tersedia.

## 3.3 Program History

Catatan perjalanan siswa pada suatu program dan periode tertentu.

## 3.4 Academic

Data akademik yang nantinya dapat mencakup:

* kelas
* absensi
* nilai
* jadwal

## 3.5 Alumni

Informasi lanjutan setelah siswa menyelesaikan perjalanan pendidikan.

---

# 4. Student Identity Rules

## BR-STU-001 — Satu Siswa Satu Identitas

Setiap siswa hanya boleh memiliki satu `student_id`.

```text
student_id = identity utama M-CORE
```

Tidak boleh membuat siswa baru hanya karena:

* naik kelas
* pindah kelas
* pindah program
* pindah unit
* masuk tahun akademik baru
* menyelesaikan program
* menjadi alumni

---

# 5. Student ID Rules

`student_id` adalah ID internal M-CORE.

Tidak boleh menggunakan:

* NIK
* nomor HP
* WhatsApp
* email
* nomor passport
* nomor pendaftaran
* nomor kelas

sebagai `student_id`.

Contoh:

```text
student_id:
550e8400-e29b-41d4-a716-446655440000
```

atau ID publik yang dihasilkan sistem:

```text
STU-2026-000001
```

Database internal tetap menggunakan ID yang stabil.

---

# 6. NIK Rules

## BR-STU-002 — NIK Harus Unik

Jika NIK tersedia, NIK hanya boleh dimiliki satu siswa.

Contoh:

```text
Student A
NIK = 1234567890123456
```

Maka sistem tidak boleh menerima:

```text
Student B
NIK = 1234567890123456
```

---

# 7. Duplicate NIK Detection

Sistem harus melakukan pengecekan NIK sebelum membuat siswa baru.

Flow:

```text
CREATE STUDENT
      ↓
Input NIK
      ↓
Check existing NIK
      ↓
 ┌────┴────┐
 │         │
FOUND    NOT FOUND
 │         │
 ▼         ▼
BLOCK     CREATE
```

Jika ditemukan:

```text
DUPLICATE_NIK
```

sistem tidak boleh langsung membuat record baru.

---

# 8. Duplicate Student Detection

NIK bukan satu-satunya metode mendeteksi kemungkinan duplikasi.

Jika NIK tidak tersedia, sistem dapat melakukan **duplicate candidate detection** menggunakan kombinasi:

```text
full_name
birth_date
birth_place
phone
email
```

Contoh:

```text
Nama sama
+
Tanggal lahir sama
+
Tempat lahir sama
```

→ tandai sebagai **Possible Duplicate**.

Sistem tidak boleh otomatis menggabungkan data hanya berdasarkan kemiripan.

---

# 9. Duplicate Handling

Jika ditemukan kemungkinan duplikasi:

```text
Possible Duplicate
        ↓
Review Admin
        ↓
 ┌──────┴──────┐
 │             │
Same Person   Different Person
 │             │
 ▼             ▼
Merge/Link     Create
```

Penggabungan data harus menjadi tindakan terkontrol dan dicatat dalam audit log.

---

# 10. Student Status

Status utama siswa:

```text
active
alumni
inactive
```

---

# 11. Active Student

## BR-STU-003 — Status Active

Siswa berstatus `active` apabila masih memiliki hubungan pendidikan/program yang aktif sesuai aturan operasional M-CORE.

Secara umum:

```text
student.status = active
```

dan minimal terdapat program/history aktif:

```text
program_history.status = enrolled
```

Namun status siswa **tidak boleh dihitung hanya dari satu kolom database tanpa mempertimbangkan aturan operasional**.

---

# 12. Inactive Student

Siswa dapat berstatus:

```text
inactive
```

apabila tidak sedang menjalani program aktif dan belum dikategorikan sebagai alumni.

Contoh:

```text
Siswa berhenti sementara
Siswa keluar
Siswa tidak melanjutkan
```

History sebelumnya tetap disimpan.

---

# 13. Alumni

## BR-STU-004 — Status Alumni

Siswa menjadi alumni setelah memenuhi kondisi kelulusan/penyelesaian yang ditetapkan oleh unit/program terkait.

Perubahan:

```text
active
   ↓
completed
   ↓
alumni
```

Menjadi alumni tidak berarti data siswa dihapus.

---

# 14. Alumni Data Preservation

Ketika siswa menjadi alumni:

```text
students.status = alumni
```

Semua history tetap ada.

Contoh:

```text
Ahmad
│
├── MTs VII      completed
├── MTs VIII     completed
├── MTs IX       completed
└── Pra-Univ     completed
        │
        ▼
      ALUMNI
```

---

# 15. Alumni Tidak Boleh Menghapus History

Dilarang:

```text
DELETE student
```

hanya karena siswa sudah alumni.

Dilarang pula menghapus:

```text
program history
attendance
grades
```

yang diperlukan sebagai histori pendidikan.

---

# 16. Program History

Setiap perjalanan siswa dalam program harus dibuat sebagai record baru.

Contoh:

```text
2024/2025 → MTs VII
2025/2026 → MTs VIII
2026/2027 → MTs IX
```

Bukan:

```text
2024/2025
   ↓
overwrite
   ↓
2025/2026
```

---

# 17. Program History Immutable Principle

Data historis pada prinsipnya bersifat **immutable**.

Artinya data masa lalu tidak boleh diubah sembarangan.

Perubahan administratif yang memang diperlukan harus:

* memiliki alasan
* memiliki permission
* dicatat dalam audit log
* tidak menghilangkan histori sebelumnya

---

# 18. Naik Kelas

## BR-ACD-001 — Promotion

Naik kelas tidak membuat siswa baru.

Contoh:

```text
2024/2025
MTs VII
```

naik menjadi:

```text
2025/2026
MTs VIII
```

Maka sistem membuat history baru:

```text
History #001
2024/2025 → VII → completed

History #002
2025/2026 → VIII → enrolled
```

`student_id` tetap sama.

---

# 19. Promotion Flow

```text
CURRENT YEAR
     │
     ▼
2024/2025
MTs VII
     │
     │ PROMOTE
     ▼
2025/2026
MTs VIII
     │
     ▼
New Program History
```

Tidak boleh:

```text
Create New Student
```

---

# 20. Naik Kelas dan Status

Ketika siswa naik kelas:

History lama:

```text
status = completed
```

History baru:

```text
status = enrolled
```

Contoh:

```text
2024/2025 → VII  → completed
2025/2026 → VIII → enrolled
```

---

# 21. Tidak Naik Kelas

Jika siswa tetap pada kelas yang sama, sistem tetap membuat history periode baru jika kebijakan akademik memerlukan pencatatan tahunan.

Contoh:

```text
2025/2026 → VIII → completed
2026/2027 → VIII → enrolled
```

Jangan mengubah history lama.

---

# 22. Pindah Program

## BR-PRG-001 — Transfer Program

Jika siswa berpindah program:

```text
Program A
   ↓
Transfer
   ↓
Program B
```

history lama tidak dihapus.

Contoh:

```text
2026/2027 → MTs → IX → transferred
2026/2027 → Pra-Univ → Batch 1 → enrolled
```

---

# 23. Transfer Program Rules

Ketika transfer:

1. History program lama diperbarui menjadi `transferred`.
2. History program baru dibuat.
3. `student_id` tetap sama.
4. Tidak membuat student baru.
5. Perubahan dicatat dalam audit log.
6. Jika diperlukan, tanggal transfer disimpan.

---

# 24. Contoh Transfer

Sebelum:

```text
STU-001

2026/2027
MTs
IX
enrolled
```

Setelah transfer:

```text
STU-001

2026/2027
MTs
IX
transferred

2026/2027
Pra-Univ
Batch 1
enrolled
```

---

# 25. Pindah Program Antar Tahun

Contoh:

```text
2026/2027 → MTs IX → completed
2027/2028 → Pra-Univ → enrolled
```

Ini bukan transfer dalam tahun yang sama, tetapi merupakan **continuation** dari perjalanan pendidikan.

Pada fase berikutnya dapat ditambahkan tipe transition:

```text
promotion
continuation
transfer
```

---

# 26. Program Aktif

## BR-PRG-002 — Active Program

Program aktif siswa ditentukan berdasarkan history yang memenuhi kondisi:

```text
student_program_history.status = enrolled
```

dan siswa:

```text
students.status = active
```

---

# 27. Single Active Program

Secara default, sistem mengasumsikan seorang siswa memiliki **satu program utama aktif pada satu periode**.

Contoh:

```text
STU-001

2026/2027
MTs IX
enrolled
```

maka program aktif:

```text
MTs IX
```

---

# 28. Multiple Active Programs

M-CORE tetap harus mendukung kemungkinan seorang siswa mengikuti lebih dari satu program pada periode yang sama.

Contoh:

```text
2026/2027
MTs IX
enrolled

2026/2027
Bahasa Arab
enrolled
```

Dalam kondisi ini sistem harus membedakan:

```text
Primary Program
Additional Program
```

Aturan ini akan membutuhkan field/entitas tambahan pada fase implementasi jika memang diperlukan.

---

# 29. Recommended Active Program Logic

Untuk versi Core saat ini:

```text
Program Aktif =
history terbaru
dengan status = enrolled
```

dengan syarat:

```text
student.status = active
```

Query konseptual:

```sql
SELECT *
FROM student_program_history
WHERE student_id = ?
  AND status = 'enrolled'
ORDER BY start_date DESC, created_at DESC
LIMIT 1;
```

---

# 30. Active Program Conflict

Jika sistem menemukan lebih dari satu history:

```text
status = enrolled
```

untuk periode yang sama dan sistem belum mendukung multiple active programs:

```text
ACTIVE_PROGRAM_CONFLICT
```

Sistem tidak boleh memilih secara diam-diam.

Admin harus menyelesaikan konflik tersebut.

---

# 31. Program Status vs Student Status

Keduanya berbeda.

Contoh:

```text
Student:
active
```

History:

```text
2024/2025 → completed
2025/2026 → completed
2026/2027 → enrolled
```

Artinya siswa aktif.

Contoh lain:

```text
Student:
inactive
```

History:

```text
2025/2026 → dropped
```

Artinya tidak sedang aktif.

---

# 32. Program Master

Program disimpan pada:

```text
programs
```

Program tidak boleh dibuat ulang untuk setiap siswa.

Contoh:

```text
PROGRAM
MTs
```

dapat digunakan oleh:

```text
Ahmad
Budi
Hasan
Fatimah
```

---

# 33. Program Deactivation

Program yang tidak lagi dibuka:

```text
programs.is_active = false
```

Bukan:

```text
DELETE programs
```

History siswa tetap menggunakan program tersebut.

---

# 34. Academic Year

Tahun akademik menggunakan format:

```text
YYYY/YYYY
```

Contoh:

```text
2024/2025
2025/2026
2026/2027
```

Satu history hanya mewakili satu periode akademik untuk kombinasi program tertentu.

---

# 35. History Duplication

Kombinasi berikut tidak boleh duplikat:

```text
student_id
+
program_id
+
academic_year
```

Contoh yang tidak diperbolehkan:

```text
STU-001
MTs
2025/2026

STU-001
MTs
2025/2026
```

---

# 36. Data Correction

Jika terjadi kesalahan data:

Contoh:

```text
2025/2026
Kelas VIII
```

ternyata salah dan seharusnya:

```text
2025/2026
Kelas IX
```

Perubahan diperbolehkan jika user memiliki permission yang sesuai.

Namun:

* perubahan harus dicatat
* audit log harus dibuat
* histori perubahan harus dapat ditelusuri jika diperlukan

---

# 37. Delete Rules

## Student

Tidak boleh dihapus secara normal.

```text
DELETE STUDENT
```

harus dianggap sebagai tindakan administratif khusus.

---

## Program

Tidak boleh dihapus jika sudah memiliki history.

Gunakan:

```text
is_active = false
```

---

## Program History

Tidak boleh dihapus untuk menghilangkan histori pendidikan.

Jika terjadi kesalahan, gunakan mekanisme correction/void yang terkontrol.

---

# 38. Student Merge

Jika dua record ternyata adalah orang yang sama:

```text
STU-001
STU-002
```

jangan langsung delete salah satunya.

Proses:

```text
Duplicate Found
      ↓
Admin Review
      ↓
Confirm Same Person
      ↓
Select Master Student
      ↓
Migrate Related Records
      ↓
Audit Log
      ↓
Deactivate Duplicate
```

Student master harus dipilih secara eksplisit.

---

# 39. Student Merge Protection

Data berikut harus diperiksa sebelum merge:

```text
program history
attendance
grades
documents
finance
alumni
```

Tidak boleh ada data relasi yang tertinggal pada student duplicate.

---

# 40. Status Transition

State transition utama:

```text
NEW
 │
 ▼
ACTIVE
 │
 ├───────────────┐
 │               │
 ▼               ▼
INACTIVE       ALUMNI
 │
 │
 └───► ACTIVE
```

Tidak semua transition harus otomatis.

---

# 41. Allowed Status Transition

## Active → Inactive

Diperbolehkan.

Contoh:

```text
active
   ↓
inactive
```

---

## Inactive → Active

Diperbolehkan jika siswa kembali mengikuti program.

```text
inactive
   ↓
active
```

---

## Active → Alumni

Diperbolehkan setelah memenuhi syarat kelulusan.

```text
active
   ↓
alumni
```

---

## Alumni → Active

Tidak boleh dilakukan secara sembarangan.

Jika alumni kembali mengikuti program baru, perlu keputusan bisnis apakah:

```text
alumni → active
```

atau tetap alumni dengan enrollment baru.

Untuk M-CORE, rekomendasi awal:

> Alumni yang kembali mengikuti program baru tetap mempertahankan histori alumni dan dapat memiliki status operasional aktif berdasarkan program baru.

Implementasi detail akan ditetapkan ketika modul alumni dan enrollment dibuat.

---

# 42. Determining Student Status

Status siswa tidak boleh berubah otomatis hanya karena history lama selesai.

Contoh:

```text
2025/2026 → completed
```

tidak otomatis berarti:

```text
student = alumni
```

Sistem harus menentukan apakah siswa:

```text
melanjutkan
berhenti
menjadi alumni
```

berdasarkan status program berikutnya atau keputusan administrasi.

---

# 43. Determining Active Student

Rekomendasi logic:

```text
Student Active
IF

student.status = active

AND

EXISTS program_history
WHERE
student_id = current_student
AND status = enrolled
```

Namun admin tetap dapat melakukan override melalui proses administratif jika dibutuhkan.

---

# 44. Determining Alumni

Rekomendasi logic:

```text
Student Alumni
IF

student.status = alumni
```

Status alumni harus merupakan status yang ditetapkan secara resmi.

History `completed` saja tidak cukup untuk secara otomatis mengubah status siswa menjadi alumni.

---

# 45. Program Continuation

Jika siswa melanjutkan program:

```text
Program A
   ↓
completed
   ↓
Program B
   ↓
enrolled
```

Student tetap sama.

Contoh:

```text
STU-001

MTs IX
2026/2027
completed

Pra-Univ
2027/2028
enrolled
```

---

# 46. Program History Tidak Mengubah Student Identity

Perubahan:

```text
program
kelas
level
academic_year
status
```

tidak boleh menghasilkan:

```text
student_id baru
```

---

# 47. Data Ownership

`students` bertanggung jawab terhadap:

```text
identitas siswa
```

`programs` bertanggung jawab terhadap:

```text
master program
```

`student_program_history` bertanggung jawab terhadap:

```text
perjalanan siswa dalam program
```

Jangan mencampurkan tanggung jawab antarentitas.

---

# 48. UI Rules

Frontend harus mengikuti business rules.

Contoh:

Jika siswa:

```text
active
```

UI dapat menampilkan:

```text
Program Aktif
MTs IX
2026/2027
```

Jika:

```text
alumni
```

UI menampilkan:

```text
Status: Alumni
```

Jika:

```text
inactive
```

UI menampilkan:

```text
Status: Nonaktif
```

---

# 49. API Rules

Backend harus melakukan validasi business rules.

Frontend validation saja tidak cukup.

Contoh:

```text
Frontend
   ↓
Validation
   ↓
API
   ↓
Business Rule Validation
   ↓
Database Constraint
```

Tiga lapisan validasi:

```text
UI
API
DATABASE
```

---

# 50. Error Codes

Gunakan error code yang konsisten.

Contoh:

```text
DUPLICATE_NIK
DUPLICATE_EMAIL
STUDENT_NOT_FOUND
PROGRAM_NOT_FOUND
PROGRAM_INACTIVE
INVALID_STATUS_TRANSITION
ACTIVE_PROGRAM_CONFLICT
DUPLICATE_PROGRAM_HISTORY
HISTORY_NOT_FOUND
INVALID_ACADEMIC_YEAR
INVALID_PROGRAM_TRANSFER
```

---

# 51. Transaction Rules

Operasi yang mengubah beberapa tabel harus menggunakan database transaction.

Contoh transfer program:

```text
BEGIN TRANSACTION

1. Update old history → transferred
2. Create new history → enrolled
3. Update student status if required
4. Create audit log

COMMIT
```

Jika salah satu gagal:

```text
ROLLBACK
```

Tidak boleh menghasilkan data setengah jadi.

---

# 52. Promotion Transaction

Kenaikan kelas:

```text
BEGIN

1. Validate current enrollment
2. Complete current history
3. Create next history
4. Update student status if required
5. Create audit log

COMMIT
```

Jika gagal:

```text
ROLLBACK
```

---

# 53. Transfer Transaction

Perpindahan program:

```text
BEGIN

1. Validate student
2. Validate source program
3. Validate destination program
4. Close/transfer source history
5. Create destination history
6. Write audit log

COMMIT
```

---

# 54. Audit Requirements

Perubahan berikut wajib dicatat:

```text
Student identity update
NIK update
Student status update
Program transfer
Program completion
Promotion
Student merge
History correction
Alumni conversion
```

Minimal audit:

```text
who
what
when
entity
entity_id
reason
```

---

# 55. Permission Requirements

Operasi sensitif harus memerlukan permission.

Contoh:

```text
student.view
student.create
student.update
student.view_sensitive

program.view
program.manage

program_history.view
program_history.create
program_history.update

student.promote
student.transfer
student.mark_alumni
student.merge
```

Detail role dan permission berada di:

```text
RBAC.md
```

---

# 56. Important Rule for Developers

Developer tidak boleh membuat business logic baru berdasarkan asumsi.

Jika requirement tidak jelas:

```text
DO NOT GUESS
```

Developer harus memeriksa:

```text
DATABASE.md
BUSINESS_RULES.md
API_SPEC.md
RBAC.md
```

Jika tetap belum jelas, requirement harus ditetapkan sebelum implementasi.

---

# 57. Example Complete Student Journey

```text
2024/2025
│
├── Student Created
│
▼
MTs VII
enrolled
│
│ Promotion
▼
2025/2026
MTs VIII
enrolled
│
│ Promotion
▼
2026/2027
MTs IX
enrolled
│
│ Completed
▼
MTs IX
completed
│
│ Continuation
▼
2027/2028
Pra-Univ
enrolled
│
│ Completed
▼
Pra-Univ
completed
│
│ Graduation Decision
▼
ALUMNI
```

Pada seluruh perjalanan:

```text
student_id = SAME
```

---

# 58. Example Transfer Journey

```text
2026/2027
MTs IX
enrolled
      │
      │ Transfer
      ▼
2026/2027
MTs IX
transferred
      │
      ▼
2026/2027
Pra-Univ
enrolled
```

Tidak membuat student baru.

---

# 59. Example Inactive Journey

```text
ACTIVE
   │
   │ Stop Program
   ▼
INACTIVE
   │
   │ Re-enroll
   ▼
ACTIVE
```

History lama tetap tersimpan.

---

# 60. Business Rule Priority

Jika terjadi konflik:

```text
Database Constraint
        ↓
Business Rules
        ↓
API Validation
        ↓
Frontend Validation
```

Namun semua layer harus konsisten.

Frontend tidak boleh menjadi satu-satunya penjaga business rule.

---

# 61. Golden Rules

## BR-CORE-001

> **One Student = One Student ID.**

## BR-CORE-002

> **Never use NIK as Student Primary Key.**

## BR-CORE-003

> **Never create a new student because of promotion.**

## BR-CORE-004

> **Never create a new student because of program transfer.**

## BR-CORE-005

> **Never overwrite historical program records.**

## BR-CORE-006

> **Never delete historical education data casually.**

## BR-CORE-007

> **NIK must be unique when provided.**

## BR-CORE-008

> **Possible duplicate students require review.**

## BR-CORE-009

> **Student status and program status are different concepts.**

## BR-CORE-010

> **Active program is determined from valid enrolled history.**

## BR-CORE-011

> **Program transfer creates a new program history.**

## BR-CORE-012

> **Promotion creates a new academic-period record.**

## BR-CORE-013

> **Alumni status does not delete student history.**

## BR-CORE-014

> **Inactive does not mean deleted.**

## BR-CORE-015

> **Sensitive operations require authorization.**

## BR-CORE-016

> **Important changes must be auditable.**

## BR-CORE-017

> **Multi-table business operations must use transactions.**

## BR-CORE-018

> **Business rules must be enforced server-side.**

## BR-CORE-019

> **Database constraints protect data integrity.**

## BR-CORE-020

> **When business behavior is unclear, do not guess.**

---

# 62. Definition of Done

Business Rules v1.0 dianggap terimplementasi apabila:

* [ ] Student identity menggunakan `student_id`.
* [ ] NIK duplicate detection tersedia.
* [ ] Possible duplicate detection tersedia.
* [ ] Student status tersedia.
* [ ] Program status tersedia.
* [ ] Program history tersedia.
* [ ] Promotion rule tersedia.
* [ ] Transfer rule tersedia.
* [ ] Continuation rule tersedia.
* [ ] Alumni rule tersedia.
* [ ] Active program logic tersedia.
* [ ] Inactive rule tersedia.
* [ ] History tidak di-overwrite.
* [ ] History tidak dihapus sembarangan.
* [ ] Sensitive operation memiliki permission.
* [ ] Transfer menggunakan transaction.
* [ ] Promotion menggunakan transaction.
* [ ] Perubahan penting dicatat dalam audit log.
* [ ] API menerapkan business rules.
* [ ] Database menerapkan integrity constraints.

---

# 63. Final Business Architecture

M-CORE memandang perjalanan siswa sebagai:

```text
                    STUDENT
                       │
                       │
                student_id tetap
                       │
                       ▼
              EDUCATION JOURNEY
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
       PROMOTION    TRANSFER    CONTINUATION
          │            │            │
          └────────────┼────────────┘
                       ▼
                PROGRAM HISTORY
                       │
                       ▼
                COMPLETION
                       │
                       ▼
                    ALUMNI
```

Status siswa:

```text
ACTIVE
  │
  ├──► INACTIVE
  │       │
  │       └──► ACTIVE
  │
  └──► ALUMNI
```

Identitas:

```text
ONE PERSON
    ↓
ONE STUDENT_ID
    ↓
MANY PROGRAM HISTORIES
    ↓
COMPLETE EDUCATION JOURNEY
```

---

# 64. Final Decision

**M-CORE tidak menyimpan "siswa per program".**

M-CORE menyimpan:

> **Satu siswa dengan seluruh perjalanan pendidikannya.**

Dengan demikian:

```text
                    M-CORE
                       │
                       ▼
                   STUDENT
                       │
                  student_id
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
     PROGRAM        ACADEMIC       ALUMNI
      HISTORY
        │
        ├── 2024/2025
        ├── 2025/2026
        ├── 2026/2027
        └── 2027/2028
```

Arsitektur ini menjadi dasar untuk pengembangan:

```text
Absensi
Nilai
Jadwal
Dokumen
Pembayaran
Beasiswa
Alumni
Laporan
RBAC
Audit Log
```

Semua tetap terhubung dengan identitas siswa yang sama.

---

**End of `BUSINESS_RULES.md`**
