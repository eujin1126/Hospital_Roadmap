// 환자 데이터
export const patients = [
  { id: 'R2024-0801', name: '이*준', fullName: '이민준', birthDate: '1985-03-15', gender: '남', phone: '010-1234-5678', department: '내과', lastVisit: '2026-08-04 09:00', age: 41 },
  { id: 'R2024-0802', name: '김*진', fullName: '김서진', birthDate: '1972-07-22', gender: '여', phone: '010-2345-6789', department: '소화기내과', lastVisit: '2026-08-04 09:30', age: 54 },
  { id: 'R2024-0803', name: '박*호', fullName: '박준호', birthDate: '1968-11-03', gender: '남', phone: '010-3456-7890', department: '외과', lastVisit: '2026-08-04 10:00', age: 57 },
  { id: 'R2024-0804', name: '장*늘', fullName: '장하늘', birthDate: '1990-01-28', gender: '여', phone: '010-4567-8901', department: '성형외과', lastVisit: '2026-08-04 10:30', age: 36 },
  { id: 'R2024-0805', name: '최*현', fullName: '최서현', birthDate: '1955-09-10', gender: '남', phone: '010-5678-9012', department: '소화기내과', lastVisit: '2026-08-04 11:00', age: 70 },
  { id: 'R2024-0806', name: '한*울', fullName: '한서울', birthDate: '1998-05-17', gender: '여', phone: '010-6789-0123', department: '내분비내과', lastVisit: '2026-08-04 13:00', age: 28 },
  { id: 'R2024-0807', name: '윤*석', fullName: '윤재석', birthDate: '1980-12-05', gender: '남', phone: '010-7890-1234', department: '호흡기내과', lastVisit: '2026-08-04 14:00', age: 45 },
  { id: 'R2024-0808', name: '송*래', fullName: '송미래', birthDate: '1963-04-20', gender: '여', phone: '010-8901-2345', department: '산부인과', lastVisit: '2026-08-04 14:30', age: 63 },
];

// 오늘 예약 환자
export const todayAppointments = [
  { aptId: 'APT-001', patientId: 'R2024-0801', name: '이*준', birthDate: '1985-03-15', time: '09:00', department: '내과', examCount: 3, guideStatus: '미생성', printStatus: '출력됨' },
  { aptId: 'APT-002', patientId: 'R2024-0802', name: '김*진', birthDate: '1972-07-22', time: '09:30', department: '소화기내과', examCount: 2, guideStatus: '확인 필요', printStatus: '미출력' },
  { aptId: 'APT-003', patientId: 'R2024-0803', name: '박*호', birthDate: '1968-11-03', time: '10:00', department: '외과', examCount: 3, guideStatus: '미생성', printStatus: '미출력' },
  { aptId: 'APT-004', patientId: 'R2024-0804', name: '장*늘', birthDate: '1990-01-28', time: '10:30', department: '성형외과', examCount: 1, guideStatus: '미생성', printStatus: '미출력' },
  { aptId: 'APT-005', patientId: 'R2024-0805', name: '최*현', birthDate: '1955-09-10', time: '11:00', department: '소화기내과', examCount: 2, guideStatus: '확인 필요', printStatus: '미출력' },
  { aptId: 'APT-006', patientId: 'R2024-0806', name: '한*울', birthDate: '1998-05-17', time: '13:00', department: '내분비내과', examCount: 2, guideStatus: '미생성', printStatus: '미출력' },
  { aptId: 'APT-007', patientId: 'R2024-0807', name: '윤*석', birthDate: '1980-12-05', time: '14:00', department: '호흡기내과', examCount: 2, guideStatus: '미생성', printStatus: '미출력' },
  { aptId: 'APT-008', patientId: 'R2024-0808', name: '송*래', birthDate: '1963-04-20', time: '14:30', department: '산부인과', examCount: 3, guideStatus: '확정됨', printStatus: '출력됨' },
];

// 안내문 관리 데이터
export const guides = {
  completed: [
    { aptId: 'APT-001', name: '이*준', time: '09:00', department: '내과', examCount: 3, status: '확정됨' },
    { aptId: 'APT-008', name: '송*래', time: '14:30', department: '산부인과', examCount: 3, status: '확정됨' },
  ],
  pending: [
    { aptId: 'APT-002', name: '김*진', time: '09:30', department: '소화기내과', examCount: 2, status: '확인 필요' },
    { aptId: 'APT-005', name: '최*현', time: '11:00', department: '소화기내과', examCount: 2, status: '확인 필요' },
  ]
};

// 출력 이력
export const printHistory = {
  completed: [
    { name: '이*준', department: '내과', time: '09:00', printDate: '2026-08-04 08:45', status: '출력됨' },
    { name: '송*래', department: '산부인과', time: '14:30', printDate: '2026-08-04 14:15', status: '출력됨' },
  ],
  pending: [
    { name: '김*진', department: '소화기내과', time: '09:30', status: '미출력' },
    { name: '박*호', department: '외과', time: '10:00', status: '미출력' },
    { name: '장*늘', department: '성형외과', time: '10:30', status: '미출력' },
    { name: '최*현', department: '소화기내과', time: '11:00', status: '미출력' },
    { name: '한*울', department: '내분비내과', time: '13:00', status: '미출력' },
  ]
};

// 환자 상세 정보
export const patientDetails = {
  'APT-001': {
    basicInfo: {
      name: '이민준',
      age: 41,
      gender: '남',
      birthDate: '1985-03-15',
      aptId: 'APT-001',
      registrationId: 'R2024-0801',
      phone: '010-1234-5678',
      guardian: '김정희 (010-9876-5432)',
    },
    appointmentInfo: {
      date: '2026-08-04 (화)',
      time: '09:00',
      department: '내과',
      doctor: '김철수 교수',
      estimatedTime: '약 45분',
      insuranceType: '건강보험',
    },
    preExamChecks: {
      fasting: { status: '금식 필요', detail: '8시간 이상 금식' },
      allergy: { status: '없음', detail: '폴리사콜 민감' },
      contrastAgent: { status: '해당 없음', detail: '' },
      mriMetal: { status: '해당 없음', detail: '' },
      others: { status: '없음', detail: '추가 주의사항 관련' },
    },
    exams: [
      { order: 1, name: '혈액검사 (CBC)', description: '전혈구 검사로 빈혈, 감염, 혈소판 이상 등을 확인합니다.', location: '2층 검사실 A', waitTime: '약 10분' },
      { order: 2, name: '흉부 X-ray', description: '흉부 엑스레이 촬영으로 폐, 심장 상태를 확인합니다.', location: '1층 영상의학과', waitTime: '약 15분' },
      { order: 3, name: '심전도 (ECG)', description: '심장의 전기적 활동을 기록하여 부정맥 등을 확인합니다.', location: '3층 심장검사실', waitTime: '약 10분' },
    ]
  },
  'APT-002': {
    basicInfo: {
      name: '김서진',
      age: 54,
      gender: '여',
      birthDate: '1972-07-22',
      aptId: 'APT-002',
      registrationId: 'R2024-0802',
      phone: '010-2345-6789',
      guardian: '이영호 (010-1111-2222)',
    },
    appointmentInfo: {
      date: '2026-08-04 (화)',
      time: '09:30',
      department: '소화기내과',
      doctor: '박영희 교수',
      estimatedTime: '약 30분',
      insuranceType: '건강보험',
    },
    preExamChecks: {
      fasting: { status: '금식 필요', detail: '6시간 이상 금식' },
      allergy: { status: '없음', detail: '' },
      contrastAgent: { status: '해당 없음', detail: '' },
      mriMetal: { status: '해당 없음', detail: '' },
      others: { status: '없음', detail: '' },
    },
    exams: [
      { order: 1, name: '복부 초음파', description: '간, 담낭, 췌장 등 복부 장기를 초음파로 확인합니다.', location: '2층 초음파실', waitTime: '약 20분' },
      { order: 2, name: '혈액검사', description: '간기능, 혈당 등을 확인합니다.', location: '2층 검사실 A', waitTime: '약 10분' },
    ]
  }
};

// 이번 주 예약 현황 (차트 데이터)
export const weeklyAppointments = [
  { day: '월', count: 5 },
  { day: '화', count: 8 },
  { day: '수', count: 6 },
  { day: '목', count: 9 },
  { day: '금', count: 11 },
  { day: '토', count: 3 },
  { day: '일', count: 0 },
];

// 시간대별 예약 분포
export const hourlyDistribution = [
  { time: '09:00', count: 2 },
  { time: '10:00', count: 2 },
  { time: '11:00', count: 1 },
  { time: '13:00', count: 1 },
  { time: '14:00', count: 2 },
];

// 월별 환자 수 추이 (2026년)
export const monthlyPatients = [
  { month: '1월', count: 173 },
  { month: '2월', count: 178 },
  { month: '3월', count: 225 },
  { month: '4월', count: 228 },
  { month: '5월', count: 200 },
  { month: '6월', count: 199 },
  { month: '7월', count: 202 },
  { month: '8월', count: 210 },
  { month: '9월', count: 216 },
  { month: '10월', count: 225 },
  { month: '11월', count: 222 },
  { month: '12월', count: 199 },
];

// 진료과별 현황
export const departmentStats = [
  { name: '소화기내과', count: 2 },
  { name: '내과', count: 1 },
  { name: '외과', count: 1 },
  { name: '성형외과', count: 1 },
];

// 캘린더 데이터 (2026년 8월)
export const calendarData = {
  '2026-08-01': 3,
  '2026-08-02': 5,
  '2026-08-04': 8,
  '2026-08-05': 11,
  '2026-08-06': 6,
  '2026-08-07': 9,
  '2026-08-08': 3,
  '2026-08-09': 15,
  '2026-08-10': 8,
  '2026-08-11': 14,
  '2026-08-12': 9,
  '2026-08-13': 11,
  '2026-08-14': 11,
  '2026-08-15': 0,
  '2026-08-16': 5,
  '2026-08-17': 5,
  '2026-08-18': 15,
  '2026-08-19': 7,
  '2026-08-20': 15,
  '2026-08-21': 7,
  '2026-08-22': 2,
  '2026-08-24': 7,
  '2026-08-25': 14,
  '2026-08-26': 11,
  '2026-08-27': 7,
  '2026-08-28': 13,
};

// 사용자 정보
export const currentUser = {
  name: '김서연',
  role: '간호사',
  employeeId: 'EMP2024001',
  department: '원무과',
  position: '접수 직원',
};

// 설정 데이터
export const settings = {
  hospitalName: '나그네대학병원',
  phone: '02-1234-5678',
  qrEnabled: true,
  defaultFontSize: '12px',
};
