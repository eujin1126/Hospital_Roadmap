import * as XLSX from 'xlsx';

const S3_URL = 'https://hospital-demo-data-6zo.s3.us-east-1.amazonaws.com/patient.xlsx';

// S3에서 xlsx 파일을 가져와 JSON으로 변환
export async function fetchPatientData() {
  const response = await fetch(S3_URL);
  if (!response.ok) throw new Error(`S3 fetch failed: ${response.status}`);
  const arrayBuffer = await response.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rawData = XLSX.utils.sheet_to_json(worksheet, { raw: false });
  return rawData;
}

// S3 데이터를 앱에서 사용하는 형식으로 변환
export function transformPatientData(rawData) {
  // visitDate 정규화 (엑셀 날짜 형식 처리)
  const normalizedData = rawData.map(row => ({
    ...row,
    visitDate: normalizeDate(row.visitDate),
    time: normalizeTime(row.time),
  }));

  // 환자 목록 (전체 환자 목록 페이지용) - reservationId 기준 중복 제거
  const patientMap = new Map();
  normalizedData.forEach(row => {
    if (!patientMap.has(row.reservationId)) {
      patientMap.set(row.reservationId, {
        id: row.reservationId,
        name: maskName(row.name),
        fullName: row.name,
        birthDate: extractBirthDate(row.rrn),
        gender: row.gender === 'F' ? '여' : '남',
        phone: row.number || row.phone || '-',
        department: row.department,
        lastVisit: `${row.visitDate} ${normalizeTime(row.time)}`.trim(),
        age: parseInt(row.age) || 0,
      });
    }
  });
  const patients = Array.from(patientMap.values());

  // 모든 예약 데이터를 reservationId 기준으로 그룹핑
  const appointmentMap = new Map();
  let aptCounter = 1;
  normalizedData.forEach(row => {
    if (!appointmentMap.has(row.reservationId)) {
      const aptId = `APT-${String(aptCounter).padStart(3, '0')}`;
      aptCounter++;
      appointmentMap.set(row.reservationId, {
        aptId,
        patientId: row.reservationId,
        name: maskName(row.name),
        fullName: row.name,
        birthDate: extractBirthDate(row.rrn),
        time: normalizeTime(row.time),
        department: row.department,
        examCount: 0,
        exams: [],
        guideStatus: row.status === 'RESERVED' ? '미생성' : '확정됨',
        printStatus: parseInt(row.checkedIn) === 1 ? '출력됨' : '미출력',
        age: parseInt(row.age) || 0,
        gender: row.gender === 'F' ? '여' : '남',
        visitDate: row.visitDate,
        phone: row.number || row.phone || '-',
        note: row.note || '',
      });
    }
    const apt = appointmentMap.get(row.reservationId);
    // exam 필드를 → 또는 -> 구분자로 분리하여 각각 독립 검사로 추가
    const examStr = row.exam || row.examCode || '';
    const examItems = examStr.split(/\s*(?:→|->)\s*/).filter(e => e.trim() !== '');
    if (examItems.length > 0) {
      examItems.forEach(examName => {
        apt.exams.push({
          order: apt.exams.length + 1,
          name: examName.trim(),
          code: row.examCode || '',
          description: row.instruction || '',
          location: getExamLocation(examName.trim()),
          waitTime: getExamWaitTime(examName.trim()),
        });
      });
      apt.examCount = apt.exams.length;
    } else {
      apt.exams.push({
        order: apt.exams.length + 1,
        name: '검사',
        code: row.examCode || '',
        description: row.instruction || '',
        location: row.location || '',
        waitTime: '약 10분',
      });
      apt.examCount = apt.exams.length;
    }
  });
  const allAppointments = Array.from(appointmentMap.values());

  // 날짜별 예약 그룹핑 (캘린더용)
  const calendarData = {};
  allAppointments.forEach(apt => {
    if (apt.visitDate) {
      calendarData[apt.visitDate] = (calendarData[apt.visitDate] || 0) + 1;
    }
  });

  // 날짜별 예약 상세 목록 (캘린더 오른쪽 패널용)
  const appointmentsByDate = {};
  allAppointments.forEach(apt => {
    if (!apt.visitDate) return;
    if (!appointmentsByDate[apt.visitDate]) {
      appointmentsByDate[apt.visitDate] = [];
    }
    appointmentsByDate[apt.visitDate].push({
      time: apt.time,
      name: apt.name,
      department: apt.department,
      doctor: '-',
      status: apt.guideStatus === '확정됨' ? '확정' : '대기',
    });
  });
  // 시간순 정렬
  Object.keys(appointmentsByDate).forEach(date => {
    appointmentsByDate[date].sort((a, b) => a.time.localeCompare(b.time));
  });

  // 환자 상세 정보
  const patientDetails = {};
  allAppointments.forEach(apt => {
    patientDetails[apt.aptId] = {
      basicInfo: {
        name: apt.fullName,
        age: apt.age,
        gender: apt.gender,
        birthDate: apt.birthDate,
        aptId: apt.aptId,
        registrationId: apt.patientId,
        phone: apt.phone || '-',
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
        others: { status: apt.note || '없음', detail: apt.exams.map(e => e.description).filter(Boolean).join(', ') || '' },
      },
      exams: apt.exams,
    };
  });

  // 진료과별 현황
  const deptCountMap = {};
  allAppointments.forEach(apt => {
    deptCountMap[apt.department] = (deptCountMap[apt.department] || 0) + 1;
  });
  const departmentStats = Object.entries(deptCountMap).map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return {
    patients,
    allAppointments,
    calendarData,
    appointmentsByDate,
    patientDetails,
    departmentStats,
  };
}

// 날짜 정규화 (2026-08-10 형태로 통일)
function normalizeDate(dateVal) {
  if (!dateVal) return '';
  // 이미 YYYY-MM-DD 형식인 경우
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateVal)) return dateVal;
  // YYYY/MM/DD 형식
  if (/^\d{4}\/\d{2}\/\d{2}$/.test(dateVal)) return dateVal.replace(/\//g, '-');
  // 엑셀 시리얼 넘버인 경우
  const num = Number(dateVal);
  if (!isNaN(num) && num > 40000) {
    const date = new Date((num - 25569) * 86400 * 1000);
    return date.toISOString().split('T')[0];
  }
  // 다른 형식 시도
  const d = new Date(dateVal);
  if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
  return String(dateVal);
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

// 시간 정규화: "9:00:00 AM" → "9:00", "2:30:00 PM" → "14:30"
function normalizeTime(timeVal) {
  if (!timeVal) return '';
  const str = String(timeVal).trim();
  
  // 이미 HH:MM 24시간 형식인 경우 (초 없이)
  if (/^\d{1,2}:\d{2}$/.test(str)) return str;
  
  // AM/PM 형식 처리
  const ampmMatch = str.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM|am|pm)?$/i);
  if (ampmMatch) {
    let hours = parseInt(ampmMatch[1]);
    const minutes = ampmMatch[2];
    const period = (ampmMatch[3] || '').toUpperCase();
    
    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }
    return `${hours}:${minutes}`;
  }
  
  // HH:MM:SS 형식 (AM/PM 없이) → HH:MM으로 자르기
  const timeMatch = str.match(/^(\d{1,2}:\d{2}):\d{2}$/);
  if (timeMatch) return timeMatch[1];
  
  return str;
}

// 검사명에 따른 검사 위치 반환
function getExamLocation(examName) {
  const name = examName.toLowerCase();
  if (name.includes('ct')) return '1층 영상의학과 CT실';
  if (name.includes('mri')) return '지하1층 MRI실';
  if (name.includes('x-ray') || name.includes('x ray') || name.includes('흉부')) return '1층 영상의학과 X-ray실';
  if (name.includes('혈액')) return '2층 검사실 A';
  if (name.includes('초음파')) return '2층 초음파실';
  if (name.includes('심전도') || name.includes('ecg')) return '3층 심장검사실';
  if (name.includes('내시경')) return '2층 내시경실';
  if (name.includes('폐기능')) return '3층 호흡기검사실';
  if (name.includes('소변') || name.includes('뇨')) return '2층 검사실 B';
  if (name.includes('골밀도')) return '1층 영상의학과';
  if (name.includes('위')) return '2층 내시경실';
  return '검사실 (접수 후 안내)';
}

// 검사명에 따른 예상 소요시간 반환
function getExamWaitTime(examName) {
  const name = examName.toLowerCase();
  if (name.includes('ct')) return '약 20분';
  if (name.includes('mri')) return '약 40분';
  if (name.includes('x-ray') || name.includes('x ray') || name.includes('흉부')) return '약 10분';
  if (name.includes('혈액')) return '약 10분';
  if (name.includes('초음파')) return '약 20분';
  if (name.includes('심전도') || name.includes('ecg')) return '약 15분';
  if (name.includes('내시경')) return '약 30분';
  if (name.includes('폐기능')) return '약 15분';
  if (name.includes('소변') || name.includes('뇨')) return '약 5분';
  if (name.includes('골밀도')) return '약 10분';
  return '약 15분';
}
