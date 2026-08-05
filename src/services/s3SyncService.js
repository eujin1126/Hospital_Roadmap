import * as XLSX from 'xlsx';

const S3_URL = 'https://hospital-demo-data-6zo.s3.us-east-1.amazonaws.com/patient.csv';

// S3의 patient.csv를 다운로드 → 특정 환자의 필드를 업데이트 → 다시 업로드
export async function updatePatientFieldInS3(reservationId, updates) {
  try {
    // 1. S3에서 CSV 다운로드
    const response = await fetch(S3_URL);
    if (!response.ok) throw new Error('S3 다운로드 실패');
    const arrayBuffer = await response.arrayBuffer();
    const decoder = new TextDecoder('euc-kr');
    const text = decoder.decode(arrayBuffer);

    // 2. CSV 파싱
    const workbook = XLSX.read(text, { type: 'string' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { raw: false });

    // 3. 해당 환자 찾아서 필드 업데이트
    let updated = false;
    for (let i = 0; i < data.length; i++) {
      if (data[i].reservationId === reservationId) {
        Object.assign(data[i], updates);
        updated = true;
        break;
      }
    }

    if (!updated) {
      console.warn(`환자 ${reservationId}을 찾을 수 없습니다.`);
      return false;
    }

    // 4. CSV로 변환 (UTF-8 BOM 포함하여 한글 호환)
    const newWs = XLSX.utils.json_to_sheet(data);
    const csvOutput = XLSX.utils.sheet_to_csv(newWs);
    // EUC-KR로 인코딩하여 S3에 업로드 (원본과 동일한 인코딩 유지)
    const encoder = new TextEncoder();
    const utf8Bytes = encoder.encode(csvOutput);

    // 5. S3에 업로드
    const uploadResponse = await fetch(S3_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'text/csv; charset=utf-8' },
      body: utf8Bytes,
    });

    if (!uploadResponse.ok) {
      throw new Error(`S3 업로드 실패: ${uploadResponse.status}`);
    }

    console.log(`환자 ${reservationId} S3 동기화 완료`);
    return true;
  } catch (err) {
    console.error('S3 동기화 실패:', err);
    return false;
  }
}

// 안내문 생성 상태를 S3에 동기화
export async function syncGuideStatusToS3(reservationId) {
  const now = new Date();
  const timestamp = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  
  return updatePatientFieldInS3(reservationId, {
    documentStatus: 'GENERATED',
    documentCreatedAt: timestamp,
  });
}

// 인쇄 상태를 S3에 동기화
export async function syncPrintStatusToS3(reservationId) {
  const now = new Date();
  const timestamp = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  
  return updatePatientFieldInS3(reservationId, {
    printStatus: 'PRINTED',
    printedAt: timestamp,
  });
}
