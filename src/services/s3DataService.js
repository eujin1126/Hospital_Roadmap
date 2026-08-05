import * as XLSX from 'xlsx';

const S3_URL = 'https://hospital-demo-data-6zo.s3.us-east-1.amazonaws.com/patient.csv';

// S3에서 CSV 파일을 가져와 JSON으로 변환 (EUC-KR/UTF-8 자동 감지)
export async function fetchPatientData() {
  const response = await fetch(S3_URL);
  if (!response.ok) throw new Error(`S3 fetch failed: ${response.status}`);
  const arrayBuffer = await response.arrayBuffer();
  
  // UTF-8로 먼저 시도, 깨지면 EUC-KR로 디코딩
  let text;
  const utf8Decoder = new TextDecoder('utf-8');
  const utf8Text = utf8Decoder.decode(arrayBuffer);
  
  // UTF-8로 디코딩했을 때 깨진 문자(replacement character) 비율 체크
  const brokenChars = (utf8Text.match(/\ufffd/g) || []).length;
  if (brokenChars > 5) {
    // EUC-KR로 재디코딩
    const eucKrDecoder = new TextDecoder('euc-kr');
    text = eucKrDecoder.decode(arrayBuffer);
  } else {
    text = utf8Text;
  }

  // CSV를 XLSX로 파싱
  const workbook = XLSX.read(text, { type: 'string' });
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
        name: row.name,
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
        name: row.name,
        fullName: row.name,
        birthDate: extractBirthDate(row.rrn),
        time: normalizeTime(row.time),
        department: row.department,
        examCount: 0,
        exams: [],
        guideStatus: row.documentStatus === 'GENERATED' ? '생성' : '미생성',
        printStatus: row.printStatus === 'PRINTED' ? '출력' : '미출력',
        age: parseInt(row.age) || 0,
        gender: row.gender === 'F' ? '여' : '남',
        visitDate: row.visitDate,
        phone: row.number || row.phone || '-',
        note: row.note || '',
        // 의료 특이사항
        allergy: row.allergy || '',
        pregnancyStatus: row.pregnancyStatus || '',
        diabetes: row.diabetes || '',
        hypertension: row.hypertension || '',
        anticoagulant: row.anticoagulant || '',
        pacemaker: row.pacemaker || '',
        metalImplant: row.metalImplant || '',
        wheelchair: row.wheelchair || '',
        guardianRequired: row.guardianRequired || '',
        patientNote: row.patientNote || '',
      });
    }
    const apt = appointmentMap.get(row.reservationId);
    // exam 필드를 → 또는 -> 구분자로 분리하여 각각 독립 검사로 추가
    const examStr = row.exam || row.examCode || '';
    const examItems = examStr.split(/\s*(?:→|->)\s*/).filter(e => e.trim() !== '');
    
    // location 필드도 동일 구분자로 분리 (검사별 위치 매핑) - →, ->, , 로 구분
    const locationStr = row.location || '';
    const locationItems = locationStr.split(/\s*(?:→|->|,)\s*/).filter(e => e.trim() !== '');

    if (examItems.length > 0) {
      examItems.forEach((examName, idx) => {
        // CSV의 location이 있으면 우선 사용, 없으면 하드코딩 함수 사용
        const csvLocation = locationItems[idx] ? locationItems[idx].trim() : '';
        const finalLocation = csvLocation || getExamLocation(examName.trim());
        
        // 위치에서 층 정보 추출하여 안내도 이미지 결정
        const floorFromLocation = extractFloorFromLocation(finalLocation);
        const floorInfo = floorFromLocation
          ? { floor: floorFromLocation, imageUrl: getFloorMapImageUrl(floorFromLocation) }
          : getExamFloorMapImage(examName.trim(), row.department);
        
        apt.exams.push({
          order: apt.exams.length + 1,
          name: examName.trim(),
          code: row.examCode || '',
          description: row.instruction || '',
          location: finalLocation,
          waitTime: getExamWaitTime(examName.trim()),
          floor: floorInfo.floor,
          floorMapImage: floorInfo.imageUrl,
        });
      });
      apt.examCount = apt.exams.length;
    } else {
      const floorInfo = getExamFloorMapImage('', row.department);
      apt.exams.push({
        order: apt.exams.length + 1,
        name: '검사',
        code: row.examCode || '',
        description: row.instruction || '',
        location: row.location || '',
        waitTime: '약 10분',
        floor: floorInfo.floor,
        floorMapImage: floorInfo.imageUrl,
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
      medicalInfo: {
        allergy: apt.allergy,
        pregnancyStatus: apt.pregnancyStatus,
        diabetes: apt.diabetes,
        hypertension: apt.hypertension,
        anticoagulant: apt.anticoagulant,
        pacemaker: apt.pacemaker,
        metalImplant: apt.metalImplant,
        wheelchair: apt.wheelchair,
        guardianRequired: apt.guardianRequired,
        patientNote: apt.patientNote,
      },
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
    // 엑셀 기준일: 1899-12-30, UTC 정오 기준으로 계산하여 타임존 오차 방지
    const date = new Date(Date.UTC(1899, 11, 30 + num, 12, 0, 0));
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, '0');
    const d = String(date.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  // 다른 형식 시도
  const d = new Date(dateVal);
  if (!isNaN(d.getTime())) {
    const y2 = d.getFullYear();
    const m2 = String(d.getMonth() + 1).padStart(2, '0');
    const d2 = String(d.getDate()).padStart(2, '0');
    return `${y2}-${m2}-${d2}`;
  }
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

// 시간 정규화: "9:00:00 AM" → "9:00", "2:30:00 PM" → "14:30", "오전 9:00:00" → "9:00"
function normalizeTime(timeVal) {
  if (!timeVal) return '';
  const str = String(timeVal).trim();
  
  // 이미 HH:MM 24시간 형식인 경우 (초 없이)
  if (/^\d{1,2}:\d{2}$/.test(str)) return str;

  // 한국어 오전/오후 형식 처리: "오전 9:00:00", "오후 2:30:00"
  const korMatch = str.match(/^(오전|오후)\s*(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (korMatch) {
    let hours = parseInt(korMatch[2]);
    const minutes = korMatch[3];
    const period = korMatch[1];
    
    if (period === '오후' && hours !== 12) {
      hours += 12;
    } else if (period === '오전' && hours === 12) {
      hours = 0;
    }
    return `${hours}:${minutes}`;
  }
  
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

// S3 이미지 베이스 URL
const S3_MAP_BASE = 'https://hospital-demo-data-6zo.s3.us-east-1.amazonaws.com/maps';

// 위치 문자열에서 층 코드 추출 (예: "2층 채혈실" → "2f", "지하1층 MRI실" → "b1")
function extractFloorFromLocation(location) {
  if (!location) return null;
  const loc = location.trim();
  
  // 지하 층 매칭
  const basementMatch = loc.match(/지하\s*(\d+)\s*층/);
  if (basementMatch) return `b${basementMatch[1]}`;
  
  // 일반 층 매칭 (예: "2층", "1층")
  const floorMatch = loc.match(/(\d+)\s*층/);
  if (floorMatch) return `${floorMatch[1]}f`;
  
  // B1, 1F 등 영문 표기
  const engMatch = loc.match(/\b(b\d+|\d+f)\b/i);
  if (engMatch) return engMatch[1].toLowerCase();
  
  return null;
}

// 검사명 → 층 코드 매핑
function getExamFloor(examName) {
  const name = examName.toLowerCase();
  if (name.includes('ct') || name.includes('x-ray') || name.includes('x ray') || name.includes('흉부')) return '1f';
  if (name.includes('mri')) return 'b1';
  if (name.includes('혈액') || name.includes('채혈')) return '2f';
  if (name.includes('초음파')) return '1f';
  if (name.includes('심전도') || name.includes('ecg') || name.includes('심장')) return '2f';
  if (name.includes('내시경')) return '2f';
  if (name.includes('폐기능') || name.includes('호흡')) return '2f';
  if (name.includes('소변') || name.includes('뇨')) return '2f';
  if (name.includes('골밀도')) return '1f';
  if (name.includes('수술')) return '3f';
  return null;
}

// 진료과 → 층 코드 매핑
function getDepartmentFloor(department) {
  if (!department) return null;
  const dept = department.trim();
  
  const floorMap = {
    // 1층
    '영상의학과': '1f',
    '정형외과': '1f',
    '재활의학과': '1f',
    '가정의학과': '1f',
    '소화기센터': '1f',
    '응급의학과': '1f',
    // 2층
    '외과': '2f',
    '이비인후과': '2f',
    '피부과': '2f',
    '안과': '2f',
    '호흡기내과': '2f',
    '알레르기내과': '2f',
    '내과': '2f',
    '소화기내과': '2f',
    '신장내과': '2f',
    '감염내과': '2f',
    '비뇨의학과': '2f',
    '비뇨기과': '2f',
    '정신건강의학과': '2f',
    '혈액종양내과': '2f',
    '성형외과': '2f',
    '신경외과': '2f',
    '신경과': '2f',
    '심장외과': '2f',
    '흉부외과': '2f',
    '치과': '2f',
    '구강외과': '2f',
    '산부인과': '2f',
    '류머티스내과': '2f',
    '호흡기·알레르기내과': '2f',
    // 3층
    '수술실': '3f',
    // 6층
    '진단검사의학과': '6f',
    // B1
    '방사선종양학과': 'b1',
    '약제과': 'b1',
  };

  // 정확한 매칭 시도
  if (floorMap[dept]) return floorMap[dept];
  
  // 부분 매칭 시도
  for (const [key, floor] of Object.entries(floorMap)) {
    if (dept.includes(key) || key.includes(dept)) return floor;
  }
  
  return null;
}

// 층 코드 → 안내도 이미지 URL
function getFloorMapImageUrl(floorCode) {
  if (!floorCode) return null;
  // 실제 S3 파일명: b1f.png, 1f.png, 2f.png ... 8f.png
  const fileName = floorCode === 'b1' ? 'b1f.png' : `${floorCode}.png`;
  return `${S3_MAP_BASE}/${fileName}`;
}

// 검사의 층별 안내도 이미지 URL 가져오기 (검사명 우선, 없으면 진료과 기준)
export function getExamFloorMapImage(examName, department) {
  const floorByExam = getExamFloor(examName);
  if (floorByExam) return { floor: floorByExam, imageUrl: getFloorMapImageUrl(floorByExam) };
  
  const floorByDept = getDepartmentFloor(department);
  if (floorByDept) return { floor: floorByDept, imageUrl: getFloorMapImageUrl(floorByDept) };
  
  return { floor: null, imageUrl: null };
}

