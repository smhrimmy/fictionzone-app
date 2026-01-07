import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, BookOpen, Clock, List, Share2, Bookmark } from 'lucide-react';
import { NovelService } from '../services/novelService';
import { useStore } from '../store/useStore';
import type { Story, Chapter } from '../types';

export default function StoryDetails() {
  const { storyId } = useParams();
  const { mode } = useStore();
  const [story, setStory] = useState<Story | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);

  const readBasePath = mode === 'manga' ? '/manga/read' : '/read';

  useEffect(() => {
    const loadData = async () => {
      if (storyId) {
        setLoading(true);
        const [storyData, chaptersData] = await Promise.all([
          NovelService.getStoryById(storyId),
          NovelService.getChapters(storyId)
        ]);
        setStory(storyData || null);
        setChapters(chaptersData);
        setLoading(false);
      }
    };
    loadData();
  }, [storyId]);

  if (loading) {
    return (
      <div className="container py-12 flex justify-center">
        <div className="animate-pulse space-y-4 w-full max-w-4xl">
          <div className="h-64 bg-muted rounded-lg w-full" />
          <div className="space-y-2">
            <div className="h-8 bg-muted rounded w-1/2" />
            <div className="h-4 bg-muted rounded w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold">Story not found</h1>
        <Link to={mode === 'manga' ? "/manga" : "/"} className="text-primary hover:underline mt-4 inline-block">Return Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Hero Section with Blur Background */}
      <div className="relative w-full bg-muted/30 border-b border-border">
        <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
            <img src={story.cover_image} alt="" className="w-full h-full object-cover blur-3xl scale-110" />
        </div>
        
        <div className="container relative py-12 md:py-16">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Cover Image */}
            <div className="w-48 md:w-64 flex-shrink-0 mx-auto md:mx-0 shadow-xl rounded-lg overflow-hidden border border-border/50">
              <img 
                src={story.cover_image} 
                alt={story.title} 
                className="w-full h-auto object-cover aspect-[2/3]"
              />
            </div>

            {/* Info */}
            <div className="flex-1 space-y-6 text-center md:text-left">
              <div className="space-y-2">
                <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">{story.title}</h1>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" /> {story.chapters_count || chapters.length} Chapters
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-primary text-primary" /> {story.average_rating} Rating
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" /> Updated {new Date(story.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {story.genres.map(genre => (
                  <span key={genre} className="px-3 py-1 rounded-full bg-secondary/10 text-secondary-foreground text-xs font-medium border border-secondary/20">
                    {genre}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4 justify-center md:justify-start pt-4">
                <Link 
                  to={`${readBasePath}/${story.id}/${chapters[0]?.id || '1'}`}
                  className="px-8 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25"
                >
                  Read Now
                </Link>
                <button className="p-3 rounded-full border border-border bg-background hover:bg-accent transition-colors" aria-label="Add to Library">
                  <Bookmark className="h-5 w-5" />
                </button>
                <button className="p-3 rounded-full border border-border bg-background hover:bg-accent transition-colors" aria-label="Share">
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">
          {/* Synopsis */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" /> Synopsis
            </h2>
            <p className="text-muted-foreground leading-relaxed text-lg">
              {story.description}
            </p>
          </section>

          {/* Chapters */}
          <section className="space-y-4">
             <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <List className="h-5 w-5 text-primary" /> Chapters
                </h2>
                <span className="text-sm text-muted-foreground">{chapters.length} releases</span>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {chapters.map((chapter) => (
                  <Link 
                    key={chapter.id}
                    to={`${readBasePath}/${story.id}/${chapter.id}`}
                    className="group flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:border-primary/50 hover:bg-accent/50 transition-all"
                  >
                    <div className="flex flex-col">
                        <span className="font-medium group-hover:text-primary transition-colors">Chapter {chapter.chapter_number}</span>
                        <span className="text-xs text-muted-foreground">{new Date(chapter.published_at).toLocaleDateString()}</span>
                    </div>
                  </Link>
                ))}
             </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-8">
            <div className="p-6 rounded-xl border border-border bg-card space-y-4">
                <h3 className="font-bold text-lg">About the Author</h3>
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                        {story.author?.username?.[0] || 'A'}
                    </div>
                    <div>
                        <p className="font-medium">{story.author?.username || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">Author</p>
                    </div>
                </div>
            </div>

             <div className="p-6 rounded-xl border border-border bg-card space-y-4">
                <h3 className="font-bold text-lg">Tags</h3>
                <div className="flex flex-wrap gap-2">
                    {['Magic', 'Strong Protagonist', 'Wars', 'Kingdom Building', 'Romance', 'Tragedy'].map(tag => (
                        <span key={tag} className="text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                            #{tag}
                        </span>
                    ))}
                </div>
            </div>
        </aside>
      </div>
    </div>
  );
}
