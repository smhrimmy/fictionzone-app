import { Link } from 'react-router-dom';
import { Star, BookOpen, Eye } from 'lucide-react';
import type { Story } from '../types';

interface HorizontalNovelCardProps {
  story: Story;
  rank?: number;
}

export function HorizontalNovelCard({ story, rank }: HorizontalNovelCardProps) {
  return (
    <Link 
      to={`/story/${story.id}`} 
      className="group flex gap-4 p-3 rounded-xl border border-white/5 bg-[#1a1a1a] hover:bg-[#252525] transition-all hover:border-white/10"
    >
      {/* Cover */}
      <div className="shrink-0 w-20 md:w-24 aspect-[2/3] rounded-lg overflow-hidden relative shadow-md">
        <img 
          src={story.cover_image} 
          alt={story.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
          loading="lazy"
        />
        {rank && (
            <div className={`absolute top-0 left-0 px-2 py-1 rounded-br-lg text-xs font-bold text-white ${rank <= 3 ? 'bg-primary' : 'bg-gray-600'}`}>
                #{rank}
            </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-center space-y-2">
        <h3 className="font-bold text-white text-base md:text-lg line-clamp-1 group-hover:text-primary transition-colors">
          {story.title}
        </h3>
        
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-400">
            <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                <span className="text-white font-medium">{story.average_rating}</span>
            </div>
            <div className="flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5" />
                <span>{story.genres[0]}</span>
            </div>
             <div className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                <span>{(story.total_reads / 1000).toFixed(1)}K</span>
            </div>
        </div>

        <p className="text-sm text-gray-500 line-clamp-2 hidden md:block">
            {story.description}
        </p>
      </div>
    </Link>
  );
}
