import axios from 'axios';
import type { Story, Chapter, StoryFilter, PaginatedResult } from '../types';

const API_URL = '/api';

export const MangaService = {
  getAllStories: async (filter: StoryFilter = {}): Promise<PaginatedResult<Story>> => {
    try {
      const response = await axios.get(`${API_URL}/metadata/search`, {
        params: {
          query: filter.search || 'manga', // Default query if empty
          type: 'manga',
          page: filter.page || 1,
          limit: filter.limit || 10
        }
      });

      if (response.data && Array.isArray(response.data.results)) {
          return {
            data: response.data.results.map((item: any) => ({
              ...item,
              content_type: 'manga',
              type: 'Translated',
              author: { id: 'unknown', username: item.author?.username || item.author || 'Unknown' },
              is_completed: item.status === 'completed',
              rating: item.rating || 0,
              total_reads: item.views || 0,
              chapters_count: item.chapters || 0,
              genres: item.genres || []
            })),
            total: response.data.pageInfo?.total || 0,
            hasMore: response.data.pageInfo?.hasNextPage || false
          };
      }
      return { data: [], total: 0, hasMore: false };
    } catch (error) {
      console.error("Backend API failed", error);
      return { data: [], total: 0, hasMore: false };
    }
  },

  getStoryById: async (id: string): Promise<Story | undefined> => {
    try {
        const response = await axios.get(`${API_URL}/metadata/manga/${id}`);
        const item = response.data;
        return {
            ...item,
            content_type: 'manga',
            type: 'Translated',
            author: { id: 'unknown', username: item.author?.username || 'Unknown' },
            is_completed: item.status === 'Completed' || item.status === 'completed',
            rating: item.rating || 0,
            total_reads: item.views || 0,
            chapters_count: item.chapters_count || 0,
            genres: item.genres || []
        };
    } catch (error) {
        console.error("Failed to fetch manga details", error);
        return undefined;
    }
  },

  getChapters: async (storyId: string): Promise<Chapter[]> => {
    try {
        const response = await axios.get(`${API_URL}/content/chapters/${storyId}`);
        return response.data.map((ch: any) => ({
            id: ch.id,
            story_id: storyId,
            title: ch.title,
            chapter_number: parseFloat(ch.chapter_number) || 0,
            content: '',
            images: [], // Images are fetched when reading the chapter
            word_count: 0,
            published_at: ch.published_at
        }));
    } catch (error) {
        console.error("Failed to fetch chapters", error);
        return [];
    }
  },

  getChapter: async (storyId: string, chapterId: string): Promise<Chapter | undefined> => {
    try {
        const response = await axios.get(`${API_URL}/content/chapter/${storyId}/${chapterId}`);
        return {
            id: chapterId,
            story_id: storyId,
            title: `Chapter`,
            chapter_number: 0,
            content: '',
            images: response.data.images || [],
            word_count: 0,
            published_at: new Date().toISOString()
        };
    } catch (error) {
        console.error("Failed to fetch chapter pages", error);
        return undefined;
    }
  },

  getFeaturedStories: async (): Promise<Story[]> => {
    try {
        const response = await axios.get(`${API_URL}/metadata/trending`, { params: { type: 'manga' } });
        return response.data.map((item: any) => ({
            ...item,
            content_type: 'manga',
            author: { id: 'unknown', username: item.author || 'Unknown' },
            genres: item.genres || []
        }));
    } catch (error) {
        console.error("Failed to fetch featured stories", error);
        return [];
    }
  },

  getTrendingStories: async (): Promise<Story[]> => {
    return MangaService.getFeaturedStories();
  },
  
  getLatestUpdates: async (): Promise<Story[]> => {
    return MangaService.getFeaturedStories();
  }
};
