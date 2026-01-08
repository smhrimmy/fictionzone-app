export interface Novel {
  id: string;
  title: string;
  author: string;
  description: string;
  coverUrl: string;
  status: 'Ongoing' | 'Completed' | 'Hiatus' | 'Unknown';
  sourceId: string;
  url: string;
  tags: string[];
  chapters?: Chapter[];
  rating?: number;
  views?: number;
}

export interface Chapter {
  id: string; // Source-specific ID (e.g., slug or numeric)
  novelId: string;
  title: string;
  chapterNumber: number;
  releaseDate?: string;
  url?: string;
  content?: string; // HTML content
  images?: string[]; // For manga
}

export interface SearchOptions {
  query: string;
  page?: number;
  limit?: number;
  filters?: Record<string, any>;
}

export interface NovelSource {
  id: string;      // Unique ID (e.g. 'fanmtl', 'mangadex')
  name: string;    // Display Name
  version: string;
  icon?: string;
  baseurl: string;
  type: 'novel' | 'manga';
  isNsfw?: boolean;

  search(options: SearchOptions): Promise<Novel[]>;
  getNovelDetails(id: string): Promise<Novel>;
  getChapters(id: string): Promise<Chapter[]>;
  getChapterContent(novelId: string, chapterId: string): Promise<Chapter>;
}
