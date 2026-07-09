import type { PaginatedResponse, Review } from '@/types';

const REVIEWS_KEY = 'medcare_mock_reviews';

interface StoredReview extends Review {
  patientUserId: string;
}

function loadReviews(): StoredReview[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(REVIEWS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveReviews(list: StoredReview[]) {
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(list));
}

export const mockReviews = {
  submitReview(
    patientUserId: string,
    appointmentId: string,
    data: { rating: number; comment?: string },
    meta?: {
      doctorId?: string;
      doctorName?: string;
      appointmentDate?: string;
      appointmentTimeSlot?: string;
    },
  ) {
    const existing = loadReviews().find(
      (r) => r.appointmentId === appointmentId && r.patientUserId === patientUserId,
    );
    if (existing) {
      throw { response: { data: { message: 'You already submitted feedback for this visit' } } };
    }

    const review: StoredReview = {
      _id: `review-${Date.now()}`,
      appointmentId,
      patientUserId,
      rating: data.rating,
      comment: data.comment?.trim() ?? '',
      createdAt: new Date().toISOString(),
      appointmentDate: meta?.appointmentDate,
      appointmentTimeSlot: meta?.appointmentTimeSlot,
      doctorId: meta?.doctorId
        ? { _id: meta.doctorId, name: meta.doctorName ?? 'Doctor', email: '', department: '' }
        : undefined,
    };

    saveReviews([review, ...loadReviews()]);
    return review;
  },

  getPatientReviews(patientUserId: string, params?: { page?: number; limit?: number }) {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const filtered = loadReviews().filter((r) => r.patientUserId === patientUserId);
    const skip = (page - 1) * limit;
    const data = filtered.slice(skip, skip + limit).map(({ patientUserId: _, ...rest }) => rest);

    return {
      data,
      totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
      currentPage: page,
      total: filtered.length,
    } satisfies PaginatedResponse<Review>;
  },

  getReviewedAppointmentIds(patientUserId: string) {
    return loadReviews()
      .filter((r) => r.patientUserId === patientUserId)
      .map((r) => r.appointmentId);
  },
};
