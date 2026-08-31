/**
 * M-CORE — Health Check API Route
 *
 * Endpoint: GET /api/v1/health
 *
 * Tujuan:
 * - Memverifikasi bahwa API M-CORE berjalan dengan baik.
 * - Digunakan untuk monitoring dan deployment verification.
 * - Tidak memerlukan autentikasi (public endpoint).
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "status": "ok",
 *     "version": "1.0.0",
 *     "timestamp": "2026-08-31T..."
 *   }
 * }
 */

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      status: 'ok',
      system: 'M-CORE — MUMTAZA CORE',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    },
  });
}
