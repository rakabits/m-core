# M-CORE

## MUMTAZA CORE

### Central Student & Education Management System

**Document:** `PROJECT.md`
**Version:** `1.0.0`
**Status:** Active
**Project Type:** Web-based Student & Education Management System
**Primary Organization:** Mumtaza Center

---

# 1. PROJECT OVERVIEW

**M-CORE (MUMTAZA CORE)** adalah sistem terpusat untuk mengelola data siswa dan perjalanan pendidikan siswa dalam satu database yang terstruktur, aman, dan dapat dikembangkan secara modular.

Nama lengkap sistem:

```text
M-CORE
MUMTAZA CORE
Central Student & Education Management System
```

M-CORE dirancang untuk menggantikan pola pengelolaan data yang tersebar di berbagai file, spreadsheet, atau sistem program yang berbeda menjadi satu sumber data terpusat.

Konsep utama:

```text
ONE STUDENT
      ↓
ONE STUDENT ID
      ↓
ONE CENTRAL PROFILE
      ↓
MULTIPLE PROGRAM HISTORY
      ↓
ACADEMIC DATA
      ↓
ALUMNI DATA
```

---

# 2. PROBLEM STATEMENT

Data siswa dapat berasal dari berbagai program dan periode pendidikan.

Contohnya:

```text
2024 → MTs → Kelas VII
2025 → MTs → Kelas VIII
2026 → MTs → Kelas IX
2027 → Pra-Univ
2028 → Kuliah
```

Masalah yang ingin diselesaikan M-CORE:

* data siswa terduplikasi;
* data siswa tersebar;
* satu siswa memiliki beberapa data identitas;
* sulit mengetahui riwayat program;
* sulit menentukan program aktif;
* sulit mengetahui status siswa;
* perpindahan program tidak terdokumentasi dengan baik;
* data akademik tidak terhubung dengan profil siswa;
* pencarian data membutuhkan banyak file;
* akses data belum terkontrol secara granular.

---

# 3. PROJECT VISION

Membangun satu platform yang menjadi **single source of truth** untuk seluruh perjalanan pendidikan siswa.

M-CORE harus memungkinkan organisasi menjawab pertanyaan:

```text
Siapa siswa ini?
        ↓
Apa identitasnya?
        ↓
Program apa yang pernah diikuti?
        ↓
Program apa yang sedang aktif?
        ↓
Kelas berapa?
        ↓
Bagaimana riwayat pendidikannya?
        ↓
Apa status terakhirnya?
        ↓
Apakah sudah menjadi alumni?
```

---

# 4. CORE PRINCIPLE

Prinsip utama M-CORE:

> **One Student, One Identity, Many Educational Experiences.**

Satu siswa hanya memiliki satu identitas utama dalam database.

Namun satu siswa dapat memiliki:

```text
Multiple Programs
Multiple Academic Years
Multiple Classes
Multiple Enrollment Records
Multiple Academic Records
```

---

# 5. PRIMARY OBJECTIVE

Tujuan utama:

### 5.1 Centralized Data

Menyediakan satu database pusat untuk data siswa.

### 5.2 Data Integrity

Menjaga agar data tidak mudah terduplikasi atau rusak.

### 5.3 Program History

Mencatat seluruh perjalanan program siswa.

### 5.4 Academic Management

Menghubungkan siswa dengan:

```text
Class
Schedule
Attendance
Grades
```

### 5.5 Access Control

Membatasi akses berdasarkan:

```text
Role
Permission
Scope
```

### 5.6 Scalability

Sistem harus dapat berkembang tanpa harus membangun ulang database dari awal.

---

# 6. MVP SCOPE

Versi pertama M-CORE berfokus pada **Student Management**.

Prioritas MVP:

```text
1. Authentication
2. RBAC
3. Student Profile
4. Student Search
5. Student CRUD
6. Program History
7. Active Program
8. Student Status
```

---

# 7. DEVELOPMENT PHASE

Pengembangan dilakukan secara bertahap.

```text
PHASE 1
Setup
    ↓
PHASE 2
Database
    ↓
PHASE 3
Authentication & RBAC
    ↓
PHASE 4
Student Management
    ↓
PHASE 5
Program History
    ↓
PHASE 6
Academic
    ↓
PHASE 7
Testing
    ↓
PHASE 8
Deployment
```

---

# 8. PHASE 1 — SETUP

Tujuan:

Mempersiapkan fondasi project.

Meliputi:

```text
Project initialization
Environment configuration
Database connection
Frontend setup
Backend setup
Code quality tools
Environment variables
Git workflow
```

Tidak membangun business feature pada tahap ini.

---

# 9. PHASE 2 — DATABASE

Membangun database utama M-CORE.

Core entity:

```text
students
programs
student_programs
academic_years
classes
```

Kemudian berkembang menjadi:

```text
attendance
grades
schedules
```

Database harus mengikuti `DATABASE.md`.

---

# 10. PHASE 3 — AUTHENTICATION & RBAC

Authentication:

```text
Login
Logout
Session
Password security
```

Authorization menggunakan:

```text
Role
    ↓
Permission
    ↓
Scope
```

Contoh:

```text
Admin
    ↓
student.view
student.create
student.update
student.delete
    ↓
Global
```

User tidak boleh memperoleh akses hanya karena mengetahui URL endpoint.

---

# 11. PHASE 4 — STUDENT MANAGEMENT

Modul Student merupakan core module M-CORE.

Fungsi:

```text
Create Student
View Student
Update Student
Search Student
Filter Student
View Student Detail
Change Student Status
```

Profil utama:

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

---

# 12. STUDENT ID

Setiap siswa harus memiliki:

```text
student_id
```

yang unik.

Student ID merupakan:

> **Internal identity identifier**

Student ID tidak boleh berubah ketika:

```text
Program berubah
Kelas berubah
Status berubah
Tahun akademik berubah
Siswa menjadi alumni
```

Contoh:

```text
STU-000001
```

tetap sama sepanjang lifecycle siswa.

---

# 13. NIK

NIK merupakan identitas nasional siswa.

Aturan:

```text
NIK harus unique jika tersedia.
```

Namun sistem harus mampu menangani siswa yang belum memiliki NIK.

Contoh:

```text
NIK = NULL
```

tidak boleh dianggap sebagai duplikasi.

Jika NIK sudah terisi dan digunakan siswa lain:

```text
REJECT
```

kecuali terdapat proses koreksi data yang memiliki authorization khusus.

---

# 14. STUDENT STATUS

Status utama:

```text
ACTIVE
ALUMNI
INACTIVE
```

### ACTIVE

Siswa masih mengikuti pendidikan/program aktif.

### ALUMNI

Siswa telah menyelesaikan perjalanan pendidikan sesuai aturan organisasi.

### INACTIVE

Siswa tidak sedang aktif dalam program dan belum dikategorikan sebagai alumni.

Status tidak boleh berubah secara sembarangan.

Perubahan status harus mengikuti `BUSINESS_RULES.md`.

---

# 15. PROGRAM HISTORY

Program History adalah salah satu fitur inti M-CORE.

Sistem harus menyimpan setiap perjalanan program siswa.

Contoh:

```text
Student
STU-000001

2024
MTs
Kelas VII

2025
MTs
Kelas VIII

2026
MTs
Kelas IX

2027
Pra-Univ
Program Intensif
```

Jangan overwrite history lama.

Buruk:

```text
2024 MTs VII
↓
Update
2025 MTs VIII
```

Data 2024 hilang.

Benar:

```text
2024 MTs VII
2025 MTs VIII
```

---

# 16. IMMUTABLE HISTORY PRINCIPLE

Riwayat pendidikan harus bersifat historis.

Ketika terjadi perubahan:

```text
Current Record
      ↓
Close / End
      ↓
Create New Record
```

Bukan:

```text
UPDATE OLD HISTORY
```

kecuali untuk koreksi data yang sah.

---

# 17. ACTIVE PROGRAM

Setiap siswa dapat memiliki satu program aktif pada konteks yang sama.

Sistem harus dapat menentukan:

```text
Current Program
Current Academic Year
Current Class
```

Program aktif ditentukan berdasarkan data enrollment/program history yang valid dan belum berakhir sesuai aturan pada `BUSINESS_RULES.md`.

Frontend tidak boleh menentukan program aktif sendiri.

Backend/database menjadi sumber kebenaran.

---

# 18. PROGRAM TRANSFER

Perpindahan program harus menghasilkan history.

Contoh:

```text
MTs
Kelas IX
2026

       ↓ Transfer

Pra-Univ
2027
```

Sistem mencatat:

```text
Previous Program
Transfer Date
New Program
Reason jika diperlukan
Actor
Timestamp
```

History lama tidak dihapus.

---

# 19. CLASS PROGRESSION

Perubahan kelas merupakan bagian dari perjalanan akademik.

Contoh:

```text
2024 → VII
2025 → VIII
2026 → IX
```

Perubahan kelas harus membuat record baru atau enrollment baru sesuai model database.

Jangan menghapus data kelas sebelumnya.

---

# 20. ACADEMIC MODULE

Setelah Student dan Program History stabil, M-CORE dikembangkan ke modul akademik.

Komponen:

```text
Class
Schedule
Attendance
Grades
```

Relasi utama:

```text
Student
   ↓
Enrollment
   ↓
Class
   ↓
Academic Data
```

---

# 21. ACADEMIC YEAR

Data akademik harus memiliki konteks tahun akademik.

Contoh:

```text
2024/2025
2025/2026
2026/2027
```

Jangan hanya menyimpan:

```text
year = 2025
```

jika organisasi menggunakan konsep tahun akademik.

---

# 22. SECURITY OBJECTIVE

Security merupakan bagian dari architecture, bukan fitur tambahan.

M-CORE harus menerapkan:

```text
Authentication
Authorization
Input Validation
Output Filtering
Secure Session
Password Hashing
CSRF Protection jika relevan
Rate Limiting
Audit Logging
Secure Headers
Error Handling
Sensitive Data Protection
```

---

# 23. ZERO TRUST APPROACH

Jangan mempercayai request dari frontend.

Semua request dianggap:

```text
UNTRUSTED
```

Backend harus melakukan:

```text
Authenticate
      ↓
Authorize
      ↓
Validate
      ↓
Business Rule
      ↓
Database
```

---

# 24. FRONTEND SECURITY PRINCIPLE

Frontend hanya bertanggung jawab terhadap:

```text
UX
UI
Client validation
Permission-aware rendering
```

Frontend **bukan security boundary**.

Contoh:

```text
Hiding Delete Button
```

tidak cukup untuk mengamankan:

```text
DELETE /students/:id
```

Backend tetap wajib melakukan authorization.

---

# 25. API PRINCIPLE

API harus mengikuti:

```text
RESTful
Consistent
Versioned
Authenticated
Authorized
Validated
Auditable
```

Contoh:

```text
/api/v1/students
```

Detail endpoint mengikuti:

```text
API_SPEC.md
```

---

# 26. ERROR HANDLING

API tidak boleh membocorkan informasi internal.

Jangan mengirim kepada user:

```text
SQL query
Database stack trace
Server path
Secret
Environment variable
Internal exception
```

Gunakan error response terstruktur.

Contoh:

```json
{
  "success": false,
  "message": "Data siswa tidak dapat diproses.",
  "code": "STUDENT_UPDATE_FAILED"
}
```

---

# 27. AUDITABILITY

Action penting harus dapat dilacak.

Contoh:

```text
Create Student
Update Student
Change Status
Transfer Program
Change Role
Change Permission
Delete / Archive
```

Audit record minimal:

```text
actor
action
target
timestamp
```

Jika diperlukan:

```text
old_value
new_value
ip_address
user_agent
```

---

# 28. DATA PRIVACY

M-CORE menyimpan data personal siswa.

Karena itu:

```text
NIK
Email
Phone
WhatsApp
Birth Date
```

harus diperlakukan sebagai data sensitif.

Prinsip:

```text
Collect only what is needed.
Expose only what is permitted.
Store securely.
Log important access/actions.
```

---

# 29. ROLE & PERMISSION

Authorization mengikuti:

```text
Role
   ↓
Permission
   ↓
Scope
```

Contoh:

```text
Teacher
   ↓
student.view
   ↓
Own Class
```

Sedangkan:

```text
Super Admin
   ↓
student.view
student.create
student.update
student.delete
   ↓
Global
```

Detail berada di:

```text
RBAC.md
```

---

# 30. CODING PRINCIPLE

M-CORE menggunakan prinsip:

```text
Readable
Predictable
Modular
Secure
Testable
Maintainable
```

Kode harus mudah dibaca oleh coder berikutnya.

Prioritas:

```text
Simple code
>
clever code
```

---

# 31. BEGINNER-FRIENDLY DEVELOPMENT

Project harus dapat dilanjutkan oleh coder pemula.

Karena itu:

* struktur folder jelas;
* nama file konsisten;
* nama function jelas;
* business logic tidak bercampur dengan UI;
* API layer terpisah;
* database access terpisah;
* authorization terpusat;
* reusable component digunakan;
* dokumentasi selalu diperbarui.

---

# 32. SINGLE RESPONSIBILITY

Setiap module memiliki tanggung jawab yang jelas.

Contoh:

```text
StudentController
```

mengatur request/response.

```text
StudentService
```

mengatur business logic.

```text
StudentRepository
```

mengatur database access.

Jangan membuat satu file:

```text
student.js
```

berisi:

```text
UI
API
SQL
Authorization
Business Logic
Validation
```

---

# 33. BUSINESS LOGIC LOCATION

Business rule harus berada di backend/service/domain layer.

Contoh:

```text
Determine Active Program
Promote Student
Transfer Program
Graduate Student
Duplicate NIK Validation
```

tidak boleh hanya berada di frontend.

---

# 34. DATABASE RULE

Database menjadi source of truth untuk data persisten.

Jangan menyimpan data penting hanya di:

```text
localStorage
sessionStorage
frontend state
```

Database harus memiliki:

```text
PK
FK
UNIQUE
INDEX
CONSTRAINT
```

sesuai kebutuhan.

---

# 35. DATABASE MIGRATION

Perubahan database harus melalui migration.

Jangan melakukan perubahan production secara manual tanpa migration.

Contoh:

```text
migration/
├── 001_create_students
├── 002_create_programs
├── 003_create_student_programs
└── 004_create_academic_years
```

---

# 36. API VERSIONING

Gunakan versioning:

```text
/api/v1/
```

Jika terjadi perubahan breaking:

```text
/api/v2/
```

Jangan merusak API existing secara sembarangan.

---

# 37. TESTING PRINCIPLE

Testing dilakukan bertahap.

Minimal:

```text
Unit Test
Integration Test
API Test
Authorization Test
Business Rule Test
```

Critical flow wajib diuji.

Contoh:

```text
Duplicate NIK
Program Transfer
Active Program
Status Change
Unauthorized Access
```

---

# 38. DEVELOPMENT WORKFLOW

Setiap feature mengikuti:

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
UI
   ↓
Test
   ↓
Review
```

Jangan langsung membuat UI sebelum memahami business rule.

---

# 39. FEATURE DEVELOPMENT RULE

Setiap feature harus memiliki:

```text
Purpose
Input
Output
Permission
Business Rule
Database Impact
API
UI
Validation
Test
```

---

# 40. GIT PRINCIPLE

Gunakan Git untuk seluruh source code.

Commit harus jelas.

Contoh:

```text
feat: add student creation
feat: add program history
fix: prevent duplicate nik
fix: correct active program calculation
refactor: simplify student service
test: add student authorization tests
docs: update database documentation
```

Hindari:

```text
update
fix
test
baru
coba
final
final2
fixbanget
```

---

# 41. ENVIRONMENT

Pisahkan environment:

```text
development
testing
production
```

Secret tidak boleh masuk Git.

Contoh:

```text
.env
.env.local
```

harus masuk `.gitignore` sesuai kebutuhan.

Gunakan:

```text
.env.example
```

untuk dokumentasi variable yang diperlukan tanpa secret.

---

# 42. NO SECRET IN SOURCE CODE

Dilarang menyimpan:

```text
Database password
API secret
JWT secret
Private key
Encryption key
Third-party credentials
```

langsung dalam source code.

---

# 43. LOGGING

Log harus membantu debugging tanpa membocorkan data sensitif.

Jangan:

```text
console.log(student)
```

jika object berisi:

```text
NIK
phone
email
```

Gunakan structured logging dan hanya log informasi yang diperlukan.

---

# 44. DOCUMENTATION HIERARCHY

Dokumentasi utama:

```text
PROJECT.md
    ↓
ARCHITECTURE.md
    ↓
DATABASE.md
    ↓
BUSINESS_RULES.md
    ↓
RBAC.md
    ↓
API_SPEC.md
    ↓
UI_GUIDELINES.md
    ↓
AI_RULES.md
    ↓
TASKS.md
```

Setiap dokumen memiliki tanggung jawab masing-masing.

---

# 45. DOCUMENTATION RULE

Jika implementation berubah dan mempengaruhi:

```text
Database
API
Business Rule
RBAC
Architecture
UI
```

dokumentasi terkait harus diperbarui.

Kode dan dokumentasi tidak boleh berjalan sendiri-sendiri.

---

# 46. AI DEVELOPMENT RULE

AI coding assistant harus membaca:

```text
PROJECT.md
ARCHITECTURE.md
DATABASE.md
BUSINESS_RULES.md
RBAC.md
API_SPEC.md
UI_GUIDELINES.md
AI_RULES.md
```

sebelum melakukan perubahan besar.

AI tidak boleh membuat keputusan architecture penting berdasarkan asumsi.

---

# 47. AI MUST NOT

AI tidak boleh:

```text
Mengubah schema database tanpa alasan
Menghapus business rule
Menghapus authorization
Menghapus validation
Membuat endpoint baru tanpa dokumentasi
Membuat permission baru tanpa RBAC update
Mengubah design system sembarangan
Mengekspos sensitive data
Menghapus history siswa
```

---

# 48. SOURCE OF TRUTH

Jika terjadi konflik:

```text
Database structure
→ DATABASE.md

Business behavior
→ BUSINESS_RULES.md

Authorization
→ RBAC.md

API contract
→ API_SPEC.md

Architecture
→ ARCHITECTURE.md

UI behavior
→ UI_GUIDELINES.md
```

Jika dokumentasi bertentangan, jangan menebak.

Lakukan review dan update dokumentasi sebelum implementation besar.

---

# 49. NON-GOALS MVP

MVP M-CORE tidak langsung mencakup seluruh sistem organisasi.

Contoh fitur yang tidak menjadi prioritas awal:

```text
Accounting
Payroll
Inventory
CRM
Marketing
Full HR System
Advanced Reporting
Mobile Native App
AI Analytics
```

Fitur tersebut dapat dipertimbangkan setelah core student system stabil.

---

# 50. FUTURE EXTENSION

M-CORE harus memungkinkan pengembangan ke:

```text
Student Management
        ↓
Program Management
        ↓
Academic Management
        ↓
Alumni Management
        ↓
Parent / Guardian
        ↓
Finance
        ↓
Document Management
        ↓
Reporting
        ↓
Analytics
```

Namun future feature tidak boleh membuat MVP menjadi terlalu kompleks.

---

# 51. SUCCESS CRITERIA

M-CORE MVP dianggap berhasil jika:

```text
[ ] Setiap siswa memiliki Student ID unik
[ ] Tidak terjadi duplikasi siswa berdasarkan NIK
[ ] Profil siswa dapat dikelola
[ ] Student dapat dicari
[ ] Student dapat difilter
[ ] Riwayat program dapat disimpan
[ ] Riwayat program tidak hilang saat pindah program
[ ] Program aktif dapat ditentukan oleh sistem
[ ] Status siswa dapat dikelola
[ ] Authorization berjalan
[ ] Permission berjalan
[ ] Scope berjalan
[ ] API tervalidasi
[ ] Data sensitif terlindungi
[ ] Critical business rules memiliki test
[ ] Dokumentasi sesuai implementation
```

---

# 52. DEFINITION OF DONE

Feature dianggap selesai apabila:

```text
[ ] Requirement jelas
[ ] Business rule jelas
[ ] Database selesai
[ ] API selesai
[ ] Authorization selesai
[ ] Validation selesai
[ ] UI selesai
[ ] Loading state tersedia
[ ] Empty state tersedia
[ ] Error state tersedia
[ ] Success state tersedia
[ ] Test selesai
[ ] Security review selesai
[ ] Documentation diperbarui
```

---

# 53. PROJECT PRIORITY

Ketika harus memilih antara dua pekerjaan, gunakan urutan:

```text
1. Security
2. Data Integrity
3. Business Correctness
4. Reliability
5. Usability
6. Performance
7. Visual Enhancement
```

Jangan mengorbankan security atau data integrity demi tampilan.

---

# 54. CORE PHILOSOPHY

M-CORE dibangun dengan filosofi:

```text
ONE IDENTITY
ONE SOURCE OF TRUTH
COMPLETE HISTORY
CONTROLLED ACCESS
CLEAR ARCHITECTURE
SECURE BY DEFAULT
```

---

# 55. PROJECT NORTH STAR

Tujuan akhir M-CORE:

> **Menjadi pusat data perjalanan pendidikan siswa yang aman, terstruktur, dan dapat dipercaya, dari pertama kali siswa terdaftar hingga menjadi alumni.**

Model:

```text
                    M-CORE
                       │
              Central Student Data
                       │
          ┌────────────┼────────────┐
          │            │            │
       PROFILE      PROGRAM      ACADEMIC
          │            │            │
          │        HISTORY        │
          │            │            │
          └────────────┼────────────┘
                       │
                  STUDENT 360°
                       │
          ┌────────────┼────────────┐
          │            │            │
        ACTIVE      ALUMNI       HISTORY
```

---

# 56. FINAL PRINCIPLE

```text
M-CORE is not just a CRUD application.

M-CORE is a centralized identity
and educational journey management system.
```

Setiap keputusan development harus mempertahankan prinsip tersebut.

---

**End of `PROJECT.md`**
