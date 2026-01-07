import { Link } from 'react-router-dom';
import { Star, User } from 'lucide-react';
import type { Review } from '../types';

interface ReviewCardProps {
  review: Review;
  className?: string;
}

export function ReviewCard({ review, className = '' }: ReviewCardProps) {
  return (
    <div className={`bg-card rounded-xl p-4 border border-border shadow-sm flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                {review.user?.avatar_url ? (
                    <img src={review.user.avatar_url} alt={review.user.username} className="w-full h-full object-cover" />
                ) : (
                    <User className="h-4 w-4 text-primary" />
                )}
            </div>
            <span className="font-medium text-sm">{review.user?.username || 'Anonymous'}</span>
        </div>
        <span className="text-xs text-muted-foreground">
            {new Date(review.created_at).toLocaleDateString()}
        </span>
      </div>

      {/* Rating */}
      <div className="flex mb-2">
        {Array.from({ length: 5 }).map((_, i) => (
            <Star 
                key={i} 
                className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-500 text-yellow-500' : 'text-muted'}`} 
            />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 mb-4">
        <p className="text-sm text-foreground/90 line-clamp-4">{review.review}</p>
      </div>

      {/* Novel Link */}
      {review.story && (
        <Link 
            to={`/story/${review.story.id}`} 
            className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors mt-auto"
        >
            <div className="h-12 w-8 shrink-0 rounded overflow-hidden">
                <img src={review.story.cover_image} alt={review.story.title} className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground mb-0.5">Review for</p>
                <p className="text-sm font-semibold truncate text-primary">{review.story.title}</p>
            </div>
        </Link>
      )}
    </div>
  );
}
