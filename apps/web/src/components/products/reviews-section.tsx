'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { reviewsApi, type Review } from '@/lib/api/reviews.api';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ApiError } from '@/lib/errors/api-error';
import { StarRating } from '@/components/ui/star-rating';

// ─── Star Rating Input ────────────────────────────────────────────────────────

function StarInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className='flex gap-1'>
      {Array.from({ length: 5 }).map((_, i) => {
        const star = i + 1;
        const active = star <= (hovered || value);
        return (
          <button
            key={star}
            type='button'
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(star)}
            className='focus-visible:outline-none'
          >
            <span
              className={cn(
                'icon-[mingcute--star-fill] size-7 transition-colors',
                active
                  ? 'text-amber-400'
                  : 'text-gray-200 hover:text-amber-200',
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

// ─── Review Form ──────────────────────────────────────────────────────────────

function ReviewForm({
  productId,
  existing,
  onSaved,
  onCancel,
}: {
  productId: string;
  existing: Review | null;
  onSaved: (review: Review) => void;
  onCancel?: () => void;
}) {
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [comment, setComment] = useState(existing?.comment ?? '');
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a rating.');
      return;
    }

    setIsSaving(true);
    try {
      let saved: Review;
      if (existing) {
        saved = await reviewsApi.update(productId, existing.id, {
          rating,
          comment: comment || undefined,
        });
        toast.success('Review updated.');
      } else {
        saved = await reviewsApi.create(productId, {
          rating,
          comment: comment || undefined,
        });
        toast.success('Review submitted.');
      }
      onSaved(saved);
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.firstMessage : 'Something went wrong.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
      <div>
        <p className='text-sm font-medium mb-2'>Your rating</p>
        <StarInput value={rating} onChange={setRating} />
      </div>
      <div>
        <p className='text-sm font-medium mb-2'>
          Comment{' '}
          <span className='text-muted-foreground font-normal'>(optional)</span>
        </p>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          maxLength={2000}
          placeholder='Share your experience with this product…'
          className='flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm resize-y focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
        />
        <p className='text-xs text-muted-foreground mt-1 text-right'>
          {comment.length}/2000
        </p>
      </div>
      <div className='flex gap-2'>
        <Button type='submit' disabled={isSaving || rating === 0}>
          {isSaving ? 'Saving…' : existing ? 'Update review' : 'Submit review'}
        </Button>
        {onCancel && (
          <Button type='button' variant='outline' onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

// ─── Review Card ──────────────────────────────────────────────────────────────

function ReviewCard({
  review,
  isOwn,
  onEdit,
  onDelete,
}: {
  review: Review;
  isOwn: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const displayName =
    review.user?.displayName ?? review.user?.email?.split('@')[0] ?? 'User';
  const date = new Date(review.createdAt).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className='py-5 border-b last:border-0'>
      <div className='flex items-start justify-between gap-4'>
        <div className='flex items-center gap-3'>
          <div className='size-9 rounded-full bg-muted flex items-center justify-center shrink-0'>
            <span className='text-sm font-medium'>
              {displayName[0].toUpperCase()}
            </span>
          </div>
          <div>
            <p className='text-sm font-medium'>{displayName}</p>
            <p className='text-xs text-muted-foreground'>{date}</p>
          </div>
        </div>
        <StarRating rating={review.rating} size='sm' />
      </div>

      {review.comment && (
        <p className='mt-3 text-sm text-muted-foreground leading-relaxed pl-12'>
          {review.comment}
        </p>
      )}

      {isOwn && (
        <div className='flex gap-3 mt-3 pl-12'>
          <button
            type='button'
            onClick={onEdit}
            className='text-xs text-muted-foreground hover:text-foreground underline'
          >
            Edit
          </button>
          <button
            type='button'
            onClick={onDelete}
            className='text-xs text-destructive hover:underline'
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

type Props = {
  productId: string;
};

export function ReviewsSection({ productId }: Props) {
  const { isAuthenticated, user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [myReview, setMyReview] = useState<Review | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  useEffect(() => {
    async function load() {
      const all = await reviewsApi.getProductReviews(productId).catch(() => []);
      setReviews(all);

      if (isAuthenticated) {
        const mine = await reviewsApi.getMyReview(productId).catch(() => null);
        setMyReview(mine);
      }

      setIsLoading(false);
    }
    void load();
  }, [productId, isAuthenticated]);

  function handleSaved(review: Review) {
    setMyReview(review);
    setReviews((prev) => {
      const exists = prev.find((r) => r.id === review.id);
      if (exists) return prev.map((r) => (r.id === review.id ? review : r));
      return [review, ...prev];
    });
    setShowForm(false);
    setEditingReview(null);
  }

  async function handleDelete(reviewId: string) {
    try {
      await reviewsApi.remove(productId, reviewId);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      setMyReview(null);
      toast.success('Review deleted.');
    } catch {
      toast.error('Something went wrong.');
    }
  }

  if (isLoading) {
    return (
      <div className='mt-16'>
        <div className='h-8 w-32 bg-muted animate-pulse rounded mb-6' />
        <div className='space-y-4'>
          {[...Array(2)].map((_, i) => (
            <div key={i} className='h-20 bg-muted animate-pulse rounded-lg' />
          ))}
        </div>
      </div>
    );
  }

  const canWrite = isAuthenticated && !myReview;
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : 0;

  return (
    <div className='mt-16'>
      {/* Header */}
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Reviews</h2>
          {reviews.length > 0 && (
            <StarRating
              rating={avgRating}
              size='sm'
              showValue
              reviewCount={reviews.length}
            />
          )}
        </div>
        {canWrite && !showForm && (
          <Button variant='outline' onClick={() => setShowForm(true)}>
            Write a review
          </Button>
        )}
        {!isAuthenticated && (
          <p className='text-sm text-muted-foreground'>
            Sign in to leave a review
          </p>
        )}
      </div>

      {/* Write / Edit form */}
      {(showForm || editingReview) && (
        <div className='rounded-xl border p-6 mb-8'>
          <h3 className='text-sm font-semibold mb-4'>
            {editingReview ? 'Edit your review' : 'Write a review'}
          </h3>
          <ReviewForm
            productId={productId}
            existing={editingReview}
            onSaved={handleSaved}
            onCancel={() => {
              setShowForm(false);
              setEditingReview(null);
            }}
          />
        </div>
      )}

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <p className='text-muted-foreground text-sm py-8 text-center'>
          No reviews yet. Be the first to share your experience!
        </p>
      ) : (
        <div>
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              isOwn={review.userId === user?.id}
              onEdit={() => {
                setEditingReview(review);
                setShowForm(false);
              }}
              onDelete={() => void handleDelete(review.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
