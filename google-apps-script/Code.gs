const SHEET_NAME = '응답';
const SPREADSHEET_ID = '1PGSPjLnI8TvjuJvrDJrVlUhFZj9T_EwZmjKL1N_af54';

const FIELDS = [
  ['responseId', '응답 ID'],
  ['submittedAt', '사용자 제출 시각'],
  ['penName', '레터북 표기 닉네임'],
  ['xId', '트위터/X 아이디'],
  ['openChatMember', '오픈채팅 참여 확인'],
  ['openChatNickname', '오픈채팅방 닉네임'],
  ['mySiwoo', '나에게 박시우란?'],
  ['fanMoment', '시우에게 입덕한 순간'],
  ['charmPoint', '시우의 매력포인트'],
  ['nextRole', '차기작의 시우'],
  ['nextRoleReason', '차기작의 시우 · 선택 이유'],
  ['ageRole', '다음 역할의 분위기'],
  ['ageRoleReason', '다음 역할의 분위기 · 선택 이유'],
  ['alignment', '선과 악'],
  ['alignmentReason', '선과 악 · 선택 이유'],
  ['characterMood', '캐릭터의 온도'],
  ['characterMoodReason', '캐릭터의 온도 · 선택 이유'],
  ['platform', '작품에서 만나는 방식'],
  ['platformReason', '작품에서 만나는 방식 · 선택 이유'],
  ['contentType', '작품 밖의 시우'],
  ['contentTypeReason', '작품 밖의 시우 · 선택 이유'],
  ['fanmeetingStage', '팬미팅 무대'],
  ['fanmeetingStageReason', '팬미팅 무대 · 선택 이유'],
  ['fanmeetingTour', '다음 팬미팅'],
  ['fanmeetingTourReason', '다음 팬미팅 · 선택 이유'],
  ['compliment', '최종 보스 질문'],
  ['complimentReason', '최종 보스 질문 · 선택 이유'],
  ['nicknameChoice', '내가 선택한 시우의 애칭'],
  ['nicknameChoiceReason', '내가 선택한 시우의 애칭 · 선택 이유'],
  ['toSiwoo', 'To. 시우'],
  ['contentAgreement', '작성 안내 동의'],
  ['privacyAgreement', '개인정보 수집 동의'],
  ['source', '제출 경로']
];

const REQUIRED_FIELDS = FIELDS.map(([key]) => key).filter((key) => key !== 'submittedAt');
const MAX_LENGTHS = {
  penName: 20,
  xId: 50,
  openChatNickname: 30,
  mySiwoo: 30,
  fanMoment: 30,
  charmPoint: 30,
  nextRoleReason: 30,
  ageRoleReason: 30,
  alignmentReason: 30,
  characterMoodReason: 30,
  platformReason: 30,
  contentTypeReason: 30,
  fanmeetingStageReason: 30,
  fanmeetingTourReason: 30,
  complimentReason: 30,
  nicknameChoiceReason: 30,
  toSiwoo: 100
};

const ALLOWED_OPTIONS = {
  openChatMember: ['yes'],
  nextRole: ['로맨스 주연', '장르물 주연'],
  ageRole: ['풋풋한 청춘 역할', '완전히 성숙한 역할'],
  alignment: ['완전 선역', '매력적인 악역'],
  characterMood: ['말랑하고 다정한 캐릭터', '차갑고 예민한 캐릭터'],
  platform: ['웹드라마·OTT에서 자주 만나기', '긴 호흡의 드라마에서 깊게 만나기'],
  contentType: ['예능 출연', '배우 브이로그'],
  fanmeetingStage: ['팬미팅에서 노래', '팬미팅에서 춤'],
  fanmeetingTour: ['한국 팬미팅 한 번 더', '해외 팬미팅 투어'],
  compliment: ['평생 귀엽다는 말만 듣기', '평생 잘생겼다는 말만 듣기'],
  nicknameChoice: ['오빠', '아기'],
  contentAgreement: ['yes'],
  privacyAgreement: ['yes']
};

function doGet() {
  return jsonResponse_({ ok: true, message: 'Letterbook form endpoint is ready.' });
}

function doPost(event) {
  try {
    if (!event || !event.parameter) throw new Error('요청 데이터가 없습니다.');
    if (clean_(event.parameter.website)) return jsonResponse_({ ok: true });

    const data = {};
    FIELDS.forEach(([key]) => { data[key] = clean_(event.parameter[key]); });
    validate_(data);

    const cache = CacheService.getScriptCache();
    const cacheKey = `response-${data.responseId}`;
    if (cache.get(cacheKey)) return jsonResponse_({ ok: true, duplicate: true });

    const lock = LockService.getScriptLock();
    lock.waitLock(15000);
    try {
      const sheet = getResponseSheet_();
      const row = [new Date()].concat(FIELDS.map(([key]) => safeForSheet_(data[key])));
      sheet.appendRow(row);
      const lastRow = sheet.getLastRow();
      sheet.getRange(lastRow, 1).setNumberFormat('yyyy-mm-dd hh:mm:ss');
      sheet.getRange(lastRow, 1, 1, row.length).setWrap(true).setVerticalAlignment('top');
      cache.put(cacheKey, '1', 21600);
    } finally {
      lock.releaseLock();
    }

    return jsonResponse_({ ok: true });
  } catch (error) {
    return jsonResponse_({ ok: false, message: error.message });
  }
}

function setupSheet() {
  const sheet = getResponseSheet_();
  sheet.setFrozenRows(1);
  sheet.setColumnWidth(1, 150);
  sheet.setColumnWidth(2, 240);
  sheet.setColumnWidths(3, 5, 150);
  sheet.setColumnWidths(8, 3, 220);
  sheet.setColumnWidths(11, 20, 210);
  sheet.setColumnWidth(31, 360);
  sheet.getRange(1, 1, 1, sheet.getLastColumn())
    .setBackground('#724ea0')
    .setFontColor('#ffffff')
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
  sheet.setRowHeight(1, 42);
  return '응답 시트 준비 완료';
}

function getResponseSheet_() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = spreadsheet.insertSheet(SHEET_NAME);
  const headers = ['접수 시각'].concat(FIELDS.map(([, label]) => label));
  const current = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  if (current.every((value) => !value) || current.join('\u0000') !== headers.join('\u0000')) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
  return sheet;
}

function validate_(data) {
  REQUIRED_FIELDS.forEach((key) => {
    if (!data[key]) throw new Error(`필수 항목이 비어 있습니다: ${key}`);
  });
  Object.keys(MAX_LENGTHS).forEach((key) => {
    if (data[key].length > MAX_LENGTHS[key]) throw new Error(`글자 수 제한을 초과했습니다: ${key}`);
  });
  Object.keys(ALLOWED_OPTIONS).forEach((key) => {
    if (!ALLOWED_OPTIONS[key].includes(data[key])) throw new Error(`허용되지 않은 선택값입니다: ${key}`);
  });
}

function clean_(value) {
  return String(value || '').replace(/\r\n/g, '\n').trim();
}

function safeForSheet_(value) {
  return /^[=+\-@]/.test(value) ? `'${value}` : value;
}

function jsonResponse_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}
