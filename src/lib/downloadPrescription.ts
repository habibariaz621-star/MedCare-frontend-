import type { MedicalRecord } from '@/types';
import { CLINIC_NAME } from '@/lib/branding';

export function downloadPrescriptionPdf(
  record: MedicalRecord,
  patientName: string
) {
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Prescription - ${patientName}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; color: #1e1b4b; }
    .header { border-bottom: 2px solid #7c3aed; padding-bottom: 16px; margin-bottom: 24px; }
    .clinic { font-size: 22px; font-weight: bold; color: #7c3aed; }
    .meta { font-size: 12px; color: #64748b; margin-top: 4px; }
    h2 { font-size: 16px; margin: 20px 0 8px; }
    .box { border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 12px; }
    .label { font-size: 11px; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.05em; }
    .value { font-size: 14px; margin-top: 4px; }
    .footer { margin-top: 40px; font-size: 11px; color: #94a3b8; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <div class="clinic">${CLINIC_NAME}</div>
    <div class="meta">Electronic Prescription · ${new Date(record.date).toLocaleDateString()}</div>
  </div>
  <p><strong>Patient:</strong> ${patientName}</p>
  <div class="box">
    <div class="label">Diagnosis</div>
    <div class="value">${record.diagnosis}</div>
  </div>
  ${
    record.prescription
      ? `<div class="box"><div class="label">Prescription</div><div class="value">${record.prescription}</div></div>`
      : ''
  }
  ${
    record.notes
      ? `<div class="box"><div class="label">Doctor Notes</div><div class="value">${record.notes}</div></div>`
      : ''
  }
  <div class="footer">This is a computer-generated prescription from ${CLINIC_NAME}.</div>
  <script>window.onload = () => { window.print(); }</script>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (!win) {
    URL.revokeObjectURL(url);
    return;
  }
  win.onload = () => URL.revokeObjectURL(url);
}
