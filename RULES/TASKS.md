# M-CORE

## MUMTAZA CORE

### Central Student & Education Management System

**Document:** `TASKS.md`
**Version:** `1.0.0`
**Status:** Development Roadmap
**Architecture:** Modular Monolith
**Database:** PostgreSQL
**Backend:** TypeScript
**Frontend:** Next.js / TypeScript

---

# 1. Tujuan

`TASKS.md` adalah roadmap pengembangan M-CORE.

Dokumen ini digunakan oleh:

* Developer
* Coder pemula
* AI Coding Assistant
* Project Manager
* QA / Tester

Tujuan utamanya:

1. Pengembangan dilakukan bertahap.
2. Setiap tahap memiliki output yang jelas.
3. Fitur tidak dikerjakan sebelum dependency siap.
4. Database, business rules, RBAC, API, dan UI tetap sinkron.
5. Developer baru dapat melanjutkan proyek dengan mudah.
6. Perubahan dapat dilacak.
7. Security menjadi bagian dari setiap tahap.

---

# 2. Development Principle

M-CORE dikembangkan dengan prinsip:

```text
Understand
    ↓
Design
    ↓
Implement
    ↓
Test
    ↓
Security Review
    ↓
Document
    ↓
Next Task
```

Jangan:

```text
Coding
   ↓
Coding
   ↓
Coding
   ↓
"nanti security"
```

---

# 3. Status Task

Gunakan status berikut:

```text
[ ] TODO
[~] IN PROGRESS
[x] DONE
[!] BLOCKED
[-] CANCELLED
```

Contoh:

```text
[x] Setup repository
[~] Setup database
[ ] Setup authentication
[!] Waiting for infrastructure
```

---

# 4. Priority

Gunakan:

```text
P0 = Critical
P1 = High
P2 = Normal
P3 = Nice to Have
```

P0 dan P1 harus diselesaikan sebelum fitur berikutnya bergantung kepadanya.

---

# 5. Dependency Rule

Urutan utama:

```text
PHASE 0
Project Setup
      ↓
PHASE 1
Database
      ↓
PHASE 2
Authentication + RBAC
      ↓
PHASE 3
Student
      ↓
PHASE 4
Riwayat Program
      ↓
PHASE 5
Akademik
      ↓
PHASE 6
Testing + Security
```

Tidak disarankan melompati dependency.

---

# 6. MASTER ROADMAP

```text
PHASE 0  ── Setup
    │
    ▼
PHASE 1  ── Database
    │
    ▼
PHASE 2  ── Auth / RBAC
    │
    ▼
PHASE 3  ── Student
    │
    ▼
PHASE 4  ── Riwayat Program
    │
    ▼
PHASE 5  ── Akademik
    │
    ▼
PHASE 6  ── Testing & Security
```

---

# PHASE 0 — PROJECT SETUP

## Tujuan

Mempersiapkan fondasi project sebelum business feature dibuat.

---

## TASK 0.1 — Repository Setup

**Priority:** P0

```text
[ ] Buat repository M-CORE
[ ] Buat branch main
[ ] Buat branch develop
[ ] Buat .gitignore
[ ] Buat README.md
[ ] Buat struktur folder dasar
```

### Output

```text
m-core/
├── src/
├── app/
├── prisma/
├── tests/
├── docs/
├── scripts/
└── README.md
```

---

## TASK 0.2 — Initialize TypeScript

**Priority:** P0

```text
[ ] Setup TypeScript
[ ] Enable strict mode
[ ] Setup path alias
[ ] Setup linting
[ ] Setup formatting
```

### Definition of Done

```text
[x] TypeScript berjalan
[x] Build berhasil
[x] Lint berhasil
```

---

## TASK 0.3 — Setup Frontend

**Priority:** P1

```text
[ ] Setup Next.js
[ ] Setup App Router
[ ] Setup Tailwind
[ ] Setup global layout
[ ] Setup basic UI components
```

---

## TASK 0.4 — Setup Backend/API

**Priority:** P0

```text
[ ] Setup API structure
[ ] Setup API versioning
[ ] Setup error handler
[ ] Setup response format
[ ] Setup request validation
```

Base route:

```text
/api/v1
```

---

## TASK 0.5 — Environment Configuration

**Priority:** P0

```text
[ ] .env
[ ] .env.example
[ ] Development configuration
[ ] Staging configuration
[ ] Production configuration
```

Required:

```text
DATABASE_URL
AUTH_SECRET
APP_URL
```

### Security

```text
[ ] .env tidak masuk Git
[ ] Secret tidak ditulis dalam source code
[ ] Secret tidak dicetak ke log
```

---

## TASK 0.6 — Documentation Setup

**Priority:** P0

```text
[x] PROJECT.md
[x] ARCHITECTURE.md
[x] DATABASE.md
[x] BUSINESS_RULES.md
[x] RBAC.md
[x] API_SPEC.md
[x] TASKS.md
[ ] UI_GUIDELINES.md
[ ] AI_RULES.md
```

---

## PHASE 0 — Definition of Done

```text
[ ] Repository siap
[ ] TypeScript strict aktif
[ ] Frontend berjalan
[ ] API berjalan
[ ] Environment siap
[ ] Documentation tersedia
[ ] Lint berhasil
[ ] Build berhasil
```

---

# PHASE 1 — DATABASE

## Tujuan

Membangun database sebagai sumber data utama M-CORE.

---

## TASK 1.1 — Setup PostgreSQL

**Priority:** P0

```text
[ ] Buat development database
[ ] Buat staging database
[ ] Siapkan production database
[ ] Setup DATABASE_URL
[ ] Test koneksi
```

---

## TASK 1.2 — Setup ORM

**Priority:** P0

```text
[ ] Install ORM
[ ] Setup schema
[ ] Setup migration
[ ] Setup seed
```

---

## TASK 1.3 — Student Table

**Priority:** P0

Implementasi sesuai `DATABASE.md`.

Field utama:

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
created_at
updated_at
```

### Constraint

```text
student_id → PK
nik → UNIQUE
```

---

## TASK 1.4 — Program Table

**Priority:** P0

```text
[ ] programs
```

Contoh:

```text
MTs
MA
Pra-Univ
```

---

## TASK 1.5 — Program History / Enrollment

**Priority:** P0

Buat tabel untuk menyimpan perjalanan siswa.

Konsep:

```text
Student
    │
    ├── 2024 MTs VII
    ├── 2025 MTs VIII
    ├── 2026 MTs IX
    └── 2027 Pra-Univ
```

---

## TASK 1.6 — Academic Reference

**Priority:** P1

Siapkan struktur dasar:

```text
academic_year
class
program
```

Jangan memasukkan fitur nilai/absensi dahulu.

---

## TASK 1.7 — Database Index

**Priority:** P1

Index berdasarkan kebutuhan query.

Minimal evaluasi:

```text
student_id
nik
full_name
status
program_id
academic_year
```

---

## TASK 1.8 — Seed Data

**Priority:** P1

Buat data development:

```text
[ ] Admin
[ ] Operator
[ ] Sample student
[ ] Sample programs
[ ] Sample program history
```

Jangan menggunakan data siswa asli untuk seed development.

---

## TASK 1.9 — Migration

**Priority:** P0

```text
[ ] Initial migration
[ ] Test migration
[ ] Test rollback strategy
[ ] Verify constraints
```

---

## PHASE 1 — Definition of Done

```text
[ ] PostgreSQL terhubung
[ ] Schema selesai
[ ] Migration berhasil
[ ] Seed berhasil
[ ] PK/FK benar
[ ] UNIQUE constraint aktif
[ ] Index tersedia
[ ] Database dapat digunakan API
```

---

# PHASE 2 — AUTHENTICATION & RBAC

## Tujuan

Membangun keamanan akses sebelum data siswa dibuka.

---

# TASK 2.1 — User Authentication

**Priority:** P0

```text
[ ] User table
[ ] Login
[ ] Logout
[ ] Session
[ ] Password hashing
[ ] Password validation
```

Password tidak boleh disimpan plaintext.

---

# TASK 2.2 — Role

**Priority:** P0

Implementasikan role sesuai `RBAC.md`.

Contoh awal:

```text
SUPER_ADMIN
ADMIN
ACADEMIC
OPERATOR
TEACHER
VIEWER
```

Role dapat disesuaikan dengan kebutuhan organisasi.

---

# TASK 2.3 — Permission

**Priority:** P0

Contoh:

```text
student.view
student.create
student.update
student.promote
student.transfer
student.alumni
```

---

# TASK 2.4 — Scope

**Priority:** P0

Implementasi:

```text
Role
  ↓
Permission
  ↓
Scope
```

Contoh:

```text
OPERATOR
    ↓
student.view
    ↓
program = MTs
```

---

# TASK 2.5 — Authorization Middleware

**Priority:** P0

Setiap protected API:

```text
Authentication
       ↓
Permission
       ↓
Scope
```

---

# TASK 2.6 — Permission Helper

Buat helper:

```text
can()
hasPermission()
hasScope()
```

Jangan membuat logic permission sendiri-sendiri di setiap halaman.

---

# TASK 2.7 — Security Test RBAC

**Priority:** P0

Test:

```text
[ ] User tanpa login
[ ] User tanpa permission
[ ] User dengan permission
[ ] User dengan scope salah
[ ] Admin
[ ] Operator
```

---

## PHASE 2 — Definition of Done

```text
[ ] Login berhasil
[ ] Logout berhasil
[ ] Session aman
[ ] Role bekerja
[ ] Permission bekerja
[ ] Scope bekerja
[ ] Unauthorized request ditolak
[ ] RBAC test berhasil
```

---

# PHASE 3 — STUDENT MANAGEMENT

## Tujuan

Membangun modul utama M-CORE: pengelolaan data siswa.

---

# TASK 3.1 — Student API

**Priority:** P0

Implementasi:

```text
GET    /api/v1/students
GET    /api/v1/students/:id
POST   /api/v1/students
PATCH  /api/v1/students/:id
```

---

# TASK 3.2 — Student List

**Priority:** P0

Fitur:

```text
[ ] Pagination
[ ] Search
[ ] Filter status
[ ] Filter gender
[ ] Sorting
```

---

# TASK 3.3 — Student Detail

**Priority:** P0

Tampilkan:

```text
Profil
Status
Program aktif
Riwayat program
Informasi kontak
```

---

# TASK 3.4 — Create Student

**Priority:** P0

Form:

```text
Nama
Gender
Tempat lahir
Tanggal lahir
NIK
Email
Phone
WhatsApp
Status
```

---

# TASK 3.5 — Duplicate NIK Protection

**Priority:** P0

Saat membuat siswa:

```text
Input NIK
    ↓
Check UNIQUE
    ↓
Jika sudah ada
    ↓
409 Conflict
```

Tidak boleh membuat student kedua dengan NIK yang sama.

---

# TASK 3.6 — Update Student

**Priority:** P0

Perubahan harus:

```text
[ ] Validated
[ ] Authorized
[ ] Scoped
[ ] Audited jika sensitif
```

---

# TASK 3.7 — Student Search

**Priority:** P1

Search minimal:

```text
student_id
full_name
nik
phone
whatsapp
```

Untuk pencarian NIK, pertimbangkan privacy dan permission.

---

# TASK 3.8 — Student Status

**Priority:** P0

Implementasi:

```text
ACTIVE
INACTIVE
ALUMNI
```

Status transition mengikuti `BUSINESS_RULES.md`.

---

# TASK 3.9 — Student UI

```text
[ ] Student Dashboard
[ ] Student Table
[ ] Student Detail
[ ] Create Student
[ ] Edit Student
[ ] Status Badge
```

---

## PHASE 3 — Definition of Done

```text
[ ] CRUD student selesai
[ ] Search selesai
[ ] Filter selesai
[ ] Pagination selesai
[ ] Duplicate NIK ditolak
[ ] RBAC aktif
[ ] Scope aktif
[ ] Audit sensitif aktif
[ ] UI selesai
[ ] API test selesai
```

---

# PHASE 4 — RIWAYAT PROGRAM

## Tujuan

Menyimpan seluruh perjalanan siswa tanpa membuat student baru.

---

# TASK 4.1 — Program Master

```text
[ ] Create program
[ ] Update program
[ ] Activate/deactivate program
[ ] List program
```

---

# TASK 4.2 — Student Program Enrollment

Buat relasi:

```text
Student
    ↓
Program History
    ↓
Program
```

---

# TASK 4.3 — Add Program History

Contoh:

```text
Student A

2024
MTs
Kelas VII

2025
MTs
Kelas VIII

2026
MTs
Kelas IX
```

---

# TASK 4.4 — Promotion

**Priority:** P0

Fitur:

```text
Promote Student
```

Flow:

```text
Current Enrollment
       ↓
Validate
       ↓
Target Class
       ↓
Create New History
       ↓
Close Previous History
       ↓
Audit
```

---

# TASK 4.5 — Prevent Duplicate Enrollment

Tidak boleh:

```text
2026
MTs IX
ACTIVE

2026
MTs IX
ACTIVE
```

untuk siswa yang sama jika aturan bisnis melarangnya.

---

# TASK 4.6 — Transfer Program

Contoh:

```text
MTs
 ↓
MA
```

atau:

```text
MTs
 ↓
Pra-Univ
```

Flow:

```text
Request Transfer
       ↓
Permission
       ↓
Scope
       ↓
Business Validation
       ↓
Close Current
       ↓
Create New Enrollment
       ↓
Audit
```

---

# TASK 4.7 — Determine Active Program

Buat service:

```text
getActiveProgram(studentId)
```

Semua modul yang membutuhkan informasi program aktif harus menggunakan service ini.

---

# TASK 4.8 — Alumni

Flow:

```text
Active
   ↓
Graduate
   ↓
Alumni
```

Jangan menghapus history.

---

# TASK 4.9 — Program Timeline UI

Tampilkan:

```text
2024
MTs — VII
    │
    ▼
2025
MTs — VIII
    │
    ▼
2026
MTs — IX
    │
    ▼
2027
Pra-Univ
```

---

## PHASE 4 — Definition of Done

```text
[ ] Program master selesai
[ ] Program history selesai
[ ] Promotion selesai
[ ] Transfer selesai
[ ] Active program service selesai
[ ] Alumni flow selesai
[ ] Duplicate enrollment dicegah
[ ] Transaction digunakan
[ ] Audit tersedia
[ ] Timeline UI selesai
```

---

# PHASE 5 — AKADEMIK

## Tujuan

Menambahkan fitur akademik setelah Student dan Program History stabil.

Modul:

```text
Absensi
Nilai
Jadwal
```

---

# TASK 5.1 — Academic Structure

```text
[ ] Academic Year
[ ] Class
[ ] Subject
[ ] Teacher
```

---

# TASK 5.2 — Class Assignment

Relasikan:

```text
Student
    ↓
Program History
    ↓
Class
```

Pastikan class mengikuti enrollment yang benar.

---

# TASK 5.3 — Schedule

**Priority:** P1

```text
[ ] Create schedule
[ ] Update schedule
[ ] Delete/cancel schedule
[ ] View schedule
```

Data minimal:

```text
program
class
subject
teacher
day
start_time
end_time
room
```

---

# TASK 5.4 — Attendance

**Priority:** P1

Status:

```text
PRESENT
ABSENT
SICK
PERMISSION
```

Fitur:

```text
[ ] Input attendance
[ ] Edit attendance
[ ] View attendance
[ ] Attendance summary
```

---

# TASK 5.5 — Grades

**Priority:** P1

Fitur:

```text
[ ] Input grade
[ ] Edit grade
[ ] View grade
[ ] Grade summary
```

---

# TASK 5.6 — Academic Authorization

Contoh:

```text
Teacher
   ↓
grade.create
   ↓
Scope: assigned class
```

Teacher tidak otomatis dapat mengubah semua nilai siswa.

---

# TASK 5.7 — Academic Dashboard

Dashboard:

```text
Jumlah Siswa
Kehadiran
Nilai
Jadwal
Program Aktif
```

---

## PHASE 5 — Definition of Done

```text
[ ] Academic year selesai
[ ] Class selesai
[ ] Subject selesai
[ ] Teacher selesai
[ ] Schedule selesai
[ ] Attendance selesai
[ ] Grade selesai
[ ] Authorization selesai
[ ] Dashboard selesai
```

---

# PHASE 6 — TESTING & SECURITY

## Tujuan

Memastikan M-CORE aman, stabil, dan dapat digunakan sebelum production.

---

# TASK 6.1 — Unit Testing

**Priority:** P0

Test service utama:

```text
[ ] StudentService
[ ] PromotionService
[ ] TransferService
[ ] AlumniService
[ ] AuthorizationService
[ ] ActiveProgramService
```

---

# TASK 6.2 — API Integration Testing

**Priority:** P0

Test:

```text
POST /students
GET /students
GET /students/:id
PATCH /students/:id
POST /students/:id/promote
POST /students/:id/transfer
```

---

# TASK 6.3 — Authentication Testing

```text
[ ] Login valid
[ ] Login invalid
[ ] Logout
[ ] Expired session
[ ] Invalid session
[ ] Password security
```

---

# TASK 6.4 — Authorization Testing

```text
[ ] No permission
[ ] Wrong role
[ ] Wrong scope
[ ] Correct permission
[ ] Correct scope
```

---

# TASK 6.5 — IDOR Testing

Test:

```text
User A
    ↓
Student A
```

tidak boleh mengakses:

```text
Student B
```

jika scope tidak mengizinkan.

---

# TASK 6.6 — Input Validation Testing

Test:

```text
[ ] Empty name
[ ] Invalid gender
[ ] Invalid date
[ ] Invalid email
[ ] Invalid phone
[ ] Invalid NIK
[ ] Excessively long input
[ ] Unexpected fields
```

---

# TASK 6.7 — Injection Testing

Test defensive handling:

```text
[ ] SQL injection
[ ] XSS payload
[ ] Malicious query parameters
[ ] Unexpected JSON
```

---

# TASK 6.8 — Mass Assignment Testing

Pastikan user tidak dapat mengirim:

```json id="p1w9je"
{
  "status": "alumni",
  "role": "SUPER_ADMIN"
}
```

lalu backend menerima semuanya secara otomatis.

API hanya boleh menerima field yang memang diizinkan.

---

# TASK 6.9 — Duplicate Data Testing

```text
[ ] Duplicate NIK
[ ] Duplicate student
[ ] Duplicate enrollment
[ ] Duplicate active program
```

---

# TASK 6.10 — Transaction Testing

Simulasikan:

```text
Promotion
    ↓
Step 1 success
    ↓
Step 2 failure
```

Pastikan database rollback.

---

# TASK 6.11 — Audit Testing

Pastikan action sensitif menghasilkan audit:

```text
[ ] Update NIK
[ ] Promote
[ ] Transfer
[ ] Alumni
[ ] Role change
[ ] Permission change
```

---

# TASK 6.12 — Performance Testing

Test:

```text
[ ] Student list pagination
[ ] Search student
[ ] Program history
[ ] Dashboard
```

Periksa N+1 query.

---

# TASK 6.13 — Security Review

Checklist:

```text
[ ] Authentication
[ ] Authorization
[ ] Scope
[ ] Input validation
[ ] SQL injection protection
[ ] XSS protection
[ ] CSRF protection
[ ] CORS
[ ] Security headers
[ ] Rate limiting
[ ] Secret management
[ ] Error handling
[ ] Logging
[ ] Audit log
```

---

# TASK 6.14 — Production Readiness

```text
[ ] Production environment
[ ] Production database
[ ] Backup strategy
[ ] Monitoring
[ ] Error monitoring
[ ] Logging
[ ] HTTPS
[ ] Environment secrets
[ ] Migration strategy
[ ] Rollback strategy
```

---

# 7. RELEASE CHECKPOINT

M-CORE tidak boleh dianggap production-ready hanya karena UI sudah selesai.

Minimal:

```text
DATABASE
   ✓

AUTH
   ✓

RBAC
   ✓

STUDENT
   ✓

PROGRAM HISTORY
   ✓

ACADEMIC
   ✓

TESTING
   ✓

SECURITY
   ✓

BACKUP
   ✓

MONITORING
   ✓
```

---

# 8. MVP SCOPE

Versi pertama M-CORE sebaiknya fokus pada:

```text
1. Authentication
2. RBAC
3. Student
4. Program
5. Program History
6. Active Program
7. Basic Dashboard
```

Jangan langsung membuat seluruh sistem akademik jika core student belum stabil.

---

# 9. MVP Milestone

## MILESTONE 1 — Foundation

```text
[ ] Setup
[ ] Database
[ ] Documentation
```

Output:

> Project dapat dijalankan dan database siap.

---

## MILESTONE 2 — Security

```text
[ ] Authentication
[ ] Role
[ ] Permission
[ ] Scope
```

Output:

> Hanya user yang berwenang dapat mengakses data.

---

## MILESTONE 3 — Student Core

```text
[ ] Student CRUD
[ ] Search
[ ] Filter
[ ] Duplicate NIK
```

Output:

> M-CORE dapat mengelola data utama siswa.

---

## MILESTONE 4 — Student Journey

```text
[ ] Program
[ ] Program History
[ ] Promotion
[ ] Transfer
[ ] Alumni
```

Output:

> Perjalanan siswa dapat dicatat dari tahun ke tahun.

---

## MILESTONE 5 — Academic

```text
[ ] Class
[ ] Schedule
[ ] Attendance
[ ] Grade
```

Output:

> M-CORE mulai berfungsi sebagai education management system.

---

## MILESTONE 6 — Production

```text
[ ] Testing
[ ] Security
[ ] Backup
[ ] Monitoring
[ ] Deployment
```

Output:

> M-CORE siap digunakan secara operasional.

---

# 10. Task Dependency Matrix

| Task            | Dependency         | Priority |
| --------------- | ------------------ | -------: |
| Project Setup   | -                  |       P0 |
| Database        | Setup              |       P0 |
| Authentication  | Setup              |       P0 |
| RBAC            | Authentication     |       P0 |
| Student         | Database + RBAC    |       P0 |
| Program         | Database + RBAC    |       P0 |
| Program History | Student + Program  |       P0 |
| Promotion       | Program History    |       P0 |
| Transfer        | Program History    |       P0 |
| Alumni          | Program History    |       P0 |
| Class           | Program History    |       P1 |
| Schedule        | Class              |       P1 |
| Attendance      | Class + Schedule   |       P1 |
| Grades          | Class + Subject    |       P1 |
| Testing         | Semua core feature |       P0 |
| Production      | Testing + Security |       P0 |

---

# 11. Coding Rule untuk Setiap Task

Sebelum coding:

```text
[ ] Baca ARCHITECTURE.md
[ ] Baca DATABASE.md jika database terkait
[ ] Baca BUSINESS_RULES.md jika business logic terkait
[ ] Baca RBAC.md jika permission terkait
[ ] Baca API_SPEC.md jika API terkait
```

Saat coding:

```text
[ ] Ikuti existing pattern
[ ] Jangan duplicate logic
[ ] Validate input
[ ] Check authorization
[ ] Check scope
[ ] Gunakan service
[ ] Gunakan repository
```

Setelah coding:

```text
[ ] Run lint
[ ] Run typecheck
[ ] Run test
[ ] Security review
[ ] Update documentation
[ ] Update TASKS.md
```

---

# 12. AI Coding Workflow

AI Coding Assistant harus bekerja dengan pola:

```text
READ
 ↓
UNDERSTAND
 ↓
PLAN
 ↓
IMPLEMENT
 ↓
TEST
 ↓
REVIEW
```

AI tidak boleh langsung membuat kode sebelum memahami:

```text
ARCHITECTURE.md
DATABASE.md
BUSINESS_RULES.md
RBAC.md
API_SPEC.md
```

---

# 13. AI Task Prompt Template

Setiap task dapat diberikan kepada AI dengan format:

```text
TASK:
Implementasikan [nama fitur].

READ FIRST:
- ARCHITECTURE.md
- DATABASE.md
- BUSINESS_RULES.md
- RBAC.md
- API_SPEC.md
- TASKS.md

REQUIREMENT:
[jelaskan requirement]

CONSTRAINT:
- Jangan mengubah architecture.
- Jangan membuat duplicate logic.
- Ikuti existing coding pattern.
- Semua input harus divalidasi.
- Semua protected endpoint harus authorization.
- Scope harus diperiksa.
- Jangan expose sensitive data.

OUTPUT:
1. File yang dibuat.
2. File yang diubah.
3. Penjelasan perubahan.
4. Test yang dibuat.
5. Security consideration.
6. Dokumentasi yang perlu diperbarui.

SEBELUM SELESAI:
- Run typecheck.
- Run lint.
- Run test.
- Review authorization.
- Review database impact.
```

---

# 14. Rule Ketika Task Gagal

Jika task gagal:

```text
[!] BLOCKED
```

Jangan langsung membuat workaround yang merusak architecture.

Identifikasi:

```text
Problem
 ↓
Root Cause
 ↓
Dependency
 ↓
Fix
```

Kemudian lanjutkan.

---

# 15. Rule Perubahan Database

Jika task membutuhkan perubahan database:

```text
DATABASE.md
     ↓
schema.prisma
     ↓
migration
     ↓
repository
     ↓
service
     ↓
API
     ↓
test
```

Jangan hanya mengubah schema tanpa migration.

---

# 16. Rule Perubahan Business Logic

Jika business rule berubah:

```text
BUSINESS_RULES.md
        ↓
Service
        ↓
Test
        ↓
API
        ↓
UI
```

Dokumentasi harus menjadi sumber perubahan pertama.

---

# 17. Rule Perubahan RBAC

Jika permission berubah:

```text
RBAC.md
   ↓
Permission seed
   ↓
Policy
   ↓
API
   ↓
UI
   ↓
Test
```

---

# 18. Final Checklist

Sebelum fitur dianggap selesai:

```text
ARCHITECTURE
[ ] Sesuai architecture

DATABASE
[ ] Schema benar
[ ] Migration benar
[ ] Constraint benar
[ ] Index sesuai

BUSINESS
[ ] Business rule benar
[ ] Edge case ditangani

AUTH
[ ] Authentication
[ ] Authorization
[ ] Scope

API
[ ] Request validation
[ ] Response aman
[ ] Error handling

FRONTEND
[ ] UI
[ ] Loading
[ ] Empty state
[ ] Error state
[ ] Permission UI

SECURITY
[ ] IDOR
[ ] Injection
[ ] XSS
[ ] CSRF
[ ] Mass assignment
[ ] Sensitive data exposure

TEST
[ ] Unit
[ ] Integration
[ ] E2E jika diperlukan

DOCUMENTATION
[ ] Dokumentasi diperbarui
[ ] TASKS.md diperbarui
```

---

# 19. M-CORE Development Philosophy

M-CORE bukan sekadar aplikasi CRUD.

Arsitektur harus menjaga:

```text
                M-CORE
                   │
        ┌──────────┴──────────┐
        │                     │
     STUDENT               SECURITY
        │                     │
        ▼                     ▼
   PROGRAM JOURNEY       RBAC + SCOPE
        │                     │
        ▼                     ▼
     ACADEMIC              AUDIT
        │                     │
        └──────────┬──────────┘
                   ▼
             TRUSTED DATA
```

Prinsip:

> **Satu siswa → satu identitas → banyak perjalanan program → akses terkontrol → histori tidak hilang → setiap perubahan penting dapat diaudit.**

---

# 20. Current Development Target

Untuk memulai development, target pertama adalah:

```text
PHASE 0
Project Setup
       ↓
PHASE 1
Database
       ↓
PHASE 2
Authentication + RBAC
       ↓
PHASE 3
Student Management
```

Jangan masuk ke fitur akademik sebelum:

```text
Student
+
Program
+
Program History
```

sudah stabil.

---

# 21. Current Task

```text
CURRENT PHASE:
PHASE 0 — PROJECT SETUP

NEXT TASK:
TASK 0.1 — Repository Setup

AFTER THAT:
TASK 0.2 — TypeScript Setup

THEN:
TASK 0.3 — Frontend Setup

THEN:
TASK 0.4 — Backend/API Setup
```

---

# 22. Completion Status

```text
PHASE 0 — SETUP
[ ] Not Started

PHASE 1 — DATABASE
[ ] Not Started

PHASE 2 — AUTH / RBAC
[ ] Not Started

PHASE 3 — STUDENT
[ ] Not Started

PHASE 4 — RIWAYAT PROGRAM
[ ] Not Started

PHASE 5 — AKADEMIK
[ ] Not Started

PHASE 6 — TESTING & SECURITY
[ ] Not Started
```

---

**End of `TASKS.md`**
