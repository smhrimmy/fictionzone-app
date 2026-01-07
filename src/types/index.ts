export interface User {
  id: string;
  email: string;
  username: string;
  avatar_url?: string;
  reading_preferences: ReadingPreferences;
  created_at: string;
  updated_at: string;
}

export interface ReadingPreferences {
  theme: 'light' | 'dark' | 'sepia';
  font_size: number;
  font_family: string;
  line_height?: number;
}

export interface Story {
  id: string;
  title: string;
  description: string;
  cover_image?: string;
  author_id: string;
  author?: User; // Joined
  genres: string[];
  type: 'Original' | 'Translated' | 'Fan-fic';
  content_type: 'novel' | 'manga';
  average_rating: number;
  total_reads: number;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
  chapters_count?: number; // Computed
}

export interface Chapter {
  id: string;
  story_id: string;
  title: string;
  content: string; // HTML for novel, empty or description for manga
  images?: string[]; // For manga
  chapter_number: number;
  word_count: number;
  published_at: string;
}

export interface Bookmark {
  id: string;
  user_id: string;
  story_id: string;
  chapter_id: string;
  progress_percentage: number;
  created_at: string;
  updated_at: string;
  story?: Story; // Joined
  chapter?: Chapter; // Joined
}

export interface Rating {
  id: string;
  user_id: string;
  story_id: string;
  rating: number;
  review?: string;
  created_at: string;
}

export interface Review extends Rating {
  user?: User;
  story?: Story;
}

export interface StoryFilter {
  page?: number;
  limit?: number;
  search?: string;
  genre?: string | null;
  status?: 'All' | 'Ongoing' | 'Completed';
  type?: 'All' | 'Original' | 'Translated';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  hasMore: boolean;
}
