# M-CORE

## MUMTAZA CORE

### Central Student & Education Management System

**Document:** `API_SPEC.md`
**Version:** `1.0.0`
**Status:** Baseline API Contract
**Related Documents:** `DATABASE.md`, `BUSINESS_RULES.md`, `RBAC.md`, `ARCHITECTURE.md`

> **One Student. One Identity. One Centralized System.**

---

# 1. Tujuan

`API_SPEC.md` adalah kontrak komunikasi antara:

```text
Frontend
   ↕
REST API
   ↕
Backend
   ↕
Database
```

Dokumen ini mendefinisikan:

* endpoint;
* HTTP method;
* authentication;
* authorization;
* permission;
* scope;
* request;
* response;
* validation;
* error response;
* pagination;
* filtering;
* sorting;
* security;
* transaction behavior.

Developer harus menganggap dokumen ini sebagai **API contract**.

---

# 2. API Architecture

M-CORE menggunakan REST API.

Base URL:

```text
/api/v1
```

Contoh:

```text
/api/v1/students
/api/v1/programs
/api/v1/auth/login
```

Struktur umum:

```text
/api
└── /v1
    ├── /auth
    ├── /users
    ├── /roles
    ├── /permissions
    ├── /scopes
    ├── /students
    ├── /programs
    ├── /program-history
    ├── /academic
    ├── /attendance
    ├── /grades
    ├── /schedules
    ├── /reports
    └── /audit-logs
```

---

# 3. HTTP Methods

| Method   | Fungsi                            |
| -------- | --------------------------------- |
| `GET`    | Membaca data                      |
| `POST`   | Membuat data / menjalankan action |
| `PUT`    | Mengganti resource secara penuh   |
| `PATCH`  | Mengubah sebagian resource        |
| `DELETE` | Menghapus resource                |

Untuk data penting M-CORE, penggunaan `DELETE` harus sangat terbatas.

---

# 4. Authentication

Endpoint yang membutuhkan login harus menggunakan:

```text
Authorization: Bearer <access_token>
```

Contoh:

```http
Authorization: Bearer eyJ...
```

Endpoint public:

```text
POST /api/v1/auth/login
POST /api/v1/auth/refresh
```

Endpoint lainnya secara default membutuhkan authentication.

---

# 5. Authorization

Setelah authentication:

```text
Request
   ↓
Authenticate
   ↓
User
   ↓
Role
   ↓
Permission
   ↓
Scope
   ↓
Business Rules
   ↓
Database
```

Authorization mengikuti:

```text
RBAC.md
```

---

# 6. Authorization Formula

```text
ALLOW =
Authenticated
AND
Has Permission
AND
Scope Matches
AND
Business Rule Allows
```

Jika salah satu gagal:

```text
403 FORBIDDEN
```

---

# 7. Standard Response Format

Response sukses menggunakan:

```json
{
  "success": true,
  "data": {},
  "meta": null
}
```

Response collection:

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 100,
    "total_pages": 5
  }
}
```

---

# 8. Standard Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": null
  }
}
```

Contoh:

```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_NIK",
    "message": "NIK is already registered.",
    "details": {
      "field": "nik"
    }
  }
}
```

---

# 9. HTTP Status Codes

|  Code | Meaning               |
| ----: | --------------------- |
| `200` | Success               |
| `201` | Created               |
| `204` | Success without body  |
| `400` | Bad Request           |
| `401` | Unauthenticated       |
| `403` | Forbidden             |
| `404` | Not Found             |
| `409` | Conflict              |
| `422` | Validation Error      |
| `429` | Too Many Requests     |
| `500` | Internal Server Error |

---

# 10. API Versioning

Versi API berada di URL:

```text
/api/v1
```

Jika terjadi breaking change:

```text
/api/v2
```

Jangan mengubah behavior breaking pada `/v1` tanpa migration strategy.

---

# 11. Authentication API

## POST `/auth/login`

Login user.

### Permission

```text
PUBLIC
```

### Request

```json
{
  "email": "admin@example.com",
  "password": "password"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "access_token": "jwt-token",
    "refresh_token": "refresh-token",
    "expires_in": 3600,
    "user": {
      "user_id": "uuid",
      "name": "Admin M-CORE",
      "email": "admin@example.com"
    }
  }
}
```

### Errors

```text
INVALID_CREDENTIALS
ACCOUNT_INACTIVE
ACCOUNT_LOCKED
TOO_MANY_ATTEMPTS
```

---

# 12. POST `/auth/refresh`

Memperbarui access token.

### Permission

```text
Authenticated Refresh Token
```

### Request

```json
{
  "refresh_token": "refresh-token"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "access_token": "new-access-token",
    "expires_in": 3600
  }
}
```

---

# 13. POST `/auth/logout`

Logout user.

### Permission

```text
Authenticated
```

### Response

```json
{
  "success": true,
  "data": null
}
```

Server harus mencabut/invalidasi refresh session sesuai implementasi authentication.

---

# 14. GET `/auth/me`

Mengambil user yang sedang login.

### Permission

```text
Authenticated
```

### Response

```json
{
  "success": true,
  "data": {
    "user_id": "uuid",
    "name": "Admin M-CORE",
    "email": "admin@example.com",
    "roles": [
      "ADMIN"
    ],
    "permissions": [
      "student.view",
      "student.create",
      "student.update"
    ],
    "scopes": [
      {
        "type": "unit",
        "value": "MTs"
      }
    ]
  }
}
```

---

# 15. Student API

Base:

```text
/api/v1/students
```

---

# 16. GET `/students`

Mengambil daftar siswa.

### Permission

```text
student.view
```

### Scope

Scope user diterapkan.

### Query Parameters

```text
page
per_page
search
status
gender
program_id
academic_year
sort
order
```

Contoh:

```text
GET /api/v1/students?page=1&per_page=20&search=Ahmad&status=active
```

### Response

```json
{
  "success": true,
  "data": [
    {
      "student_id": "uuid",
      "full_name": "Ahmad Fulan",
      "gender": "male",
      "birth_place": "Surabaya",
      "birth_date": "2010-05-12",
      "status": "active"
    }
  ],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 1,
    "total_pages": 1
  }
}
```

Data sensitif hanya dikembalikan jika permission:

```text
student.view_sensitive
```

---

# 17. Student Search

Endpoint:

```text
GET /students?search=Ahmad
```

Pencarian dapat menggunakan:

```text
full_name
student_id
NIK
phone
```

Namun pencarian terhadap data sensitif harus tunduk pada:

```text
student.view_sensitive
```

---

# 18. GET `/students/{student_id}`

Mengambil detail satu siswa.

### Permission

```text
student.view
```

### Scope

Wajib sesuai scope user.

### Response

```json
{
  "success": true,
  "data": {
    "student_id": "uuid",
    "full_name": "Ahmad Fulan",
    "gender": "male",
    "birth_place": "Surabaya",
    "birth_date": "2010-05-12",
    "status": "active",
    "active_program": {
      "program_id": "uuid",
      "program_name": "MTs",
      "academic_year": "2026/2027",
      "class_name": "IX"
    }
  }
}
```

---

# 19. Sensitive Student Fields

Field berikut dianggap sensitif:

```text
nik
email
phone
whatsapp
birth_date
```

Jika user tidak memiliki:

```text
student.view_sensitive
```

field sensitif harus:

* tidak dikirim; atau
* dimasking sesuai kebijakan.

Rekomendasi:

```json
{
  "full_name": "Ahmad Fulan",
  "status": "active"
}
```

bukan:

```json
{
  "nik": "1234567890123456"
}
```

---

# 20. POST `/students`

Membuat siswa baru.

### Permission

```text
student.create
```

### Request

```json
{
  "full_name": "Ahmad Fulan",
  "gender": "male",
  "birth_place": "Surabaya",
  "birth_date": "2010-05-12",
  "nik": "1234567890123456",
  "email": "ahmad@example.com",
  "phone": "081234567890",
  "whatsapp": "081234567890",
  "status": "active"
}
```

### Response

HTTP:

```text
201 Created
```

```json
{
  "success": true,
  "data": {
    "student_id": "uuid",
    "full_name": "Ahmad Fulan",
    "status": "active"
  }
}
```

---

# 21. Create Student Validation

Backend wajib memvalidasi:

```text
full_name required
gender valid
birth_date valid
nik valid
email valid
phone valid
status valid
```

Jika NIK sudah digunakan:

```text
409 CONFLICT
```

Code:

```text
DUPLICATE_NIK
```

---

# 22. PATCH `/students/{student_id}`

Mengubah data profil siswa.

### Permission

```text
student.update
```

### Scope

Wajib match.

### Request

```json
{
  "full_name": "Ahmad Fulan Updated",
  "phone": "081299999999"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "student_id": "uuid",
    "full_name": "Ahmad Fulan Updated",
    "phone": "081299999999"
  }
}
```

---

# 23. NIK Update

Mengubah NIK harus melakukan:

```text
student.update
+
duplicate NIK validation
```

Jika NIK telah digunakan:

```text
409 DUPLICATE_NIK
```

Perubahan NIK harus dicatat dalam audit log.

---

# 24. Student Status API

## PATCH `/students/{student_id}/status`

Mengubah status siswa.

### Permission

```text
student.update
```

### Request

```json
{
  "status": "inactive",
  "reason": "Tidak melanjutkan program"
}
```

### Valid Status

```text
active
inactive
alumni
```

### Response

```json
{
  "success": true,
  "data": {
    "student_id": "uuid",
    "status": "inactive"
  }
}
```

Perubahan harus mengikuti:

```text
BUSINESS_RULES.md
```

---

# 25. Student Promotion API

## POST `/students/{student_id}/promote`

Menaikkan siswa ke periode/kelas berikutnya.

### Permission

```text
student.promote
```

### Scope

Harus sesuai dengan program/unit siswa.

### Request

```json
{
  "target_academic_year": "2026/2027",
  "target_class": "VIII"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "student_id": "uuid",
    "previous": {
      "academic_year": "2025/2026",
      "class_name": "VII",
      "status": "completed"
    },
    "current": {
      "academic_year": "2026/2027",
      "class_name": "VIII",
      "status": "enrolled"
    }
  }
}
```

---

# 26. Promotion Business Rules

Backend harus memeriksa:

```text
student exists
student active
current program exists
current enrollment valid
target academic year valid
target class valid
duplicate history = false
```

Promotion harus dijalankan dalam:

```text
DATABASE TRANSACTION
```

Jika gagal:

```text
ROLLBACK
```

---

# 27. Program Transfer API

## POST `/students/{student_id}/transfer`

Memindahkan siswa ke program lain.

### Permission

```text
student.transfer
```

### Request

```json
{
  "from_program_id": "uuid",
  "to_program_id": "uuid",
  "academic_year": "2026/2027",
  "reason": "Melanjutkan ke program Pra-Univ"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "student_id": "uuid",
    "previous_program": {
      "program_id": "uuid",
      "status": "transferred"
    },
    "new_program": {
      "program_id": "uuid",
      "status": "enrolled"
    }
  }
}
```

---

# 28. Transfer Validation

Backend harus memvalidasi:

```text
student exists
source program exists
destination program exists
destination program active
user has scope
source enrollment valid
duplicate target history = false
```

Transfer menggunakan transaction.

---

# 29. Mark Alumni API

## POST `/students/{student_id}/mark-alumni`

### Permission

```text
student.mark_alumni
```

### Request

```json
{
  "graduation_date": "2027-06-30",
  "reason": "Lulus program"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "student_id": "uuid",
    "status": "alumni"
  }
}
```

---

# 30. Alumni Validation

Sistem harus memastikan:

```text
student exists
permission valid
scope valid
student eligible
active program completed
```

Jika tidak memenuhi:

```text
422 INVALID_ALUMNI_TRANSITION
```

---

# 31. Student Merge API

## POST `/students/merge`

Operasi menggabungkan dua student record.

### Permission

```text
student.merge
```

### Request

```json
{
  "source_student_id": "uuid-source",
  "target_student_id": "uuid-master",
  "reason": "Duplicate student record"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "master_student_id": "uuid-master",
    "merged_student_id": "uuid-source",
    "status": "merged"
  }
}
```

Operasi ini harus:

* menggunakan transaction;
* memindahkan seluruh relasi yang diperbolehkan;
* mencatat audit;
* tidak menghapus histori secara sembarangan.

---

# 32. Program API

Base:

```text
/api/v1/programs
```

---

# 33. GET `/programs`

### Permission

```text
program.view
```

### Response

```json
{
  "success": true,
  "data": [
    {
      "program_id": "uuid",
      "program_code": "MTS",
      "program_name": "MTs",
      "is_active": true
    }
  ],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 1,
    "total_pages": 1
  }
}
```

---

# 34. GET `/programs/{program_id}`

### Permission

```text
program.view
```

Mengambil detail program.

---

# 35. POST `/programs`

### Permission

```text
program.create
```

### Request

```json
{
  "program_code": "PRA-UNIV",
  "program_name": "Pra-Univ",
  "description": "Program persiapan universitas"
}
```

### Response

```text
201 Created
```

---

# 36. PATCH `/programs/{program_id}`

### Permission

```text
program.update
```

Contoh:

```json
{
  "program_name": "Pra-Univ Intensif"
}
```

---

# 37. Program Deactivation

Tidak menggunakan:

```text
DELETE /programs/{id}
```

sebagai operasi normal.

Gunakan:

```text
PATCH /programs/{id}
```

```json
{
  "is_active": false
}
```

History siswa tetap aman.

---

# 38. Program History API

Base:

```text
/api/v1/students/{student_id}/program-history
```

---

# 39. GET Program History

## GET `/students/{student_id}/program-history`

### Permission

```text
program_history.view
```

### Response

```json
{
  "success": true,
  "data": [
    {
      "history_id": "uuid",
      "program_id": "uuid",
      "program_name": "MTs",
      "academic_year": "2024/2025",
      "class_name": "VII",
      "status": "completed",
      "start_date": "2024-07-01",
      "end_date": "2025-06-30"
    },
    {
      "history_id": "uuid",
      "program_id": "uuid",
      "program_name": "MTs",
      "academic_year": "2025/2026",
      "class_name": "VIII",
      "status": "enrolled"
    }
  ]
}
```

---

# 40. POST Program History

## POST `/students/{student_id}/program-history`

### Permission

```text
program_history.create
```

### Request

```json
{
  "program_id": "uuid",
  "academic_year": "2026/2027",
  "class_name": "IX",
  "status": "enrolled",
  "start_date": "2026-07-01"
}
```

### Validation

Tidak boleh terdapat duplicate:

```text
student_id
+
program_id
+
academic_year
```

---

# 41. PATCH Program History

## PATCH `/students/{student_id}/program-history/{history_id}`

### Permission

```text
program_history.update
```

Perubahan history harus mengikuti:

```text
BUSINESS_RULES.md
```

Perubahan sensitif harus dicatat dalam audit log.

---

# 42. Active Program API

## GET `/students/{student_id}/active-program`

### Permission

```text
student.view
```

### Response

```json
{
  "success": true,
  "data": {
    "program_id": "uuid",
    "program_name": "MTs",
    "academic_year": "2026/2027",
    "class_name": "IX",
    "status": "enrolled"
  }
}
```

Jika tidak ada:

```json
{
  "success": true,
  "data": null
}
```

---

# 43. Active Program Logic

Backend mencari:

```text
status = enrolled
```

dengan:

```text
student.status = active
```

Jika lebih dari satu dan sistem belum mendukung multiple active program:

```text
409 ACTIVE_PROGRAM_CONFLICT
```

---

# 44. Academic API

Base:

```text
/api/v1/academic
```

Modul:

```text
academic
├── attendance
├── grades
└── schedules
```

---

# 45. Attendance API

## GET `/attendance`

### Permission

```text
attendance.view
```

### Scope

```text
class
program
unit
```

sesuai permission user.

---

## POST `/attendance`

### Permission

```text
attendance.create
```

### Request

```json
{
  "student_id": "uuid",
  "date": "2026-08-31",
  "status": "present",
  "notes": null
}
```

### Valid Status

```text
present
absent
late
excused
```

---

# 46. Grades API

## GET `/grades`

### Permission

```text
grades.view
```

## POST `/grades`

### Permission

```text
grades.create
```

### Request

```json
{
  "student_id": "uuid",
  "subject_id": "uuid",
  "academic_year": "2026/2027",
  "score": 85
}
```

Backend memvalidasi:

```text
student exists
subject exists
scope valid
score valid
```

---

# 47. Schedule API

## GET `/schedules`

### Permission

```text
schedule.view
```

Response:

```json
{
  "success": true,
  "data": [
    {
      "schedule_id": "uuid",
      "day": "Monday",
      "start_time": "08:00",
      "end_time": "09:30",
      "subject": "Mathematics",
      "class": "IX-A"
    }
  ]
}
```

---

# 48. User API

Base:

```text
/api/v1/users
```

---

# 49. GET `/users`

### Permission

```text
rbac.user.view
```

Tidak semua user boleh melihat daftar user sistem.

---

# 50. POST `/users`

### Permission

```text
rbac.user.create
```

Request:

```json
{
  "name": "Ahmad Admin",
  "email": "ahmad@example.com",
  "role_ids": [
    "uuid"
  ]
}
```

Password harus diproses secara aman.

---

# 51. PATCH `/users/{user_id}`

### Permission

```text
rbac.user.update
```

Tidak boleh digunakan untuk privilege escalation oleh user biasa.

---

# 52. Role API

Base:

```text
/api/v1/roles
```

Permission:

```text
rbac.role.view
rbac.role.create
rbac.role.update
rbac.role.delete
```

---

# 53. Permission API

Base:

```text
/api/v1/permissions
```

Permission:

```text
rbac.permission.view
rbac.permission.manage
```

Permission system sebaiknya tidak dapat dihapus jika sudah digunakan oleh role tanpa proses dependency check.

---

# 54. Scope API

Base:

```text
/api/v1/scopes
```

Permission:

```text
rbac.scope.view
rbac.scope.manage
```

Scope dapat berupa:

```text
all
unit
program
class
own
assigned
```

---

# 55. Assign Role API

## POST `/users/{user_id}/roles`

### Permission

```text
rbac.user.assign_role
```

### Request

```json
{
  "role_id": "uuid",
  "scope_ids": [
    "uuid"
  ]
}
```

System harus memastikan pemberi role memiliki hak untuk memberikan role tersebut.

---

# 56. Remove Role API

## DELETE `/users/{user_id}/roles/{role_id}`

### Permission

```text
rbac.user.assign_role
```

Harus dicatat dalam audit log.

---

# 57. Reports API

Base:

```text
/api/v1/reports
```

Contoh:

```text
GET /reports/students
GET /reports/programs
GET /reports/alumni
GET /reports/academic
```

Permission:

```text
report.student
report.program
report.alumni
report.academic
```

Scope tetap berlaku.

---

# 58. Export API

Export harus menggunakan permission khusus.

Contoh:

```text
GET /students/export
```

Permission:

```text
student.export
```

Untuk field sensitif:

```text
student.export_sensitive
```

`student.view` tidak otomatis memberikan hak export.

---

# 59. Bulk API

Bulk action harus eksplisit.

Contoh:

```text
POST /students/bulk-promote
POST /students/bulk-transfer
POST /students/bulk-update
```

Permission:

```text
student.bulk_promote
student.bulk_transfer
student.bulk_update
```

---

# 60. Pagination

Default:

```text
page = 1
per_page = 20
```

Maximum:

```text
per_page = 100
```

Request:

```text
?page=2&per_page=50
```

Jika user meminta:

```text
per_page=10000
```

backend harus membatasi:

```text
100
```

atau menolak request.

---

# 61. Filtering

Filter menggunakan query parameter.

Contoh:

```text
GET /students
?status=active
&gender=male
&program_id=uuid
&academic_year=2026/2027
```

Backend harus memvalidasi setiap filter.

---

# 62. Sorting

Format:

```text
?sort=full_name&order=asc
```

Hanya field yang diizinkan yang boleh digunakan untuk sorting.

Jangan memasukkan parameter sorting langsung ke SQL tanpa whitelist.

---

# 63. Search Security

Search harus menggunakan parameterized query.

Jangan:

```text
SQL string concatenation
```

Gunakan:

```text
prepared statement
ORM parameter
query builder
```

sesuai stack yang digunakan.

---

# 64. Rate Limiting

Minimal rate limit untuk:

```text
/auth/login
/auth/refresh
```

Endpoint sensitif lainnya juga dapat menggunakan rate limit.

Contoh:

```text
POST /auth/login
```

harus memiliki perlindungan brute-force.

---

# 65. Input Validation

Semua input API harus divalidasi backend.

Frontend validation bukan security boundary.

Flow:

```text
Client
   ↓
API
   ↓
Schema Validation
   ↓
Authorization
   ↓
Business Rule
   ↓
Service
   ↓
Database
```

---

# 66. Request Validation

Request harus menolak:

* field tidak dikenal jika endpoint menggunakan strict schema;
* tipe data salah;
* enum tidak valid;
* UUID invalid;
* tanggal invalid;
* nilai numerik di luar range;
* string melebihi panjang maksimum.

---

# 67. Mass Assignment Protection

Backend tidak boleh menerima semua field database secara otomatis.

Contoh request berbahaya:

```json
{
  "full_name": "Ahmad",
  "status": "alumni",
  "created_at": "2020-01-01"
}
```

Jika endpoint hanya boleh mengubah nama:

```text
created_at
status
```

harus diabaikan atau ditolak.

Gunakan DTO/schema yang eksplisit.

---

# 68. IDOR Protection

M-CORE harus mencegah:

```text
GET /students/{student_id}
```

mengakses student lain hanya karena user mengetahui UUID.

Setiap resource harus melewati:

```text
permission
+
scope
```

Contoh:

```text
Operator MTs
```

tidak boleh mengakses:

```text
Pra-Univ student
```

dengan mengganti UUID.

---

# 69. Sensitive Field Protection

Jangan mengembalikan seluruh object database secara otomatis.

Buruk:

```text
return student;
```

Lebih aman:

```text
return StudentResponseDTO(student);
```

DTO menentukan field yang boleh keluar.

---

# 70. Database Transaction API

Endpoint berikut wajib menggunakan transaction:

```text
POST /students/{id}/promote
POST /students/{id}/transfer
POST /students/merge
POST /students/{id}/mark-alumni
```

---

# 71. Idempotency

Action tertentu harus mencegah eksekusi ganda.

Contoh:

```text
POST /students/STU-001/promote
```

Jika request dikirim dua kali karena user menekan tombol dua kali:

```text
Request #1 → SUCCESS
Request #2 → DUPLICATE / SAFE RESPONSE
```

Jangan membuat dua program history.

---

# 72. Recommended Idempotency Key

Untuk operation sensitif:

```http
Idempotency-Key: unique-request-id
```

Backend menyimpan hasil request sesuai kebijakan.

---

# 73. Concurrency Protection

Promotion dan transfer harus menangani race condition.

Contoh:

```text
Admin A → Promote
Admin B → Promote
```

Tidak boleh menghasilkan dua history aktif.

Gunakan:

* database transaction;
* unique constraint;
* row locking bila diperlukan;
* idempotency.

---

# 74. Optimistic Locking

Untuk resource yang sering diedit, dapat digunakan:

```text
version
updated_at
```

Contoh:

```text
PATCH /students/{id}
```

Jika data sudah berubah sejak user membuka halaman:

```text
409 RESOURCE_VERSION_CONFLICT
```

Ini mencegah overwrite perubahan user lain.

---

# 75. Audit API

Audit log tidak boleh bebas dimanipulasi oleh user biasa.

Base:

```text
/api/v1/audit-logs
```

### GET `/audit-logs`

Permission:

```text
audit.view
```

Filter:

```text
user_id
action
resource
resource_id
date_from
date_to
```

---

# 76. Audit Event Example

```json
{
  "action": "STUDENT_TRANSFER",
  "resource": "student",
  "resource_id": "uuid",
  "user_id": "uuid",
  "result": "success",
  "timestamp": "2026-08-31T10:00:00Z"
}
```

---

# 77. Error Code Catalog

## Authentication

```text
INVALID_CREDENTIALS
ACCOUNT_INACTIVE
ACCOUNT_LOCKED
TOKEN_EXPIRED
TOKEN_INVALID
```

## Authorization

```text
UNAUTHENTICATED
FORBIDDEN
SCOPE_DENIED
```

## Student

```text
STUDENT_NOT_FOUND
DUPLICATE_NIK
DUPLICATE_EMAIL
DUPLICATE_STUDENT
INVALID_STUDENT_STATUS
INVALID_STATUS_TRANSITION
```

## Program

```text
PROGRAM_NOT_FOUND
PROGRAM_INACTIVE
DUPLICATE_PROGRAM
```

## Program History

```text
HISTORY_NOT_FOUND
DUPLICATE_PROGRAM_HISTORY
ACTIVE_PROGRAM_CONFLICT
INVALID_ACADEMIC_YEAR
```

## Academic

```text
ATTENDANCE_NOT_FOUND
GRADE_NOT_FOUND
INVALID_GRADE
SCHEDULE_NOT_FOUND
```

## Operation

```text
INVALID_PROMOTION
INVALID_PROGRAM_TRANSFER
INVALID_ALUMNI_TRANSITION
RESOURCE_VERSION_CONFLICT
DUPLICATE_OPERATION
```

---

# 78. API Security Checklist

Setiap endpoint harus melewati checklist:

```text
[ ] Authentication
[ ] Permission
[ ] Scope
[ ] Input validation
[ ] Business rule
[ ] Database constraint
[ ] Sensitive data filtering
[ ] Audit requirement
[ ] Rate limit if required
[ ] Transaction if required
```

---

# 79. Endpoint Authorization Matrix

| Endpoint                                          | Permission               |
| ------------------------------------------------- | ------------------------ |
| `GET /students`                                   | `student.view`           |
| `GET /students/:id`                               | `student.view`           |
| `POST /students`                                  | `student.create`         |
| `PATCH /students/:id`                             | `student.update`         |
| `PATCH /students/:id/status`                      | `student.update`         |
| `POST /students/:id/promote`                      | `student.promote`        |
| `POST /students/:id/transfer`                     | `student.transfer`       |
| `POST /students/:id/mark-alumni`                  | `student.mark_alumni`    |
| `POST /students/merge`                            | `student.merge`          |
| `GET /programs`                                   | `program.view`           |
| `POST /programs`                                  | `program.create`         |
| `PATCH /programs/:id`                             | `program.update`         |
| `GET /students/:id/program-history`               | `program_history.view`   |
| `POST /students/:id/program-history`              | `program_history.create` |
| `PATCH /students/:id/program-history/:history_id` | `program_history.update` |
| `GET /attendance`                                 | `attendance.view`        |
| `POST /attendance`                                | `attendance.create`      |
| `GET /grades`                                     | `grades.view`            |
| `POST /grades`                                    | `grades.create`          |
| `GET /schedules`                                  | `schedule.view`          |
| `GET /users`                                      | `rbac.user.view`         |
| `POST /users`                                     | `rbac.user.create`       |
| `GET /roles`                                      | `rbac.role.view`         |
| `GET /permissions`                                | `rbac.permission.view`   |
| `GET /audit-logs`                                 | `audit.view`             |

---

# 80. Endpoint Naming Rules

Gunakan plural noun:

```text
/students
/programs
/users
/roles
```

Bukan:

```text
/getStudents
/createStudent
/updateStudent
```

Untuk action khusus:

```text
POST /students/{id}/promote
POST /students/{id}/transfer
POST /students/{id}/mark-alumni
```

---

# 81. Response Naming

Gunakan `snake_case` secara konsisten jika database/API M-CORE menggunakan snake case.

Contoh:

```json
{
  "student_id": "uuid",
  "full_name": "Ahmad Fulan",
  "birth_date": "2010-05-12",
  "academic_year": "2026/2027"
}
```

Jangan mencampur:

```text
student_id
fullName
birthDate
```

dalam API yang sama.

---

# 82. Date & Time

Tanggal:

```text
YYYY-MM-DD
```

Contoh:

```text
2026-08-31
```

Datetime:

```text
ISO 8601
```

Contoh:

```text
2026-08-31T10:30:00Z
```

Simpan timestamp secara konsisten dan tentukan timezone pada level aplikasi/database.

---

# 83. UUID

Resource ID direkomendasikan menggunakan UUID.

Contoh:

```text
550e8400-e29b-41d4-a716-446655440000
```

Jangan menggunakan:

```text
student_id = NIK
```

NIK adalah business identifier, bukan primary key internal.

---

# 84. API Layer Architecture

Recommended:

```text
src/
├── api/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   └── validators/
│
├── modules/
│   ├── students/
│   ├── programs/
│   ├── academics/
│   ├── auth/
│   └── rbac/
│
├── services/
├── repositories/
├── database/
├── security/
└── shared/
```

Detail struktur folder mengikuti:

```text
ARCHITECTURE.md
```

---

# 85. Controller Rule

Controller hanya menangani:

```text
HTTP request
validation entry
calling service
HTTP response
```

Controller tidak boleh menjadi tempat business logic utama.

Buruk:

```text
controller
  └── 300 lines business logic
```

Lebih baik:

```text
Controller
    ↓
Service
    ↓
Repository
    ↓
Database
```

---

# 86. Service Rule

Business logic berada pada service.

Contoh:

```text
StudentService
PromotionService
TransferService
AlumniService
AuthorizationService
```

Contoh:

```text
PromotionService.promoteStudent()
```

bertanggung jawab terhadap aturan:

```text
validate
authorize
check history
create new history
transaction
audit
```

---

# 87. Repository Rule

Repository bertanggung jawab terhadap akses database.

Contoh:

```text
StudentRepository
ProgramRepository
ProgramHistoryRepository
UserRepository
```

Repository tidak boleh menentukan authorization.

---

# 88. Authorization Service

Authorization terpusat pada:

```text
AuthorizationService
```

Contoh:

```text
authorize(
  user,
  "student.transfer",
  student
)
```

Tidak membuat logic authorization berbeda-beda pada setiap controller.

---

# 89. Business Rule Separation

Pisahkan:

```text
Authentication
Authorization
Business Logic
Data Access
```

Arsitektur:

```text
Request
   ↓
Authentication
   ↓
Authorization
   ↓
Controller
   ↓
Service
   ↓
Business Rules
   ↓
Repository
   ↓
Database
```

---

# 90. API Development Rule

Setiap endpoint baru harus memiliki:

```text
1. Endpoint
2. HTTP method
3. Permission
4. Scope
5. Request schema
6. Response schema
7. Validation
8. Error codes
9. Business rules
10. Audit requirement
```

---

# 91. Definition of Done

API dianggap selesai apabila:

* [ ] Semua endpoint memiliki authorization.
* [ ] Semua endpoint menggunakan validation.
* [ ] Semua resource menggunakan scope bila diperlukan.
* [ ] Sensitive fields terlindungi.
* [ ] Duplicate NIK dicegah.
* [ ] Promotion transactional.
* [ ] Transfer transactional.
* [ ] Alumni transition tervalidasi.
* [ ] Student merge transactional.
* [ ] Bulk operation memiliki permission sendiri.
* [ ] Export memiliki permission sendiri.
* [ ] Audit log tersedia.
* [ ] IDOR protection tersedia.
* [ ] Mass assignment protection tersedia.
* [ ] Rate limiting tersedia untuk endpoint sensitif.
* [ ] Pagination memiliki maximum limit.
* [ ] Sorting menggunakan whitelist.
* [ ] Query menggunakan parameterization.
* [ ] Error format konsisten.
* [ ] API versioning tersedia.

---

# 92. Golden API Rules

## API-001

> Semua endpoint private membutuhkan authentication.

## API-002

> Authentication tidak sama dengan authorization.

## API-003

> Backend adalah security boundary.

## API-004

> Frontend tidak boleh dipercaya sebagai security layer.

## API-005

> Setiap endpoint harus memiliki permission yang jelas.

## API-006

> Permission harus dikombinasikan dengan scope.

## API-007

> Sensitive fields tidak boleh dikembalikan secara default.

## API-008

> NIK harus unique.

## API-009

> Promotion tidak membuat student baru.

## API-010

> Transfer tidak membuat student baru.

## API-011

> Historical data tidak boleh di-overwrite sembarangan.

## API-012

> Business action penting harus transactional.

## API-013

> Bulk action membutuhkan permission khusus.

## API-014

> Export membutuhkan permission khusus.

## API-015

> Semua input harus divalidasi backend.

## API-016

> Jangan melakukan mass assignment langsung ke database model.

## API-017

> Jangan mengandalkan UUID sebagai authorization.

## API-018

> Resource access harus melewati scope validation.

## API-019

> Sensitive action harus diaudit.

## API-020

> Jangan menambahkan endpoint baru tanpa memperbarui API contract.

---

# 93. Final API Architecture

```text
                        M-CORE API
                            │
                            ▼
                     /api/v1/*
                            │
             ┌──────────────┴──────────────┐
             ▼                             ▼
      Authentication                  Public API
             │
             ▼
      Authorization
             │
       Role → Permission
             │
             ▼
           Scope
             │
             ▼
      Input Validation
             │
             ▼
       Business Rules
             │
             ▼
          Service
             │
             ▼
        Repository
             │
             ▼
          Database
             │
             ▼
        Audit Log
```

M-CORE API harus selalu mempertahankan prinsip:

```text
IDENTITY
    ↓
AUTHENTICATION
    ↓
AUTHORIZATION
    ↓
SCOPE
    ↓
BUSINESS RULE
    ↓
DATA INTEGRITY
    ↓
AUDIT
```

---

**End of `API_SPEC.md`**
