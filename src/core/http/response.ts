/**
 * M-CORE — HTTP Response Helpers
 *
 * File ini menyediakan helper function untuk membuat response API yang
 * konsisten di seluruh M-CORE.
 *
 * Format response standar M-CORE:
 *
 * Success:
 * {
 *   "success": true,
 *   "data": { ... }
 * }
 *
 * Success dengan pagination:
 * {
 *   "success": true,
 *   "data": [ ... ],
 *   "meta": {
 *     "total": 100,
 *     "page": 1,
 *     "limit": 20,
 *     "totalPages": 5
 *   }
 * }
 *
 * Error:
 * {
 *   "success": false,
 *   "error": {
 *     "code": "STUDENT_NOT_FOUND",
 *     "message": "Siswa tidak ditemukan."
 *   }
 * }
 *
 * Referensi: API_SPEC.md §response-format, PROJECT.md §26
 */

import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import {
  ApiError,
  ValidationError,
  InternalServerError,
} from '@/core/errors/api-error';

// =============================================================================
// Response Types
// =============================================================================

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// =============================================================================
// Success Response Helpers
// =============================================================================

/**
 * Membuat response sukses standar M-CORE.
 *
 * Contoh penggunaan:
 * ```typescript
 * return successResponse({ id: '...', name: 'Ahmad' }, 200);
 * ```
 */
export function successResponse<T>(
  data: T,
  status: number = 200,
  meta?: PaginationMeta
): NextResponse<ApiSuccessResponse<T>> {
  const body: ApiSuccessResponse<T> = { success: true, data };
  if (meta) body.meta = meta;

  return NextResponse.json(body, { status });
}

/**
 * Response untuk pembuatan resource baru (201 Created).
 */
export function createdResponse<T>(data: T): NextResponse<ApiSuccessResponse<T>> {
  return successResponse(data, 201);
}

/**
 * Response untuk operasi yang berhasil tanpa data (204 No Content pattern
 * disederhanakan menjadi 200 dengan null karena Next.js lebih mudah handle).
 */
export function noContentResponse(): NextResponse<ApiSuccessResponse<null>> {
  return successResponse(null, 200);
}

// =============================================================================
// Error Response Helpers
// =============================================================================

/**
 * Membuat response error standar M-CORE.
 *
 * Contoh penggunaan:
 * ```typescript
 * return errorResponse('STUDENT_NOT_FOUND', 'Siswa tidak ditemukan.', 404);
 * ```
 */
export function errorResponse(
  code: string,
  message: string,
  status: number = 400,
  details?: unknown
): NextResponse<ApiErrorResponse> {
  const body: ApiErrorResponse = {
    success: false,
    error: { code, message },
  };

  // Hanya sertakan details jika bukan production (untuk debugging)
  // Di production, details tidak dikirim ke client
  if (details && process.env.NODE_ENV !== 'production') {
    body.error.details = details;
  }

  return NextResponse.json(body, { status });
}

// =============================================================================
// Error Handler — Catch-all untuk Route Handlers
// =============================================================================

/**
 * Handler error universal untuk Next.js Route Handlers.
 *
 * Gunakan di setiap route handler sebagai catch block:
 * ```typescript
 * export async function GET(request: Request) {
 *   try {
 *     // ... logic
 *   } catch (error) {
 *     return handleApiError(error);
 *   }
 * }
 * ```
 *
 * Handler ini:
 * 1. Menangani ApiError (error yang kita throw sendiri)
 * 2. Menangani ZodError (error validasi)
 * 3. Menangkap error lain dan TIDAK mengekspos detail internal
 * 4. Mencatat error ke server log
 *
 * Referensi: PROJECT.md §26, AI_RULES.md
 */
export function handleApiError(error: unknown): NextResponse<ApiErrorResponse> {
  // Error yang kita throw sendiri melalui ApiError classes
  if (error instanceof ApiError) {
    // Validasi error memiliki details tambahan
    if (error instanceof ValidationError) {
      return errorResponse(error.code, error.message, error.statusCode, error.details);
    }
    return errorResponse(error.code, error.message, error.statusCode);
  }

  // Zod validation error yang tidak di-catch sebelumnya
  if (error instanceof ZodError) {
    const validationError = new ValidationError(
      'Input tidak valid. Periksa kembali data yang dikirimkan.',
      error.flatten()
    );
    return errorResponse(
      validationError.code,
      validationError.message,
      400,
      process.env.NODE_ENV !== 'production' ? error.flatten() : undefined
    );
  }

  // Error tidak terduga — LOG di server, jangan expose ke client
  // PENTING: Jangan pernah kirim error.message dari Error biasa ke client
  // karena bisa berisi informasi sensitif (SQL error, path, dll)
  console.error('[M-CORE API ERROR]', error);

  const internalError = new InternalServerError();
  return errorResponse(internalError.code, internalError.message, 500);
}
