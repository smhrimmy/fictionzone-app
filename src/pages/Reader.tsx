import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Settings, List, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { NovelService } from '../services/novelService';
import { ReaderSettings } from '../components/ReaderSettings';
import type { Chapter, Story } from '../types';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';

export default function Reader() {
  const { storyId, chapterId } = useParams();
  const navigate = useNavigate();
  const { theme, readerSettings } = useStore();
  
  const [story, setStory] = useState<Story | null>(null);
  const [allChapters, setAllChapters] = useState<Chapter[]>([]);
  const [loadedChapters, setLoadedChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const [showChapters, setShowChapters] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Helper to get plain text for TTS
  const getCurrentChapterText = () => {
      if (loadedChapters.length === 0) return "";
      // Simple HTML strip
      const div = document.createElement("div");
      div.innerHTML = loadedChapters[0].content;
      return div.textContent || div.innerText || "";
  };

  // Observer for infinite scroll
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadData = async () => {
      if (storyId && chapterId) {
        setLoading(true);
        window.scrollTo(0, 0);
        
        const [storyData, chaptersData] = await Promise.all([
          NovelService.getStoryById(storyId),
          NovelService.getChapters(storyId)
        ]);
        
        setStory(storyData || null);
        setAllChapters(chaptersData);
        
        let currentChapter = chaptersData.find(c => c.id === chapterId);
        // Fuzzy match if direct match fails
        if (!currentChapter && chapterId) {
             currentChapter = chaptersData.find(c => c.chapter_number.toString() === chapterId) ||
                              chaptersData.find(c => c.id.endsWith(`-${chapterId}`)) ||
                              chaptersData.find(c => c.id.endsWith(`_${chapterId}`)) ||
                              chaptersData.find(c => parseInt(c.id.match(/\d+$/)?.[0] || '-1') === parseInt(chapterId));
        }

        if (currentChapter) {
          setLoadedChapters([currentChapter]);
        }
        setLoading(false);
      }
    };
    loadData();
  }, [storyId]); // Only re-run if story changes. If chapterId changes via nav, we might want to reset, but for infinite scroll we usually stick to the flow.

  // If chapterId changes manually (e.g. from sidebar), we should reset the view
  useEffect(() => {
     if (!loading && allChapters.length > 0 && chapterId) {
         // Check if the requested chapter is already loaded (e.g. via scroll)
         // If not, or if it's a jump, we might want to reset loadedChapters
         // For simple behavior: if the user clicks a specific chapter in the menu, we reset the view to that chapter.
         let targetChapter = allChapters.find(c => c.id === chapterId);
         if (!targetChapter && chapterId) {
             targetChapter = allChapters.find(c => c.chapter_number.toString() === chapterId) ||
                             allChapters.find(c => c.id.endsWith(`-${chapterId}`)) ||
                             allChapters.find(c => c.id.endsWith(`_${chapterId}`));
         }

         if (targetChapter && loadedChapters[0]?.id !== targetChapter.id) {
             setLoadedChapters([targetChapter]);
             window.scrollTo(0, 0);
         }
     }
  }, [chapterId, allChapters]);


  const loadNextChapter = useCallback(async () => {
    if (loadingMore || loadedChapters.length === 0 || allChapters.length === 0) return;

    const lastLoadedChapter = loadedChapters[loadedChapters.length - 1];
    const currentIndex = allChapters.findIndex(c => c.id === lastLoadedChapter.id);
    
    if (currentIndex !== -1 && currentIndex < allChapters.length - 1) {
      setLoadingMore(true);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));

      const nextChapter = allChapters[currentIndex + 1];
      
      setLoadedChapters(prev => [...prev, nextChapter]);
      setLoadingMore(false);
    }
  }, [allChapters, loadedChapters, loadingMore]);

  // Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          loadNextChapter();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [loadNextChapter]);


  const handleChapterSelect = (id: string) => {
    navigate(`/read/${storyId}/${id}`);
    setShowChapters(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (loadedChapters.length === 0 || !story) {
       return (
           <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center text-white space-y-4">
               <h1 className="text-2xl font-bold">Chapter Not Found</h1>
               <p className="text-gray-400">
                   {allChapters.length === 0 
                       ? "No chapters found for this story." 
                       : `Could not load chapter ${chapterId} (Available: ${allChapters.length})`}
               </p>
               <Link to={`/story/${storyId}`} className="px-4 py-2 bg-primary text-black rounded-full font-bold hover:bg-primary/90">
                   Return to Story
               </Link>
           </div>
       );
   }

  const currentChapter = loadedChapters[0];
  
  // Theme Logic
  const pageBg = theme === 'light' ? 'bg-[#f0f2f5]' : 
                 theme === 'sepia' ? 'bg-[#f4ecd8]' : 
                 theme === 'midnight' ? 'bg-black' : 
                 'bg-[#121212]';
                 
  const cardBg = theme === 'light' ? 'bg-white shadow-sm border border-gray-200' : 
                 theme === 'sepia' ? 'bg-[#fdf6e3] shadow-sm border border-[#e3d5b8]' : 
                 theme === 'midnight' ? 'bg-[#050505] shadow-sm border border-[#2ECC71]/20' : 
                 'bg-[#121212]';
                 
  const textColor = theme === 'light' ? 'text-gray-900' : 
                    theme === 'sepia' ? 'text-[#5b4636]' : 
                    theme === 'midnight' ? 'text-gray-300' : 
                    'text-[#d1d5db]';

  return (
    <div className={cn("min-h-screen transition-colors duration-500", pageBg, textColor)}>
      
      {/* Header */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-40 w-full h-16 bg-[#121212] border-b border-white/10 flex items-center justify-between px-4 shadow-lg"
      >
        <div className="flex items-center gap-4">
          <Link to={`/story/${storyId}`} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div className="hidden md:block">
            <h1 className="text-sm font-bold text-white truncate max-w-[200px]">{story.title}</h1>
            <p className="text-xs text-gray-400">
                {loadedChapters.length > 1 ? `Reading Ch. ${loadedChapters[loadedChapters.length-1].chapter_number}` : `Chapter ${currentChapter.chapter_number}`}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
           <div className="relative">
             <button 
                className="px-3 py-1.5 hover:bg-white/10 rounded-full transition-colors flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white border border-transparent hover:border-white/10"
                onClick={() => setShowChapters(!showChapters)}
             >
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">Chapters</span>
             </button>
             
             {showChapters && (
                 <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 top-full mt-2 w-64 max-h-[60vh] overflow-y-auto rounded-xl shadow-2xl border border-white/10 bg-[#1a1a1a] text-gray-300 p-1 z-50"
                 >
                    {allChapters.map(c => (
                        <button
                            key={c.id}
                            onClick={() => handleChapterSelect(c.id)}
                            className={cn(
                                "w-full text-left px-4 py-3 text-sm rounded-lg hover:bg-white/5 truncate flex items-center justify-between transition-colors",
                                loadedChapters.some(lc => lc.id === c.id) && "bg-primary/10 text-primary font-bold"
                            )}
                        >
                            <span>Chapter {c.chapter_number}</span>
                            {loadedChapters.some(lc => lc.id === c.id) && <div className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(0,220,130,0.5)]" />}
                        </button>
                    ))}
                 </motion.div>
             )}
          </div>

          <button 
            className={cn(
                "p-2 rounded-full transition-all duration-300",
                showSettings ? "bg-primary text-black rotate-90" : "text-gray-400 hover:text-white hover:bg-white/10"
            )}
            onClick={() => setShowSettings(true)}
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </motion.header>

      <ReaderSettings 
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        currentText={getCurrentChapterText()}
      />

      {/* Main Content Area */}
      <main className="container mx-auto py-8 px-4 flex flex-col items-center">
        
        {loadedChapters.map((chapter, index) => (
             <motion.article 
                key={chapter.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className={cn(
                    "w-full transition-all duration-500 rounded-none md:rounded-2xl p-6 md:p-12 mb-8",
                    cardBg
                )}
                style={{ maxWidth: `${readerSettings.maxWidth}px` }}
            >
                {/* Chapter Header */}
                <header className="mb-8 text-center space-y-4">
                    {index > 0 && <div className="w-20 h-1 bg-border/20 mx-auto mb-8 rounded-full" />}
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{chapter.title}</h2>
                </header>
                
                {/* Story Content */}
                <div 
                    className={cn(
                        "prose max-w-none transition-all duration-300",
                        theme === 'dark' || theme === 'midnight' ? "prose-invert" : "prose-gray"
                    )}
                    style={{ 
                        fontSize: `${readerSettings.fontSize}px`,
                        fontFamily: readerSettings.fontFamily === 'serif' ? '"Merriweather", "Georgia", serif' : '"Inter", "Arial", sans-serif',
                        lineHeight: readerSettings.lineHeight
                    }}
                >
                    <div className="flex flex-col gap-0 items-center">
                        {chapter.images && chapter.images.length > 0 ? (
                            chapter.images.map((img, idx) => (
                                <img key={idx} src={img} alt={`Page ${idx + 1}`} className="w-full max-w-3xl h-auto" loading="lazy" />
                            ))
                        ) : (
                            <div dangerouslySetInnerHTML={{ __html: chapter.content }} />
                        )}
                    </div>
                </div>

                {/* Bottom Interaction Area - Only for the last loaded chapter if it's the absolute last one, or just generic footer */}
                <div className="mt-16 pt-8 border-t border-border/10">
                     {/* Comment Input per chapter? Or just global? Let's keep it simple for now and maybe remove per-chapter comments to avoid clutter in infinite scroll */}
                     <p className="text-center text-xs opacity-50 uppercase tracking-widest">End of Chapter {chapter.chapter_number}</p>
                </div>
            </motion.article>
        ))}

        {/* Infinite Scroll Loader */}
        <div ref={observerTarget} className="h-24 w-full flex items-center justify-center">
             {loadingMore ? (
                 <div className="flex items-center gap-2 text-primary">
                     <Loader2 className="h-6 w-6 animate-spin" />
                     <span className="font-medium">Loading next chapter...</span>
                 </div>
             ) : (
                 <div className="text-muted-foreground text-sm">
                     {loadedChapters.length < allChapters.length ? "Scroll for more" : "You have reached the end of the story"}
                 </div>
             )}
        </div>

      </main>
    </div>
  );
}
