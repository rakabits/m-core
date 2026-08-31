/**
 * M-CORE Shared Enums — Program
 *
 * Enum ini merepresentasikan nilai-nilai untuk entitas Program dan Program History.
 * Nilai harus selalu sinkron dengan DATABASE.md dan schema.prisma.
 *
 * Referensi: DATABASE.md §16, BUSINESS_RULES.md §16-25
 */

/**
 * Status riwayat program siswa dalam tabel student_program_history.
 *
 * Lifecycle umum:
 *   ENROLLED → COMPLETED   : Selesai / lulus dari program/kelas ini
 *   ENROLLED → TRANSFERRED  : Pindah ke program lain
 *   ENROLLED → DROPPED      : Berhenti dari program ini
 *   ENROLLED → CANCELLED    : Dibatalkan (administratif)
 *
 * PENTING: Status 'enrolled' menandai program aktif siswa.
 * Hanya boleh ada SATU record enrolled per siswa pada satu konteks periode
 * (kecuali jika sistem mendukung multiple active programs).
 *
 * Referensi: DATABASE.md §16, BUSINESS_RULES.md §26-30
 */
export enum ProgramHistoryStatus {
  /**
   * Siswa sedang aktif mengikuti program ini.
   * Ini adalah satu-satunya status yang menandai "program aktif".
   */
  ENROLLED = 'enrolled',

  /**
   * Siswa telah menyelesaikan program/kelas ini dengan baik.
   * Record lama dengan status ini tetap harus disimpan (tidak boleh dihapus).
   */
  COMPLETED = 'completed',

  /**
   * Siswa pindah ke program lain.
   * Ketika ini terjadi, harus ada record baru dengan status ENROLLED untuk program baru.
   * Referensi: BUSINESS_RULES.md §22-24 (BR-PRG-001)
   */
  TRANSFERRED = 'transferred',

  /**
   * Siswa berhenti dari program ini tanpa menyelesaikannya.
   */
  DROPPED = 'dropped',

  /**
   * Enrollment dibatalkan secara administratif.
   */
  CANCELLED = 'cancelled',
}

/**
 * Label tampilan UI untuk ProgramHistoryStatus.
 */
export const PROGRAM_HISTORY_STATUS_LABEL: Record<ProgramHistoryStatus, string> = {
  [ProgramHistoryStatus.ENROLLED]: 'Aktif',
  [ProgramHistoryStatus.COMPLETED]: 'Selesai',
  [ProgramHistoryStatus.TRANSFERRED]: 'Pindah Program',
  [ProgramHistoryStatus.DROPPED]: 'Berhenti',
  [ProgramHistoryStatus.CANCELLED]: 'Dibatalkan',
};

/**
 * Badge variant untuk setiap status (digunakan dengan shadcn/ui Badge).
 */
export const PROGRAM_HISTORY_STATUS_VARIANT: Record<
  ProgramHistoryStatus,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  [ProgramHistoryStatus.ENROLLED]: 'default',
  [ProgramHistoryStatus.COMPLETED]: 'secondary',
  [ProgramHistoryStatus.TRANSFERRED]: 'outline',
  [ProgramHistoryStatus.DROPPED]: 'destructive',
  [ProgramHistoryStatus.CANCELLED]: 'destructive',
};
