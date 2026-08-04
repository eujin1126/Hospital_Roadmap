import * as XLSX from 'xlsx';

const S3_URL = 'https://hospital-demo-data-6zo.s3.us-east-1.amazonaws.com/patient.xlsx';

// S3에서 xlsx 파일을 가져와 JSON으로 변환
export async function fetchPatientData() {
  const response = await fetch(S3_URL);
  const arrayBuffer = await response.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rawData = XLSX.utils.sheet_to_json(worksheet);
  return rawData;
}

// S3 데이터를 앱에서 사용하는 형식으로 변환
export function transformPatientData(rawData) {
  // 환자 목록 (전체 환자 목록 페이지용) - 중복 제거
  const patientMap = new Map();
  rawData.forEach(row => {
    if (!patientMap.has(row.reservationId)) {
      patientMap.set(row.reservationId, {
        id: row.reservationId,
        name: maskName(row.name),
        fullName: row.name,
        birthDate: extractBirthDate(row.rrn),
        gender: row.gender === 'F' ? '여' : '남',
        phone: '010-****-****', // rrn에서 전화번호 추출 불가, 마스킹
        department: row.department,
        lastVisit: `${row.visitDate} ${row.time || ''}`.trim(),
        age: row.age,
      });
    }
  });
  const patients = Array.from(patientMap.values());

  // 오늘 예약 환자 (visitDate 기준)
  const today = new Date().toISOString().split('T')[0];
  const todayRows = rawData.filter(row => row.visitDate === today || row.visitDate);
  
  // 접수번호별 예약 데이터 그룹핑
  const appointmentMap = new Map();
  rawData.forEach((row, idx) => {
    const aptId = `APT-${String(idx + 1).padStart(3, '0')}`;
    if (!appointmentMap.has(row.reservationId)) {
      appointmentMap.set(row.reservationId, {
        aptId,
        patientId: row.reservationId,
        name: maskName(row.name),
        fullName: row.name,
        birthDate: extractBirthDate(row.rrn),
        time: row.time || '',
        department: row.department,
        examCount: 0,
        exams: [],
        guideStatus: row.status === 'RESERVED' ? '미생성' : '확정됨',
        printStatus: row.checkedIn === 1 ? '출력됨' : '미출력',
        age: row.age,
        gender: row.gender === 'F' ? '여' : '남',
        visitDate: row.visitDate,
      });
    }
    const apt = appointmentMap.get(row.reservationId);
    apt.examCount += 1;
    apt.exams.push({
      order: apt.exams.length + 1,
      name: row.exam || row.examCode || '검사',
      description: row.instruction || '',
      location: row.location || '',
      waitTime: '약 10분',
    });
  });
  const todayAppointments = Array.from(appointmentMap.values());

  // 환자 상세 정보
  const patientDetails = {};
  todayAppointments.forEach(apt => {
    patientDetails[apt.aptId] = {
      basicInfo: {
        name: apt.fullName,
        age: apt.age,
        gender: apt.gender,
        birthDate: apt.birthDate,
        aptId: apt.aptId,
        registrationId: apt.patientId,
        phone: '010-****-****',
        guardian: '-',
      },
      appointmentInfo: {
        date: apt.visitDate || '',
        time: apt.time,
        department: apt.department,
        doctor: '-',
        estimatedTime: `약 ${apt.examCount * 15}분`,
        insuranceType: '건강보험',
      },
      preExamChecks: {
        fasting: { status: apt.exams.some(e => e.description.includes('금식')) ? '금식 필요' : '해당 없음', detail: '' },
        allergy: { status: '해당 없음', detail: '' },
        contrastAgent: { status: apt.exams.some(e => e.name.includes('CT') || e.name.includes('조영')) ? '사용' : '해당 없음', detail: '' },
        mriMetal: { status: apt.exams.some(e => e.name.includes('MRI')) ? '확인 필요' : '해당 없음', detail: '' },
        others: { status: '없음', detail: apt.exams.map(e => e.description).filter(Boolean).join(', ') || '' },
      },
      exams: apt.exams,
    };
  });

  return {
    patients,
    todayAppointments,
    patientDetails,
  };
}

// 이름 마스킹 (예: 김영희 → 김*희)
function maskName(name) {
  if (!name || name.length < 2) return name;
  if (name.length === 2) return name[0] + '*';
  return name[0] + '*' + name.slice(2);
}

// 주민등록번호에서 생년월일 추출
function extractBirthDate(rrn) {
  if (!rrn) return '';
  const rrnStr = String(rrn).replace('-', '');
  if (rrnStr.length < 7) return '';
  const prefix = rrnStr.substring(0, 6);
  const genderDigit = rrnStr.substring(6, 7);
  let year = prefix.substring(0, 2);
  const month = prefix.substring(2, 4);
  const day = prefix.substring(4, 6);
  
  if (genderDigit === '1' || genderDigit === '2') {
    year = '19' + year;
  } else {
    year = '20' + year;
  }
  return `${year}-${month}-${day}`;
}
