import { Link } from 'react-router-dom';
import type { Story } from '../types';

interface NovelCardProps {
  story: Story;
  className?: string;
}

export function NovelCard({ story, className = '' }: NovelCardProps) {
  return (
    <Link 
      to={`/story/${story.id}`} 
      className={`block group relative overflow-hidden rounded-xl bg-card transition-all hover:-translate-y-1 ${className}`}
    >
      <div className="aspect-[2/3] w-full overflow-hidden relative">
        {story.cover_image ? (
            <img 
            src={story.cover_image} 
            alt={story.title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
            loading="lazy"
            />
        ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                No Image
            </div>
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 p-3 w-full">
            <h3 className="text-base font-bold text-white leading-tight line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                {story.title}
            </h3>
            <div className="flex items-center text-xs text-gray-300">
                <span>{story.chapters_count || 0} Chapters</span>
            </div>
        </div>
      </div>
    </Link>
  );
}
