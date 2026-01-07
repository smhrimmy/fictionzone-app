import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Star, BookOpen, Check, X, Loader2 } from 'lucide-react';
import { NovelService } from '../services/novelService';
import { MangaService } from '../services/mangaService';
import { useStore } from '../store/useStore';
import type { Story } from '../types';
import { cn } from '../lib/utils';

export default function Discovery() {
  const { mode } = useStore();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<'All' | 'Ongoing' | 'Completed'>('All');
  const [selectedType, setSelectedType] = useState<'All' | 'Original' | 'Translated'>('All');
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Observer for Infinite Scroll
  const observerTarget = useRef<HTMLDivElement>(null);

  const fetchStories = useCallback(async (pageNum: number, isReset: boolean) => {
    setLoading(true);
    try {
        const service = mode === 'novel' ? NovelService : MangaService;
        const result = await service.getAllStories({
            page: pageNum,
            limit: 12, // Load 12 items per page
            search: debouncedSearch,
            genre: selectedGenre,
            status: selectedStatus,
            type: selectedType
        });

        if (isReset) {
            setStories(result.data);
            // Scroll to top on reset/filter change
            window.scrollTo(0, 0);
        } else {
            setStories(prev => [...prev, ...result.data]);
        }
        
        setHasMore(result.hasMore);
        setInitialLoaded(true);
    } catch (error) {
        console.error("Failed to fetch stories", error);
    } finally {
        setLoading(false);
    }
  }, [mode, debouncedSearch, selectedGenre, selectedStatus, selectedType]);

  // Effect to reset and fetch when filters change
  useEffect(() => {
     setPage(1);
     fetchStories(1, true);
  }, [fetchStories]);

  // Intersection Observer Effect
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading && initialLoaded) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchStories(nextPage, false);
        }
      },
      { threshold: 0.1 } // Trigger when 10% visible
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, loading, initialLoaded, page, fetchStories]);

  // Collect all unique genres for the sidebar (This is tricky with pagination as we don't have ALL stories)
  // For now, we'll hardcode common genres or fetch a separate "genres" list if the API supported it.
  // We'll infer from the currently loaded stories + a static list to ensure sidebar isn't empty initially.
  const commonGenres = ['Action', 'Adventure', 'Fantasy', 'Romance', 'System', 'Martial Arts', 'Sci-Fi', 'Horror', 'Slice of Life', 'Comedy', 'Drama', 'Mystery', 'Supernatural', 'Xianxia', 'Mecha', 'Sports'];
  const loadedGenres = Array.from(new Set(stories.flatMap(s => s.genres)));
  const displayGenres = Array.from(new Set([...commonGenres, ...loadedGenres])).sort();

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 space-y-6 shrink-0">
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2 text-lg">
              <Filter className="h-5 w-5" /> Filters
            </h3>
            
            <div className="p-4 rounded-lg border border-border bg-card space-y-6">
               {/* Status */}
              <div>
                <h4 className="font-medium mb-3 text-xs text-muted-foreground uppercase tracking-wider">Status</h4>
                <div className="flex flex-wrap gap-2">
                  {(['All', 'Ongoing', 'Completed'] as const).map(status => (
                    <button
                        key={status}
                        onClick={() => setSelectedStatus(status)}
                        className={cn(
                            "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                            selectedStatus === status 
                                ? "bg-primary text-primary-foreground border-primary" 
                                : "bg-background border-border hover:bg-accent hover:text-accent-foreground"
                        )}
                    >
                        {status}
                    </button>
                  ))}
                </div>
              </div>

               {/* Type */}
               <div>
                <h4 className="font-medium mb-3 text-xs text-muted-foreground uppercase tracking-wider">Type</h4>
                <div className="flex flex-wrap gap-2">
                  {(['All', 'Original', 'Translated'] as const).map(type => (
                    <button
                        key={type}
                        onClick={() => setSelectedType(type)}
                        className={cn(
                            "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                            selectedType === type 
                                ? "bg-primary text-primary-foreground border-primary" 
                                : "bg-background border-border hover:bg-accent hover:text-accent-foreground"
                        )}
                    >
                        {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Genres */}
              <div>
                <h4 className="font-medium mb-3 text-xs text-muted-foreground uppercase tracking-wider">Genres</h4>
                <div className="flex flex-col gap-1 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                  <button 
                    onClick={() => setSelectedGenre(null)}
                    className={cn(
                        "text-left text-sm px-2 py-1.5 rounded transition-colors flex items-center justify-between group",
                        !selectedGenre ? "bg-primary/10 text-primary font-medium" : "hover:bg-accent"
                    )}
                  >
                    <span>All Genres</span>
                    {!selectedGenre && <Check className="h-3 w-3" />}
                  </button>
                  {displayGenres.map(genre => (
                    <button 
                      key={genre}
                      onClick={() => setSelectedGenre(genre)}
                      className={cn(
                        "text-left text-sm px-2 py-1.5 rounded transition-colors flex items-center justify-between group",
                        selectedGenre === genre ? "bg-primary/10 text-primary font-medium" : "hover:bg-accent"
                      )}
                    >
                      <span>{genre}</span>
                      {selectedGenre === genre && <Check className="h-3 w-3" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset Filters */}
              {(selectedGenre || selectedStatus !== 'All' || selectedType !== 'All') && (
                  <button 
                    onClick={() => {
                        setSelectedGenre(null);
                        setSelectedStatus('All');
                        setSelectedType('All');
                        setSearchQuery('');
                    }}
                    className="w-full py-2 text-xs font-medium text-muted-foreground hover:text-destructive transition-colors flex items-center justify-center gap-1 border-t border-border pt-4"
                  >
                    <X className="h-3 w-3" /> Reset Filters
                  </button>
              )}
            </div>
          </div>
        </aside>
        
        {/* Main Content */}
        <div className="flex-1 space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search stories, authors, or tags..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-10 pr-4 rounded-lg border border-input bg-card shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
          
          {loading && !initialLoaded ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {[1,2,3,4,5,6].map(i => <div key={i} className="h-48 bg-muted rounded-lg animate-pulse" />)}
             </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Showing {stories.length} results</p>
              </div>

              {stories.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {stories.map((story, index) => (
                    <Link key={`${story.id}-${index}`} to={`/story/${story.id}`} className="group flex flex-col bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                      <div className="relative aspect-[16/9] overflow-hidden">
                        <img src={story.cover_image} alt={story.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        
                        {/* Status Badge */}
                        <div className="absolute top-2 left-2 px-2 py-1 bg-black/70 backdrop-blur rounded text-[10px] font-bold text-white uppercase tracking-wider">
                            {story.type}
                        </div>

                        <div className="absolute top-2 right-2 px-2 py-1 bg-black/70 backdrop-blur rounded text-xs font-bold text-white flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" /> {story.average_rating}
                        </div>
                      </div>
                      <div className="p-4 flex flex-col flex-1 space-y-3">
                        <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-1">{story.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 flex-1">{story.description}</p>
                        <div className="flex items-center justify-between pt-2 border-t border-border/50 mt-auto">
                            <div className="flex flex-wrap gap-2">
                                {story.genres.slice(0, 2).map(g => (
                                    <span key={g} className="text-[10px] px-2 py-1 rounded-full bg-secondary/10 text-secondary-foreground border border-secondary/20">
                                        {g}
                                    </span>
                                ))}
                            </div>
                            <span className={cn(
                                "text-[10px] font-medium px-2 py-0.5 rounded-full border",
                                story.is_completed 
                                    ? "bg-green-500/10 text-green-600 border-green-500/20" 
                                    : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                            )}>
                                {story.is_completed ? 'Completed' : 'Ongoing'}
                            </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-muted/20 rounded-lg border border-dashed border-border">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <h3 className="text-lg font-medium">No stories found</h3>
                  <p className="text-muted-foreground">Try adjusting your search or filters</p>
                  <button 
                    onClick={() => {
                        setSelectedGenre(null);
                        setSelectedStatus('All');
                        setSelectedType('All');
                        setSearchQuery('');
                    }}
                    className="mt-4 text-sm text-primary hover:underline"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
              
              {/* Infinite Scroll Trigger & Loading State */}
              <div ref={observerTarget} className="h-10 w-full flex items-center justify-center mt-8">
                {loading && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Loading more...</span>
                    </div>
                )}
                {!hasMore && stories.length > 0 && (
                    <span className="text-sm text-muted-foreground">You've reached the end</span>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
