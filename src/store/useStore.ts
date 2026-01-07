import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';

interface ReaderSettings {
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  maxWidth: number;
}

interface MangaSettings {
  fitMode: 'width' | 'height' | 'original';
}

interface AppState {
  user: User | null;
  theme: 'light' | 'dark' | 'sepia' | 'midnight';
  mode: 'novel' | 'manga';
  readerSettings: ReaderSettings;
  mangaSettings: MangaSettings;
  setUser: (user: User | null) => void;
  setTheme: (theme: 'light' | 'dark' | 'sepia' | 'midnight') => void;
  setMode: (mode: 'novel' | 'manga') => void;
  setReaderSettings: (settings: Partial<ReaderSettings>) => void;
  setMangaSettings: (settings: Partial<MangaSettings>) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      theme: 'dark',
      mode: 'novel',
      readerSettings: {
        fontSize: 18,
        fontFamily: 'sans',
        lineHeight: 1.8,
        maxWidth: 768,
      },
      mangaSettings: {
        fitMode: 'width',
      },
      setUser: (user) => set({ user }),
      setTheme: (theme) => {
        set({ theme });
        if (theme === 'dark' || theme === 'midnight') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },
      setMode: (mode) => set({ mode }),
      setReaderSettings: (settings) => set((state) => ({
        readerSettings: { ...state.readerSettings, ...settings }
      })),
      setMangaSettings: (settings) => set((state) => ({
        mangaSettings: { ...state.mangaSettings, ...settings }
      })),
    }),
    {
      name: 'fictionzone-storage',
      partialize: (state) => ({ 
        user: state.user, 
        theme: state.theme, 
        mode: state.mode,
        readerSettings: state.readerSettings,
        mangaSettings: state.mangaSettings
      }),
    }
  )
);
