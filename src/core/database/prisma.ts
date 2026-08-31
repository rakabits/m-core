/**
 * M-CORE â€” Prisma Database Client (Singleton)
 *
 * File ini mengelola koneksi database melalui Prisma ORM.
 *
 * PENTING â€” SERVERLESS CONSIDERATION:
 * Next.js di Vercel berjalan sebagai serverless function.
 * Setiap request bisa saja menggunakan instance function yang berbeda.
 * Jika kita membuat PrismaClient baru di setiap request, akan terjadi
 * "too many connections" error di database.
 *
 * Solusi: Gunakan pattern singleton yang menyimpan satu instance di
 * globalThis selama development (hot-reload), dan buat instance baru
 * sekali di production.
 *
 * Referensi: ARCHITECTURE.md Â§19, Â§20
 * Referensi Prisma: https://www.prisma.io/docs/guides/performance-and-optimization/connection-management
 */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// Deklarasi tipe untuk globalThis agar TypeScript tidak complaint
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Instance Prisma Client yang digunakan oleh seluruh aplikasi M-CORE.
 *
 * Cara penggunaan:
 * ```typescript
 * import { prisma } from '@/core/database/prisma';
 *
 * const students = await prisma.student.findMany();
 * ```
 *
 * JANGAN membuat instance PrismaClient baru di tempat lain.
 * Selalu import dari file ini.
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

// Di development, simpan instance di globalThis agar tidak dibuat ulang
// setiap kali Next.js melakukan hot-reload.
// Di production, ini tidak diperlukan karena tidak ada hot-reload.
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

