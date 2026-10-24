/* eslint-disable @typescript-eslint/no-explicit-any */
import * as XLSX from 'xlsx';
import type { StudentCreateInput } from './validation';

export interface ParsedStudentRow {
  rowNumber: number;
  fullName: string;
  gender: string;
  genderRaw: string;
  nik: string;
  nisn: string;
  email: string;
  phone: string;
  whatsapp: string;
  birthPlace: string;
  birthDate: string;
  fatherName: string;
  motherName: string;
  isValid: boolean;
  errors: string[];
  payload?: (StudentCreateInput & { rowNumber: number }) | null;
}

export interface ParseResult {
  totalRows: number;
  validRows: ParsedStudentRow[];
  invalidRows: ParsedStudentRow[];
  allRows: ParsedStudentRow[];
}

/**
 * Normalizes header keys to make reading flexible
 */
function normalizeKey(key: string): string {
  return key
    .toLowerCase()
    .replace(/[*()_/\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanDigits(val: any): string {
  if (val === undefined || val === null) return '';
  return String(val).replace(/\D/g, '');
}

function parseDateValue(val: any): string | null {
  if (!val) return null;
  if (val instanceof Date && !isNaN(val.getTime())) {
    return val.toISOString().slice(0, 10);
  }
  if (typeof val === 'number') {
    // Excel numeric date code conversion
    const date = new Date(Math.round((val - 25569) * 86400 * 1000));
    if (!isNaN(date.getTime())) return date.toISOString().slice(0, 10);
  }
  const s = String(val).trim();
  if (!s) return null;

  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  // DD/MM/YYYY or DD-MM-YYYY
  const parts = s.split(/[/.-]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
    }
    if (parts[2].length === 4) {
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
  }

  const parsed = new Date(s);
  if (!isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  return null;
}

function normalizeGender(val: any): 'male' | 'female' | null {
  if (!val) return null;
  const s = String(val).trim().toLowerCase();
  if (['l', 'laki', 'laki-laki', 'laki - laki', 'pria', 'male', 'm', 'cowok'].includes(s)) return 'male';
  if (['p', 'perempuan', 'wanita', 'female', 'f', 'cewek'].includes(s)) return 'female';
  return null;
}

/**
 * Downloads the Excel template (.xlsx) for bulk student upload
 */
export function downloadStudentTemplate() {
  const sampleData = [
    {
      'Nama Lengkap *': 'Ahmad Fauzi',
      'Jenis Kelamin * (L/P)': 'Laki-laki',
      'Tempat Lahir': 'Jakarta',
      'Tanggal Lahir (YYYY-MM-DD)': '2008-05-15',
      'NIK (16 digit)': '3201012345670001',
      'ID Siswa MTs': 'MTs-2024-0001',
      'ID Siswa MA': 'MA-2024-0001',
      'NISN': '0081234567',
      'Nomor KK': '3201012345678901',
      'Nomor Paspor': '',
      'Email': 'ahmad.fauzi@example.com',
      'No HP Siswa': '081234567890',
      'WhatsApp Siswa': '081234567890',
      'Username Telegram': '@ahmadfauzi',
      'Alamat': 'Jl. Melati No. 12',
      'RT': '003',
      'RW': '005',
      'Kelurahan / Desa': 'Menteng',
      'Kecamatan': 'Menteng',
      'Kota / Kabupaten': 'Jakarta Pusat',
      'Provinsi': 'DKI Jakarta',
      'Kode Pos': '10310',
      'Tinggi Badan (cm)': 165,
      'Berat Badan (kg)': 54,
      'Jumlah Saudara': 2,
      'Anak Ke-': 1,
      'Nama Ayah *': 'Budi Santoso',
      'NIK Ayah': '3201012345678902',
      'No HP Ayah': '081298765431',
      'Pendidikan Ayah': 'Sarjana',
      'Pendidikan Ayah Lainnya': '',
      'Pekerjaan Ayah': 'Wiraswasta',
      'Pekerjaan Ayah Lainnya': '',
      'Penghasilan Ayah / Bulan': 7500000,
      'Nama Ibu *': 'Siti Rahma',
      'NIK Ibu': '3201012345678903',
      'No HP Ibu': '081398765432',
      'Pendidikan Ibu': 'Sarjana',
      'Pendidikan Ibu Lainnya': '',
      'Pekerjaan Ibu': 'Guru',
      'Pekerjaan Ibu Lainnya': '',
      'Penghasilan Ibu / Bulan': 5000000,
      'Wali Berbeda (Ya/Tidak)': 'Tidak',
      'Sumber Wali (Ayah/Ibu/Lainnya)': 'Ayah',
      'Nama Wali': '',
      'Hubungan Wali': '',
      'NIK Wali': '',
      'No HP Wali': '',
      'Pendidikan Wali': '',
      'Pekerjaan Wali': '',
      'Penghasilan Wali / Bulan': '',
      'Jenjang Pendidikan Terakhir': 'SMA',
      'Nama Sekolah Terakhir': 'SMP Negeri 1 Jakarta',
      'Kota Sekolah Terakhir': 'Jakarta Pusat',
      'Provinsi Sekolah Terakhir': 'DKI Jakarta',
      'Tahun Lulus': 2024,
      'Status': 'active',
    },
    {
      'Nama Lengkap *': 'Fatimah Az-Zahra',
      'Jenis Kelamin * (L/P)': 'Perempuan',
      'Tempat Lahir': 'Bandung',
      'Tanggal Lahir (YYYY-MM-DD)': '2009-08-20',
      'NIK (16 digit)': '3204016789010002',
      'ID Siswa MTs': 'MTs-2024-0002',
      'ID Siswa MA': '',
      'NISN': '0097654321',
      'Nomor KK': '3204016789012345',
      'Nomor Paspor': '',
      'Email': 'fatimah@example.com',
      'No HP Siswa': '085712345678',
      'WhatsApp Siswa': '085712345678',
      'Username Telegram': '',
      'Alamat': 'Jl. Cempaka No. 45',
      'RT': '001',
      'RW': '002',
      'Kelurahan / Desa': 'Dago',
      'Kecamatan': 'Coblong',
      'Kota / Kabupaten': 'Bandung',
      'Provinsi': 'Jawa Barat',
      'Kode Pos': '40135',
      'Tinggi Badan (cm)': 158,
      'Berat Badan (kg)': 48,
      'Jumlah Saudara': 1,
      'Anak Ke-': 2,
      'Nama Ayah *': 'Herman Wijaya',
      'NIK Ayah': '',
      'No HP Ayah': '085798765431',
      'Pendidikan Ayah': 'SMA',
      'Pendidikan Ayah Lainnya': '',
      'Pekerjaan Ayah': 'PNS',
      'Pekerjaan Ayah Lainnya': '',
      'Penghasilan Ayah / Bulan': 6500000,
      'Nama Ibu *': 'Nurul Hidayah',
      'NIK Ibu': '',
      'No HP Ibu': '085898765432',
      'Pendidikan Ibu': 'Diploma',
      'Pendidikan Ibu Lainnya': '',
      'Pekerjaan Ibu': 'Guru',
      'Pekerjaan Ibu Lainnya': '',
      'Penghasilan Ibu / Bulan': 4500000,
      'Wali Berbeda (Ya/Tidak)': 'Tidak',
      'Sumber Wali (Ayah/Ibu/Lainnya)': 'Ibu',
      'Nama Wali': '',
      'Hubungan Wali': '',
      'NIK Wali': '',
      'No HP Wali': '',
      'Pendidikan Wali': '',
      'Pekerjaan Wali': '',
      'Penghasilan Wali / Bulan': '',
      'Jenjang Pendidikan Terakhir': 'SMP',
      'Nama Sekolah Terakhir': 'SMP Negeri 2 Bandung',
      'Kota Sekolah Terakhir': 'Bandung',
      'Provinsi Sekolah Terakhir': 'Jawa Barat',
      'Tahun Lulus': 2024,
      'Status': 'active',
    },
  ];

  const ws = XLSX.utils.json_to_sheet(sampleData);
  ws['!freeze'] = { xSplit: 0, ySplit: 1 };
  ws['!autofilter'] = { ref: ws['!ref'] || 'A1:BG3' };
  ws['!cols'] = Object.keys(sampleData[0]).map((header) => ({
    wch: Math.min(32, Math.max(16, header.length + 3)),
  }));

  const instructions = [
    ['PETUNJUK PENGISIAN TEMPLATE UPLOAD MASSAL SISWA'],
    ['Kolom bertanda * wajib diisi. Baris contoh boleh dihapus sebelum upload.'],
    ['Jenis kelamin menerima: Laki-laki, Perempuan, L, atau P.'],
    ['Tanggal lahir gunakan format YYYY-MM-DD, contoh: 2008-05-15.'],
    ['NIK, NISN, nomor telepon, dan kode pos sebaiknya diformat sebagai Text agar angka 0 di depan tidak hilang.'],
    ['Wali berbeda: isi Ya pada kolom tersebut lalu lengkapi data wali dan hubungan wali.'],
    ['Status menerima: active, inactive, atau alumni.'],
    ['Semua data orang tua dan wali bersifat opsional kecuali nama ayah dan nama ibu pada template ini.'],
  ];
  const instructionSheet = XLSX.utils.aoa_to_sheet(instructions);
  instructionSheet['!cols'] = [{ wch: 110 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Template Siswa');
  XLSX.utils.book_append_sheet(wb, instructionSheet, 'Petunjuk Pengisian');
  XLSX.writeFile(wb, 'template_upload_masal_siswa_lengkap.xlsx');
}

/**
 * Parses and validates an uploaded Excel file (.xlsx / .xls)
 */
export async function parseStudentExcel(file: File): Promise<ParseResult> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(new Uint8Array(data), {
    type: 'array',
    cellDates: true,
  });

  if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
    throw new Error('File Excel tidak memiliki lembar kerja (worksheet).');
  }

  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
    defval: '',
  });

  if (rawRows.length === 0) {
    throw new Error('Lembar kerja Excel kosong atau tidak memiliki baris data.');
  }

  const allRows: ParsedStudentRow[] = [];

  for (let index = 0; index < rawRows.length; index++) {
    const raw = rawRows[index];
    const rowNumber = index + 2; // Row 1 is header in Excel, so data starts at row 2

    // Map keys flexibly
    const lookup: Record<string, any> = {};
    for (const [k, v] of Object.entries(raw)) {
      lookup[normalizeKey(k)] = v;
    }

    const findVal = (...aliases: string[]) => {
      for (const alias of aliases) {
        const norm = normalizeKey(alias);
        for (const [k, v] of Object.entries(lookup)) {
          if (k === norm || k.includes(norm)) {
            const str = String(v ?? '').trim();
            if (str !== '') return v;
          }
        }
      }
      return '';
    };

    const fullNameRaw = String(findVal('nama lengkap', 'nama siswa', 'nama', 'full name')).trim();
    const genderRaw = String(findVal('jenis kelamin', 'gender', 'jk', 'sex')).trim();
    const birthPlaceRaw = String(findVal('tempat lahir', 'birth place', 'kota lahir')).trim();
    const birthDateRaw = findVal('tanggal lahir', 'tgl lahir', 'birth date', 'tgl');
    const nikRaw = cleanDigits(findVal('nik', 'no ktp', 'national id'));
    const nisnRaw = cleanDigits(findVal('nisn'));
    const mtsStudentIdRaw = String(findVal('id siswa mts', 'mts student id')).trim();
    const maStudentIdRaw = String(findVal('id siswa ma', 'ma student id')).trim();
    const familyCardNumberRaw = cleanDigits(findVal('nomor kk', 'no kk', 'kartu keluarga', 'family card'));
    const passportNumberRaw = String(findVal('nomor paspor', 'paspor', 'passport')).trim();
    const emailRaw = String(findVal('email', 'surel')).trim().toLowerCase();
    const phoneRaw = cleanDigits(findVal('no hp siswa', 'hp siswa', 'telepon siswa', 'phone', 'hp'));
    const whatsappRaw = cleanDigits(findVal('whatsapp siswa', 'whatsapp', 'wa siswa', 'no wa'));
    const telegramUsernameRaw = String(findVal('username telegram', 'telegram')).trim();

    const fatherNameRaw = String(findVal('nama ayah', 'ayah', 'father name')).trim();
    const fatherNikRaw = cleanDigits(findVal('nik ayah'));
    const fatherPhoneRaw = cleanDigits(findVal('no hp ayah', 'hp ayah', 'telepon ayah'));
    const fatherEducationRaw = String(findVal('pendidikan ayah')).trim();
    const fatherEducationOtherRaw = String(findVal('pendidikan ayah lainnya')).trim();
    const fatherOccupationRaw = String(findVal('pekerjaan ayah', 'profesi ayah')).trim();
    const fatherOccupationOtherRaw = String(findVal('pekerjaan ayah lainnya')).trim();
    const fatherIncomeRaw = Number(findVal('penghasilan ayah', 'penghasilan ayah bulan')) || null;

    const motherNameRaw = String(findVal('nama ibu', 'ibu', 'mother name')).trim();
    const motherNikRaw = cleanDigits(findVal('nik ibu'));
    const motherPhoneRaw = cleanDigits(findVal('no hp ibu', 'hp ibu', 'telepon ibu'));
    const motherEducationRaw = String(findVal('pendidikan ibu')).trim();
    const motherEducationOtherRaw = String(findVal('pendidikan ibu lainnya')).trim();
    const motherOccupationRaw = String(findVal('pekerjaan ibu', 'profesi ibu')).trim();
    const motherOccupationOtherRaw = String(findVal('pekerjaan ibu lainnya')).trim();
    const motherIncomeRaw = Number(findVal('penghasilan ibu', 'penghasilan ibu bulan')) || null;

    const addressLineRaw = String(findVal('alamat', 'alamat lengkap', 'address')).trim();
    const addressRtRaw = String(findVal('rt')).trim();
    const addressRwRaw = String(findVal('rw')).trim();
    const villageRaw = String(findVal('kelurahan', 'desa')).trim();
    const districtRaw = String(findVal('kecamatan')).trim();
    const cityRegencyRaw = String(findVal('kota', 'kabupaten', 'kota kabupaten', 'city')).trim();
    const provinceRaw = String(findVal('provinsi', 'province')).trim();
    const postalCodeRaw = String(findVal('kode pos', 'postal code')).trim();
    const heightRaw = Number(findVal('tinggi badan', 'height')) || null;
    const weightRaw = Number(findVal('berat badan', 'weight')) || null;
    const siblingCountRaw = Number(findVal('jumlah saudara', 'sibling count')) || null;
    const birthOrderRaw = Number(findVal('anak ke', 'birth order')) || null;
    const statusRaw = String(findVal('status')).trim().toLowerCase() || 'active';
    const guardianDifferentRaw = String(findVal('wali berbeda')).trim().toLowerCase();
    const guardianSourceRaw = String(findVal('sumber wali')).trim().toLowerCase();
    const guardianNameRaw = String(findVal('nama wali')).trim();
    const guardianRelationshipRaw = String(findVal('hubungan wali')).trim();
    const guardianNikRaw = cleanDigits(findVal('nik wali'));
    const guardianPhoneRaw = cleanDigits(findVal('no hp wali', 'hp wali'));
    const guardianEducationRaw = String(findVal('pendidikan wali')).trim();
    const guardianOccupationRaw = String(findVal('pekerjaan wali')).trim();
    const guardianIncomeRaw = Number(findVal('penghasilan wali')) || null;
    const educationInstitutionRaw = String(findVal('nama sekolah terakhir')).trim();
    const educationCityRaw = String(findVal('kota sekolah terakhir')).trim();
    const educationProvinceRaw = String(findVal('provinsi sekolah terakhir')).trim();
    const graduationYearRaw = Number(findVal('tahun lulus')) || null;
    const educationLevelRaw = String(findVal('jenjang pendidikan terakhir')).trim();

    const errors: string[] = [];

    // Validation 1: Full Name
    if (!fullNameRaw) {
      errors.push('Nama lengkap wajib diisi');
    } else if (fullNameRaw.length < 2) {
      errors.push('Nama lengkap minimal 2 karakter');
    }

    // Validation 2: Gender
    const gender = normalizeGender(genderRaw);
    if (!gender) {
      errors.push('Jenis kelamin wajib diisi (Laki-laki / Perempuan)');
    }

    // Validation 3: NIK
    if (nikRaw && nikRaw.length !== 16) {
      errors.push(`NIK harus 16 digit angka (saat ini ${nikRaw.length} digit)`);
    }

    // Validation 4: Email
    if (emailRaw && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailRaw)) {
      errors.push('Format email tidak valid');
    }

    // Parse Birth Date
    const birthDate = parseDateValue(birthDateRaw);

    // Prepare parents, guardian, and complete student payload.
    const studentPhones = new Set([phoneRaw, whatsappRaw].filter(Boolean));
    const cleanFatherPhone = fatherPhoneRaw && !studentPhones.has(fatherPhoneRaw) ? fatherPhoneRaw : null;
    const cleanMotherPhone = motherPhoneRaw && !studentPhones.has(motherPhoneRaw) ? motherPhoneRaw : null;
    const fatherName = fatherNameRaw || (fullNameRaw ? `Ayah ${fullNameRaw}` : 'Ayah Siswa');
    const motherName = motherNameRaw || (fullNameRaw ? `Ibu ${fullNameRaw}` : 'Ibu Siswa');
    const guardianIsDifferent = ['ya', 'yes', 'true', '1'].includes(guardianDifferentRaw);
    const guardianSource = guardianSourceRaw.includes('ibu') ? 'mother' : guardianSourceRaw.includes('lain') || guardianSourceRaw.includes('other') ? 'other' : 'father';
    const normalizedStatus = ['active', 'inactive', 'alumni'].includes(statusRaw) ? statusRaw as 'active' | 'inactive' | 'alumni' : 'active';
    const educationLevelMap: Record<string, 'elementary' | 'junior_high' | 'senior_high' | 'university_s1' | 'university_s2' | 'university_s3'> = {
      sd: 'elementary', mi: 'elementary', smp: 'junior_high', mts: 'junior_high', sma: 'senior_high', smk: 'senior_high', ma: 'senior_high',
      s1: 'university_s1', s2: 'university_s2', s3: 'university_s3',
    };
    const educationLevel = educationLevelMap[educationLevelRaw.toLowerCase()] || null;

    const isValid = errors.length === 0;
    let payload: (StudentCreateInput & { rowNumber: number }) | null = null;
    if (isValid && gender) {
      payload = {
        rowNumber,
        fullName: fullNameRaw,
        gender,
        birthPlace: birthPlaceRaw || null,
        birthDate: birthDate ? new Date(birthDate) : null,
        nik: nikRaw || null,
        mtsStudentId: mtsStudentIdRaw || null,
        maStudentId: maStudentIdRaw || null,
        nisn: nisnRaw || null,
        familyCardNumber: familyCardNumberRaw || null,
        passportNumber: passportNumberRaw || null,
        email: emailRaw || null,
        phone: phoneRaw || null,
        whatsapp: whatsappRaw || null,
        telegramUsername: telegramUsernameRaw || null,
        addressLine: addressLineRaw || null,
        addressRt: addressRtRaw || null,
        addressRw: addressRwRaw || null,
        village: villageRaw || null,
        district: districtRaw || null,
        cityRegency: cityRegencyRaw || null,
        province: provinceRaw || null,
        postalCode: postalCodeRaw || null,
        heightCm: heightRaw,
        weightKg: weightRaw,
        siblingCount: siblingCountRaw,
        birthOrder: birthOrderRaw,
        status: normalizedStatus,
        parents: {
          father: {
            fullName: fatherName, nik: fatherNikRaw || null, phone: cleanFatherPhone,
            education: fatherEducationRaw || null, educationOther: fatherEducationOtherRaw || null,
            occupation: fatherOccupationRaw || null, occupationOther: fatherOccupationOtherRaw || null, monthlyIncome: fatherIncomeRaw,
          },
          mother: {
            fullName: motherName, nik: motherNikRaw || null, phone: cleanMotherPhone,
            education: motherEducationRaw || null, educationOther: motherEducationOtherRaw || null,
            occupation: motherOccupationRaw || null, occupationOther: motherOccupationOtherRaw || null, monthlyIncome: motherIncomeRaw,
          },
        },
        guardian: {
          guardianIsDifferent,
          guardianSource,
          ...(guardianIsDifferent && guardianSource === 'other' && guardianNameRaw ? {
            other: {
              fullName: guardianNameRaw, relationship: guardianRelationshipRaw || 'Wali', nik: guardianNikRaw || null,
              phone: guardianPhoneRaw || null, education: guardianEducationRaw || null, educationOther: null,
              occupation: guardianOccupationRaw || null, occupationOther: null, monthlyIncome: guardianIncomeRaw,
            },
          } : {}),
        },
        ...(educationInstitutionRaw && educationLevel ? {
          educationHistories: [{ level: educationLevel, institutionName: educationInstitutionRaw, cityRegency: educationCityRaw || null, province: educationProvinceRaw || null, graduationYear: graduationYearRaw, degreeLevel: null }],
        } : {}),
      } as StudentCreateInput & { rowNumber: number };
    }

    allRows.push({
      rowNumber,
      fullName: fullNameRaw,
      gender: gender ? (gender === 'male' ? 'Laki-laki' : 'Perempuan') : (genderRaw || 'Tidak valid'),
      genderRaw,
      nik: nikRaw,
      nisn: nisnRaw,
      email: emailRaw,
      phone: phoneRaw,
      whatsapp: whatsappRaw,
      birthPlace: birthPlaceRaw,
      birthDate: birthDate || '',
      fatherName: fatherNameRaw,
      motherName: motherNameRaw,
      isValid,
      errors,
      payload,
    });
  }

  const validRows = allRows.filter(r => r.isValid);
  const invalidRows = allRows.filter(r => !r.isValid);

  return {
    totalRows: allRows.length,
    validRows,
    invalidRows,
    allRows,
  };
}
