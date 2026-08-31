/**
 * M-CORE Shared Enums — Student
 *
 * Enum ini merepresentasikan nilai-nilai yang diperbolehkan untuk entitas Student.
 * Nilai harus selalu sinkron dengan DATABASE.md dan schema.prisma.
 *
 * Aturan: JANGAN mengubah nilai enum ini tanpa memperbarui DATABASE.md dan melakukan migrasi.
 */

/**
 * Status utama siswa dalam sistem M-CORE.
 *
 * Lifecycle:
 *   ACTIVE → ALUMNI      : Lulus / selesai program
 *   ACTIVE → INACTIVE    : Keluar / berhenti sementara
 *   INACTIVE → ACTIVE    : Aktif kembali (jika kebijakan memungkinkan)
 *
 * Referensi: DATABASE.md §9, BUSINESS_RULES.md §10-13
 */
export enum StudentStatus {
  /**
   * Siswa masih mengikuti program aktif.
   * Minimal harus memiliki satu program_history dengan status ENROLLED.
   */
  ACTIVE = 'active',

  /**
   * Siswa telah menyelesaikan perjalanan pendidikan sesuai ketentuan.
   * Data siswa TIDAK boleh dihapus setelah menjadi alumni.
   */
  ALUMNI = 'alumni',

  /**
   * Siswa tidak sedang aktif dalam program dan belum dikategorikan alumni.
   * Contoh: keluar sementara, tidak melanjutkan.
   */
  INACTIVE = 'inactive',
}

/**
 * Jenis kelamin siswa.
 *
 * Nilai database: 'male' | 'female'
 * Tampilan UI: Laki-laki | Perempuan
 *
 * Referensi: DATABASE.md §8
 */
export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

/**
 * Label tampilan UI untuk Gender.
 * Digunakan untuk rendering teks Indonesia di frontend.
 */
export const GENDER_LABEL: Record<Gender, string> = {
  [Gender.MALE]: 'Laki-laki',
  [Gender.FEMALE]: 'Perempuan',
};

/**
 * Label tampilan UI untuk StudentStatus.
 */
export const STUDENT_STATUS_LABEL: Record<StudentStatus, string> = {
  [StudentStatus.ACTIVE]: 'Aktif',
  [StudentStatus.ALUMNI]: 'Alumni',
  [StudentStatus.INACTIVE]: 'Nonaktif',
};
