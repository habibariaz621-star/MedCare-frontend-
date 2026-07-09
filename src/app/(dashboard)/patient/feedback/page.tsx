'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAppointmentsRedux } from '@/hooks/useAppointmentsRedux';
import { reviewService } from '@/services/review.service';
import { getApiErrorMessage } from '@/lib/apiError';
import { toast } from '@/lib/toast';
import StarRating from '@/components/common/StarRating';
import Pagination from '@/components/common/Pagination';
import type { Appointment, Review } from '@/types';
import { Calendar, MessageSquare, Star } from 'lucide-react';

function getDoctorName(appt: Appointment) {
  if (typeof appt.doctorId === 'object' && appt.doctorId) {
    return (appt.doctorId as { name: string }).name;
  }
  return 'Doctor';
}

export default function PatientFeedbackPage() {
  const { appointments, loading, reload } = useAppointmentsRedux();
  const [reviewedIds, setReviewedIds] = useState<string[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsTotalPages, setReviewsTotalPages] = useState(1);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [reviewTarget, setReviewTarget] = useState<Appointment | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadReviewData = useCallback(async () => {
    setLoadingReviews(true);
    try {
      const [ids, reviewList] = await Promise.all([
        reviewService.getReviewedAppointmentIds(),
        reviewService.getMyReviews({ page: reviewsPage, limit: 5 }),
      ]);
      setReviewedIds(ids);
      setReviews(reviewList.data ?? []);
      setReviewsTotalPages(reviewList.totalPages ?? 1);
    } catch {
      toast.error('Could not load your feedback history');
    } finally {
      setLoadingReviews(false);
    }
  }, [reviewsPage]);

  useEffect(() => {
    loadReviewData();
  }, [loadReviewData]);

  const completedPendingReview = appointments.filter(
    (a) => a.status === 'Completed' && !reviewedIds.includes(a._id),
  );

  const openReview = (appt: Appointment) => {
    setReviewTarget(appt);
    setRating(5);
    setComment('');
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewTarget) return;
    setSubmitting(true);
    try {
      const doctor = reviewTarget.doctorId;
      await reviewService.submitReview(
        reviewTarget._id,
        { rating, comment },
        {
          doctorId: typeof doctor === 'object' && doctor ? doctor._id : undefined,
          doctorName: getDoctorName(reviewTarget),
          appointmentDate: reviewTarget.date,
          appointmentTimeSlot: reviewTarget.timeSlot,
        },
      );
      toast.success('Thank you! Your feedback was submitted.');
      setReviewTarget(null);
      await Promise.all([reload(), loadReviewData()]);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, 'Could not submit feedback'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 text-sm font-semibold uppercase tracking-widest">
          <MessageSquare className="w-4 h-4" />
          Patient
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">Visit Feedback</h1>
        <p className="text-slate-600 dark:text-violet-200/60 mt-1">
          Share your experience after a completed appointment. One review per visit.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Leave feedback</h2>
        {loading ? (
          <p className="text-slate-500">Loading appointments...</p>
        ) : completedPendingReview.length === 0 ? (
          <div className="glass-card rounded-xl p-6 text-sm text-slate-500 dark:text-violet-300/60">
            No completed visits waiting for feedback. After your doctor marks a visit as completed, you can review it here.
          </div>
        ) : (
          <div className="space-y-3">
            {completedPendingReview.map((appt) => (
              <div
                key={appt._id}
                className="dashboard-panel rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Dr. {getDoctorName(appt)}</p>
                  <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(appt.date).toLocaleDateString()} · {appt.timeSlot}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => openReview(appt)}
                  className="inline-flex items-center gap-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 text-sm font-semibold"
                >
                  <Star className="w-4 h-4" />
                  Rate visit
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Your past feedback</h2>
        {loadingReviews ? (
          <p className="text-slate-500">Loading...</p>
        ) : reviews.length === 0 ? (
          <div className="glass-card rounded-xl p-6 text-sm text-slate-500 dark:text-violet-300/60">
            You have not submitted any reviews yet.
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => (
              <div key={review._id} className="dashboard-panel rounded-xl p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      Dr.{' '}
                      {typeof review.doctorId === 'object' && review.doctorId
                        ? review.doctorId.name
                        : 'Doctor'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Visit:{' '}
                      {review.appointmentDate
                        ? new Date(review.appointmentDate).toLocaleDateString()
                        : '—'}
                      {review.appointmentTimeSlot ? ` · ${review.appointmentTimeSlot}` : ''}
                    </p>
                  </div>
                  <StarRating value={review.rating} readonly size="sm" />
                </div>
                {review.comment && (
                  <p className="text-sm text-slate-600 dark:text-violet-200/70 mt-3">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
        <Pagination page={reviewsPage} totalPages={reviewsTotalPages} onPageChange={setReviewsPage} />
      </section>

      {reviewTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleSubmitReview}
            className="glass-card rounded-xl p-6 w-full max-w-md space-y-4"
          >
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Rate your visit</h3>
            <p className="text-sm text-slate-500">
              Dr. {getDoctorName(reviewTarget)} · {new Date(reviewTarget.date).toLocaleDateString()}
            </p>
            <div>
              <label className="text-sm font-medium block mb-2">Rating</label>
              <StarRating value={rating} onChange={setRating} />
            </div>
            <div>
              <label className="text-sm font-medium">Comments (optional)</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                placeholder="How was your consultation?"
                className="w-full mt-1 input-theme px-3 py-2 text-sm resize-none"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReviewTarget(null)}
                className="flex-1 py-2 rounded-lg bg-violet-50 dark:bg-violet-950/40 text-violet-800 dark:text-violet-200 text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2 rounded-lg bg-violet-600 text-white text-sm font-semibold disabled:opacity-60"
              >
                {submitting ? 'Submitting...' : 'Submit feedback'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
