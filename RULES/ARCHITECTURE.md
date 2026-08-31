# M-CORE

## MUMTAZA CORE

### Central Student & Education Management System

**Document:** `ARCHITECTURE.md`
**Version:** `1.0.0`
**Status:** Baseline Architecture
**Related Documents:**

* `PROJECT.md`
* `DATABASE.md`
* `BUSINESS_RULES.md`
* `RBAC.md`
* `API_SPEC.md`
* `UI_GUIDELINES.md`
* `AI_RULES.md`
* `TASKS.md`

---

# 1. Tujuan

`ARCHITECTURE.md` mendefinisikan struktur teknis M-CORE agar:

* kode mudah dipahami;
* kode mudah dikembangkan;
* kode mudah diperbaiki;
* aman terhadap kesalahan umum;
* business logic tidak bercampur dengan UI;
* database tidak diakses sembarangan;
* authorization terpusat;
* developer pemula dapat mengikuti pola yang sama;
* AI coding assistant dapat memahami struktur proyek;
* proyek dapat dikembangkan secara bertahap tanpa merusak modul lain.

Prinsip utama:

> **Simple First. Structured Always. Secure by Default.**

---

# 2. Arsitektur Utama

M-CORE menggunakan pendekatan:

```text
Modular Monolith
+
Layered Architecture
+
Service / Repository Pattern
+
RBAC
+
Scope Authorization
```

Diagram:

```text
                    M-CORE
                      │
                      ▼
                ┌───────────┐
                │  Frontend │
                └─────┬─────┘
                      │
                      ▼
                ┌───────────┐
                │   API     │
                └─────┬─────┘
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
   Authentication           Authorization
          │                       │
          │                 Role → Permission
          │                       │
          │                     Scope
          └───────────┬───────────┘
                      ▼
                ┌───────────┐
                │ Controller│
                └─────┬─────┘
                      ▼
                ┌───────────┐
                │  Service  │
                └─────┬─────┘
                      ▼
                ┌───────────┐
                │Repository │
                └─────┬─────┘
                      ▼
                ┌───────────┐
                │ Database  │
                └───────────┘
```

---

# 3. Kenapa Modular Monolith?

M-CORE tidak langsung menggunakan microservices.

Untuk tahap awal, modular monolith lebih sesuai karena:

* lebih mudah dikembangkan;
* deployment lebih sederhana;
* debugging lebih mudah;
* database lebih mudah dikelola;
* cocok untuk tim kecil;
* cocok untuk coder pemula;
* tidak membutuhkan infrastructure kompleks.

Struktur modul tetap dibuat seolah-olah dapat dipisahkan di masa depan.

---

# 4. Prinsip Arsitektur

## ARCH-001 — Separation of Concerns

Setiap layer memiliki tanggung jawab sendiri.

```text
Controller
    ↓
Service
    ↓
Repository
    ↓
Database
```

Jangan mencampur semuanya.

---

## ARCH-002 — Single Responsibility

Satu file harus memiliki satu tanggung jawab utama.

Buruk:

```text
student.controller.ts
```

berisi:

```text
validation
authorization
business logic
SQL
email
audit
response
```

Lebih baik:

```text
student.controller.ts
student.service.ts
student.repository.ts
student.validator.ts
student.policy.ts
```

---

## ARCH-003 — Business Logic di Service

Business logic tidak boleh berada di:

```text
Frontend
Controller
Repository
Database migration
```

Business logic berada di:

```text
Service
```

Contoh:

```text
PromotionService
TransferService
AlumniService
StudentService
```

---

## ARCH-004 — Database Access melalui Repository

Controller dan service tidak boleh melakukan query database secara sembarangan.

Gunakan:

```text
Repository
```

Contoh:

```text
StudentRepository
ProgramRepository
ProgramHistoryRepository
```

---

## ARCH-005 — Authorization sebelum Business Action

Urutan:

```text
Authentication
        ↓
Authorization
        ↓
Scope Check
        ↓
Validation
        ↓
Business Rule
        ↓
Database
```

---

# 5. Recommended Technology Stack

Stack dapat disesuaikan, tetapi baseline M-CORE:

### Frontend

```text
Next.js
TypeScript
Tailwind CSS
```

### Backend

```text
Next.js API / Node.js
TypeScript
```

Jika backend dipisahkan:

```text
Node.js
NestJS / Fastify
TypeScript
```

### Database

```text
PostgreSQL
```

### ORM

```text
Prisma
```

atau ORM setara yang menerapkan parameterized query.

### Authentication

Gunakan authentication framework/library yang matang.

Jangan membuat sistem authentication cryptographic sendiri.

---

# 6. Project Root

Struktur utama:

```text
m-core/
│
├── app/
├── src/
├── prisma/
├── public/
├── tests/
├── docs/
├── scripts/
│
├── .env
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── README.md
│
├── PROJECT.md
├── ARCHITECTURE.md
├── DATABASE.md
├── BUSINESS_RULES.md
├── RBAC.md
├── API_SPEC.md
├── UI_GUIDELINES.md
├── AI_RULES.md
└── TASKS.md
```

---

# 7. Struktur Frontend

Jika menggunakan Next.js App Router:

```text
app/
│
├── (auth)/
│   ├── login/
│   └── forgot-password/
│
├── (dashboard)/
│   ├── dashboard/
│   ├── students/
│   ├── programs/
│   ├── academics/
│   ├── reports/
│   └── settings/
│
├── api/
│
├── layout.tsx
└── page.tsx
```

---

# 8. Struktur Source Code

```text
src/
│
├── modules/
│   │
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.repository.ts
│   │   ├── auth.schema.ts
│   │   ├── auth.types.ts
│   │   └── index.ts
│   │
│   ├── students/
│   │   ├── student.controller.ts
│   │   ├── student.service.ts
│   │   ├── student.repository.ts
│   │   ├── student.schema.ts
│   │   ├── student.policy.ts
│   │   ├── student.types.ts
│   │   └── index.ts
│   │
│   ├── programs/
│   │   ├── program.controller.ts
│   │   ├── program.service.ts
│   │   ├── program.repository.ts
│   │   ├── program.schema.ts
│   │   ├── program.policy.ts
│   │   ├── program.types.ts
│   │   └── index.ts
│   │
│   ├── program-history/
│   │   ├── history.controller.ts
│   │   ├── history.service.ts
│   │   ├── history.repository.ts
│   │   ├── history.schema.ts
│   │   └── history.types.ts
│   │
│   ├── attendance/
│   ├── grades/
│   ├── schedules/
│   ├── users/
│   ├── roles/
│   ├── permissions/
│   ├── scopes/
│   ├── reports/
│   └── audit/
│
├── core/
│   ├── auth/
│   ├── authorization/
│   ├── database/
│   ├── errors/
│   ├── http/
│   ├── logging/
│   └── validation/
│
├── shared/
│   ├── constants/
│   ├── enums/
│   ├── types/
│   ├── utils/
│   └── helpers/
│
└── config/
    ├── app.config.ts
    ├── auth.config.ts
    └── database.config.ts
```

---

# 9. Module Structure

Setiap module mengikuti pola:

```text
module/
│
├── controller
├── service
├── repository
├── schema
├── policy
├── types
└── index
```

Tidak semua modul wajib memiliki semua file.

Gunakan file hanya jika memang diperlukan.

---

# 10. Controller

Controller bertanggung jawab terhadap:

* menerima HTTP request;
* membaca parameter;
* menjalankan validation;
* memanggil service;
* mengembalikan HTTP response.

Contoh:

```text
StudentController
        ↓
StudentService
```

Controller tidak boleh:

```text
query database
menentukan business rule
mengubah role
memutuskan scope
```

---

# 11. Service

Service adalah pusat business logic.

Contoh:

```text
StudentService
PromotionService
TransferService
AlumniService
ProgramService
```

Contoh alur:

```text
promoteStudent()
    │
    ├── verify student
    ├── verify permission
    ├── verify scope
    ├── verify current program
    ├── verify target class
    ├── create history
    ├── close previous enrollment
    └── create audit log
```

---

# 12. Repository

Repository bertanggung jawab terhadap database.

Contoh:

```text
StudentRepository
```

Method:

```text
findById()
findByNik()
findMany()
create()
update()
exists()
```

Repository tidak menentukan:

```text
boleh/tidak boleh
aktif/alumni
naik kelas/tidak
transfer/tidak
```

Itu business logic.

---

# 13. Schema / Validator

Schema digunakan untuk validation.

Contoh:

```text
student.schema.ts
```

Validasi:

```text
full_name
gender
birth_date
nik
email
phone
whatsapp
status
```

Gunakan library schema validation seperti:

```text
Zod
```

atau alternatif setara.

---

# 14. Policy

Policy menangani authorization terhadap resource.

Contoh:

```text
student.policy.ts
```

Konsep:

```text
canView()
canCreate()
canUpdate()
canDelete()
canTransfer()
canPromote()
canMarkAlumni()
```

Namun policy tetap menggunakan:

```text
Role
Permission
Scope
```

sesuai `RBAC.md`.

---

# 15. Core Layer

`core/` berisi komponen fundamental yang digunakan banyak module.

```text
core/
├── auth/
├── authorization/
├── database/
├── errors/
├── http/
├── logging/
└── validation/
```

Core harus:

* stabil;
* reusable;
* tidak bergantung pada module bisnis tertentu.

---

# 16. Shared Layer

`shared/` berisi hal yang benar-benar umum.

Contoh:

```text
shared/
├── constants/
├── enums/
├── types/
├── utils/
└── helpers/
```

Contoh:

```text
DATE_FORMAT
STATUS_ENUM
PAGINATION_DEFAULT
```

Jangan memasukkan business logic student ke `shared`.

---

# 17. Dependency Rule

Dependency harus mengalir satu arah:

```text
UI
 ↓
API
 ↓
Module
 ↓
Core
 ↓
Infrastructure
```

Module tidak boleh bergantung secara langsung pada UI.

Contoh buruk:

```text
student.service.ts
   ↓
React Component
```

Tidak diperbolehkan.

---

# 18. Module Dependency

Module boleh menggunakan core:

```text
students
   ↓
core
```

Module dapat menggunakan module lain melalui service/interface yang jelas.

Hindari:

```text
StudentService
   ↓
ProgramRepository
   ↓
UserRepository
   ↓
AttendanceRepository
   ↓
StudentService
```

Ini menyebabkan circular dependency.

---

# 19. Database Architecture

```text
Application
     ↓
Repository
     ↓
ORM
     ↓
PostgreSQL
```

Database connection dikelola secara terpusat.

Contoh:

```text
src/core/database/
```

Jangan membuat connection database baru di setiap request.

---

# 20. Prisma Structure

Jika menggunakan Prisma:

```text
prisma/
│
├── schema.prisma
├── migrations/
└── seed.ts
```

`schema.prisma` harus merepresentasikan `DATABASE.md`.

Perubahan database harus melalui migration.

---

# 21. Migration Rule

Jangan mengubah database production secara manual.

Gunakan:

```text
migration
```

Flow:

```text
Change DATABASE.md
        ↓
Update schema
        ↓
Create migration
        ↓
Test migration
        ↓
Review
        ↓
Deploy
```

---

# 22. Database Constraint

Business-critical rules harus diperkuat oleh database.

Contoh:

```text
NIK UNIQUE
student_id PRIMARY KEY
FK valid
required field NOT NULL
```

Jangan hanya mengandalkan frontend.

---

# 23. Security Architecture

Security M-CORE menggunakan beberapa lapisan:

```text
                 SECURITY
                    │
       ┌────────────┼────────────┐
       ▼            ▼            ▼
 Authentication Authorization Validation
       │            │            │
       └────────────┼────────────┘
                    ▼
               Business Rules
                    │
                    ▼
              Data Protection
                    │
                    ▼
                  Audit
```

---

# 24. Authentication Layer

Authentication menjawab:

> Siapa pengguna ini?

Contoh:

```text
Login
 ↓
Credentials
 ↓
Authentication Provider
 ↓
Session / Token
 ↓
User Identity
```

Password:

* tidak boleh disimpan plaintext;
* harus menggunakan password hashing yang aman;
* tidak boleh muncul dalam API response;
* tidak boleh masuk log.

---

# 25. Authorization Layer

Authorization menjawab:

> Apakah user ini boleh melakukan tindakan tersebut?

Formula:

```text
User
 ↓
Role
 ↓
Permission
 ↓
Scope
 ↓
Resource
```

Contoh:

```text
User: Operator MTs

Role:
OPERATOR

Permission:
student.view

Scope:
program = MTs
```

Maka user hanya dapat melihat data sesuai scope.

---

# 26. RBAC Architecture

```text
User
 │
 ├── Role
 │     │
 │     └── Permissions
 │
 └── Scope
```

Contoh:

```text
User
  ↓
ADMIN AKADEMIK
  ↓
student.view
student.update
student.promote
  ↓
Scope: MTs
```

Detail aturan berada di:

```text
RBAC.md
```

---

# 27. Scope Security

Scope wajib diperiksa di backend.

Contoh:

```text
GET /students/STUDENT-001
```

Backend:

```text
1. User authenticated?
2. Permission student.view?
3. Student exists?
4. Student belongs to user's scope?
5. Return data.
```

Jangan hanya menyembunyikan data di frontend.

---

# 28. IDOR Protection

Jangan menganggap:

```text
UUID = security
```

UUID hanya identifier.

Contoh:

```text
/student/UUID-A
```

tetap harus melewati:

```text
Permission
+
Scope
```

---

# 29. Input Security

Semua input dianggap tidak terpercaya.

```text
Frontend Input
      ↓
UNTRUSTED
      ↓
Validation
      ↓
Sanitization where appropriate
      ↓
Business Rules
      ↓
Database
```

---

# 30. SQL Injection Protection

Jangan menggunakan:

```text
raw SQL string concatenation
```

Gunakan:

```text
ORM
Parameterized Query
Prepared Statement
```

Jika raw SQL diperlukan, parameter harus tetap dipisahkan dari query.

---

# 31. XSS Protection

Output user-generated content harus diperlakukan sebagai data.

Jangan melakukan:

```text
dangerouslySetInnerHTML
```

tanpa sanitization dan alasan yang jelas.

Frontend framework escaping harus digunakan sebagai default.

---

# 32. CSRF Protection

Jika authentication menggunakan cookie-based session:

```text
CSRF protection
```

harus diterapkan untuk state-changing request.

Jika menggunakan architecture token tertentu, tetap evaluasi CSRF berdasarkan mekanisme authentication aktual.

---

# 33. CORS

CORS harus whitelist.

Jangan:

```text
Access-Control-Allow-Origin: *
```

untuk API private.

Gunakan daftar origin yang diizinkan.

---

# 34. Security Headers

Production harus menggunakan security headers yang sesuai, seperti:

```text
Content-Security-Policy
X-Content-Type-Options
Referrer-Policy
Strict-Transport-Security
Frame protections
```

Konfigurasi disesuaikan dengan framework dan deployment.

---

# 35. Environment Variables

Secret tidak boleh berada di source code.

Gunakan:

```text
.env
```

Contoh:

```text
DATABASE_URL=
AUTH_SECRET=
APP_URL=
```

Commit:

```text
.env.example
```

Jangan commit:

```text
.env
```

---

# 36. Environment Separation

Minimal:

```text
development
staging
production
```

Database harus terpisah.

```text
Development DB
       ≠
Production DB
```

---

# 37. Secret Management

Secret production harus disimpan menggunakan:

* environment secret;
* deployment secret manager;
* cloud secret manager.

Jangan:

```text
console.log(AUTH_SECRET)
```

Jangan memasukkan secret ke Git.

---

# 38. Logging

Logging harus aman.

Boleh:

```text
student_id
action
timestamp
user_id
request_id
```

Jangan:

```text
password
access_token
refresh_token
full NIK
sensitive credentials
```

---

# 39. Audit Logging

Action sensitif harus dicatat.

Contoh:

```text
CREATE_STUDENT
UPDATE_STUDENT
UPDATE_NIK
PROMOTE_STUDENT
TRANSFER_STUDENT
MARK_ALUMNI
MERGE_STUDENT
ASSIGN_ROLE
REMOVE_ROLE
EXPORT_STUDENTS
```

Audit log minimal:

```text
who
what
when
resource
result
```

---

# 40. Error Handling

Gunakan centralized error handler.

```text
Request
   ↓
Controller
   ↓
Service
   ↓
Error
   ↓
Global Error Handler
   ↓
Standard API Response
```

Jangan mengirim stack trace kepada client production.

---

# 41. Error Architecture

Contoh:

```text
NotFoundError
ValidationError
AuthorizationError
ConflictError
BusinessRuleError
DatabaseError
```

Response tetap mengikuti `API_SPEC.md`.

---

# 42. Transaction Management

Transaction berada di service layer atau unit-of-work layer.

Contoh:

```text
PromotionService
     ↓
Transaction
     ├── close old history
     ├── create new history
     └── audit
```

Jika salah satu gagal:

```text
ROLLBACK
```

---

# 43. Student Lifecycle Architecture

```text
Student Created
      │
      ▼
    ACTIVE
      │
      ├───────────────┐
      ▼               ▼
 Promotion         Transfer
      │               │
      └───────┬───────┘
              ▼
           ACTIVE
              │
              ▼
           Graduate
              │
              ▼
           ALUMNI
```

Status:

```text
active
inactive
alumni
```

Business rules berada di:

```text
BUSINESS_RULES.md
```

---

# 44. Student Identity Rule

Student adalah entitas utama.

```text
student_id
```

adalah:

```text
PRIMARY KEY
INTERNAL IDENTITY
```

Program bukan identity siswa.

Contoh:

```text
Student
  ↓
Student ID: UUID-001
  │
  ├── MTs 2024
  ├── MTs 2025
  ├── MTs 2026
  └── Pra-Univ 2027
```

Tidak membuat student baru ketika pindah program.

---

# 45. Historical Data Rule

Data histori tidak boleh dihapus hanya karena siswa berpindah program.

Contoh:

```text
2024 → MTs VII
2025 → MTs VIII
2026 → MTs IX
2027 → Pra-Univ
```

Semua tetap tersimpan.

Current state ditentukan dari history yang valid.

---

# 46. Active Program Resolution

Service:

```text
StudentProgramService
```

menentukan program aktif.

Flow:

```text
Student
 ↓
Current Enrollments
 ↓
Filter Active
 ↓
Validate
 ↓
Return Active Program
```

Jangan menduplikasi logic active program di:

```text
dashboard
student page
report
API
```

Gunakan satu service.

---

# 47. Frontend Data Flow

```text
Page
 ↓
Component
 ↓
API Client
 ↓
API
 ↓
Service
 ↓
Repository
 ↓
Database
```

Frontend tidak boleh mengakses database secara langsung.

---

# 48. API Client

Buat satu layer:

```text
src/lib/api/
```

Contoh:

```text
api-client.ts
student-api.ts
program-api.ts
auth-api.ts
```

Jangan melakukan fetch API secara acak di setiap component.

---

# 49. Frontend Permission Handling

Frontend boleh menyembunyikan UI:

```text
if can("student.create")
    show Create Button
```

Tetapi:

> UI permission bukan security.

Backend tetap wajib melakukan authorization.

---

# 50. Component Architecture

Gunakan:

```text
Page
 ↓
Feature Component
 ↓
Reusable Component
 ↓
UI Component
```

Contoh:

```text
StudentPage
 ├── StudentHeader
 ├── StudentProfile
 ├── StudentProgramHistory
 └── StudentActions
```

---

# 51. Reusable UI

Komponen umum:

```text
Button
Input
Select
Modal
Table
Badge
Card
Dialog
Pagination
DataTable
```

berada di:

```text
components/ui/
```

---

# 52. Feature UI

Komponen khusus student:

```text
components/students/
```

Contoh:

```text
StudentTable
StudentForm
StudentProfile
StudentStatusBadge
StudentProgramHistory
```

---

# 53. Naming Convention

Gunakan:

```text
PascalCase
```

untuk component:

```text
StudentTable.tsx
StudentForm.tsx
```

Gunakan:

```text
camelCase
```

untuk function:

```text
getStudent()
createStudent()
updateStudent()
```

Gunakan:

```text
kebab-case
```

untuk route URL:

```text
/program-history
```

---

# 54. TypeScript Rule

M-CORE menggunakan TypeScript secara strict.

Hindari:

```text
any
```

sebisa mungkin.

Buruk:

```typescript
const student: any
```

Lebih baik:

```typescript
const student: Student
```

atau type yang sesuai.

---

# 55. Type Ownership

Type harus memiliki sumber yang jelas.

Contoh:

```text
Student
StudentStatus
Program
ProgramHistory
```

Jangan membuat type yang sama berkali-kali.

Buruk:

```text
StudentA
StudentData
StudentResponse
StudentObject
```

tanpa alasan.

---

# 56. DTO Architecture

Pisahkan:

```text
Database Model
```

dengan:

```text
API DTO
```

Contoh:

```text
StudentDatabaseModel
        ↓
StudentResponseDTO
```

Tidak boleh otomatis mengekspos seluruh database model.

---

# 57. Repository Result

Repository boleh mengembalikan database model.

Service mengubahnya menjadi domain/DTO.

```text
Repository
   ↓
Database Model
   ↓
Service
   ↓
DTO
   ↓
Controller
   ↓
API
```

---

# 58. Testing Architecture

Struktur:

```text
tests/
│
├── unit/
├── integration/
└── e2e/
```

---

# 59. Unit Test

Test:

```text
PromotionService
TransferService
AlumniService
AuthorizationService
```

Contoh:

```text
should promote active student
should reject inactive student
should reject duplicate promotion
should reject invalid scope
```

---

# 60. Integration Test

Test:

```text
API
+
Database
```

Contoh:

```text
POST /students
GET /students
PATCH /students/:id
POST /students/:id/promote
```

---

# 61. E2E Test

Test dari sudut pandang user:

```text
Login
 ↓
Dashboard
 ↓
Student
 ↓
Program History
 ↓
Promote
 ↓
Verify History
```

---

# 62. Security Testing

Minimal test:

```text
Unauthenticated request
Unauthorized role
Wrong scope
IDOR
Duplicate NIK
Invalid input
SQL injection payload
XSS payload
Rate limit
Expired session
```

---

# 63. Git Architecture

Branch utama:

```text
main
```

Development:

```text
develop
```

Feature:

```text
feature/student-module
feature/program-history
feature/rbac
```

Bug:

```text
fix/duplicate-nik
fix/student-scope
```

---

# 64. Commit Convention

Gunakan:

```text
feat:
fix:
refactor:
security:
docs:
test:
chore:
```

Contoh:

```text
feat: add student registration
fix: prevent duplicate nik
security: restrict student scope access
docs: update api specification
test: add promotion service tests
```

---

# 65. Pull Request Rule

Setiap perubahan harus menjelaskan:

```text
What changed?
Why?
Affected modules?
Database change?
API change?
Security impact?
Test result?
```

---

# 66. AI Coding Rule

AI coding assistant harus mengikuti:

```text
PROJECT.md
ARCHITECTURE.md
DATABASE.md
BUSINESS_RULES.md
RBAC.md
API_SPEC.md
AI_RULES.md
```

AI tidak boleh membuat arsitektur baru tanpa alasan.

---

# 67. Rule untuk Coder Pemula

Sebelum membuat file baru:

```text
1. Cari module yang sesuai.
2. Cari pattern existing.
3. Ikuti struktur existing.
4. Jangan membuat pattern baru.
5. Jalankan test.
6. Review security.
```

---

# 68. Rule "Do Not Overengineer"

Jangan menambahkan:

```text
microservices
event sourcing
CQRS
Kafka
Redis
GraphQL
Kubernetes
```

hanya karena terlihat modern.

Gunakan hanya jika ada kebutuhan nyata.

---

# 69. Rule "Do Not Duplicate"

Sebelum membuat function:

```text
findStudent()
```

cari terlebih dahulu apakah sudah ada.

Jangan membuat:

```text
findStudent()
getStudent()
fetchStudent()
loadStudent()
```

yang melakukan hal sama tanpa alasan.

---

# 70. Rule "One Source of Truth"

Contoh:

### Student status

Sumber utama:

```text
student.status
```

### Program history

Sumber utama:

```text
student_program_history
```

### Permission

Sumber utama:

```text
RBAC database
```

### Active program

Sumber utama:

```text
Active Program Service
```

---

# 71. Feature Development Flow

Setiap fitur baru mengikuti:

```text
Requirement
    ↓
Business Rule
    ↓
Database
    ↓
API
    ↓
Service
    ↓
Authorization
    ↓
UI
    ↓
Test
    ↓
Documentation
```

---

# 72. Student Feature Example

Untuk membuat fitur "Tambah Siswa":

```text
DATABASE.md
      ↓
students table
      ↓
API_SPEC.md
      ↓
POST /students
      ↓
StudentSchema
      ↓
StudentPolicy
      ↓
StudentService
      ↓
StudentRepository
      ↓
StudentForm
      ↓
Test
```

---

# 73. Program Promotion Example

```text
User
 ↓
POST /students/{id}/promote
 ↓
Authentication
 ↓
Permission: student.promote
 ↓
Scope validation
 ↓
PromotionService
 ↓
Business Rules
 ↓
Transaction
 ├── close old enrollment
 ├── create new enrollment
 └── audit log
 ↓
Response
```

---

# 74. Security Boundary

Security boundary utama:

```text
┌───────────────────────────┐
│        FRONTEND           │
│      UNTRUSTED             │
└─────────────┬─────────────┘
              │
              ▼
┌───────────────────────────┐
│           API             │
│      SECURITY BOUNDARY    │
├───────────────────────────┤
│ Authentication            │
│ Authorization             │
│ Scope                     │
│ Validation                │
│ Rate Limit                │
└─────────────┬─────────────┘
              │
              ▼
┌───────────────────────────┐
│         SERVICES          │
│       BUSINESS RULES      │
└─────────────┬─────────────┘
              │
              ▼
┌───────────────────────────┐
│        DATABASE           │
│      DATA INTEGRITY       │
└───────────────────────────┘
```

---

# 75. Never Trust Client

Frontend dapat mengirim:

```json
{
  "status": "alumni"
}
```

Tetapi backend tidak boleh langsung percaya.

Backend harus menentukan:

```text
Apakah user memiliki permission?
Apakah scope sesuai?
Apakah siswa memenuhi syarat alumni?
Apakah transition valid?
```

---

# 76. Sensitive Operations

Operasi berikut membutuhkan security review tambahan:

```text
Change NIK
Change student status
Promote student
Transfer program
Mark alumni
Merge student
Assign role
Change permission
Export data
Delete data
```

---

# 77. Delete Policy

Jangan menggunakan hard delete sebagai default untuk data utama.

Student:

```text
DO NOT DELETE CASUALLY
```

Gunakan status:

```text
inactive
```

Jika benar-benar perlu delete:

```text
Permission khusus
+
Audit
+
Dependency check
+
Transaction
```

---

# 78. Soft Delete

Jika diperlukan:

```text
deleted_at
```

Namun soft delete tidak boleh digunakan untuk menggantikan status bisnis.

Contoh:

```text
inactive ≠ deleted
alumni ≠ deleted
```

---

# 79. Data Privacy

M-CORE menyimpan data pribadi siswa.

Karena itu:

```text
minimum access
minimum response
minimum export
```

diterapkan.

Prinsip:

> User hanya mendapatkan data yang diperlukan untuk pekerjaannya.

---

# 80. Performance Rule

Default query harus:

```text
paginated
indexed
filtered
```

Jangan mengambil seluruh student table:

```text
SELECT * FROM students
```

untuk halaman biasa.

Gunakan:

```text
pagination
```

---

# 81. N+1 Query Prevention

Hindari:

```text
1 query students
+
N query program
```

Gunakan:

```text
include
join
batch query
```

sesuai kebutuhan ORM.

---

# 82. Index Rule

Index mengikuti kebutuhan query.

Field kandidat:

```text
student_id
nik
full_name
status
program_id
academic_year
```

Detail index ditentukan di:

```text
DATABASE.md
```

Jangan membuat index berlebihan.

---

# 83. API Performance

API list harus:

```text
pagination
select required fields
filter
index
```

Response tidak boleh mengembalikan field yang tidak dibutuhkan.

---

# 84. Caching

Caching bukan default.

Gunakan jika terdapat kebutuhan nyata seperti:

```text
program list
permission metadata
reference data
```

Jangan cache data student sensitif tanpa desain invalidation dan security yang jelas.

---

# 85. Background Jobs

Operasi berat seperti:

```text
large export
bulk processing
report generation
```

dapat dipindahkan ke background job.

Namun fitur ini ditambahkan ketika kebutuhan muncul.

---

# 86. File Upload

Jika M-CORE nantinya memiliki:

```text
student photo
document
certificate
passport
```

file harus:

* divalidasi;
* dibatasi ukuran;
* dibatasi tipe;
* disimpan di object storage;
* tidak disimpan sembarangan di repository;
* menggunakan access control;
* tidak menggunakan filename user secara langsung sebagai path.

---

# 87. Monitoring

Production minimal memiliki:

```text
application logs
error monitoring
database monitoring
request metrics
audit logs
```

Gunakan `request_id` untuk tracing.

Contoh:

```text
Request ID:
req_01ABCXYZ
```

---

# 88. Health Check

Endpoint:

```text
GET /api/v1/health
```

Response:

```json
{
  "success": true,
  "data": {
    "status": "ok"
  }
}
```

Health check tidak boleh membocorkan:

```text
database credentials
environment secrets
internal infrastructure
stack trace
```

---

# 89. Folder Rules

## Rule 1

Jangan membuat folder:

```text
misc/
temp/
random/
new/
backup/
```

tanpa tujuan yang jelas.

## Rule 2

Nama folder harus menjelaskan tanggung jawab.

## Rule 3

Jangan menyimpan file sementara di source code.

## Rule 4

Jangan menyimpan secret di repository.

---

# 90. File Rules

Setiap file harus memiliki alasan keberadaan.

Jika sebuah file hanya berisi satu function kecil dan tidak meningkatkan readability, pertimbangkan untuk tetap berada di module yang relevan.

Jangan membuat abstraction berlebihan.

---

# 91. Import Rules

Gunakan import path yang konsisten.

Contoh:

```text
@/modules/students
@/core/auth
@/shared/types
```

Hindari relative path yang terlalu panjang:

```text
../../../../../../student.service
```

---

# 92. Circular Dependency

Tidak diperbolehkan:

```text
A → B → C → A
```

Jika terjadi:

```text
refactor dependency
```

Gunakan:

```text
interface
shared abstraction
service boundary
```

---

# 93. Configuration Rule

Configuration terpusat:

```text
src/config/
```

Jangan membaca `process.env` di seluruh project secara acak.

Lebih baik:

```text
config.database
config.auth
config.app
```

---

# 94. Constants Rule

Constant global yang benar-benar umum:

```text
shared/constants
```

Business constant:

```text
module/constants
```

Contoh:

```text
STUDENT_STATUS
```

dapat berada di module student jika hanya digunakan oleh student.

---

# 95. Enum Rule

Enum harus memiliki satu sumber.

Contoh:

```text
StudentStatus
Gender
ProgramHistoryStatus
AttendanceStatus
```

Jangan membuat enum yang sama di:

```text
frontend
backend
database
```

tanpa synchronization strategy.

---

# 96. Documentation Rule

Setiap perubahan berikut wajib memperbarui dokumentasi:

```text
Database change
API change
Business rule change
RBAC change
Architecture change
```

Dokumen tidak boleh tertinggal dari implementasi.

---

# 97. Definition of Done

Sebuah feature dianggap selesai jika:

```text
[ ] Database sesuai
[ ] Business rule sesuai
[ ] API sesuai
[ ] Permission sesuai
[ ] Scope sesuai
[ ] Validation tersedia
[ ] Service tersedia
[ ] Repository sesuai
[ ] UI sesuai
[ ] Error handling tersedia
[ ] Audit tersedia jika diperlukan
[ ] Unit test
[ ] Integration test jika diperlukan
[ ] Security review
[ ] Documentation update
```

---

# 98. Golden Rules

## ARCH-G001

> Jangan membuat kode sebelum memahami module yang terkait.

## ARCH-G002

> Jangan memasukkan business logic ke controller.

## ARCH-G003

> Jangan mengakses database langsung dari UI.

## ARCH-G004

> Jangan mengakses database sembarangan dari controller.

## ARCH-G005

> Gunakan service untuk business logic.

## ARCH-G006

> Gunakan repository untuk database access.

## ARCH-G007

> Authentication ≠ Authorization.

## ARCH-G008

> Permission ≠ Scope.

## ARCH-G009

> Frontend bukan security boundary.

## ARCH-G010

> Backend harus memvalidasi semua input.

## ARCH-G011

> Jangan expose database model secara langsung ke API.

## ARCH-G012

> Jangan gunakan UUID sebagai pengganti authorization.

## ARCH-G013

> Jangan menghapus historical data tanpa alasan dan prosedur.

## ARCH-G014

> Action penting harus transactional.

## ARCH-G015

> Sensitive action harus diaudit.

## ARCH-G016

> Jangan membuat abstraction sebelum dibutuhkan.

## ARCH-G017

> Jangan membuat pattern baru jika pattern existing sudah tersedia.

## ARCH-G018

> Jangan melakukan mass assignment.

## ARCH-G019

> Jangan menyimpan secret di Git.

## ARCH-G020

> Security harus menjadi default, bukan tambahan terakhir.

---

# 99. Golden Development Flow

Coder M-CORE harus mengikuti alur:

```text
                REQUEST
                   │
                   ▼
             UNDERSTAND
                   │
                   ▼
          CHECK DOCUMENTATION
                   │
        ┌──────────┼──────────┐
        ▼          ▼          ▼
     DATABASE    BUSINESS    RBAC
                  RULES
        └──────────┼──────────┘
                   ▼
                 API
                   │
                   ▼
                SERVICE
                   │
                   ▼
              REPOSITORY
                   │
                   ▼
                   DB
                   │
                   ▼
                 TEST
                   │
                   ▼
               SECURITY
                   │
                   ▼
              DOCUMENT
```

---

# 100. Final Architecture

```text
                         M-CORE
                           │
             ┌─────────────┴─────────────┐
             │                           │
          FRONTEND                    API v1
             │                           │
             │                   ┌───────┴───────┐
             │                   │               │
             │             Authentication   Authorization
             │                                   │
             │                             Role → Permission
             │                                   │
             │                                 Scope
             │                                   │
             │                   ┌───────────────┘
             │                   │
             │                   ▼
             │              Controllers
             │                   │
             │                   ▼
             │                Services
             │                   │
             │            Business Rules
             │                   │
             │                   ▼
             │              Repositories
             │                   │
             │                   ▼
             │              PostgreSQL
             │                   │
             │                   ▼
             │              Audit Logs
             │
             └────── UI Permission ──────┘
```

Prinsip akhir M-CORE:

```text
ONE STUDENT
     ↓
ONE INTERNAL IDENTITY
     ↓
MANY PROGRAM HISTORIES
     ↓
CONTROLLED ACCESS
     ↓
AUDITABLE ACTIONS
     ↓
SECURE CENTRAL DATA
```

**End of `ARCHITECTURE.md`**
