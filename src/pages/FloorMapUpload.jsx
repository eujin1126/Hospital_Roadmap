import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import './DataManagement.css';

const S3_BASE_URL = 'https://hospital-demo-data-6zo.s3.us-east-1.amazonaws.com';

const FLOOR_OPTIONS = [
  { value: 'b1f', label: '지하 1층' },
  { value: '1f', label: '1층' },
  { value: '2f', label: '2층' },
  { value: '3f', label: '3층' },
  { value: '4f', label: '4층' },
  { value: '5f', label: '5층' },
  { value: '6f', label: '6층' },
  { value: '7f', label: '7층' },
  { value: '8f', label: '8층' },
];

function FloorMapUpload() {
  const { hospitalInfo } = useAuth();
  const fileInputRef = useRef(null);

  const [selectedFloor, setSelectedFloor] = useState('1f');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  // 업로드 이력
  const [uploadHistory, setUploadHistory] = useState(() => {
    try {
      const stored = localStorage.getItem('floorMapUploadHistory');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  const handleFileSelect = (file) => {
    if (!file) return;
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setUploadMessage('PNG, JPG, 또는 PDF 파일만 업로드할 수 있습니다.');
      return;
    }
    setSelectedFile(file);
    setUploadMessage('');

    // 이미지 미리보기
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleFileChange = (e) => handleFileSelect(e.target.files[0]);

  const handleDragOver = (e) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = () => setIsDragOver(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedFloor) return;

    setIsUploading(true);
    setUploadMessage('');

    try {
      // 파일 확장자 결정
      const ext = selectedFile.type === 'application/pdf' ? 'pdf' : 'png';
      const mapsFolder = hospitalInfo?.mapsFolder || 'maps';
      const s3Key = `${mapsFolder}/${selectedFloor}.${ext}`;
      const s3Url = `${S3_BASE_URL}/${s3Key}`;

      const response = await fetch(s3Url, {
        method: 'PUT',
        headers: { 'Content-Type': selectedFile.type },
        body: selectedFile,
      });

      if (response.ok) {
        setUploadMessage(`${FLOOR_OPTIONS.find(f => f.value === selectedFloor)?.label} 안내도 업로드 성공!`);
        
        // 이력 추가
        const newHistory = {
          id: Date.now(),
          floor: FLOOR_OPTIONS.find(f => f.value === selectedFloor)?.label,
          fileName: selectedFile.name,
          uploadTime: new Date().toLocaleString('ko-KR'),
          fileSize: `${(selectedFile.size / 1024).toFixed(1)}KB`,
          status: '성공',
        };
        const updated = [newHistory, ...uploadHistory].slice(0, 20);
        setUploadHistory(updated);
        localStorage.setItem('floorMapUploadHistory', JSON.stringify(updated));

        // 초기화
        setSelectedFile(null);
        setPreviewUrl(null);
      } else {
        setUploadMessage(`업로드 실패 (${response.status}). S3 권한을 확인하세요.`);
      }
    } catch (err) {
      setUploadMessage(`업로드 오류: ${err.message}`);
    }

    setIsUploading(false);
  };

  return (
    <div className="data-mgmt-page">
      <h1 className="page-title">층별 안내도 업로드</h1>

      {/* 파일 업로드 섹션 */}
      <div className="data-section">
        <h2 className="data-section-title">안내도 이미지 업로드</h2>

        <div className="form-grid" style={{ marginBottom: '16px' }}>
          <div className="form-field">
            <label>층 선택 *</label>
            <select
              value={selectedFloor}
              onChange={(e) => setSelectedFloor(e.target.value)}
              style={{ padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', background: '#f8fafc' }}
            >
              {FLOOR_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div
          className={`upload-dropzone ${isDragOver ? 'dragover' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="dropzone-icon">🗺️</div>
          <p className="dropzone-text">
            여기에 PNG, JPG 또는 PDF 파일을 드래그하거나 클릭하여 선택하세요
          </p>
          {selectedFile && <p className="dropzone-file">선택된 파일: {selectedFile.name}</p>}
          <input
            ref={fileInputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.pdf"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </div>

        {/* 미리보기 */}
        {previewUrl && (
          <div style={{ marginTop: '16px', textAlign: 'center' }}>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>미리보기</p>
            <img
              src={previewUrl}
              alt="안내도 미리보기"
              style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
            />
          </div>
        )}

        {/* 업로드 버튼 */}
        {selectedFile && (
          <div style={{ marginTop: '16px' }}>
            <button
              className="upload-btn"
              onClick={handleUpload}
              disabled={isUploading}
              style={{ padding: '10px 24px', fontSize: '14px' }}
            >
              {isUploading ? '업로드 중...' : `${FLOOR_OPTIONS.find(f => f.value === selectedFloor)?.label} 안내도 S3에 업로드`}
            </button>
          </div>
        )}

        {uploadMessage && (
          <p className={uploadMessage.includes('성공') ? 'data-success' : 'data-error'} style={{ marginTop: '12px' }}>
            {uploadMessage}
          </p>
        )}
      </div>

      {/* 현재 등록된 안내도 */}
      <div className="data-section">
        <h2 className="data-section-title">현재 등록된 안내도</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {FLOOR_OPTIONS.map(opt => {
            const mapsFolder = hospitalInfo?.mapsFolder || 'maps';
            const format = hospitalInfo?.mapFileNameFormat || 'lower';
            let fileName;
            if (format === 'upper') {
              fileName = opt.value === 'b1f' ? 'B1.png' : `${opt.value.replace('f', '').toUpperCase()}F.png`;
            } else {
              fileName = `${opt.value}.png`;
            }
            const imgUrl = `${S3_BASE_URL}/${mapsFolder}/${fileName}?v=${Date.now()}`;
            return (
              <div key={opt.value} style={{
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '12px',
                textAlign: 'center',
              }}>
                <p style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>{opt.label}</p>
                <img
                  src={imgUrl}
                  alt={`${opt.label} 안내도`}
                  style={{ width: '100%', height: '80px', objectFit: 'contain', borderRadius: '4px', background: '#f8fafc' }}
                  onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                />
                <p style={{ display: 'none', fontSize: '12px', color: '#94a3b8', marginTop: '8px' }}>미등록</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 업로드 이력 */}
      <div className="data-section">
        <h2 className="data-section-title">업로드 히스토리</h2>
        {uploadHistory.length === 0 ? (
          <p className="no-history">업로드 이력이 없습니다.</p>
        ) : (
          <table className="history-table">
            <thead>
              <tr>
                <th>층</th>
                <th>파일명</th>
                <th>업로드 시간</th>
                <th>파일 크기</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {uploadHistory.map(item => (
                <tr key={item.id}>
                  <td>{item.floor}</td>
                  <td>{item.fileName}</td>
                  <td>{item.uploadTime}</td>
                  <td>{item.fileSize}</td>
                  <td>
                    <span className="history-status success">{item.status}</span>
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

export default FloorMapUpload;
