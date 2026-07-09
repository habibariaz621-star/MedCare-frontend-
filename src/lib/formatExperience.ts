export function formatExperienceYears(years?: number | null): string {
  if (years == null || years <= 0) return 'Experience not set';
  if (years === 1) return '1 year experience';
  return `${years} years experience`;
}
