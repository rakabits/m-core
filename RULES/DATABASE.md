# M-CORE

## MUMTAZA CORE

### Central Student & Education Management System

**Document:** `DATABASE.md`
**Version:** `1.0.0`
**Status:** Baseline Architecture
**Database Engine:** PostgreSQL 16+
**System Principle:** One Student. One Identity. One Centralized System.

---

# 1. Database Overview

M-CORE menggunakan database terpusat sebagai **Single Source of Truth** untuk seluruh data siswa dan perjalanan pendidikan.

Tujuan utama database:

* Menyimpan satu profil utama untuk setiap siswa.
* Menghindari duplikasi data siswa.
* Menyimpan seluruh riwayat program siswa.
* Mendukung perpindahan dan kelanjutan program.
* Menyediakan fondasi untuk modul akademik.
* Menyediakan fondasi untuk modul alumni.
* Menjadi sumber data utama bagi seluruh aplikasi M-CORE.

Prinsip utama:

> **One Student. One Identity. One Centralized System.**

---

# 2. Konsep Utama

Identitas siswa dipisahkan dari perjalanan pendidikannya.

```text
STUDENT
   │
   │ 1 : N
   ▼
PROGRAM HISTORY
   │
   │ N : 1
   ▼
PROGRAM
```

Contoh:

```text
STU-001
Ahmad Fulan
      │
      ├── 2024/2025 → MTs → VII
      ├── 2025/2026 → MTs → VIII
      ├── 2026/2027 → MTs → IX
      └── 2027/2028 → Pra-Univ
```

`student_id` tetap sama sepanjang perjalanan siswa.

---

# 3. Database Architecture

M-CORE Core Database pada versi 1.0 terdiri dari tiga tabel utama:

```text
database
│
├── students
│
├── programs
│
└── student_program_history
```

Fungsi:

| Table                     | Fungsi                          |
| ------------------------- | ------------------------------- |
| `students`                | Master identitas siswa          |
| `programs`                | Master daftar program           |
| `student_program_history` | Riwayat siswa mengikuti program |

---

# 4. ERD

```text
┌─────────────────────────────────┐
│             STUDENTS            │
├─────────────────────────────────┤
│ PK student_id                   │
│    full_name                    │
│    gender                       │
│    birth_place                  │
│    birth_date                   │
│ UQ nik                          │
│ UQ email                        │
│    phone                        │
│    whatsapp                     │
│    status                       │
│    created_at                   │
│    updated_at                   │
└───────────────┬─────────────────┘
                │
                │ 1
                │
                │ N
                ▼
┌─────────────────────────────────┐
│     STUDENT_PROGRAM_HISTORY     │
├─────────────────────────────────┤
│ PK history_id                   │
│ FK student_id                   │
│ FK program_id                   │
│    academic_year                │
│    level                        │
│    class_name                   │
│    status                       │
│    start_date                   │
│    end_date                     │
│    notes                        │
│    created_at                   │
│    updated_at                   │
└───────────────┬─────────────────┘
                │
                │ N
                │
                │ 1
                ▼
┌─────────────────────────────────┐
│             PROGRAMS            │
├─────────────────────────────────┤
│ PK program_id                   │
│ UQ program_code                 │
│    program_name                 │
│    education_level              │
│    is_active                    │
│    created_at                   │
│    updated_at                   │
└─────────────────────────────────┘
```

---

# 5. Naming Convention

## 5.1 Table

Gunakan:

```text
snake_case
plural
lowercase
```

Contoh:

```text
students
programs
student_program_history
```

Hindari:

```text
Student
StudentData
tblStudent
studentData
```

---

## 5.2 Column

Gunakan:

```text
snake_case
lowercase
```

Contoh:

```text
student_id
full_name
birth_date
academic_year
created_at
```

---

## 5.3 Primary Key

Format:

```text
<table_singular>_id
```

Contoh:

```text
student_id
program_id
history_id
```

---

## 5.4 Foreign Key

Gunakan nama Primary Key dari tabel tujuan.

Contoh:

```text
student_id
program_id
```

---

# 6. Table: `students`

## Purpose

`students` merupakan **Master Student Identity**.

Tabel ini adalah sumber utama data profil siswa di M-CORE.

Satu siswa hanya boleh memiliki satu record.

---

## Fields

| Field         | Type         | Null | Key | Default             | Description              |
| ------------- | ------------ | ---: | --- | ------------------- | ------------------------ |
| `student_id`  | UUID         |   NO | PK  | `gen_random_uuid()` | ID unik internal M-CORE  |
| `full_name`   | VARCHAR(150) |   NO |     |                     | Nama lengkap             |
| `gender`      | VARCHAR(20)  |   NO |     |                     | Jenis kelamin            |
| `birth_place` | VARCHAR(100) |  YES |     |                     | Tempat lahir             |
| `birth_date`  | DATE         |  YES |     |                     | Tanggal lahir            |
| `nik`         | VARCHAR(16)  |  YES | UQ  |                     | Nomor identitas nasional |
| `email`       | VARCHAR(150) |  YES | UQ* |                     | Email utama              |
| `phone`       | VARCHAR(20)  |  YES |     |                     | Nomor HP utama           |
| `whatsapp`    | VARCHAR(20)  |  YES |     |                     | Nomor WhatsApp           |
| `status`      | VARCHAR(20)  |   NO |     | `active`            | Status siswa             |
| `created_at`  | TIMESTAMPTZ  |   NO |     | `NOW()`             | Waktu dibuat             |
| `updated_at`  | TIMESTAMPTZ  |   NO |     | `NOW()`             | Waktu diperbarui         |

---

# 7. Student ID

`student_id` adalah identitas internal M-CORE.

Contoh:

```text
550e8400-e29b-41d4-a716-446655440000
```

`student_id` tidak boleh menggunakan:

* NIK
* nomor HP
* email
* nomor passport
* nomor pendaftaran

Alasan:

> ID internal sistem harus independen dari identitas eksternal siswa.

---

# 8. Gender

Nilai database:

```text
male
female
```

UI:

```text
male   → Laki-laki
female → Perempuan
```

Constraint:

```sql
CHECK (gender IN ('male', 'female'))
```

---

# 9. Student Status

Nilai yang diperbolehkan:

```text
active
alumni
inactive
```

| Value      | UI       | Description                               |
| ---------- | -------- | ----------------------------------------- |
| `active`   | Aktif    | Masih menjadi siswa                       |
| `alumni`   | Alumni   | Telah menyelesaikan perjalanan pendidikan |
| `inactive` | Nonaktif | Tidak sedang aktif                        |

Status siswa **tidak sama** dengan status program.

---

# 10. NIK

NIK:

```text
VARCHAR(16)
```

bukan:

```text
INTEGER
BIGINT
```

Alasan:

* NIK adalah identifier, bukan angka untuk operasi matematika.
* Bisa membutuhkan leading zero.
* Tidak boleh mengalami perubahan format numerik.

NIK harus unik jika tersedia.

Jika belum tersedia:

```text
nik = NULL
```

bukan:

```text
nik = ''
```

---

# 11. Email

Email bersifat unik jika tersedia.

Perbandingan harus case-insensitive.

Contoh:

```text
Ahmad@Email.com
ahmad@email.com
```

dianggap sebagai email yang sama.

Gunakan unique index:

```sql
CREATE UNIQUE INDEX uq_students_email
ON students(LOWER(email))
WHERE email IS NOT NULL;
```

---

# 12. Table: `programs`

## Purpose

Menyimpan master seluruh program yang tersedia di M-CORE.

Contoh:

```text
MTs
MA
Pra Universitas
Program Turkiye
Program Mesir
Program Bahasa
```

---

## Fields

| Field             | Type         | Null | Key | Default             | Description        |
| ----------------- | ------------ | ---: | --- | ------------------- | ------------------ |
| `program_id`      | UUID         |   NO | PK  | `gen_random_uuid()` | ID program         |
| `program_code`    | VARCHAR(50)  |   NO | UQ  |                     | Kode unik program  |
| `program_name`    | VARCHAR(150) |   NO |     |                     | Nama program       |
| `education_level` | VARCHAR(100) |  YES |     |                     | Jenjang pendidikan |
| `is_active`       | BOOLEAN      |   NO |     | `TRUE`              | Status program     |
| `created_at`      | TIMESTAMPTZ  |   NO |     | `NOW()`             | Waktu dibuat       |
| `updated_at`      | TIMESTAMPTZ  |   NO |     | `NOW()`             | Waktu diperbarui   |

---

# 13. Program Code

`program_code` harus unik.

Contoh:

```text
MTS
MA
PRA-UNIV
TURKIYE
MESIR
```

Tidak boleh terdapat dua program dengan kode sama.

---

# 14. Program Active Status

Program yang tidak lagi digunakan tidak boleh langsung dihapus.

Gunakan:

```text
is_active = false
```

Contoh:

```text
PRA-UNIV
is_active = false
```

Riwayat siswa yang pernah mengikuti program tersebut tetap aman.

---

# 15. Table: `student_program_history`

## Purpose

Menyimpan seluruh perjalanan siswa dalam program M-CORE.

Tabel ini adalah bagian penting dari sistem karena seorang siswa dapat mengikuti banyak program sepanjang waktu.

---

## Fields

| Field           | Type        | Null | Key | Default             | Description      |
| --------------- | ----------- | ---: | --- | ------------------- | ---------------- |
| `history_id`    | UUID        |   NO | PK  | `gen_random_uuid()` | ID riwayat       |
| `student_id`    | UUID        |   NO | FK  |                     | ID siswa         |
| `program_id`    | UUID        |   NO | FK  |                     | ID program       |
| `academic_year` | VARCHAR(9)  |   NO |     |                     | Tahun akademik   |
| `level`         | VARCHAR(50) |  YES |     |                     | Level/jenjang    |
| `class_name`    | VARCHAR(50) |  YES |     |                     | Kelas            |
| `status`        | VARCHAR(20) |   NO |     | `enrolled`          | Status program   |
| `start_date`    | DATE        |  YES |     |                     | Tanggal mulai    |
| `end_date`      | DATE        |  YES |     |                     | Tanggal selesai  |
| `notes`         | TEXT        |  YES |     |                     | Catatan          |
| `created_at`    | TIMESTAMPTZ |   NO |     | `NOW()`             | Waktu dibuat     |
| `updated_at`    | TIMESTAMPTZ |   NO |     | `NOW()`             | Waktu diperbarui |

---

# 16. Program History Status

Nilai yang diperbolehkan:

```text
enrolled
completed
transferred
dropped
cancelled
```

| Value         | Description      |
| ------------- | ---------------- |
| `enrolled`    | Sedang mengikuti |
| `completed`   | Selesai          |
| `transferred` | Pindah program   |
| `dropped`     | Berhenti         |
| `cancelled`   | Dibatalkan       |

---

# 17. Academic Year

Format:

```text
YYYY/YYYY
```

Contoh:

```text
2024/2025
2025/2026
2026/2027
```

Validasi:

```text
^[0-9]{4}/[0-9]{4}$
```

---

# 18. Class & Level

`level` dan `class_name` dibuat terpisah karena tidak semua program menggunakan sistem kelas.

Contoh MTs:

```text
level      = MTs
class_name = VII
```

Pra-Universitas:

```text
level      = Persiapan
class_name = Batch 1
```

Program lain mungkin:

```text
level      = Turkish Language
class_name = A2
```

Dengan struktur ini, database tidak terlalu bergantung pada satu jenis sistem pendidikan.

---

# 19. Primary Key Rules

## `students`

```text
PRIMARY KEY (student_id)
```

## `programs`

```text
PRIMARY KEY (program_id)
```

## `student_program_history`

```text
PRIMARY KEY (history_id)
```

Semua Primary Key:

* wajib unik
* tidak boleh NULL
* tidak boleh berubah setelah record dibuat

---

# 20. Foreign Key Rules

## Student History → Student

```sql
FOREIGN KEY (student_id)
REFERENCES students(student_id)
ON UPDATE CASCADE
ON DELETE RESTRICT
```

Artinya:

* Riwayat harus memiliki siswa.
* Siswa tidak dapat dihapus jika masih memiliki history.

---

## Student History → Program

```sql
FOREIGN KEY (program_id)
REFERENCES programs(program_id)
ON UPDATE CASCADE
ON DELETE RESTRICT
```

Artinya:

* History harus memiliki program.
* Program tidak boleh dihapus jika masih digunakan.

Gunakan `is_active = false` untuk menonaktifkan program.

---

# 21. Unique Constraints

## Student NIK

```sql
UNIQUE (nik)
```

Implementasi yang disarankan:

```sql
CREATE UNIQUE INDEX uq_students_nik
ON students(nik)
WHERE nik IS NOT NULL;
```

---

## Student Email

```sql
CREATE UNIQUE INDEX uq_students_email
ON students(LOWER(email))
WHERE email IS NOT NULL;
```

---

## Program Code

```text
UNIQUE(program_code)
```

---

## Program History

Gunakan:

```text
UNIQUE(
    student_id,
    program_id,
    academic_year
)
```

Tujuannya mencegah duplikasi history yang sama.

---

# 22. Index Strategy

Index utama:

```text
students
├── PK student_id
├── UNIQUE nik
├── UNIQUE lower(email)
├── INDEX full_name
├── INDEX status
└── INDEX birth_date

programs
├── PK program_id
├── UNIQUE program_code
├── INDEX program_name
└── INDEX is_active

student_program_history
├── PK history_id
├── INDEX student_id
├── INDEX program_id
├── INDEX academic_year
├── INDEX status
└── INDEX student_id + academic_year
```

---

# 23. SQL Schema

## Enable UUID

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

---

## Students

```sql
CREATE TABLE students (
    student_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    full_name VARCHAR(150) NOT NULL,

    gender VARCHAR(20) NOT NULL
        CHECK (gender IN ('male', 'female')),

    birth_place VARCHAR(100),

    birth_date DATE,

    nik VARCHAR(16),

    email VARCHAR(150),

    phone VARCHAR(20),

    whatsapp VARCHAR(20),

    status VARCHAR(20) NOT NULL DEFAULT 'active'
        CHECK (
            status IN (
                'active',
                'alumni',
                'inactive'
            )
        ),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## Students Index

```sql
CREATE UNIQUE INDEX uq_students_nik
ON students(nik)
WHERE nik IS NOT NULL;
```

```sql
CREATE UNIQUE INDEX uq_students_email
ON students(LOWER(email))
WHERE email IS NOT NULL;
```

```sql
CREATE INDEX idx_students_full_name
ON students(full_name);
```

```sql
CREATE INDEX idx_students_status
ON students(status);
```

```sql
CREATE INDEX idx_students_birth_date
ON students(birth_date);
```

---

# 24. Programs SQL

```sql
CREATE TABLE programs (
    program_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    program_code VARCHAR(50) NOT NULL UNIQUE,

    program_name VARCHAR(150) NOT NULL,

    education_level VARCHAR(100),

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Indexes:

```sql
CREATE INDEX idx_programs_name
ON programs(program_name);
```

```sql
CREATE INDEX idx_programs_active
ON programs(is_active);
```

---

# 25. Student Program History SQL

```sql
CREATE TABLE student_program_history (
    history_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    student_id UUID NOT NULL,

    program_id UUID NOT NULL,

    academic_year VARCHAR(9) NOT NULL
        CHECK (
            academic_year ~ '^[0-9]{4}/[0-9]{4}$'
        ),

    level VARCHAR(50),

    class_name VARCHAR(50),

    status VARCHAR(20) NOT NULL DEFAULT 'enrolled'
        CHECK (
            status IN (
                'enrolled',
                'completed',
                'transferred',
                'dropped',
                'cancelled'
            )
        ),

    start_date DATE,

    end_date DATE,

    notes TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_sph_student
        FOREIGN KEY (student_id)
        REFERENCES students(student_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_sph_program
        FOREIGN KEY (program_id)
        REFERENCES programs(program_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT uq_student_program_year
        UNIQUE (
            student_id,
            program_id,
            academic_year
        ),

    CONSTRAINT chk_program_dates
        CHECK (
            end_date IS NULL
            OR start_date IS NULL
            OR end_date >= start_date
        )
);
```

---

# 26. History Indexes

```sql
CREATE INDEX idx_sph_student_id
ON student_program_history(student_id);
```

```sql
CREATE INDEX idx_sph_program_id
ON student_program_history(program_id);
```

```sql
CREATE INDEX idx_sph_academic_year
ON student_program_history(academic_year);
```

```sql
CREATE INDEX idx_sph_status
ON student_program_history(status);
```

```sql
CREATE INDEX idx_sph_student_year
ON student_program_history(
    student_id,
    academic_year
);
```

---

# 27. Relationship Rules

## Student → Program History

```text
students 1 ───────── N student_program_history
```

Satu siswa dapat memiliki banyak history.

Minimum:

```text
0
```

Maximum:

```text
N
```

---

## Program → Program History

```text
programs 1 ───────── N student_program_history
```

Satu program dapat digunakan oleh banyak siswa.

---

# 28. Example Student Journey

Contoh:

```text
Student:
Ahmad Fulan
student_id:
STU-001
```

History:

| Academic Year | Program  | Level     | Class   | Status    |
| ------------- | -------- | --------- | ------- | --------- |
| 2024/2025     | MTs      | MTs       | VII     | completed |
| 2025/2026     | MTs      | MTs       | VIII    | completed |
| 2026/2027     | MTs      | MTs       | IX      | enrolled  |
| 2027/2028     | Pra-Univ | Persiapan | Batch 1 | enrolled  |

Semua record tetap:

```text
student_id = STU-001
```

---

# 29. Historical Data Rules

## DO

```text
2024 → MTs VII
2025 → MTs VIII
2026 → MTs IX
```

## DON'T

```text
2024 record
      ↓
overwrite
      ↓
2025
```

Setiap perjalanan pendidikan harus membuat record history baru.

---

# 30. Student Status vs Program Status

Kedua status tidak boleh disamakan.

Contoh:

```text
Student Status:
active
```

History:

```text
2024 → completed
2025 → completed
2026 → enrolled
```

Artinya:

> Siswa masih aktif, tetapi dua program/periode sebelumnya sudah selesai.

---

# 31. Alumni Rule

Ketika siswa menjadi alumni:

```text
students.status = 'alumni'
```

Tidak boleh:

```text
DELETE FROM students;
```

History tetap tersimpan.

Contoh:

```text
Ahmad
│
├── MTs VII       completed
├── MTs VIII      completed
├── MTs IX        completed
└── Pra-Univ      completed
        │
        ▼
      ALUMNI
```

---

# 32. Program Deactivation Rule

Jika program dihentikan:

```text
programs.is_active = false
```

Jangan:

```text
DELETE FROM programs
```

karena data history masih membutuhkan referensi program tersebut.

---

# 33. Data Integrity Rules

Database harus menjaga:

1. `student_id` selalu unik.
2. `program_id` selalu unik.
3. `history_id` selalu unik.
4. NIK tidak boleh duplikat.
5. Email tidak boleh duplikat jika digunakan.
6. Program code tidak boleh duplikat.
7. History harus mempunyai student.
8. History harus mempunyai program.
9. Tahun akademik harus valid.
10. `end_date` tidak boleh lebih awal dari `start_date`.
11. Data history tidak boleh di-overwrite.
12. Data historis tidak boleh dihapus sembarangan.

---

# 34. Security & Privacy

Database M-CORE mengandung Personal Identifiable Information (PII).

Data yang perlu dilindungi:

```text
NIK
Tanggal lahir
Nomor HP
WhatsApp
Email
```

## Rules

### 1. Database tidak boleh diakses langsung dari browser

Arsitektur:

```text
Browser
   ↓
Frontend
   ↓
Backend/API
   ↓
Database
```

Bukan:

```text
Browser
   ↓
Database
```

---

### 2. Gunakan Parameterized Query

Jangan membuat query berdasarkan string concatenation.

Gunakan parameter:

```sql
WHERE student_id = $1
```

---

### 3. Sensitive Data Exposure

Jangan mengirim seluruh profil siswa pada endpoint yang hanya membutuhkan nama.

Contoh list:

```json
{
    "student_id": "...",
    "full_name": "Ahmad Fulan",
    "status": "active"
}
```

NIK, nomor HP, WhatsApp, dan email hanya dikirim jika memang diperlukan dan user memiliki permission.

---

### 4. Authentication

Authentication tidak boleh menggunakan tabel `students`.

Siswa dan user aplikasi adalah dua konsep berbeda.

```text
students
    ↓
data pendidikan

users
    ↓
akun untuk mengakses M-CORE
```

Tabel `users` akan dibuat pada modul authentication.

---

### 5. Authorization

Akses data harus menggunakan permission.

Contoh:

```text
student.view
student.create
student.update
student.delete
student.view_sensitive
program.view
program.manage
```

Detail RBAC akan didefinisikan pada:

```text
RBAC.md
```

---

# 35. Audit Log

Pada fase berikutnya M-CORE disarankan memiliki:

```text
audit_logs
```

Minimal mencatat:

```text
user_id
action
entity
entity_id
timestamp
```

Contoh:

```text
user_id: ADMIN-001
action: UPDATE
entity: students
entity_id: STU-001
timestamp: 2026-08-31 10:30
```

Audit log diperlukan untuk perubahan data penting.

---

# 36. Migration

Semua perubahan database harus menggunakan migration.

Contoh:

```text
migrations/
│
├── 001_create_students.sql
├── 002_create_programs.sql
├── 003_create_student_program_history.sql
└── 004_create_audit_logs.sql
```

Developer tidak boleh mengubah production database secara manual tanpa migration yang tercatat.

---

# 37. Future Database Architecture

Core Database akan berkembang menjadi:

```text
                              M-CORE
                                │
                                ▼
                            STUDENTS
                                │
          ┌─────────────────────┼─────────────────────┐
          │                     │                     │
          ▼                     ▼                     ▼
       PROGRAM              ACADEMIC              PERSONAL
          │                     │                     │
          ▼                     ├── Attendance        ├── Documents
   Program History              ├── Grades            ├── Guardians
                                └── Schedule          └── Address
          │
          ▼
        ALUMNI
```

Future tables dapat meliputi:

```text
students
programs
student_program_history
student_documents
student_guardians
student_addresses
enrollments
attendance
grades
schedules
payments
scholarships
alumni_profiles
audit_logs
```

---

# 38. Future Academic Architecture

Untuk modul akademik yang lebih kompleks, gunakan konsep:

```text
students
    │
    ▼
enrollments
    │
    ├── attendance
    ├── grades
    └── schedules
```

`enrollments` dapat menjadi penghubung antara:

```text
student
program
academic_year
class
```

sehingga modul akademik tidak bergantung langsung pada history.

---

# 39. Data Lifecycle

Siklus data siswa:

```text
PROSPECT
   │
   ▼
STUDENT
   │
   ▼
ENROLLED
   │
   ▼
ACTIVE
   │
   ├──────────────┐
   │              │
   ▼              ▼
TRANSFER       COMPLETED
                  │
                  ▼
                ALUMNI
```

Data identitas utama tetap berada di:

```text
students
```

sedangkan perjalanan pendidikan berada di:

```text
student_program_history
```

---

# 40. Database Golden Rules

## Rule 01

> **One Student = One `student_id`.**

---

## Rule 02

> **Never use NIK as Primary Key.**

---

## Rule 03

> **Never duplicate student identity across modules.**

---

## Rule 04

> **Never overwrite historical program data.**

---

## Rule 05

> **Never delete historical data casually.**

---

## Rule 06

> **Every relationship must use Foreign Key.**

---

## Rule 07

> **Every schema change must use migration.**

---

## Rule 08

> **Sensitive student data must be protected.**

---

## Rule 09

> **Database is the Single Source of Truth.**

---

## Rule 10

> **When unsure, check `DATABASE.md` and `BUSINESS_RULES.md` before changing the schema.**

---

# 41. Current Scope — Version 1.0

Database Core M-CORE saat ini hanya mencakup:

```text
┌─────────────────────────────┐
│           M-CORE            │
│      CORE DATABASE          │
├─────────────────────────────┤
│                             │
│  1. students                │
│  2. programs                │
│  3. student_program_history │
│                             │
└─────────────────────────────┘
```

Jangan menambahkan tabel baru tanpa requirement yang jelas.

---

# 42. Definition of Done

Database Core v1.0 dianggap selesai apabila:

* [ ] `students` tersedia.
* [ ] `programs` tersedia.
* [ ] `student_program_history` tersedia.
* [ ] Primary Key sudah diterapkan.
* [ ] Foreign Key sudah diterapkan.
* [ ] Unique constraint sudah diterapkan.
* [ ] Index utama sudah diterapkan.
* [ ] Check constraint sudah diterapkan.
* [ ] Delete rule sudah diterapkan.
* [ ] Migration tersedia.
* [ ] Sample data tersedia.
* [ ] Query profil siswa berhasil.
* [ ] Query riwayat program berhasil.
* [ ] Query siswa berdasarkan program berhasil.
* [ ] Historical data tidak ter-overwrite.
* [ ] Sensitive data tidak terekspos secara default.
* [ ] Struktur siap dikembangkan ke modul akademik.
* [ ] Struktur siap dikembangkan ke modul alumni.
* [ ] Struktur siap dikembangkan ke RBAC dan audit log.

---

# 43. Final Architecture Decision

M-CORE menggunakan pendekatan **Centralized Student Identity**.

Struktur inti:

```text
                    M-CORE
                       │
                       ▼
                  ┌─────────┐
                  │ STUDENT │
                  │  CORE   │
                  └────┬────┘
                       │
              student_id sebagai
              identitas utama
                       │
          ┌────────────┴────────────┐
          │                         │
          ▼                         ▼
      PROGRAMS              PROGRAM HISTORY
          │                         │
          └────────────┬────────────┘
                       │
                       ▼
              EDUCATION JOURNEY
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
      ACADEMIC       ALUMNI       FUTURE
      MODULES        MODULES      MODULES
```

**M-CORE Database Core = `students` + `programs` + `student_program_history`.**

Seluruh modul M-CORE yang akan dikembangkan harus mempertahankan prinsip:

> **One Student. One Identity. One Centralized System.**

---

**End of `DATABASE.md`**
