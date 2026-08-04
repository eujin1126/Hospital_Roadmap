import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// 안내문 영역을 PDF로 변환
export async function generatePDF(elementId, fileName) {
  const element = document.getElementById(elementId);
  if (!element) throw new Error('안내문 요소를 찾을 수 없습니다.');

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;

  // A4에 맞춰서 비율 조정
  const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
  const scaledWidth = imgWidth * ratio;
  const scaledHeight = imgHeight * ratio;

  // 가운데 정렬
  const x = (pdfWidth - scaledWidth) / 2;
  const y = 0;

  pdf.addImage(imgData, 'PNG', x, y, scaledWidth, scaledHeight);

  return { pdf, fileName };
}

// PDF를 Blob으로 변환
export function pdfToBlob(pdf) {
  return pdf.output('blob');
}

// PDF 다운로드 (로컬 저장)
export function downloadPDF(pdf, fileName) {
  pdf.save(fileName);
}

// S3에 PDF 업로드 (백엔드 API를 통해)
// API_URL은 Lambda + API Gateway 엔드포인트
const UPLOAD_API_URL = import.meta.env.VITE_UPLOAD_API_URL || '';

export async function uploadPDFToS3(pdfBlob, fileName) {
  if (!UPLOAD_API_URL) {
    console.warn('UPLOAD_API_URL이 설정되지 않았습니다. 로컬 다운로드만 가능합니다.');
    return null;
  }

  // Presigned URL 요청
  const presignedResponse = await fetch(`${UPLOAD_API_URL}/get-upload-url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fileName: `generated/${fileName}`,
      contentType: 'application/pdf',
    }),
  });

  if (!presignedResponse.ok) throw new Error('Presigned URL 생성 실패');
  const { uploadUrl, fileUrl } = await presignedResponse.json();

  // S3에 직접 업로드
  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/pdf' },
    body: pdfBlob,
  });

  if (!uploadResponse.ok) throw new Error('S3 업로드 실패');

  return fileUrl;
}

// S3에 저장된 PDF의 Presigned URL 가져오기
export async function getPresignedDownloadUrl(fileName) {
  if (!UPLOAD_API_URL) return null;

  const response = await fetch(`${UPLOAD_API_URL}/get-download-url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileName: `generated/${fileName}` }),
  });

  if (!response.ok) throw new Error('Presigned Download URL 생성 실패');
  const { downloadUrl } = await response.json();
  return downloadUrl;
}
