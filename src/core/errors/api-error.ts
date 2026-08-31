/**
 * M-CORE — API Error Classes
 *
 * File ini mendefinisikan class error yang digunakan di seluruh API M-CORE.
 *
 * Tujuan:
 * - Membuat error yang terstruktur dan konsisten.
 * - Memisahkan HTTP error dari logic error.
 * - Mencegah bocornya informasi internal ke user (stack trace, SQL error, dll).
 * - Memudahkan error handling di route handlers.
 *
 * PENTING (Referensi: PROJECT.md §26, AI_RULES.md):
 * API TIDAK BOLEH mengirimkan ke user:
 *   - SQL query atau stack trace
 *   - Server path
 *   - Environment variable
 *   - Internal exception detail
 *
 * Referensi: ARCHITECTURE.md §ARCH-001, API_SPEC.md
 */

/**
 * Base class untuk semua API Error M-CORE.
 *
 * Setiap error memiliki:
 * - statusCode: HTTP status code
 * - code: Kode error internal M-CORE (contoh: STUDENT_NOT_FOUND)
 * - message: Pesan user-friendly (bahasa Indonesia/Inggris sesuai konteks)
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;

    // Fix untuk prototype chain di TypeScript
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

// =============================================================================
// 400 — Bad Request
// =============================================================================

/**
 * Error validasi input.
 * Digunakan ketika input dari user tidak memenuhi validasi Zod atau business rule.
 *
 * Contoh: format NIK salah, email tidak valid, field required kosong.
 */
export class ValidationError extends ApiError {
  public readonly details?: unknown;

  constructor(message: string, details?: unknown) {
    super(400, 'VALIDATION_ERROR', message);
    this.name = 'ValidationError';
    this.details = details;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

// =============================================================================
// 401 — Unauthorized
// =============================================================================

/**
 * Error autentikasi.
 * Digunakan ketika user belum login atau token tidak valid/expired.
 */
export class UnauthorizedError extends ApiError {
  constructor(message = 'Autentikasi diperlukan. Silakan login terlebih dahulu.') {
    super(401, 'UNAUTHORIZED', message);
    this.name = 'UnauthorizedError';
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

// =============================================================================
// 403 — Forbidden
// =============================================================================

/**
 * Error otorisasi.
 * Digunakan ketika user sudah login tetapi tidak memiliki permission/scope
 * untuk melakukan tindakan yang diminta.
 *
 * Referensi: RBAC.md — Default Deny principle
 */
export class ForbiddenError extends ApiError {
  constructor(message = 'Anda tidak memiliki izin untuk melakukan tindakan ini.') {
    super(403, 'FORBIDDEN', message);
    this.name = 'ForbiddenError';
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

// =============================================================================
// 404 — Not Found
// =============================================================================

/**
 * Error resource tidak ditemukan.
 */
export class NotFoundError extends ApiError {
  constructor(resource = 'Data', message?: string) {
    super(404, 'NOT_FOUND', message ?? `${resource} tidak ditemukan.`);
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

// =============================================================================
// 409 — Conflict
// =============================================================================

/**
 * Error konflik data.
 * Digunakan ketika terjadi duplikasi yang melanggar unique constraint.
 *
 * Contoh utama M-CORE:
 * - DUPLICATE_NIK: NIK sudah digunakan siswa lain
 * - DUPLICATE_EMAIL: Email sudah digunakan siswa lain
 * - ACTIVE_PROGRAM_CONFLICT: Siswa sudah memiliki program aktif pada periode yang sama
 */
export class ConflictError extends ApiError {
  constructor(code: string, message: string) {
    super(409, code, message);
    this.name = 'ConflictError';
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

// =============================================================================
// 422 — Unprocessable Entity
// =============================================================================

/**
 * Error business rule.
 * Digunakan ketika input valid secara format, tetapi melanggar business rule.
 *
 * Contoh: mencoba promote siswa yang berstatus INACTIVE,
 * transfer program tapi tidak ada program aktif.
 */
export class BusinessRuleError extends ApiError {
  constructor(code: string, message: string) {
    super(422, code, message);
    this.name = 'BusinessRuleError';
    Object.setPrototypeOf(this, BusinessRuleError.prototype);
  }
}

// =============================================================================
// 500 — Internal Server Error
// =============================================================================

/**
 * Error server internal.
 * Digunakan sebagai fallback untuk error yang tidak terduga.
 *
 * PENTING: Jangan pernah expose detail internal error ke user.
 * Log error di server, kirim pesan generik ke user.
 */
export class InternalServerError extends ApiError {
  constructor(message = 'Terjadi kesalahan sistem. Silakan coba lagi atau hubungi administrator.') {
    super(500, 'INTERNAL_SERVER_ERROR', message);
    this.name = 'InternalServerError';
    Object.setPrototypeOf(this, InternalServerError.prototype);
  }
}

// =============================================================================
// ERROR CODES CATALOG
// Kode error yang umum digunakan di M-CORE
// =============================================================================

/**
 * Katalog kode error M-CORE.
 * Gunakan konstanta ini alih-alih menulis string langsung.
 */
export const ERROR_CODES = {
  // Student errors
  STUDENT_NOT_FOUND: 'STUDENT_NOT_FOUND',
  STUDENT_DUPLICATE_NIK: 'STUDENT_DUPLICATE_NIK',
  STUDENT_DUPLICATE_EMAIL: 'STUDENT_DUPLICATE_EMAIL',
  STUDENT_STATUS_INVALID_TRANSITION: 'STUDENT_STATUS_INVALID_TRANSITION',

  // Program errors
  PROGRAM_NOT_FOUND: 'PROGRAM_NOT_FOUND',
  PROGRAM_INACTIVE: 'PROGRAM_INACTIVE',
  PROGRAM_DUPLICATE_CODE: 'PROGRAM_DUPLICATE_CODE',

  // Program History errors
  PROGRAM_HISTORY_NOT_FOUND: 'PROGRAM_HISTORY_NOT_FOUND',
  PROGRAM_HISTORY_DUPLICATE: 'PROGRAM_HISTORY_DUPLICATE',
  ACTIVE_PROGRAM_NOT_FOUND: 'ACTIVE_PROGRAM_NOT_FOUND',
  ACTIVE_PROGRAM_CONFLICT: 'ACTIVE_PROGRAM_CONFLICT',

  // Auth errors
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',

  // RBAC errors
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  SCOPE_DENIED: 'SCOPE_DENIED',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
