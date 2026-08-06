// 병원별 설정 (로그인 계정 → 병원 데이터 매핑)
// 새 병원 추가 시 여기에 항목만 추가하면 됨

const hospitalConfig = {
  'EMP2024001': {
    hospitalName: '강원대학교병원',
    csvFileName: 'patient.csv',
    s3Bucket: 'hospital-demo-data-6zo',
    mapsFolder: 'maps',
    mapsAvailable: ['b1f', '1f', '2f', '3f', '4f', '5f', '6f', '7f', '8f'],
    phone: '033-258-2000',
    logo: '/knuh-logo.svg',
  },
  'EMP2024002': {
    hospitalName: '건국대학교병원',
    csvFileName: 'patient2.csv',
    s3Bucket: 'hospital-demo-data-6zo',
    mapsFolder: 'map',
    mapsAvailable: ['b1f', '1f', '2f'],
    phone: '02-2030-5000',
    logo: '/konkuk-logo.svg',
  },
  // 향후 확장:
  // 'EMP2024003': {
  //   hospitalName: 'OO대학교병원',
  //   csvFileName: 'patient3.csv',
  //   s3Bucket: 'hospital-demo-data-6zo',
  //   mapsFolder: 'maps',
  //   phone: '000-000-0000',
  //   logo: '/logo.svg',
  // },
};

export function getHospitalConfig(employeeId) {
  return hospitalConfig[employeeId] || null;
}

export function getAllEmployeeIds() {
  return Object.keys(hospitalConfig);
}

export default hospitalConfig;
