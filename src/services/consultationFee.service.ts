import type { Doctor } from '@/types';

const useMockAuth = process.env.NEXT_PUBLIC_USE_MOCK_AUTH === 'true';

async function getAllFees(): Promise<Record<string, number>> {
  if (useMockAuth) return {};
  try {
    const response = await fetch('/api/consultation-fees');
    if (!response.ok) return {};
    return response.json();
  } catch {
    return {};
  }
}

export const consultationFeeService = {
  async getFee(doctorId: string): Promise<number | undefined> {
    const fees = await getAllFees();
    return fees[doctorId];
  },

  async setFee(doctorId: string, consultationFee?: number) {
    if (useMockAuth) return;
    await fetch('/api/consultation-fees', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ doctorId, consultationFee }),
    });
  },

  async mergeIntoDoctor<T extends Doctor>(doctor: T): Promise<T> {
    if (useMockAuth || !doctor._id) return doctor;
    const fee = await this.getFee(doctor._id);
    return fee != null ? { ...doctor, consultationFee: fee } : doctor;
  },

  async mergeIntoDoctors(doctors: Doctor[]): Promise<Doctor[]> {
    if (useMockAuth || doctors.length === 0) return doctors;
    const fees = await getAllFees();
    return doctors.map((doctor) =>
      fees[doctor._id] != null ? { ...doctor, consultationFee: fees[doctor._id] } : doctor
    );
  },
};
