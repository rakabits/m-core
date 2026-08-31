/**
 * M-CORE — Shared Constants
 *
 * Konstanta yang digunakan di seluruh aplikasi M-CORE.
 * Jangan menulis magic number atau string langsung di kode.
 * Gunakan konstanta dari file ini.
 */

// =============================================================================
// API
// =============================================================================

/** Base URL untuk semua API M-CORE */
export const API_BASE_URL = '/api/v1';

/** Versi API saat ini */
export const API_VERSION = 'v1';

// =============================================================================
// Pagination Defaults
// =============================================================================

/** Halaman default (mulai dari 1) */
export const DEFAULT_PAGE = 1;

/** Jumlah item per halaman secara default */
export const DEFAULT_LIMIT = 20;

/** Batas maksimum item per halaman */
export const MAX_LIMIT = 100;

// =============================================================================
// Student Constants
// =============================================================================

/** Panjang maksimum NIK Indonesia (16 digit) */
export const NIK_LENGTH = 16;

/** Regex validasi format NIK: 16 digit angka */
export const NIK_REGEX = /^\d{16}$/;

/** Regex validasi format tahun akademik: YYYY/YYYY */
export const ACADEMIC_YEAR_REGEX = /^\d{4}\/\d{4}$/;

/** Format date untuk display */
export const DATE_FORMAT = 'dd MMMM yyyy';

// =============================================================================
// Application
// =============================================================================

/** Nama aplikasi */
export const APP_NAME = 'M-CORE';

/** Nama lengkap aplikasi */
export const APP_FULL_NAME = 'MUMTAZA CORE';

/** Deskripsi aplikasi */
export const APP_DESCRIPTION = 'Central Student & Education Management System';
