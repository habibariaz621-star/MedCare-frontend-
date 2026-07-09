export function sanitizePhoneInput(value: string): string {
  return value.replace(/[^\d+\s()-]/g, '');
}

export function isValidPhone(phone: string): boolean {
  const trimmed = phone.trim();
  if (!trimmed) return true;
  if (/[a-zA-Z]/.test(trimmed)) return false;
  const digits = trimmed.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15;
}

export function phoneValidationMessage(phone: string): string | null {
  if (isValidPhone(phone)) return null;
  return 'Enter a valid phone number (10–15 digits). Letters are not allowed.';
}
