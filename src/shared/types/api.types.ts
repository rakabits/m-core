/**
 * M-CORE — Shared API Types
 *
 * Type definitions yang digunakan di seluruh aplikasi M-CORE.
 * Terutama untuk request/response API dan pagination.
 *
 * Referensi: API_SPEC.md
 */

// =============================================================================
// Pagination
// =============================================================================

/**
 * Parameter pagination untuk list endpoint.
 * Digunakan di: GET /api/v1/students, GET /api/v1/programs, dll.
 */
export interface PaginationParams {
  /** Nomor halaman (mulai dari 1). Default: 1. */
  page?: number;
  /** Jumlah item per halaman. Default: 20. Max: 100. */
  limit?: number;
}

/**
 * Metadata pagination dalam response.
 */
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Response list yang terpaginasi.
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// =============================================================================
// Sort & Filter
// =============================================================================

export type SortOrder = 'asc' | 'desc';

// =============================================================================
// Common API Response Wrapper
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

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

// =============================================================================
// Audit Types
// =============================================================================

/**
 * Informasi actor yang melakukan tindakan.
 * Digunakan dalam audit logging.
 * Referensi: PROJECT.md §27
 */
export interface AuditActor {
  userId: string;
  userEmail: string;
  ipAddress?: string;
  userAgent?: string;
}
