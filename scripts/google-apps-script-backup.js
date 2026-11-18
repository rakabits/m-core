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
  var sheet = spreadsheet.getSheets()[0];
  sheet.setName('Students');
  var rows = payload.data || [];
  var columns = ['student_id', 'student_number', 'full_name', 'gender', 'birth_place', 'birth_date', 'nik', 'nisn', 'family_card_number', 'passport_number', 'email', 'phone', 'whatsapp', 'address_line', 'address_rt', 'address_rw', 'village', 'district', 'city_regency', 'province', 'postal_code', 'height_cm', 'weight_kg', 'sibling_count', 'birth_order', 'status', 'parents', 'guardian', 'education_histories', 'program_histories', 'created_at', 'updated_at'];
  var values = [columns].concat(rows.map(function (row) {
    return columns.map(function (column) {
      var value = row[column];
      return value && typeof value === 'object' ? JSON.stringify(value) : value == null ? '' : value;
    });
  }));
  if (values.length) sheet.getRange(1, 1, values.length, columns.length).setValues(values);
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, columns.length).setFontWeight('bold');
  sheet.autoResizeColumns(1, columns.length);

  reportBackup(baseUrl, token, period, 'success', rows.length, spreadsheet.getName(), spreadsheet.getUrl(), '');
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
