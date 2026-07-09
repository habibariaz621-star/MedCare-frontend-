/** Format 24h "HH:mm" to 12h display e.g. "9:00 AM" */
export function formatTime12(time24: string): string {
  if (!time24) return '';
  const [hStr, mStr] = time24.split(':');
  const h = parseInt(hStr, 10);
  const m = mStr ?? '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${m.padStart(2, '0')} ${ampm}`;
}

/** Generate appointment slot labels between office start and end (hourly) */
export function generateTimeSlots(start: string, end: string, intervalMinutes = 60): string[] {
  if (!start || !end) return [];

  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  let startMins = sh * 60 + sm;
  const endMins = eh * 60 + em;

  if (startMins >= endMins) return [];

  const slots: string[] = [];
  while (startMins + intervalMinutes <= endMins) {
    const h = Math.floor(startMins / 60);
    const m = startMins % 60;
    const time24 = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    slots.push(formatTime12(time24));
    startMins += intervalMinutes;
  }

  return slots;
}

export function formatOfficeHours(start?: string, end?: string): string {
  if (!start || !end) return 'Not set';
  return `${formatTime12(start)} – ${formatTime12(end)}`;
}
