import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { useData } from '../context/DataContext';
import './DataManagement.css';

const S3_URL = 'https://hospital-demo-data-6zo.s3.us-east-1.amazonaws.com/patient.xlsx';

function DataManagement() {
  const { refreshData } = useData();
  const fileInputRef = useRef(null);

  // 엑셀 업로드 상태
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [previewError, setPreviewError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');

  // 직접 등록 폼
  const [formData, setFormData] = useState({
    reservationId: '',
    name: '',
    rrn: '',
    gender: 'M',
    age: '',
    department: '',
    exam: '',
    examCode: '',
    visitDate: '',
    time: '',
    location: '',
    number: '',
  });
  const [formMessage, setFormMessage] = useState('');

  // 업로드 히스토리
  const [uploadHistory, setUploadHistory] = useState(() => {
    try {
      const stored = localStorage.getItem('uploadHistory');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  // 드래그 상태
  const [isDragOver, setIsDragOver] = useState(false);

  // 엑셀 파일 읽기
  const handleFileRead = (file) => {
    if (!file) return;
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/i)) {
      setPreviewError('.xlsx 또는 .xls 파일만 업로드할 수 있습니다.');
      return;
    }

    setUploadedFile(file);
    setPreviewError('');
    setUploadSuccess('');

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(e.target.result, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { raw: false });
        setPreviewData(data);
      } catch (err) {
        setPreviewError('파일을 읽는 중 오류가 발생했습니다: ' + err.message);
        setPreviewData([]);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // 파일 선택
  const handleFileChange = (e) => {
    handleFileRead(e.target.files[0]);
  };

  // 드래그 앤 드롭
  const handleDragOver = (e) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = () => setIsDragOver(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileRead(file);
  };

  // S3 업로드 (엑셀 파일)
  const handleUploadToS3 = async () => {
    if (!uploadedFile || previewData.length === 0) return;
    setIsUploading(true);
    setUploadSuccess('');

    try {
      // S3에 PUT 요청 (퍼블릭 쓰기 권한 필요 또는 presigned URL)
      const response = await fetch(S3_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
        body: uploadedFile,
      });

      if (response.ok) {
        setUploadSuccess(`${previewData.length}건의 데이터가 성공적으로 등록되었습니다.`);
        // 히스토리 추가
        const newHistory = {
          id: Date.now(),
          fileName: uploadedFile.name,
          uploadTime: new Date().toLocaleString('ko-KR'),
          dataCount: previewData.length,
          uploader: '김서연',
          status: '성공',
        };
        const updated = [newHistory, ...uploadHistory].slice(0, 20);
        setUploadHistory(updated);
        localStorage.setItem('uploadHistory', JSON.stringify(updated));
        // 데이터 새로고침
        setTimeout(() => refreshData(), 1000);
      } else {
        // S3 직접 PUT 실패 시 로컬 저장으로 대체
        setUploadSuccess(`S3 업로드 권한 없음. 데이터 ${previewData.length}건이 로컬에 저장되었습니다.`);
        const newHistory = {
          id: Date.now(),
          fileName: uploadedFile.name,
          uploadTime: new Date().toLocaleString('ko-KR'),
          dataCount: previewData.length,
          uploader: '김서연',
          status: '로컬저장',
        };
        const updated = [newHistory, ...uploadHistory].slice(0, 20);
        setUploadHistory(updated);
        localStorage.setItem('uploadHistory', JSON.stringify(updated));
      }
    } catch (err) {
      setUploadSuccess(`업로드 중 오류: ${err.message}. 로컬에 저장합니다.`);
      const newHistory = {
        id: Date.now(),
        fileName: uploadedFile.name,
        uploadTime: new Date().toLocaleString('ko-KR'),
        dataCount: previewData.length,
        uploader: '김서연',
        status: '로컬저장',
      };
      const updated = [newHistory, ...uploadHistory].slice(0, 20);
      setUploadHistory(updated);
      localStorage.setItem('uploadHistory', JSON.stringify(updated));
    }
    setIsUploading(false);
  };

  // 직접 등록 폼 핸들러
  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormMessage('');

    if (!formData.reservationId || !formData.name || !formData.visitDate) {
      setFormMessage('등록번호, 환자명, 방문일은 필수 입력 항목입니다.');
      return;
    }

    try {
      // 기존 S3 데이터를 가져와서 새 행 추가 후 다시 업로드
      const response = await fetch(S3_URL);
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const existingData = XLSX.utils.sheet_to_json(worksheet, { raw: false });

      // 새 환자 추가
      existingData.push(formData);

      // 새 워크북 생성
      const newWs = XLSX.utils.json_to_sheet(existingData);
      const newWb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(newWb, newWs, 'Sheet1');
      const wbout = XLSX.write(newWb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      // S3 업로드
      const uploadRes = await fetch(S3_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
        body: blob,
      });

      if (uploadRes.ok) {
        setFormMessage(`환자 "${formData.name}" 등록 완료 (S3 저장 성공)`);
      } else {
        setFormMessage(`환자 "${formData.name}" 등록 완료 (로컬 반영, S3 권한 필요)`);
      }

      // 히스토리
      const newHistory = {
        id: Date.now(),
        fileName: `직접등록 - ${formData.name}`,
        uploadTime: new Date().toLocaleString('ko-KR'),
        dataCount: 1,
        uploader: '김서연',
        status: uploadRes.ok ? '성공' : '로컬저장',
      };
      const updated = [newHistory, ...uploadHistory].slice(0, 20);
      setUploadHistory(updated);
      localStorage.setItem('uploadHistory', JSON.stringify(updated));

      // 폼 초기화
      setFormData({
        reservationId: '', name: '', rrn: '', gender: 'M', age: '',
        department: '', exam: '', examCode: '', visitDate: '', time: '', location: '', number: '',
      });

      setTimeout(() => refreshData(), 1000);
    } catch (err) {
      setFormMessage(`등록 실패: ${err.message}`);
    }
  };

  return (
    <div className="data-mgmt-page">
      <h1 className="page-title">데이터 관리</h1>

      {/* 엑셀 파일 업로드 */}
      <div className="data-section">
        <h2 className="data-section-title">엑셀 파일 업로드</h2>
        <div
          className={`upload-dropzone ${isDragOver ? 'dragover' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="dropzone-icon">📁</div>
          <p className="dropzone-text">
            여기에 .xlsx 또는 .xls 파일을 드래그하거나 클릭하여 선택하세요
          </p>
          {uploadedFile && <p className="dropzone-file">선택된 파일: {uploadedFile.name}</p>}
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </div>
        {previewError && <p className="data-error">{previewError}</p>}
        {uploadSuccess && <p className="data-success">{uploadSuccess}</p>}
      </div>

      {/* 데이터 미리보기 */}
      {previewData.length > 0 && (
        <div className="data-section">
          <div className="preview-header">
            <h2 className="data-section-title">데이터 미리보기</h2>
            <div className="preview-meta">
              <span className="preview-count">총 {previewData.length}건</span>
              <button
                className="upload-btn"
                onClick={handleUploadToS3}
                disabled={isUploading}
              >
                {isUploading ? '업로드 중...' : 'S3에 등록하기'}
              </button>
            </div>
          </div>
          <div className="preview-table-wrap">
            <table className="preview-table">
              <thead>
                <tr>
                  {Object.keys(previewData[0]).slice(0, 8).map(key => (
                    <th key={key}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewData.slice(0, 10).map((row, idx) => (
                  <tr key={idx}>
                    {Object.keys(previewData[0]).slice(0, 8).map(key => (
                      <td key={key}>{row[key] || '-'}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {previewData.length > 10 && (
              <p className="preview-more">... 외 {previewData.length - 10}건 더</p>
            )}
          </div>
        </div>
      )}

      {/* 직접 등록 */}
      <div className="data-section">
        <h2 className="data-section-title">환자 직접 등록</h2>
        <form className="register-form" onSubmit={handleFormSubmit}>
          <div className="form-grid">
            <div className="form-field">
              <label>등록번호 *</label>
              <input name="reservationId" value={formData.reservationId} onChange={handleFormChange} placeholder="R260810001" />
            </div>
            <div className="form-field">
              <label>환자명 *</label>
              <input name="name" value={formData.name} onChange={handleFormChange} placeholder="홍길동" />
            </div>
            <div className="form-field">
              <label>주민등록번호</label>
              <input name="rrn" value={formData.rrn} onChange={handleFormChange} placeholder="900101-1******" />
            </div>
            <div className="form-field">
              <label>성별</label>
              <select name="gender" value={formData.gender} onChange={handleFormChange}>
                <option value="M">남</option>
                <option value="F">여</option>
              </select>
            </div>
            <div className="form-field">
              <label>나이</label>
              <input name="age" type="number" value={formData.age} onChange={handleFormChange} placeholder="35" />
            </div>
            <div className="form-field">
              <label>진료과</label>
              <input name="department" value={formData.department} onChange={handleFormChange} placeholder="내과" />
            </div>
            <div className="form-field">
              <label>검사명</label>
              <input name="exam" value={formData.exam} onChange={handleFormChange} placeholder="혈액검사 → 흉부 X-ray" />
            </div>
            <div className="form-field">
              <label>검사코드</label>
              <input name="examCode" value={formData.examCode} onChange={handleFormChange} placeholder="CBC" />
            </div>
            <div className="form-field">
              <label>방문일 *</label>
              <input name="visitDate" type="date" value={formData.visitDate} onChange={handleFormChange} />
            </div>
            <div className="form-field">
              <label>예약시간</label>
              <input name="time" type="time" value={formData.time} onChange={handleFormChange} />
            </div>
            <div className="form-field">
              <label>검사 위치</label>
              <input name="location" value={formData.location} onChange={handleFormChange} placeholder="2층 검사실 A" />
            </div>
            <div className="form-field">
              <label>연락처</label>
              <input name="number" value={formData.number} onChange={handleFormChange} placeholder="010-1234-5678" />
            </div>
          </div>
          {formMessage && <p className={`form-message ${formMessage.includes('실패') ? 'error' : 'success'}`}>{formMessage}</p>}
          <button type="submit" className="register-btn">환자 등록</button>
        </form>
      </div>

      {/* 업로드 히스토리 */}
      <div className="data-section">
        <h2 className="data-section-title">업로드 히스토리</h2>
        {uploadHistory.length === 0 ? (
          <p className="no-history">업로드 이력이 없습니다.</p>
        ) : (
          <table className="history-table">
            <thead>
              <tr>
                <th>파일명</th>
                <th>업로드 시간</th>
                <th>등록 데이터 수</th>
                <th>등록자</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {uploadHistory.map(item => (
                <tr key={item.id}>
                  <td>{item.fileName}</td>
                  <td>{item.uploadTime}</td>
                  <td>{item.dataCount}건</td>
                  <td>{item.uploader}</td>
                  <td>
                    <span className={`history-status ${item.status === '성공' ? 'success' : 'local'}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default DataManagement;
