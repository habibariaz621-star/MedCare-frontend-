export function formatConsultationFee(fee?: number | null): string {
  if (fee == null || fee <= 0) return 'Fee not set';
  return `Rs. ${fee.toLocaleString('en-PK')}`;
}
