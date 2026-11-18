/**
 * Standalone Google Apps Script for the monthly M-CORE snapshot.
 * Configure MCORE_BASE_URL and BACKUP_SCRIPT_TOKEN in Script Properties before use.
 */
function runMonthlyMCoreBackup() {
  var props = PropertiesService.getScriptProperties();
  var baseUrl = props.getProperty('MCORE_BASE_URL') || 'https://m-core.my.id';
  var token = props.getProperty('BACKUP_SCRIPT_TOKEN');
  if (!token) throw new Error('BACKUP_SCRIPT_TOKEN belum dikonfigurasi.');

  var period = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyy-MM');
  var payload;
  var lastError = '';
  for (var attempt = 1; attempt <= 3; attempt++) {
    try {
      var response = UrlFetchApp.fetch(baseUrl + '/api/v1/backups/payload', {
        method: 'get',
        headers: { Authorization: 'Bearer ' + token },
        muteHttpExceptions: true,
      });
      payload = JSON.parse(response.getContentText());
      if (response.getResponseCode() < 300 && payload.success) break;
      lastError = response.getContentText();
    } catch (error) {
      lastError = String(error);
    }
    if (attempt < 3) Utilities.sleep(5000 * attempt);
  }
  if (!payload || !payload.success) {
    reportBackup(baseUrl, token, period, 'failed', 0, '', '', lastError);
    throw new Error('Gagal mengambil payload M-CORE setelah 3 percobaan: ' + lastError);
  }

  var spreadsheet = SpreadsheetApp.create('M-CORE Master Students ' + period);
  var backupFolderId = props.getProperty('BACKUP_FOLDER_ID') || '1_aov4mqXs93M-QQeC2nkT5I5OMsvRYDN';
  var backupFolder = DriveApp.getFolderById(backupFolderId);
  DriveApp.getFileById(spreadsheet.getId()).moveTo(backupFolder);
  var rows = payload.data || [];
  var students = rows.map(function (student) {
    return [student.id, student.studentNumber, student.mtsStudentId, student.maStudentId, student.fullName, student.gender, student.birthPlace, student.birthDate, student.nik, student.nisn, student.familyCardNumber, student.passportNumber, student.email, student.phone, student.whatsapp, student.telegramUsername, student.addressLine, student.addressRt, student.addressRw, student.village, student.district, student.cityRegency, student.province, student.postalCode, student.heightCm, student.weightKg, student.siblingCount, student.birthOrder, student.status, student.alumniDestinationStatus, student.alumniDestinationName, student.alumniDestinationProgram, student.alumniDestinationCity, student.alumniDestinationYear, student.createdAt, student.updatedAt];
  });
  writeSheet(spreadsheet, 'Students', ['ID Siswa', 'Nomor Siswa', 'ID MTs', 'ID MA', 'Nama Lengkap', 'Jenis Kelamin', 'Tempat Lahir', 'Tanggal Lahir', 'NIK', 'NISN', 'Nomor KK', 'Nomor Paspor', 'Email', 'Telepon', 'WhatsApp', 'Telegram', 'Alamat', 'RT', 'RW', 'Desa/Kelurahan', 'Kecamatan', 'Kota/Kabupaten', 'Provinsi', 'Kode Pos', 'Tinggi (cm)', 'Berat (kg)', 'Jumlah Saudara', 'Anak Ke-', 'Status', 'Status Tujuan Alumni', 'Nama Tujuan Alumni', 'Program Tujuan Alumni', 'Kota Tujuan Alumni', 'Tahun Tujuan Alumni', 'Dibuat Pada', 'Diperbarui Pada'], students);

  var parents = [];
  var guardians = [];
  var education = [];
  var programs = [];
  rows.forEach(function (student) {
    (student.parents || []).forEach(function (parent) {
      parents.push([student.id, student.studentNumber, parent.id, parent.role, parent.fullName, parent.nik, parent.phone, parent.education, parent.educationOther, parent.occupation, parent.occupationOther, parent.monthlyIncome, parent.relationship, parent.createdAt, parent.updatedAt]);
    });
    if (student.guardianConfig) {
      var guardian = student.guardianConfig;
      guardians.push([student.id, student.studentNumber, guardian.id, guardian.guardianIsDifferent, guardian.guardianSource, guardian.otherParentId]);
    }
    (student.educationHistories || []).forEach(function (item) {
      education.push([student.id, student.studentNumber, item.id, item.level, item.institutionName, item.cityRegency, item.province, item.graduationYear, item.degreeLevel, item.createdAt, item.updatedAt]);
    });
    (student.programHistories || []).forEach(function (item) {
      programs.push([student.id, student.studentNumber, item.id, item.programId, item.program ? item.program.programName : '', item.academicYear, item.status, item.startDate, item.endDate, item.createdAt, item.updatedAt]);
    });
  });
  writeSheet(spreadsheet, 'Parents', ['ID Siswa', 'Nomor Siswa', 'ID Orang Tua', 'Peran', 'Nama Lengkap', 'NIK', 'Telepon', 'Pendidikan', 'Pendidikan Lainnya', 'Pekerjaan', 'Pekerjaan Lainnya', 'Penghasilan Bulanan', 'Hubungan', 'Dibuat Pada', 'Diperbarui Pada'], parents);
  writeSheet(spreadsheet, 'Guardians', ['ID Siswa', 'Nomor Siswa', 'ID Wali', 'Wali Berbeda', 'Sumber Wali', 'ID Orang Tua Lain'], guardians);
  writeSheet(spreadsheet, 'Education History', ['ID Siswa', 'Nomor Siswa', 'ID Riwayat', 'Jenjang', 'Nama Institusi', 'Kota/Kabupaten', 'Provinsi', 'Tahun Lulus', 'Gelar/Jurusan', 'Dibuat Pada', 'Diperbarui Pada'], education);
  writeSheet(spreadsheet, 'Program History', ['ID Siswa', 'Nomor Siswa', 'ID Riwayat', 'ID Program', 'Nama Program', 'Tahun Ajaran', 'Status', 'Mulai', 'Selesai', 'Dibuat Pada', 'Diperbarui Pada'], programs);

  reportBackup(baseUrl, token, period, 'success', rows.length, spreadsheet.getName(), spreadsheet.getUrl(), '');
}

function writeSheet(spreadsheet, name, headers, rows) {
  var sheet = spreadsheet.getSheetByName(name) || spreadsheet.insertSheet(name);
  sheet.clear();
  var values = [headers].concat(rows);
  sheet.getRange(1, 1, values.length, headers.length).setValues(values);
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  sheet.autoResizeColumns(1, headers.length);
}

function reportBackup(baseUrl, token, period, status, totalStudents, spreadsheetName, spreadsheetUrl, errorMessage) {
  UrlFetchApp.fetch(baseUrl + '/api/v1/backups/callback', {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + token },
    payload: JSON.stringify({ period: period, status: status, totalStudents: totalStudents, spreadsheetName: spreadsheetName, spreadsheetUrl: spreadsheetUrl, errorMessage: errorMessage || '', attempts: 1 }),
    muteHttpExceptions: true,
  });
}

function installMonthlyTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (trigger) {
    if (trigger.getHandlerFunction() === 'runMonthlyMCoreBackup') ScriptApp.deleteTrigger(trigger);
  });
  ScriptApp.newTrigger('runMonthlyMCoreBackup').timeBased().onMonthDay(1).atHour(0).inTimezone('Asia/Jakarta').create();
}
