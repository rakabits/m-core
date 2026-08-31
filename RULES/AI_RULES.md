# M-CORE

## MUMTAZA CORE

### Central Student & Education Management System

**Document:** `AI_RULES.md`
**Version:** `1.0.0`
**Status:** Active
**Purpose:** AI Coding & Development Governance

---

# 1. PURPOSE

Dokumen ini mendefinisikan aturan yang **WAJIB** diikuti oleh AI Coding Assistant ketika membaca, membuat, mengubah, atau menghapus kode dalam project M-CORE.

AI dianggap sebagai **development assistant**, bukan pemilik keputusan arsitektur.

AI harus:

* memahami struktur project sebelum coding;
* mengikuti dokumentasi project;
* mengikuti database schema;
* mengikuti business rules;
* mengikuti RBAC;
* mengikuti API specification;
* menjaga security;
* membuat kode yang mudah dipahami coder pemula;
* tidak membuat asumsi tanpa dasar;
* tidak mengubah architecture secara sembarangan.

---

# 2. SOURCE OF TRUTH

AI harus menggunakan prioritas sumber berikut:

```text
1. PROJECT.md
2. ARCHITECTURE.md
3. DATABASE.md
4. BUSINESS_RULES.md
5. RBAC.md
6. API_SPEC.md
7. UI_GUIDELINES.md
8. TASKS.md
9. Existing Source Code
```

Jika terdapat konflik:

```text
Documentation
      ↓
Existing implementation
      ↓
AI assumption
```

**AI tidak boleh menggunakan asumsi pribadi untuk mengalahkan aturan project.**

Jika dokumentasi bertentangan dengan kode existing, AI harus:

1. menemukan konflik;
2. menjelaskan konflik;
3. menentukan file yang terdampak;
4. tidak melakukan perubahan besar tanpa alasan.

---

# 3. CORE PRINCIPLE

M-CORE menggunakan prinsip:

```text
ONE STUDENT
     ↓
ONE UNIQUE IDENTITY
     ↓
MULTIPLE PROGRAM JOURNEYS
     ↓
ACADEMIC RECORDS
     ↓
CONTROLLED ACCESS
     ↓
AUDITABLE DATA
```

AI harus menjaga prinsip tersebut dalam seluruh implementasi.

---

# 4. DO NOT GUESS

AI **DILARANG** mengarang:

```text
[ ] Database table
[ ] Database field
[ ] API endpoint
[ ] Permission
[ ] Role
[ ] Scope
[ ] Business rule
[ ] Status
[ ] Relationship
[ ] Required field
[ ] Validation rule
```

Jika informasi belum tersedia:

```text
Unknown
   ↓
Identify missing information
   ↓
Use existing documentation
   ↓
If still undefined → propose option
```

Proposal harus ditandai dengan:

```text
PROPOSAL
```

dan bukan langsung dianggap sebagai implementation requirement.

---

# 5. READ BEFORE CODE

Sebelum mengubah kode, AI wajib membaca dokumentasi yang relevan.

## Database task

Wajib membaca:

```text
DATABASE.md
ARCHITECTURE.md
BUSINESS_RULES.md
```

## Authentication task

Wajib membaca:

```text
ARCHITECTURE.md
RBAC.md
API_SPEC.md
```

## Student task

Wajib membaca:

```text
DATABASE.md
BUSINESS_RULES.md
RBAC.md
API_SPEC.md
```

## Program History task

Wajib membaca:

```text
DATABASE.md
BUSINESS_RULES.md
RBAC.md
```

## Academic task

Wajib membaca:

```text
DATABASE.md
BUSINESS_RULES.md
RBAC.md
API_SPEC.md
```

---

# 6. ARCHITECTURE RULE

AI wajib mengikuti architecture yang telah ditentukan.

Default architecture:

```text
Presentation
     ↓
API / Controller
     ↓
Validation
     ↓
Authorization
     ↓
Service
     ↓
Repository / Data Access
     ↓
Database
```

AI tidak boleh:

```text
UI
 ↓
Direct Database
```

atau:

```text
Controller
 ↓
Huge Business Logic
 ↓
Database
```

Business logic harus berada di layer yang sesuai.

---

# 7. SINGLE RESPONSIBILITY

Setiap module harus memiliki tanggung jawab yang jelas.

Contoh:

```text
StudentController
```

bertanggung jawab terhadap:

```text
HTTP request
HTTP response
```

Bukan:

```text
database query
business calculation
authorization logic
```

Business logic:

```text
StudentService
```

Database access:

```text
StudentRepository
```

Authorization:

```text
AuthorizationService / Policy
```

---

# 8. NO DUPLICATE BUSINESS LOGIC

AI tidak boleh menulis logic yang sama di banyak tempat.

Contoh buruk:

```text
StudentPage
    → menentukan active program

StudentAPI
    → menentukan active program

Dashboard
    → menentukan active program
```

Gunakan satu service:

```text
ActiveProgramService
        ↓
getActiveProgram(studentId)
```

Kemudian digunakan oleh:

```text
API
Dashboard
Student Detail
Academic
Reports
```

---

# 9. DATABASE RULES

AI tidak boleh mengubah database tanpa mempertimbangkan:

```text
PK
FK
UNIQUE
INDEX
NULLABILITY
CASCADE
RELATIONSHIP
```

Setiap perubahan schema harus melalui:

```text
DATABASE.md
      ↓
Schema
      ↓
Migration
      ↓
Repository
      ↓
Service
      ↓
API
      ↓
Test
```

---

# 10. DATABASE MIGRATION RULE

Dilarang melakukan perubahan database production secara manual tanpa migration yang terdokumentasi.

Setiap perubahan harus menghasilkan:

```text
Migration
+
Updated schema
+
Updated DATABASE.md
+
Tests
```

---

# 11. STUDENT IDENTITY RULE

`student_id` adalah identitas internal utama siswa.

Prinsip:

```text
Student
   ↓
student_id
   ↓
Program History
   ↓
Academic Records
```

AI **tidak boleh membuat student baru** hanya karena siswa:

* naik kelas;
* pindah kelas;
* pindah program;
* melanjutkan program;
* menjadi alumni.

Yang berubah adalah:

```text
Program History / Enrollment
```

bukan identitas student.

---

# 12. NIK RULE

NIK adalah identitas nasional dan harus diperlakukan sebagai data sensitif.

AI wajib:

```text
[ ] Validasi format
[ ] Cegah duplicate
[ ] Hormati UNIQUE constraint
[ ] Batasi akses
[ ] Hindari logging NIK
```

AI tidak boleh menampilkan NIK secara penuh kepada role yang tidak memiliki permission.

---

# 13. DUPLICATE STUDENT RULE

AI harus membedakan:

```text
Duplicate Student
```

dan:

```text
Duplicate Program History
```

Contoh:

```text
Siswa A
student_id = STU-001
```

kemudian:

```text
2024 MTs VII
2025 MTs VIII
2026 MTs IX
```

tetap satu student.

---

# 14. PROGRAM HISTORY RULE

Riwayat program bersifat historis.

AI **tidak boleh menghapus history hanya untuk memperbaiki tampilan data**.

Contoh:

```text
2024 → MTs VII
2025 → MTs VIII
2026 → MTs IX
```

harus tetap dapat ditelusuri.

Jika terjadi kesalahan:

```text
Correction
```

lebih diutamakan daripada:

```text
Hard Delete
```

untuk data historis penting.

---

# 15. ACTIVE PROGRAM RULE

AI tidak boleh menentukan program aktif menggunakan logic berbeda-beda.

Gunakan:

```text
getActiveProgram(studentId)
```

Satu sumber logic harus digunakan oleh seluruh module.

---

# 16. PROMOTION RULE

Naik kelas harus melalui business service.

Contoh:

```text
2024
MTs VII
   ↓
Promotion
   ↓
2025
MTs VIII
```

AI tidak boleh sekadar:

```text
UPDATE class = VIII
```

jika business rule mengharuskan pembuatan history baru.

---

# 17. TRANSFER PROGRAM RULE

Pindah program bukan membuat student baru.

Contoh:

```text
MTs
 ↓
Pra-Univ
```

Flow:

```text
Validate
   ↓
Authorize
   ↓
Close Current Enrollment
   ↓
Create New Enrollment
   ↓
Audit
```

Jika beberapa operasi harus berhasil bersama-sama, gunakan database transaction.

---

# 18. ALUMNI RULE

Alumni tetap merupakan student record yang sama.

Jangan:

```text
DELETE student
```

ketika siswa menjadi alumni.

Gunakan:

```text
status = ALUMNI
```

dan simpan seluruh history.

---

# 19. STATUS RULE

Status siswa tidak boleh diubah hanya untuk memenuhi UI.

Status harus mengikuti:

```text
BUSINESS_RULES.md
```

AI tidak boleh membuat status baru seperti:

```text
WAITING
SUSPENDED
GRADUATED
PENDING
```

tanpa definisi resmi dalam business rules.

---

# 20. AUTHENTICATION RULE

Semua endpoint protected harus melakukan authentication.

Flow:

```text
Request
   ↓
Authentication
   ↓
Authorization
   ↓
Scope
   ↓
Validation
   ↓
Business Logic
```

Urutan dapat disesuaikan dengan framework, tetapi tidak boleh melewati security check.

---

# 21. RBAC RULE

Model M-CORE:

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
student.update
   ↓
scope: assigned_program
```

Role saja tidak cukup.

AI wajib mempertimbangkan:

```text
Who?
What?
Where?
```

---

# 22. NO CLIENT-SIDE AUTHORIZATION

AI tidak boleh mengandalkan UI untuk security.

Contoh buruk:

```text
if (user.role === "ADMIN") {
    showButton();
}
```

Itu hanya UI control.

Backend tetap harus melakukan:

```text
Authentication
Authorization
Scope validation
```

---

# 23. PERMISSION RULE

Permission harus menggunakan format konsisten.

Contoh:

```text
student.view
student.create
student.update
student.delete
student.promote
student.transfer
student.alumni
```

AI tidak boleh membuat variasi:

```text
view_student
canViewStudent
student-read
studentAccess
```

kecuali sudah ditentukan oleh architecture.

---

# 24. SCOPE RULE

Scope harus diperiksa di server.

Contoh:

```text
User
 ↓
Role
 ↓
Permission
 ↓
Program Scope
 ↓
Student
```

Memiliki:

```text
student.view
```

tidak otomatis berarti:

```text
view ALL students
```

---

# 25. API RULE

Semua API harus mengikuti:

```text
/api/v1
```

Format endpoint harus konsisten.

Contoh:

```text
GET    /api/v1/students
GET    /api/v1/students/:id
POST   /api/v1/students
PATCH  /api/v1/students/:id
```

Jangan membuat:

```text
/getStudents
/createStudent
/updateStudent
```

jika tidak sesuai API specification.

---

# 26. REQUEST VALIDATION

Semua external input harus divalidasi.

Sumber input:

```text
Body
Query
Params
Headers
Upload
```

Jangan percaya input dari frontend.

Frontend validation ≠ Backend validation.

---

# 27. MASS ASSIGNMENT PROTECTION

AI dilarang menggunakan pola yang secara otomatis menerima seluruh request body ke database.

Contoh berbahaya:

```text
database.student.update({
    data: request.body
})
```

Gunakan explicit fields.

Contoh konsep:

```text
allowedFields:
    full_name
    gender
    birth_place
    birth_date
    email
    phone
    whatsapp
```

Field sensitif atau privilege tidak boleh dapat diubah melalui endpoint biasa.

---

# 28. SQL INJECTION

AI harus menggunakan parameterized query / ORM safely.

Dilarang membangun SQL dari string input user.

Buruk:

```text
SELECT * FROM students WHERE name = '${name}'
```

Gunakan mekanisme parameterized query dari database library/ORM.

---

# 29. XSS PROTECTION

AI harus memperlakukan input user sebagai untrusted data.

Jangan:

```text
dangerouslySetInnerHTML
```

tanpa alasan dan sanitization yang benar.

Output harus di-escape sesuai konteks.

---

# 30. CSRF

Untuk authentication berbasis cookie/session:

```text
[ ] CSRF protection
[ ] SameSite cookie
[ ] Secure cookie
[ ] HttpOnly cookie
```

harus dipertimbangkan sesuai architecture.

---

# 31. SENSITIVE DATA

Data seperti:

```text
NIK
Phone
WhatsApp
Email
Birth Date
```

harus diperlakukan sebagai personal data.

AI:

```text
[ ] Tidak memasukkannya ke debug log
[ ] Tidak menampilkan tanpa permission
[ ] Tidak mengirim field yang tidak diperlukan
[ ] Tidak memasukkan data sensitif ke error message
```

---

# 32. ERROR HANDLING

Error kepada user harus aman.

Jangan expose:

```text
Database stack trace
SQL query
Environment variable
Secret
Internal filesystem path
```

Gunakan response yang aman:

```text
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Validation Error
500 Internal Server Error
```

---

# 33. LOGGING RULE

Log harus membantu debugging tanpa membocorkan data pribadi.

Dilarang:

```text
console.log(student)
```

jika object tersebut mengandung:

```text
NIK
phone
email
password
token
```

Gunakan structured logging dan redaction.

---

# 34. SECRET MANAGEMENT

AI dilarang menulis:

```text
API_KEY = "..."
PASSWORD = "..."
JWT_SECRET = "..."
DATABASE_PASSWORD = "..."
```

di source code.

Gunakan environment variable / secret manager.

---

# 35. PASSWORD RULE

Password:

```text
NEVER plaintext
```

Gunakan password hashing yang aman.

Jangan:

```text
MD5
SHA1
Plain SHA256
```

sebagai password hashing scheme.

---

# 36. TOKEN RULE

Token/session credential:

```text
[ ] Tidak ditulis ke log
[ ] Tidak dimasukkan ke URL
[ ] Tidak disimpan sembarangan di localStorage jika architecture menggunakan secure cookie
[ ] Expiration diterapkan
```

Ikuti authentication architecture project.

---

# 37. FILE UPLOAD RULE

Jika M-CORE nantinya mendukung upload:

```text
[ ] Validate extension
[ ] Validate MIME
[ ] Validate file size
[ ] Rename generated filename
[ ] Jangan percaya filename user
[ ] Jangan menjalankan file upload
[ ] Simpan di lokasi yang sesuai
```

---

# 38. FRONTEND SECURITY RULE

Frontend bukan security boundary.

Frontend bertugas:

```text
UI
UX
Validation awal
Permission-aware interface
```

Backend bertugas:

```text
Security
Authorization
Validation
Business Rules
Data Access
```

---

# 39. UI PERMISSION RULE

Button dapat disembunyikan berdasarkan permission:

```text
student.promote
```

tetapi API tetap wajib memeriksa permission.

---

# 40. TYPE SAFETY

Gunakan TypeScript strict mode.

Hindari:

```text
any
```

kecuali benar-benar diperlukan dan diberi alasan.

Lebih baik:

```text
unknown
```

kemudian lakukan validation/type narrowing.

---

# 41. NAMING RULE

Gunakan nama yang mudah dipahami.

Contoh:

```text
StudentService
StudentRepository
ActiveProgramService
PromotionService
TransferService
AuthorizationService
```

Hindari nama ambigu:

```text
Helper
Utils
Manager
Common
Misc
```

jika tanggung jawabnya tidak jelas.

---

# 42. FUNCTION SIZE

Function harus fokus.

Jika function terlalu panjang:

```text
Function
   ↓
Identify responsibility
   ↓
Extract service/helper
```

Jangan membuat satu function yang:

```text
validate
authorize
query
calculate
save
send email
log
```

sekaligus.

---

# 43. NO PREMATURE ABSTRACTION

AI tidak boleh membuat abstraction kompleks hanya karena:

> "mungkin nanti dibutuhkan."

Utamakan:

```text
Simple
Readable
Maintainable
```

baru lakukan abstraction jika ada kebutuhan nyata.

---

# 44. NO OVERENGINEERING

Untuk coder pemula, kode harus mudah dipahami.

Lebih baik:

```text
3 function sederhana
```

daripada:

```text
1 generic abstraction yang sangat kompleks
```

---

# 45. REUSE EXISTING PATTERN

Sebelum membuat module baru:

```text
Search existing implementation
        ↓
Identify pattern
        ↓
Reuse pattern
```

Jangan membuat style baru jika project sudah memiliki standard.

---

# 46. NO UNRELATED CHANGES

Saat mengerjakan:

```text
TASK 3.2 Student List
```

AI tidak boleh sekaligus mengubah:

```text
Authentication
RBAC
Database architecture
Academic module
```

kecuali memang dependency task membutuhkan perubahan tersebut.

---

# 47. MINIMAL CHANGE PRINCIPLE

Gunakan prinsip:

```text
Smallest Safe Change
```

Perubahan harus sekecil mungkin untuk menyelesaikan task.

---

# 48. BEFORE MODIFYING FILE

AI harus memahami:

```text
Why does this file exist?
What depends on it?
What depends on the changed function?
```

Sebelum melakukan refactor besar.

---

# 49. DELETE CODE RULE

Jangan menghapus kode hanya karena:

> "tidak digunakan sekarang."

Pastikan:

```text
Search references
   ↓
Check dependency
   ↓
Confirm unused
   ↓
Delete
```

---

# 50. API RESPONSE RULE

API response harus konsisten.

Contoh:

```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request"
  }
}
```

Ikuti `API_SPEC.md` sebagai sumber utama.

---

# 51. PAGINATION

Endpoint list tidak boleh mengambil seluruh database tanpa alasan.

Gunakan:

```text
page
limit
```

atau mekanisme pagination yang ditentukan API.

Default limit harus aman untuk mencegah query berlebihan.

---

# 52. SEARCH RULE

Search harus:

```text
[ ] Parameterized
[ ] Paginated
[ ] Indexed jika diperlukan
[ ] Tidak menyebabkan full table scan tanpa alasan
```

---

# 53. TRANSACTION RULE

Gunakan database transaction jika satu operasi terdiri dari beberapa perubahan yang harus berhasil atau gagal bersama.

Contoh:

```text
Transfer Program

1. Close old enrollment
2. Create new enrollment
3. Create audit log
```

Jika business rule mengharuskan atomic:

```text
BEGIN
 ↓
Operation 1
 ↓
Operation 2
 ↓
Operation 3
 ↓
COMMIT
```

Jika gagal:

```text
ROLLBACK
```

---

# 54. AUDIT RULE

Action sensitif harus dapat ditelusuri.

Minimal pertimbangkan audit untuk:

```text
[ ] Student identity changes
[ ] NIK changes
[ ] Status changes
[ ] Promotion
[ ] Program transfer
[ ] Alumni transition
[ ] Role changes
[ ] Permission changes
```

Audit tidak boleh menyimpan secret atau credential.

---

# 55. TEST-FIRST MINDSET

Setiap business-critical feature harus memiliki test.

Minimal:

```text
Happy Path
+
Validation Error
+
Authorization Error
+
Business Rule Error
+
Edge Case
```

---

# 56. TEST DATA RULE

Gunakan data dummy.

Jangan menggunakan data siswa asli untuk automated tests.

Contoh:

```text
Test Student
NIK: synthetic test value
Email: test@example.invalid
```

---

# 57. TEST ISOLATION

Test tidak boleh bergantung pada urutan test lain.

Setiap test harus dapat dijalankan secara independen.

---

# 58. BUILD CHECK

Sebelum task dianggap selesai:

```text
npm run lint
npm run typecheck
npm run test
npm run build
```

Gunakan command aktual project jika berbeda.

---

# 59. FAILURE RULE

Jika command gagal:

```text
DO NOT IGNORE
```

AI harus:

```text
Read error
   ↓
Identify root cause
   ↓
Fix
   ↓
Run again
```

Jangan menyatakan task selesai jika build/test masih gagal.

---

# 60. SECURITY FAILURE RULE

Jika menemukan vulnerability:

```text
STOP
 ↓
Assess impact
 ↓
Fix vulnerability
 ↓
Test
 ↓
Document
```

Security issue memiliki prioritas lebih tinggi daripada cosmetic UI issue.

---

# 61. DEPENDENCY RULE

Jangan menambahkan package baru hanya untuk hal sederhana yang dapat dilakukan menggunakan dependency existing.

Sebelum install package:

```text
[ ] Apakah benar diperlukan?
[ ] Apakah functionality sudah tersedia?
[ ] Apakah package maintained?
[ ] Apakah package memiliki security concern?
[ ] Apakah license sesuai?
```

---

# 62. PACKAGE CHANGE RULE

Jika menambahkan dependency:

Dokumentasikan:

```text
Package:
Purpose:
Why needed:
Alternative considered:
Security consideration:
```

---

# 63. VERSION CONTROL RULE

Setiap perubahan harus mudah direview.

Commit ideal:

```text
feat(student): add student creation
fix(student): prevent duplicate nik
feat(program): add program history
fix(auth): enforce program scope
test(student): add duplicate nik tests
```

Hindari:

```text
update
fix
changes
final
final2
final-final
```

---

# 64. COMMIT SCOPE

Satu commit sebaiknya memiliki satu tujuan.

Contoh baik:

```text
feat(student): add student list endpoint
```

bukan:

```text
feat: student + auth + dashboard + database + random fixes
```

---

# 65. DOCUMENTATION UPDATE RULE

Jika implementasi mengubah behavior:

```text
Code Change
    ↓
Check Documentation
    ↓
Update Documentation
```

Dokumentasi yang mungkin perlu diperbarui:

```text
DATABASE.md
BUSINESS_RULES.md
RBAC.md
API_SPEC.md
ARCHITECTURE.md
TASKS.md
```

---

# 66. BUSINESS RULE CHANGE

AI tidak boleh diam-diam mengubah business rule.

Contoh:

Jika aturan mengatakan:

```text
Student Active = memiliki active enrollment
```

AI tidak boleh menggantinya menjadi:

```text
Student Active = login dalam 30 hari terakhir
```

Jika perlu perubahan:

```text
PROPOSAL:
...
Reason:
...
Impact:
...
```

---

# 67. RBAC CHANGE

AI tidak boleh menambahkan permission baru tanpa dokumentasi.

Jika membutuhkan permission baru:

```text
PROPOSAL

Permission:
student.export

Reason:
...

Affected roles:
...

Affected endpoints:
...
```

Setelah disetujui:

```text
RBAC.md
   ↓
Permission seed
   ↓
Policy
   ↓
API
   ↓
Test
```

---

# 68. API CHANGE

Jika endpoint berubah:

```text
API_SPEC.md
      ↓
Controller
      ↓
Validation
      ↓
Service
      ↓
Test
```

Jangan mengubah endpoint hanya karena AI menganggap nama lain lebih bagus.

---

# 69. DATABASE CHANGE

Jika field berubah:

```text
DATABASE.md
      ↓
Schema
      ↓
Migration
      ↓
Code
      ↓
Test
```

Jangan menghapus column production tanpa migration dan impact analysis.

---

# 70. BACKWARD COMPATIBILITY

Untuk perubahan API/database yang sudah digunakan:

```text
Analyze consumers
     ↓
Migration strategy
     ↓
Compatibility
     ↓
Deprecation
     ↓
Removal
```

Jangan memutus API existing secara tiba-tiba.

---

# 71. RESPONSE TO AMBIGUITY

Jika requirement ambigu, AI harus:

```text
1. Identify ambiguity
2. State assumption
3. Explain impact
4. Choose safest implementation
```

Format:

```text
AMBIGUITY:
...

CURRENT ASSUMPTION:
...

IMPACT:
...

SAFE IMPLEMENTATION:
...
```

---

# 72. WHEN AI SHOULD STOP

AI harus berhenti dan meminta keputusan manusia jika:

```text
[ ] Business rule belum ditentukan
[ ] Data relationship ambigu
[ ] Security model bertentangan
[ ] Production data berisiko rusak
[ ] Migration destructive
[ ] Requirement bertentangan dengan documentation
[ ] Perubahan architecture besar
[ ] Permission baru diperlukan
```

AI boleh membuat proposal, tetapi tidak boleh diam-diam memilih keputusan kritis.

---

# 73. CODER-BEGINNER FRIENDLY RULE

Kode harus dapat dipahami oleh developer yang baru masuk project.

Prioritaskan:

```text
Readable
Explicit
Predictable
Consistent
Documented
```

Hindari:

```text
Magic
Implicit behavior
Over-abstraction
Complex metaprogramming
Unnecessary generic types
```

---

# 74. COMMENT RULE

Comment menjelaskan **WHY**, bukan sekadar **WHAT**.

Buruk:

```text
// Set status to active
status = "ACTIVE";
```

Lebih baik:

```text
// Student status is derived from the current enrollment
// according to the active-program business rule.
status = ...
```

Jangan memenuhi kode dengan comment yang tidak diperlukan.

---

# 75. TODO RULE

Jangan meninggalkan:

```text
TODO
FIXME
HACK
TEMP
```

tanpa alasan yang jelas.

Jika memang diperlukan:

```text
TODO:
Reason:
Impact:
Owner:
```

---

# 76. SECURITY PRIORITY

Urutan prioritas:

```text
1. Data Integrity
2. Authentication
3. Authorization
4. Privacy
5. Business Rules
6. Reliability
7. Performance
8. UX
9. Cosmetic
```

UI yang bagus tidak boleh mengorbankan security.

---

# 77. DATA INTEGRITY PRIORITY

AI harus lebih memilih:

```text
Prevent invalid data
```

daripada:

```text
Fix invalid data later
```

Gunakan:

```text
Database constraints
+
Application validation
+
Business validation
```

---

# 78. DEFENSE IN DEPTH

Security M-CORE harus berlapis:

```text
Browser
   ↓
Frontend Validation
   ↓
API
   ↓
Authentication
   ↓
Authorization
   ↓
Scope
   ↓
Input Validation
   ↓
Business Rules
   ↓
Repository
   ↓
Database Constraints
```

Tidak ada satu layer yang boleh dianggap cukup sendirian.

---

# 79. AI OUTPUT FORMAT

Setiap kali AI menyelesaikan task besar, berikan ringkasan:

```text
TASK:
...

FILES CREATED:
...

FILES MODIFIED:
...

DATABASE IMPACT:
...

API IMPACT:
...

RBAC IMPACT:
...

SECURITY:
...

TESTS:
...

DOCUMENTATION:
...

STATUS:
DONE / BLOCKED
```

---

# 80. NO FALSE COMPLETION

AI tidak boleh mengatakan:

```text
Done
```

jika:

```text
Build gagal
Test gagal
Migration gagal
Typecheck gagal
Security requirement belum terpenuhi
```

Gunakan:

```text
BLOCKED
```

jika belum selesai.

---

# 81. DEFINITION OF DONE

Sebuah task hanya boleh dianggap:

```text
DONE
```

jika:

```text
[ ] Requirement implemented
[ ] Code follows architecture
[ ] Database impact handled
[ ] Authorization implemented
[ ] Validation implemented
[ ] Business rules respected
[ ] Tests pass
[ ] Typecheck pass
[ ] Lint pass
[ ] Security reviewed
[ ] Documentation updated if needed
```

---

# 82. AI DEVELOPMENT LOOP

Gunakan loop:

```text
┌───────────────┐
│ READ TASK     │
└───────┬───────┘
        ↓
┌───────────────┐
│ READ DOCS     │
└───────┬───────┘
        ↓
┌───────────────┐
│ INSPECT CODE  │
└───────┬───────┘
        ↓
┌───────────────┐
│ MAKE PLAN     │
└───────┬───────┘
        ↓
┌───────────────┐
│ IMPLEMENT     │
└───────┬───────┘
        ↓
┌───────────────┐
│ TEST          │
└───────┬───────┘
        ↓
┌───────────────┐
│ SECURITY      │
│ REVIEW        │
└───────┬───────┘
        ↓
┌───────────────┐
│ DOCUMENT      │
└───────┬───────┘
        ↓
      DONE
```

---

# 83. GOLDEN RULE

> **AI harus mengikuti M-CORE, bukan membuat M-CORE mengikuti AI.**

AI adalah alat untuk mempercepat development.

Architecture, database, business rules, security, dan data integrity tetap menjadi prioritas utama.

---

# 84. FINAL AI CHECKLIST

Sebelum memberikan hasil coding:

```text
UNDERSTANDING
[ ] Saya memahami task
[ ] Saya membaca dokumentasi relevan
[ ] Saya memahami existing code

ARCHITECTURE
[ ] Tidak merusak architecture
[ ] Tidak membuat duplicate logic
[ ] Layer responsibility benar

DATABASE
[ ] PK/FK benar
[ ] Constraint benar
[ ] Migration aman
[ ] Tidak merusak data

BUSINESS
[ ] Business rules dipatuhi
[ ] Student identity tidak diduplikasi
[ ] Program history tetap terjaga
[ ] Active program menggunakan sumber logic yang sama

SECURITY
[ ] Authentication
[ ] Authorization
[ ] Scope
[ ] Validation
[ ] IDOR protection
[ ] Injection protection
[ ] XSS protection
[ ] Mass assignment protection
[ ] Sensitive data protection

QUALITY
[ ] Typecheck
[ ] Lint
[ ] Test
[ ] Build

DOCUMENTATION
[ ] Dokumentasi diperbarui
[ ] TASKS.md diperbarui

FINAL
[ ] Tidak ada asumsi tersembunyi
[ ] Tidak ada false completion
```

---

# 85. M-CORE AI COMMANDMENT

```text
READ BEFORE CODE.

UNDERSTAND BEFORE MODIFY.

VALIDATE BEFORE SAVE.

AUTHORIZE BEFORE ACCESS.

TRANSACTION BEFORE MULTI-STEP CHANGE.

TEST BEFORE DONE.

DOCUMENT BEFORE MOVING ON.

NEVER GUESS CRITICAL RULES.

NEVER EXPOSE SENSITIVE DATA.

NEVER SACRIFICE SECURITY FOR CONVENIENCE.
```

---

**End of `AI_RULES.md`**
