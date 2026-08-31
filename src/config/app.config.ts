/**
 * M-CORE — Application Configuration
 *
 * Konfigurasi aplikasi yang dibaca dari environment variables.
 *
 * KEAMANAN:
 * - Jangan pernah hardcode secrets di sini.
 * - Semua nilai sensitif harus dibaca dari environment variables.
 * - NEXT_PUBLIC_ prefix hanya untuk nilai yang aman diekspos ke browser.
 * - SUPABASE_SERVICE_ROLE_KEY TIDAK BOLEH menggunakan NEXT_PUBLIC_ prefix.
 *
 * Referensi: PROJECT.md §28, §29, ARCHITECTURE.md §28
 */

/**
 * Konfigurasi database.
 * Hanya digunakan di server-side (API routes, Server Components).
 */
export const dbConfig = {
  /**
   * URL koneksi database untuk Prisma (connection pooler Supabase).
   * Digunakan untuk query runtime.
   */
  databaseUrl: process.env.DATABASE_URL ?? '',

  /**
   * URL koneksi langsung (tanpa pooler).
   * Digunakan untuk Prisma migrations.
   */
  directUrl: process.env.DIRECT_URL ?? '',
} as const;

/**
 * Konfigurasi aplikasi umum.
 */
export const appConfig = {
  /** Environment saat ini */
  nodeEnv: process.env.NODE_ENV ?? 'development',

  /** URL aplikasi (digunakan untuk redirect, callback, dll) */
  appUrl: process.env.NEXTAUTH_URL ?? process.env.VERCEL_URL ?? 'http://localhost:3000',

  /** Apakah sedang dalam mode development */
  isDevelopment: process.env.NODE_ENV === 'development',

  /** Apakah sedang dalam mode production */
  isProduction: process.env.NODE_ENV === 'production',
} as const;

/**
 * Konfigurasi Supabase — SERVER ONLY.
 *
 * PERINGATAN KEAMANAN:
 * Jangan pernah mengekspos SERVICE_ROLE_KEY ke browser.
 * File ini hanya boleh diimport di server-side code (API routes, server components).
 */
export const supabaseConfig = {
  /** URL Supabase project. Aman diekspos ke browser. */
  url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',

  /** Anon/public key. Aman diekspos ke browser. */
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',

  /**
   * Service Role Key. RAHASIA — hanya untuk server-side.
   * Jangan pernah log nilai ini.
   * Jangan pernah kirim ke browser.
   */
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
} as const;
