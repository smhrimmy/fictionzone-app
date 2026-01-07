import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize, Minimize, Settings } from 'lucide-react';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';

interface MangaReaderSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MangaReaderSettings({
  isOpen,
  onClose
}: MangaReaderSettingsProps) {
  const { mangaSettings, setMangaSettings } = useStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Modal/Panel */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 md:top-0 md:left-auto md:h-full md:w-80 bg-[#0F1115] border-t md:border-l md:border-t-0 border-[#2ECC71]/20 z-50 shadow-2xl flex flex-col text-white font-sans rounded-t-2xl md:rounded-none"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 bg-[#0F1115] rounded-t-2xl md:rounded-none">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-[#2ECC71]/10 flex items-center justify-center border border-[#2ECC71]/20">
                        <Settings className="h-4 w-4 text-[#2ECC71]" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-white tracking-wide">Manga Settings</h2>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Display Options</p>
                    </div>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 space-y-8">
               {/* Fit Mode */}
               <div className="space-y-3">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  Fit Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => setMangaSettings({ fitMode: 'width' })}
                        className={cn(
                            "flex flex-col items-center justify-center gap-2 h-20 rounded-lg border transition-all",
                            mangaSettings.fitMode === 'width'
                                ? "border-[#2ECC71] bg-[#2ECC71]/10 text-[#2ECC71]" 
                                : "border-white/5 bg-[#16181D] text-gray-500 hover:border-white/20 hover:text-gray-300"
                        )}
                    >
                        <Maximize className="h-5 w-5 rotate-90" />
                        <span className="text-xs font-bold">Fit Width</span>
                    </button>
                    
                    <button
                        onClick={() => setMangaSettings({ fitMode: 'height' })}
                        className={cn(
                            "flex flex-col items-center justify-center gap-2 h-20 rounded-lg border transition-all",
                            mangaSettings.fitMode === 'height'
                                ? "border-[#2ECC71] bg-[#2ECC71]/10 text-[#2ECC71]" 
                                : "border-white/5 bg-[#16181D] text-gray-500 hover:border-white/20 hover:text-gray-300"
                        )}
                    >
                        <Minimize className="h-5 w-5" />
                        <span className="text-xs font-bold">Fit Height</span>
                    </button>
                </div>
              </div>
              
              {/* Note about vertical scroll */}
              <div className="p-4 rounded-lg bg-[#16181D] border border-white/5">
                  <p className="text-xs text-gray-400 leading-relaxed">
                      Infinite scroll is enabled by default for seamless reading.
                  </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
