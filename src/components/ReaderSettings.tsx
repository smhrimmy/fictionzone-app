import { motion, AnimatePresence } from 'framer-motion';
import { X, Type, Layout, Monitor, Moon, Sun, Coffee, Mic, Languages, Play, Square, Zap } from 'lucide-react';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';
import { useState, useEffect, useRef } from 'react';

interface ReaderSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  currentText?: string; // Optional text to read for TTS testing or current chapter
}

export function ReaderSettings({
  isOpen,
  onClose,
  currentText
}: ReaderSettingsProps) {
  const { theme, setTheme, readerSettings, setReaderSettings } = useStore();
  const [activeTab, setActiveTab] = useState<'reading' | 'audio' | 'translation'>('reading');

  // TTS State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRate, setSpeechRate] = useState(1);
  const [speechPitch, setSpeechPitch] = useState(1);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const synth = useRef(window.speechSynthesis);

  // Translation State
  const [targetLang, setTargetLang] = useState('en');

  useEffect(() => {
    const loadVoices = () => {
      setVoices(synth.current.getVoices());
    };
    loadVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const handleSpeak = () => {
    if (isSpeaking) {
      synth.current.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToSpeak = currentText || "This is a sample text to test your voice settings. Adjust the speed, pitch, and volume to your preference.";
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.rate = speechRate;
    utterance.pitch = speechPitch;
    
    utterance.onend = () => setIsSpeaking(false);
    
    synth.current.speak(utterance);
    setIsSpeaking(true);
  };

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

          {/* Sidebar Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-80 md:w-96 bg-[#0F1115] border-l border-[#2ECC71]/20 z-50 shadow-2xl flex flex-col text-white font-sans"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 bg-[#0F1115]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-[#2ECC71]/10 flex items-center justify-center border border-[#2ECC71]/20">
                        <Layout className="h-4 w-4 text-[#2ECC71]" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-white tracking-wide">Reading Settings</h2>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Customize experience</p>
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

            {/* Tabs */}
            <div className="flex px-4 pt-4 gap-2 border-b border-white/5">
              {[
                  { id: 'reading', label: 'Reading', icon: Type },
                  { id: 'audio', label: 'Audio', icon: Mic },
                  { id: 'translation', label: 'Translation', icon: Languages }
              ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                    "flex-1 pb-3 text-xs font-bold transition-colors relative flex items-center justify-center gap-2",
                    activeTab === tab.id ? "text-[#2ECC71]" : "text-gray-500 hover:text-gray-300"
                    )}
                >
                    <tab.icon className="h-3.5 w-3.5" />
                    {tab.label}
                    {activeTab === tab.id && (
                    <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2ECC71] shadow-[0_0_8px_#2ECC71]" />
                    )}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              {activeTab === 'reading' && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-8"
                >
                   {/* Theme */}
                   <div className="space-y-3">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                      <Monitor className="h-3 w-3 text-[#2ECC71]" /> Theme
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                        {[
                            { id: 'light', icon: Sun, label: 'Light' },
                            { id: 'dark', icon: Moon, label: 'Dark' },
                            { id: 'sepia', icon: Coffee, label: 'Sepia' },
                            { id: 'midnight', icon: Zap, label: 'Neon' }
                        ].map(t => (
                            <button
                                key={t.id}
                                onClick={() => setTheme(t.id as any)}
                                className={cn(
                                "flex flex-col items-center justify-center gap-2 h-16 rounded-lg border transition-all",
                                theme === t.id 
                                    ? "border-[#2ECC71] bg-[#2ECC71]/10 text-[#2ECC71] shadow-[0_0_10px_rgba(46,204,113,0.1)]" 
                                    : "border-white/5 bg-[#16181D] text-gray-500 hover:border-white/20 hover:text-gray-300"
                                )}
                            >
                                <t.icon className="h-4 w-4" />
                                <span className="text-[10px] font-bold">{t.label}</span>
                            </button>
                        ))}
                    </div>
                  </div>

                  {/* Font Family */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                      <Type className="h-3 w-3 text-[#2ECC71]" /> Font Family
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {['Sans', 'Serif', 'Mono', 'Rounded'].map(font => (
                            <button
                                key={font}
                                onClick={() => setReaderSettings({ fontFamily: font.toLowerCase() })}
                                className={cn(
                                    "h-10 px-3 rounded border text-xs font-medium transition-all flex items-center justify-between",
                                    readerSettings.fontFamily === font.toLowerCase()
                                        ? "border-[#2ECC71] bg-[#2ECC71]/10 text-[#2ECC71]"
                                        : "border-white/5 bg-[#16181D] text-gray-400 hover:border-white/20"
                                )}
                            >
                                <span>{font}</span>
                                <span className="opacity-50">Aa</span>
                            </button>
                        ))}
                    </div>
                  </div>

                  {/* Font Size Slider */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Font Size</label>
                      <span className="text-[10px] font-mono text-[#2ECC71] bg-[#2ECC71]/10 px-1.5 py-0.5 rounded border border-[#2ECC71]/20">
                        {readerSettings.fontSize}px
                      </span>
                    </div>
                    <div className="relative h-6 flex items-center">
                        <input 
                        type="range" 
                        min="14" 
                        max="32" 
                        step="1"
                        value={readerSettings.fontSize} 
                        onChange={(e) => setReaderSettings({ fontSize: Number(e.target.value) })}
                        className="w-full h-1 bg-[#2a2a2a] rounded-lg appearance-none cursor-pointer accent-[#2ECC71] hover:accent-[#2ECC71]/80 z-10 relative"
                        />
                        <div className="absolute left-0 right-0 h-1 bg-[#2ECC71]/20 rounded-lg" />
                    </div>
                  </div>

                  {/* Line Height Slider */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Line Spacing</label>
                      <span className="text-[10px] font-mono text-[#2ECC71] bg-[#2ECC71]/10 px-1.5 py-0.5 rounded border border-[#2ECC71]/20">
                        {readerSettings.lineHeight}
                      </span>
                    </div>
                    <div className="relative h-6 flex items-center">
                        <input 
                        type="range" 
                        min="1.2" 
                        max="2.4" 
                        step="0.1"
                        value={readerSettings.lineHeight} 
                        onChange={(e) => setReaderSettings({ lineHeight: Number(e.target.value) })}
                        className="w-full h-1 bg-[#2a2a2a] rounded-lg appearance-none cursor-pointer accent-[#2ECC71] hover:accent-[#2ECC71]/80 z-10 relative"
                        />
                        <div className="absolute left-0 right-0 h-1 bg-[#2ECC71]/20 rounded-lg" />
                    </div>
                  </div>

                  {/* Max Width Slider */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Max Width</label>
                      <span className="text-[10px] font-mono text-[#2ECC71] bg-[#2ECC71]/10 px-1.5 py-0.5 rounded border border-[#2ECC71]/20">
                        {readerSettings.maxWidth}px
                      </span>
                    </div>
                    <div className="relative h-6 flex items-center">
                        <input 
                        type="range" 
                        min="500" 
                        max="1200" 
                        step="10"
                        value={readerSettings.maxWidth} 
                        onChange={(e) => setReaderSettings({ maxWidth: Number(e.target.value) })}
                        className="w-full h-1 bg-[#2a2a2a] rounded-lg appearance-none cursor-pointer accent-[#2ECC71] hover:accent-[#2ECC71]/80 z-10 relative"
                        />
                        <div className="absolute left-0 right-0 h-1 bg-[#2ECC71]/20 rounded-lg" />
                    </div>
                  </div>

                  {/* Preview Box */}
                  <div className="p-4 rounded-lg bg-[#16181D] border border-white/5">
                      <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Preview</h4>
                      <p className="text-xs text-gray-300 leading-relaxed" style={{
                          fontFamily: readerSettings.fontFamily === 'serif' ? 'serif' : 'sans-serif',
                          lineHeight: readerSettings.lineHeight,
                          fontSize: `${Math.max(12, readerSettings.fontSize * 0.7)}px` // scaled down for preview
                      }}>
                          This is a sample paragraph to demonstrate your settings. Adjust the options above to find your perfect reading experience.
                      </p>
                  </div>
                </motion.div>
              )}

              {activeTab === 'audio' && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-8"
                  >
                      {/* Voice Selection */}
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Voice</label>
                        <div className="relative">
                            <select 
                                className="w-full h-10 bg-[#16181D] border border-white/10 rounded px-3 text-xs text-white appearance-none focus:border-[#2ECC71] outline-none"
                                onChange={(e) => {
                                    const voice = voices.find(v => v.name === e.target.value);
                                    setSelectedVoice(voice || null);
                                }}
                                value={selectedVoice?.name || ''}
                            >
                                <option value="">Default System Voice</option>
                                {voices.map(voice => (
                                    <option key={voice.name} value={voice.name}>
                                        {voice.name} ({voice.lang})
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                <Monitor className="w-3 h-3 text-[#2ECC71]" />
                            </div>
                        </div>
                      </div>

                      {/* Speed Slider */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Speed</label>
                            <span className="text-[10px] font-mono text-[#2ECC71]">{speechRate}x</span>
                        </div>
                        <input 
                            type="range" 
                            min="0.5" 
                            max="2" 
                            step="0.1" 
                            value={speechRate}
                            onChange={(e) => setSpeechRate(Number(e.target.value))}
                            className="w-full h-1 bg-[#2a2a2a] rounded-lg appearance-none cursor-pointer accent-[#2ECC71]" 
                        />
                      </div>

                      {/* Pitch Slider */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Pitch</label>
                            <span className="text-[10px] font-mono text-[#2ECC71]">{speechPitch}</span>
                        </div>
                        <input 
                            type="range" 
                            min="0.5" 
                            max="2" 
                            step="0.1"
                            value={speechPitch}
                            onChange={(e) => setSpeechPitch(Number(e.target.value))} 
                            className="w-full h-1 bg-[#2a2a2a] rounded-lg appearance-none cursor-pointer accent-[#2ECC71]" 
                        />
                      </div>

                      {/* Controls */}
                      <div className="p-4 rounded-lg bg-[#16181D] border border-white/5 space-y-4">
                          <p className="text-xs text-gray-300 italic border-l-2 border-[#2ECC71] pl-3">
                              {currentText ? "Ready to read current chapter..." : "Adjust settings and click Play to test."}
                          </p>
                          <div className="flex gap-2">
                              <button 
                                onClick={handleSpeak}
                                className={cn(
                                    "flex-1 h-9 text-black text-xs font-bold rounded flex items-center justify-center gap-2 transition-colors",
                                    isSpeaking ? "bg-red-500 hover:bg-red-600 text-white" : "bg-[#2ECC71] hover:bg-[#2ECC71]/90"
                                )}
                              >
                                  {isSpeaking ? <Square className="h-3 w-3 fill-current" /> : <Play className="h-3 w-3 fill-black" />}
                                  {isSpeaking ? "Stop" : "Play / Test"}
                              </button>
                          </div>
                      </div>

                  </motion.div>
              )}

              {activeTab === 'translation' && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-8"
                  >
                     <div className="p-4 rounded-lg bg-[#2ECC71]/10 border border-[#2ECC71]/20 text-[#2ECC71] text-xs">
                        <p className="font-bold mb-1">AI Translation (Beta)</p>
                        <p className="opacity-80">Translate chapter content instantly. Note: This may take a few seconds.</p>
                     </div>

                     <div className="space-y-3">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Target Language</label>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { code: 'en', label: 'English' },
                                { code: 'es', label: 'Spanish' },
                                { code: 'fr', label: 'French' },
                                { code: 'id', label: 'Indonesian' },
                                { code: 'vi', label: 'Vietnamese' },
                                { code: 'zh', label: 'Chinese' },
                            ].map(lang => (
                                <button
                                    key={lang.code}
                                    onClick={() => setTargetLang(lang.code)}
                                    className={cn(
                                        "h-10 px-3 rounded border text-xs font-medium transition-all flex items-center justify-between",
                                        targetLang === lang.code
                                            ? "border-[#2ECC71] bg-[#2ECC71]/10 text-[#2ECC71]"
                                            : "border-white/5 bg-[#16181D] text-gray-400 hover:border-white/20"
                                    )}
                                >
                                    {lang.label}
                                </button>
                            ))}
                        </div>
                     </div>

                     <button className="w-full py-3 rounded-lg bg-white/5 border border-white/10 text-white text-xs font-bold hover:bg-white/10 transition-colors">
                        Translate Current Chapter
                     </button>
                  </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
