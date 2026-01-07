import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Settings, MessageSquare, Menu, ChevronRight, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MangaService } from '../services/mangaService';
import { MangaReaderSettings } from '../components/MangaReaderSettings';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';
import type { Story, Chapter } from '../types';

export default function MangaReader() {
  const { storyId, chapterId } = useParams();
  const navigate = useNavigate();
  const { mangaSettings } = useStore();
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  
  const [story, setStory] = useState<Story | null>(null);
  const [availableChapters, setAvailableChapters] = useState<Chapter[]>([]);
  const [loadedChapters, setLoadedChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const [showChapters, setShowChapters] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Observer for infinite scroll
  const observerTarget = useRef<HTMLDivElement>(null);

  // Initial Load
  useEffect(() => {
    const init = async () => {
      if (storyId && chapterId) {
        setLoading(true);
        try {
          const [storyData, chaptersData] = await Promise.all([
            MangaService.getStoryById(storyId),
            MangaService.getChapters(storyId)
          ]);
          
          if (storyData) setStory(storyData);
          setAvailableChapters(chaptersData);

          // Find the starting chapter
          const currentChapter = chaptersData.find(c => c.id === chapterId);
          if (currentChapter) {
            setLoadedChapters([currentChapter]);
          }
        } catch (error) {
          console.error("Failed to load manga data", error);
        } finally {
          setLoading(false);
        }
      }
    };
    init();
  }, [storyId]); 

  // Handle Scroll Header
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setShowHeader(false);
      } else {
        setShowHeader(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Load Next Chapter Logic
  const loadNextChapter = useCallback(async () => {
    if (loadingMore || loadedChapters.length === 0 || availableChapters.length === 0) return;

    const lastLoadedChapter = loadedChapters[loadedChapters.length - 1];
    const currentIndex = availableChapters.findIndex(c => c.id === lastLoadedChapter.id);
    
    if (currentIndex !== -1 && currentIndex < availableChapters.length - 1) {
      setLoadingMore(true);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));

      const nextChapter = availableChapters[currentIndex + 1];
      
      setLoadedChapters(prev => [...prev, nextChapter]);
      setLoadingMore(false);
    }
  }, [availableChapters, loadedChapters, loadingMore]);

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

  const handleChapterJump = (id: string) => {
      const chapter = availableChapters.find(c => c.id === id);
      if (chapter) {
          setLoadedChapters([chapter]);
          window.scrollTo(0, 0);
          setShowChapters(false);
          // Ideally update URL too without reload
          navigate(`/manga/read/${storyId}/${id}`, { replace: true });
      }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#0F1115] flex items-center justify-center text-white">Loading...</div>;
  }

  const currentChapter = loadedChapters[0];

  return (
    <div className="min-h-screen bg-[#0F1115]">
      {/* Header */}
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: showHeader ? 0 : -100 }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 left-0 right-0 h-16 bg-[#0F1115]/90 backdrop-blur-md z-50 border-b border-white/5 flex items-center justify-between px-4"
      >
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/10 rounded-full text-white transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="overflow-hidden">
            <h1 className="text-white font-bold text-sm truncate max-w-[150px] md:max-w-xs">{story?.title || 'Loading...'}</h1>
            <p className="text-gray-400 text-xs">
                {currentChapter ? `Chapter ${currentChapter.chapter_number}` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowSettings(true)}
            className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setShowChapters(true)}
            className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
          >
             <Menu className="w-5 h-5" />
          </button>
        </div>
      </motion.div>

      {/* Chapter Drawer */}
      <AnimatePresence>
        {showChapters && (
            <>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowChapters(false)}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                />
                <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="fixed top-0 right-0 bottom-0 w-80 bg-[#0F1115] border-l border-white/10 z-50 flex flex-col shadow-2xl"
                >
                    <div className="p-4 border-b border-white/10 flex items-center justify-between">
                        <h2 className="text-white font-bold">Chapters</h2>
                        <button onClick={() => setShowChapters(false)} className="p-2 hover:bg-white/10 rounded-full text-white">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2">
                        {availableChapters.map(c => (
                            <button
                                key={c.id}
                                onClick={() => handleChapterJump(c.id)}
                                className={cn(
                                    "w-full text-left px-4 py-3 text-sm rounded-lg hover:bg-white/5 truncate flex items-center justify-between transition-colors mb-1",
                                    loadedChapters.some(lc => lc.id === c.id) ? "bg-[#2ECC71]/10 text-[#2ECC71] font-bold" : "text-gray-300"
                                )}
                            >
                                <span>Chapter {c.chapter_number}</span>
                                {loadedChapters.some(lc => lc.id === c.id) && <div className="h-1.5 w-1.5 rounded-full bg-[#2ECC71]" />}
                            </button>
                        ))}
                    </div>
                </motion.div>
            </>
        )}
      </AnimatePresence>

      <MangaReaderSettings 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />

      {/* Reader Content - Vertical Scroll */}
      <div className="pt-0 pb-0 mx-auto bg-black min-h-screen">
         {loadedChapters.map((chapter) => (
            <div key={chapter.id} className="chapter-container">
                {loadedChapters.length > 1 && (
                    <div className="py-8 text-center text-gray-500 text-sm uppercase tracking-widest bg-[#0F1115]">
                        Chapter {chapter.chapter_number}
                    </div>
                )}
                
                {chapter.images && chapter.images.length > 0 ? (
                    chapter.images.map((src, index) => (
                        <div key={`${chapter.id}-img-${index}`} className="flex justify-center bg-black">
                            <img 
                                src={src}
                                alt={`Ch ${chapter.chapter_number} - Page ${index + 1}`}
                                className={cn(
                                    "block",
                                    mangaSettings.fitMode === 'width' ? "w-full h-auto max-w-3xl" : "h-screen w-auto max-w-none"
                                )}
                                loading="lazy"
                            />
                        </div>
                    ))
                ) : (
                    <div className="flex items-center justify-center h-64 text-gray-500">
                        No images available for Chapter {chapter.chapter_number}
                    </div>
                )}
            </div>
         ))}
         
         {/* Infinite Scroll Trigger */}
         <div ref={observerTarget} className="h-20 flex items-center justify-center bg-[#0F1115]">
            {loadingMore ? (
                <div className="flex items-center gap-2 text-white">
                    <Loader2 className="w-6 h-6 animate-spin text-[#2ECC71]" />
                    <span>Loading next chapter...</span>
                </div>
            ) : (
                <div className="text-gray-600 text-sm">
                    {loadedChapters.length > 0 && loadedChapters.length < availableChapters.length 
                        ? "Scroll for next chapter" 
                        : "End of series"}
                </div>
            )}
         </div>
      </div>

      {/* Navigation Footer */}
      <motion.div
         initial={{ y: 0 }}
         animate={{ y: showHeader ? 0 : 100 }}
         className="fixed bottom-0 left-0 right-0 p-4 bg-[#0F1115]/90 backdrop-blur-md border-t border-white/5 z-50"
      >
        <div className="max-w-3xl mx-auto flex items-center justify-between">
            <button 
                onClick={() => {
                    // Logic to go to previous chapter? 
                    // For now, simpler to just let user scroll up or use menu. 
                    // Or maybe implement prev chapter load (prepend) later.
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10 text-gray-400 transition-colors opacity-50 cursor-not-allowed"
            >
               <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            
            <div className="flex items-center gap-3">
               <button className="p-2 text-gray-400 hover:text-white">
                  <MessageSquare className="w-5 h-5" />
               </button>
            </div>

            <button 
                onClick={() => loadNextChapter()}
                disabled={loadingMore || loadedChapters.length >= availableChapters.length}
                className="flex items-center gap-2 px-4 py-2 bg-[#2ECC71] text-black font-bold rounded-lg hover:bg-[#27ae60] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
               Next <ChevronRight className="w-4 h-4" />
            </button>
        </div>
      </motion.div>
    </div>
  );
}
