# M-CORE

## MUMTAZA CORE

### Central Student & Education Management System

**Document:** `RBAC.md`
**Version:** `1.0.0`
**Status:** Baseline Security Architecture
**Related Documents:** `DATABASE.md`, `BUSINESS_RULES.md`, `API_SPEC.md`, `ARCHITECTURE.md`

> **One Student. One Identity. One Centralized System.**

---

# 1. Tujuan

`RBAC.md` mendefinisikan sistem **Role-Based Access Control (RBAC)** untuk M-CORE.

RBAC bertujuan memastikan bahwa setiap pengguna hanya dapat:

* melihat data yang memang diperlukan;
* membuat data sesuai tanggung jawabnya;
* mengubah data sesuai kewenangannya;
* menjalankan tindakan sensitif jika memiliki permission;
* mengakses data sesuai scope/unit/program;
* mengakses data sensitif berdasarkan permission khusus.

Model utama:

```text
USER
  │
  ▼
ROLE
  │
  ▼
PERMISSION
  │
  ▼
SCOPE
  │
  ▼
RESOURCE / DATA
```

---

# 2. Prinsip Keamanan

M-CORE menggunakan prinsip:

> **Default Deny.**

Artinya:

```text
Tidak memiliki permission
        ↓
Tidak boleh mengakses
```

Bukan:

```text
Boleh mengakses
        ↓
kecuali diblokir
```

---

# 3. Model Role → Permission → Scope

RBAC M-CORE terdiri dari tiga lapisan.

```text
┌──────────────┐
│     ROLE     │
│     Admin    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  PERMISSION  │
│ student.view │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│    SCOPE     │
│ All Students │
└──────┬───────┘
       │
       ▼
     DATA
```

Contoh:

```text
Operator Madrasah
        ↓
student.view
        ↓
scope = madrasah
        ↓
hanya siswa Madrasah
```

---

# 4. Definisi Role

**Role** adalah kumpulan permission berdasarkan tanggung jawab pengguna.

Contoh:

```text
Super Admin
Admin
Operator
Academic Staff
Finance Staff
Teacher
Counselor
Viewer
```

Role tidak menentukan data secara langsung.

Role menentukan:

> "Apa yang boleh dilakukan?"

Scope menentukan:

> "Data mana yang boleh diakses?"

---

# 5. Definisi Permission

Permission adalah kemampuan spesifik yang dapat dilakukan user.

Format:

```text
resource.action
```

Contoh:

```text
student.view
student.create
student.update
student.delete
```

Permission tambahan:

```text
student.view_sensitive
student.promote
student.transfer
student.mark_alumni
student.merge
```

---

# 6. Definisi Scope

Scope menentukan batas data yang dapat diakses.

Contoh:

```text
scope = all
scope = unit
scope = program
scope = class
scope = own
```

Dengan demikian dua user dapat memiliki permission yang sama tetapi melihat data berbeda.

Contoh:

```text
Operator A
student.view
scope = MTs

Operator B
student.view
scope = Pra-Univ
```

---

# 7. Access Decision

Akses diberikan jika:

```text
USER
 │
 ├── memiliki ROLE
 │
 ├── ROLE memiliki PERMISSION
 │
 └── PERMISSION berlaku pada SCOPE
             │
             ▼
           ALLOW
```

Jika salah satu tidak terpenuhi:

```text
DENY
```

---

# 8. Formula Authorization

Secara konseptual:

```text
ALLOW =
Authenticated
AND
HasPermission
AND
ScopeMatches
AND
ResourceExists
AND
BusinessRuleAllows
```

Contoh:

```text
user.update student
```

harus melewati:

```text
Authentication
       ↓
Permission
       ↓
Scope
       ↓
Business Rule
       ↓
Database
```

---

# 9. Authentication vs Authorization

Keduanya berbeda.

## Authentication

Menjawab:

> Siapa pengguna ini?

```text
LOGIN
 ↓
USER
```

## Authorization

Menjawab:

> Apa yang boleh dilakukan pengguna ini?

```text
USER
 ↓
ROLE
 ↓
PERMISSION
 ↓
SCOPE
```

---

# 10. Recommended Core Tables

Untuk implementasi RBAC:

```text
users
roles
permissions
scopes
user_roles
role_permissions
```

Jika membutuhkan scope yang lebih granular:

```text
role_permission_scopes
```

Struktur:

```text
users
  │
  ▼
user_roles
  │
  ▼
roles
  │
  ▼
role_permissions
  │
  ▼
permissions
  │
  ▼
role_permission_scopes
  │
  ▼
scopes
```

---

# 11. Table: `users`

User aplikasi bukan siswa.

```text
users
```

menyimpan akun yang dapat masuk ke M-CORE.

Contoh:

```text
User:
Ahmad Admin

Student:
Ahmad Fulan
```

Keduanya adalah entitas berbeda.

---

## Recommended Fields

| Field           | Type        | Key | Description            |
| --------------- | ----------- | --- | ---------------------- |
| `user_id`       | UUID        | PK  | ID user                |
| `username`      | VARCHAR     | UQ  | Username               |
| `email`         | VARCHAR     | UQ  | Email                  |
| `password_hash` | TEXT        |     | Password hash          |
| `status`        | VARCHAR     |     | active/inactive/locked |
| `last_login_at` | TIMESTAMPTZ |     | Login terakhir         |
| `created_at`    | TIMESTAMPTZ |     | Waktu dibuat           |
| `updated_at`    | TIMESTAMPTZ |     | Waktu diperbarui       |

Password **tidak boleh disimpan plaintext**.

---

# 12. Table: `roles`

Menyimpan role.

| Field         | Type        | Key | Description      |
| ------------- | ----------- | --- | ---------------- |
| `role_id`     | UUID        | PK  | ID role          |
| `role_code`   | VARCHAR     | UQ  | Kode role        |
| `role_name`   | VARCHAR     |     | Nama role        |
| `description` | TEXT        |     | Deskripsi        |
| `is_system`   | BOOLEAN     |     | Role sistem      |
| `is_active`   | BOOLEAN     |     | Status           |
| `created_at`  | TIMESTAMPTZ |     | Waktu dibuat     |
| `updated_at`  | TIMESTAMPTZ |     | Waktu diperbarui |

---

# 13. Table: `permissions`

| Field             | Type    | Key | Description     |
| ----------------- | ------- | --- | --------------- |
| `permission_id`   | UUID    | PK  | ID permission   |
| `permission_code` | VARCHAR | UQ  | Kode permission |
| `permission_name` | VARCHAR |     | Nama            |
| `resource`        | VARCHAR |     | Resource        |
| `action`          | VARCHAR |     | Action          |
| `description`     | TEXT    |     | Penjelasan      |

Contoh:

```text
student.view
student.create
student.update
student.view_sensitive
student.promote
```

---

# 14. Table: `scopes`

| Field         | Type         | Key | Description |
| ------------- | ------------ | --- | ----------- |
| `scope_id`    | UUID         | PK  | ID scope    |
| `scope_type`  | VARCHAR      |     | Tipe scope  |
| `scope_value` | UUID/VARCHAR |     | Nilai scope |
| `description` | TEXT         |     | Deskripsi   |

---

# 15. Table: `user_roles`

Relasi user dengan role.

```text
users
  │
  │ N
  ▼
user_roles
  ▲
  │ N
roles
```

Seorang user dapat memiliki lebih dari satu role.

Contoh:

```text
Ahmad
 ├── Academic Staff
 └── Counselor
```

---

# 16. Table: `role_permissions`

Menghubungkan role dengan permission.

```text
roles
  │
  │ N
  ▼
role_permissions
  ▲
  │ N
permissions
```

Contoh:

```text
Academic Staff
    │
    ├── student.view
    ├── student.update
    ├── student.promote
    └── program_history.view
```

---

# 17. Table: `role_permission_scopes`

Digunakan jika satu permission membutuhkan batas data.

Contoh:

```text
student.view
        +
scope = MTs
```

atau:

```text
student.view
        +
scope = Program Pra-Univ
```

---

# 18. Role Hierarchy

M-CORE **tidak menggunakan hierarchy sebagai satu-satunya mekanisme authorization**.

Jangan membuat asumsi:

```text
Admin > Operator
```

berarti otomatis semua permission Operator dimiliki Admin.

Permission harus tetap eksplisit.

Namun hierarchy dapat digunakan sebagai konsep administratif:

```text
Super Admin
     ↓
Admin
     ↓
Operator
```

---

# 19. Core Roles

M-CORE v1.0 memiliki role dasar:

```text
SUPER_ADMIN
ADMIN
OPERATOR
ACADEMIC_STAFF
TEACHER
COUNSELOR
VIEWER
```

Role tambahan dapat dibuat sesuai kebutuhan organisasi.

---

# 20. SUPER_ADMIN

Tujuan:

> Pengelola penuh sistem.

Permission:

```text
*
```

atau seluruh permission yang tersedia.

Scope:

```text
all
```

Super Admin dapat:

* mengelola user;
* mengelola role;
* mengelola permission;
* mengelola scope;
* melihat data;
* mengubah data;
* mengelola konfigurasi;
* melakukan recovery administratif.

Namun tindakan sensitif tetap harus tercatat dalam audit log.

---

# 21. ADMIN

Tujuan:

> Administrator operasional M-CORE.

Contoh permission:

```text
student.view
student.create
student.update
student.view_sensitive
student.promote
student.transfer
student.mark_alumni

program.view
program.create
program.update

program_history.view
program_history.create
program_history.update
```

Scope:

```text
unit
```

atau sesuai konfigurasi organisasi.

---

# 22. OPERATOR

Tujuan:

> Input dan pengelolaan data operasional.

Permission:

```text
student.view
student.create
student.update

program.view

program_history.view
program_history.create
program_history.update
```

Default:

```text
student.view_sensitive = DENY
```

Operator tidak otomatis boleh:

```text
student.merge
student.delete
student.mark_alumni
```

---

# 23. ACADEMIC_STAFF

Tujuan:

> Mengelola perjalanan dan data akademik siswa.

Permission:

```text
student.view
student.update

program.view

program_history.view
program_history.create
program_history.update

student.promote
student.transfer
```

Scope:

```text
unit/program
```

---

# 24. TEACHER

Tujuan:

> Mengakses data siswa yang diperlukan untuk kegiatan pengajaran.

Default permission:

```text
student.view
program_history.view

attendance.view
attendance.create
attendance.update

grades.view
grades.create
grades.update

schedule.view
```

Scope:

```text
class
```

Teacher tidak otomatis dapat melihat:

```text
NIK
email pribadi
nomor HP
WhatsApp
```

---

# 25. COUNSELOR

Tujuan:

> Mendukung kebutuhan pembinaan siswa.

Permission:

```text
student.view
program_history.view
```

Jika diperlukan:

```text
student.view_sensitive
```

harus diberikan secara eksplisit.

Scope:

```text
unit
```

atau siswa yang ditugaskan.

---

# 26. VIEWER

Tujuan:

> Hanya melihat data.

Permission:

```text
student.view
program.view
program_history.view
```

Tidak memiliki:

```text
create
update
delete
promote
transfer
merge
mark_alumni
```

---

# 27. Permission Matrix

| Permission               | Super Admin | Admin | Operator | Academic | Teacher |    Counselor | Viewer |
| ------------------------ | ----------: | ----: | -------: | -------: | ------: | -----------: | -----: |
| `student.view`           |           ✓ |     ✓ |        ✓ |        ✓ |       ✓ |            ✓ |      ✓ |
| `student.create`         |           ✓ |     ✓ |        ✓ |        ✓ |       - |            - |      - |
| `student.update`         |           ✓ |     ✓ |        ✓ |        ✓ |       - |            - |      - |
| `student.view_sensitive` |           ✓ |     ✓ |        - |        - |       - | configurable |      - |
| `student.promote`        |           ✓ |     ✓ |        - |        ✓ |       - |            - |      - |
| `student.transfer`       |           ✓ |     ✓ |        - |        ✓ |       - |            - |      - |
| `student.mark_alumni`    |           ✓ |     ✓ |        - |        ✓ |       - |            - |      - |
| `student.merge`          |           ✓ |     ✓ |        - |        - |       - |            - |      - |
| `program.view`           |           ✓ |     ✓ |        ✓ |        ✓ |       ✓ |            ✓ |      ✓ |
| `program.create`         |           ✓ |     ✓ |        - |        - |       - |            - |      - |
| `program.update`         |           ✓ |     ✓ |        - |        - |       - |            - |      - |
| `program_history.view`   |           ✓ |     ✓ |        ✓ |        ✓ |       ✓ |            ✓ |      ✓ |
| `program_history.create` |           ✓ |     ✓ |        ✓ |        ✓ |       - |            - |      - |
| `program_history.update` |           ✓ |     ✓ |        ✓ |        ✓ |       - |            - |      - |

`-` berarti deny secara default.

---

# 28. Sensitive Permissions

Permission sensitif harus dipisahkan.

Contoh:

```text
student.view
```

tidak otomatis berarti:

```text
student.view_sensitive
```

Data sensitif:

```text
NIK
Phone
WhatsApp
Email
Birth Date
```

Dapat dilindungi dengan permission:

```text
student.view_sensitive
```

---

# 29. Scope Types

M-CORE menggunakan scope berikut:

```text
all
unit
program
class
own
assigned
```

---

# 30. Scope: `all`

User dapat mengakses seluruh data yang diizinkan permission.

Contoh:

```text
Super Admin
student.view
scope = all
```

---

# 31. Scope: `unit`

User hanya dapat mengakses siswa dalam unit tertentu.

Contoh:

```text
Operator MTs
student.view
scope = unit:MTs
```

Tidak dapat melihat:

```text
Pra-Univ
Turkiye
Program Bahasa
```

kecuali diberikan scope tambahan.

---

# 32. Scope: `program`

User hanya dapat mengakses program tertentu.

Contoh:

```text
Academic Staff
student.view
scope = program:PRA-UNIV
```

---

# 33. Scope: `class`

User hanya dapat mengakses kelas tertentu.

Contoh:

```text
Teacher A
student.view
scope = class:MTs-IX-A
```

Teacher tersebut tidak otomatis dapat melihat:

```text
MTs-IX-B
MTs-VIII
Pra-Univ
```

---

# 34. Scope: `own`

User hanya dapat mengakses data yang dibuat atau dimilikinya jika business process mendukung konsep ownership.

Contoh:

```text
document.view
scope = own
```

---

# 35. Scope: `assigned`

User hanya dapat mengakses data yang secara eksplisit ditugaskan kepadanya.

Contoh:

```text
Counselor
student.view
scope = assigned
```

Hanya siswa yang ditugaskan kepada counselor tersebut.

---

# 36. Scope Combination

Satu user dapat memiliki beberapa scope.

Contoh:

```text
Academic Staff
│
├── student.view
│     ├── unit:MTs
│     └── unit:MA
│
└── student.promote
      └── unit:MTs
```

Artinya:

User dapat melihat MTs dan MA, tetapi hanya dapat melakukan promotion pada MTs.

---

# 37. Permission Scope ≠ User Scope

Scope sebaiknya melekat pada hubungan:

```text
Role + Permission + Scope
```

bukan hanya:

```text
User + Scope
```

Contoh:

```text
Operator
```

boleh:

```text
student.view → MTs
```

tetapi:

```text
student.promote → DENY
```

Meskipun user sama.

---

# 38. Authorization Flow

Setiap request:

```text
HTTP Request
     ↓
Authentication
     ↓
Identify User
     ↓
Load Roles
     ↓
Load Permissions
     ↓
Evaluate Scope
     ↓
Evaluate Business Rules
     ↓
ALLOW / DENY
```

---

# 39. Example: View Student

Request:

```text
GET /students/STU-001
```

Authorization:

```text
student.view
```

Scope:

```text
program:MTs
```

System mengecek:

```text
User memiliki student.view?
        ↓
       YES
        ↓
Siswa STU-001 berada dalam scope MTs?
        ↓
       YES
        ↓
ALLOW
```

---

# 40. Example: View Sensitive Data

Request:

```text
GET /students/STU-001
```

User ingin mendapatkan:

```text
NIK
WhatsApp
Phone
```

System mengecek:

```text
student.view
        ↓
student.view_sensitive
        ↓
scope
```

Jika tidak memiliki `student.view_sensitive`:

```text
DENY SENSITIVE FIELDS
```

Bukan selalu:

```text
DENY ENTIRE REQUEST
```

API dapat mengembalikan data non-sensitive yang memang diizinkan.

---

# 41. Example: Promotion

Request:

```text
POST /students/STU-001/promote
```

Required:

```text
student.promote
```

Kemudian:

```text
scope
+
business rule
```

System harus memastikan:

* siswa ditemukan;
* siswa memiliki program aktif;
* program dapat dipromosikan;
* target periode valid;
* kelas berikutnya valid;
* tidak ada history duplicate;
* user memiliki scope yang sesuai.

---

# 42. Example: Program Transfer

Request:

```text
POST /students/STU-001/transfer
```

Required:

```text
student.transfer
```

System harus mengecek:

```text
Permission
      ↓
Scope
      ↓
Source Program
      ↓
Destination Program
      ↓
Business Rules
      ↓
Transaction
```

---

# 43. Example: Mark Alumni

Request:

```text
POST /students/STU-001/mark-alumni
```

Required:

```text
student.mark_alumni
```

System harus memastikan:

* user memiliki permission;
* scope sesuai;
* siswa valid;
* syarat alumni terpenuhi;
* history relevan sudah selesai;
* perubahan dicatat dalam audit log.

---

# 44. Student Merge

Merge merupakan operasi sangat sensitif.

Required:

```text
student.merge
```

Default:

```text
Super Admin
Admin
```

saja.

Flow:

```text
Duplicate Candidate
       ↓
Admin Review
       ↓
Confirm
       ↓
Select Master
       ↓
Merge Related Data
       ↓
Audit
```

Tidak boleh dilakukan oleh Operator biasa.

---

# 45. Delete Permission

Delete harus dipisahkan dari update.

Contoh:

```text
student.delete
program.delete
program_history.delete
```

Default:

```text
DENY
```

Untuk data pendidikan, rekomendasi:

> Hindari hard delete sebagai operasi normal.

Gunakan:

```text
inactive
archived
voided
```

sesuai kebutuhan entity.

---

# 46. Default Deny Matrix

Permission yang tidak tercantum pada role:

```text
DENY
```

Contoh:

Operator memiliki:

```text
student.view
student.create
student.update
```

maka otomatis tidak memiliki:

```text
student.merge
student.promote
student.transfer
student.mark_alumni
student.delete
```

---

# 47. Backend Enforcement

RBAC **WAJIB diterapkan di backend**.

Tidak cukup:

```text
Frontend hide button
```

Karena user dapat langsung memanggil API.

Arsitektur:

```text
Frontend
   ↓
API
   ↓
Authentication
   ↓
Authorization
   ↓
Business Rule
   ↓
Database
```

---

# 48. Frontend Enforcement

Frontend tetap harus menyembunyikan fitur yang tidak tersedia.

Contoh:

User tidak memiliki:

```text
student.promote
```

maka tombol:

```text
Naik Kelas
```

tidak ditampilkan.

Namun backend tetap melakukan validasi.

---

# 49. API Security Rule

Tidak boleh mengandalkan:

```text
role === "admin"
```

untuk seluruh authorization.

Gunakan:

```text
hasPermission(
    "student.promote"
)
```

dan:

```text
checkScope(...)
```

Karena role dapat berubah dan permission dapat dikustomisasi.

---

# 50. Recommended Authorization Service

Backend sebaiknya memiliki satu service:

```text
AuthorizationService
```

Contoh konsep:

```text
authorize(
    user,
    permission,
    resource
)
```

Contoh:

```text
authorize(
    currentUser,
    "student.promote",
    student
)
```

Service menghasilkan:

```text
ALLOW
```

atau:

```text
DENY
```

---

# 51. Authorization Middleware

Contoh struktur:

```text
middleware/
│
├── authenticate.ts
├── authorize.ts
├── scopeGuard.ts
└── audit.ts
```

Flow:

```text
authenticate
      ↓
authorize
      ↓
scopeGuard
      ↓
controller
      ↓
service
```

---

# 52. API Error

Jika permission tidak tersedia:

```text
403 FORBIDDEN
```

Contoh:

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to perform this action."
  }
}
```

Jangan mengungkapkan detail security internal.

---

# 53. Authentication Security

Password:

```text
plaintext = NEVER
```

Gunakan password hashing modern seperti:

```text
Argon2id
```

atau algoritma password hashing yang direkomendasikan framework yang digunakan.

---

# 54. Session Security

Session/token harus:

* memiliki expiry;
* dapat dicabut;
* tidak disimpan secara tidak aman;
* menggunakan HTTPS;
* tidak mengandung informasi sensitif berlebihan.

Jika menggunakan cookie session:

```text
Secure
HttpOnly
SameSite
```

harus dikonfigurasi sesuai arsitektur deployment.

---

# 55. Brute Force Protection

Login harus memiliki perlindungan terhadap percobaan login berulang.

Contoh:

```text
Rate Limit
Account Lock / Cooldown
Login Monitoring
```

Jangan memberikan error yang membedakan secara berlebihan:

```text
username benar
password salah
```

vs

```text
username tidak ditemukan
```

---

# 56. Privilege Escalation Protection

User tidak boleh mengubah role dirinya sendiri.

Contoh:

```text
Operator
   ↓
UPDATE role = SUPER_ADMIN
```

harus:

```text
DENY
```

Perubahan role hanya boleh dilakukan oleh user dengan permission administratif yang sesuai.

---

# 57. Scope Escalation Protection

User tidak boleh mengubah scope dirinya sendiri.

Contoh:

```text
Operator
scope = MTs
```

tidak boleh mengubah menjadi:

```text
scope = all
```

tanpa permission administratif.

---

# 58. Role Modification

Role system-level tidak boleh diubah sembarangan.

Contoh:

```text
SUPER_ADMIN
```

harus dilindungi.

Permission untuk mengelola RBAC:

```text
rbac.role.view
rbac.role.create
rbac.role.update
rbac.role.delete

rbac.permission.view
rbac.permission.manage

rbac.scope.view
rbac.scope.manage

rbac.user.assign_role
```

---

# 59. Audit Log

Operasi berikut wajib dicatat:

```text
LOGIN
LOGOUT
FAILED_LOGIN
ROLE_ASSIGNED
ROLE_REMOVED
PERMISSION_CHANGED
SCOPE_CHANGED

STUDENT_VIEW_SENSITIVE
STUDENT_CREATE
STUDENT_UPDATE
STUDENT_MERGE
STUDENT_PROMOTE
STUDENT_TRANSFER
STUDENT_MARK_ALUMNI
```

Audit log harus mencatat minimal:

```text
user_id
action
resource
resource_id
timestamp
result
ip_address
user_agent
reason
```

---

# 60. Sensitive Data Audit

Akses terhadap data sensitif harus lebih ketat.

Contoh:

```text
student.view_sensitive
```

ketika digunakan harus dapat diaudit:

```text
WHO
WHEN
WHICH STUDENT
WHAT ACTION
RESULT
```

---

# 61. Service-to-Service Access

Jika M-CORE memiliki service internal:

```text
Frontend
API
Worker
Report Service
Notification Service
```

jangan memberikan akses database penuh kepada semua service.

Gunakan:

```text
least privilege
```

Contoh:

```text
Report Service
→ read-only
```

---

# 62. Database Permission

Application database user tidak boleh selalu menggunakan akun database superuser.

Gunakan user database dengan permission sesuai kebutuhan.

Contoh:

```text
mcore_app
```

bukan:

```text
postgres
```

untuk koneksi aplikasi production.

---

# 63. Principle of Least Privilege

Setiap user mendapatkan:

> Permission minimum yang diperlukan untuk menjalankan pekerjaannya.

Contoh:

Teacher membutuhkan:

```text
student.view
attendance.create
grades.create
```

Tidak membutuhkan:

```text
student.merge
student.mark_alumni
rbac.role.manage
```

---

# 64. Temporary Permission

Jika diperlukan, permission sementara harus memiliki:

```text
start_at
expires_at
reason
granted_by
```

Contoh:

```text
Admin memberikan:
student.view_sensitive

kepada:
Operator

selama:
1 hari
```

Setelah expired:

```text
DENY
```

---

# 65. Emergency Access

Emergency access dapat disediakan untuk kondisi khusus.

Contoh:

```text
break_glass_access
```

Tetapi harus:

* sangat terbatas;
* memiliki expiry;
* membutuhkan alasan;
* tercatat dalam audit log;
* tidak menjadi akses permanen.

---

# 66. Data Export

Export data harus memiliki permission tersendiri.

Contoh:

```text
student.export
student.export_sensitive
```

Memiliki `student.view` tidak otomatis berarti boleh export.

---

# 67. Bulk Operations

Operasi massal juga harus memiliki permission.

Contoh:

```text
student.bulk_update
student.bulk_promote
student.bulk_transfer
```

Jangan menganggap:

```text
student.update
```

otomatis berarti:

```text
student.bulk_update
```

---

# 68. Import Data

Import data memiliki permission:

```text
student.import
```

Import harus menjalankan validasi yang sama dengan input manual.

Khusus NIK:

```text
duplicate detection
```

tetap wajib dijalankan.

---

# 69. Reporting

Permission report dipisahkan dari view.

Contoh:

```text
report.student
report.academic
report.alumni
report.financial
```

Scope tetap berlaku.

Contoh:

```text
report.student
scope = unit:MTs
```

tidak boleh menghasilkan data Pra-Univ.

---

# 70. RBAC Database ERD

```text
┌─────────────┐
│    USERS    │
└──────┬──────┘
       │
       │ N
       ▼
┌─────────────┐
│ USER_ROLES  │
└──────┬──────┘
       │ N
       ▼
┌─────────────┐
│    ROLES    │
└──────┬──────┘
       │
       │ N
       ▼
┌───────────────────┐
│ ROLE_PERMISSIONS  │
└─────────┬─────────┘
          │ N
          ▼
┌──────────────────┐
│   PERMISSIONS    │
└──────────────────┘
          │
          │
          ▼
┌─────────────────────────┐
│ ROLE_PERMISSION_SCOPES  │
└────────────┬────────────┘
             │
             ▼
       ┌───────────┐
       │  SCOPES   │
       └───────────┘
```

---

# 71. Authorization Architecture

```text
                         M-CORE
                            │
                            ▼
                       API REQUEST
                            │
                            ▼
                    ┌───────────────┐
                    │ AUTHENTICATE  │
                    └───────┬───────┘
                            │
                            ▼
                         USER
                            │
                            ▼
                          ROLE
                            │
                            ▼
                       PERMISSION
                            │
                            ▼
                          SCOPE
                            │
                            ▼
                    BUSINESS RULES
                            │
                            ▼
                        DATABASE
                            │
                    ┌───────┴───────┐
                    ▼               ▼
                  ALLOW            DENY
```

---

# 72. Golden Security Rules

## RBAC-001

> Default Deny.

## RBAC-002

> Never trust frontend authorization.

## RBAC-003

> Backend must enforce authorization.

## RBAC-004

> Role does not directly determine data scope.

## RBAC-005

> Permission defines action.

## RBAC-006

> Scope defines data boundary.

## RBAC-007

> Sensitive data requires separate permission.

## RBAC-008

> `student.view` does not imply `student.view_sensitive`.

## RBAC-009

> `student.update` does not imply `student.delete`.

## RBAC-010

> `student.update` does not imply `student.merge`.

## RBAC-011

> `student.view` does not imply `student.export`.

## RBAC-012

> Bulk operations require explicit permission.

## RBAC-013

> Users cannot escalate their own privileges.

## RBAC-014

> Users cannot expand their own scope.

## RBAC-015

> Sensitive actions must be audited.

## RBAC-016

> Use least privilege.

## RBAC-017

> Use database constraints as a final integrity layer.

## RBAC-018

> Authentication and authorization are separate concerns.

## RBAC-019

> Every new permission must have a documented purpose.

## RBAC-020

> Never implement authorization using hardcoded role checks when permission-based authorization is available.

---

# 73. Definition of Done

RBAC v1.0 dianggap selesai apabila:

* [ ] User system tersedia.
* [ ] Role system tersedia.
* [ ] Permission system tersedia.
* [ ] Scope system tersedia.
* [ ] User → Role tersedia.
* [ ] Role → Permission tersedia.
* [ ] Permission → Scope tersedia.
* [ ] Default Deny diterapkan.
* [ ] Backend authorization diterapkan.
* [ ] Frontend permission-aware.
* [ ] Sensitive data permission diterapkan.
* [ ] Student promotion memiliki permission.
* [ ] Student transfer memiliki permission.
* [ ] Student merge memiliki permission.
* [ ] Alumni conversion memiliki permission.
* [ ] Export memiliki permission terpisah.
* [ ] Bulk operation memiliki permission terpisah.
* [ ] Audit log tersedia.
* [ ] Privilege escalation dicegah.
* [ ] Scope escalation dicegah.
* [ ] Database application user menggunakan least privilege.
* [ ] Permission matrix terdokumentasi.

---

# 74. Final Authorization Principle

M-CORE menggunakan:

```text
ROLE
  ↓
"Siapa kamu dalam organisasi?"

PERMISSION
  ↓
"Apa yang boleh kamu lakukan?"

SCOPE
  ↓
"Data mana yang boleh kamu akses?"
```

Contoh:

```text
Operator MTs
     │
     ▼
student.update
     │
     ▼
scope = MTs
     │
     ▼
Student MTs
```

Sedangkan:

```text
Operator MTs
     │
     ▼
student.merge
     │
     ▼
DENY
```

Dan:

```text
Teacher IX-A
     │
     ▼
student.view
     │
     ▼
scope = class:IX-A
     │
     ▼
Student IX-A
```

Dengan model ini, M-CORE dapat berkembang dari sistem sederhana menjadi sistem enterprise tanpa harus membongkar ulang authorization ketika jumlah unit, program, kelas, maupun pengguna bertambah.

---

**End of `RBAC.md`**
