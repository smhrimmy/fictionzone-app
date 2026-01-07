import axios from 'axios';
import type { Story, Chapter, Review, StoryFilter, PaginatedResult } from '../types';

const API_URL = '/api';

export const NovelService = {
  getAllStories: async (filter: StoryFilter = {}): Promise<PaginatedResult<Story>> => {
    try {
      const response = await axios.get(`${API_URL}/metadata/search`, {
        params: {
          query: filter.search || 'novel', // Default query
          type: 'novel',
          page: filter.page || 1,
          limit: filter.limit || 10
        }
      });

      if (response.data && response.data.results) {
          return {
            data: response.data.results.map((item: any) => ({
              ...item,
              content_type: 'novel',
              type: 'Translated',
              author: { id: 'unknown', username: item.author || 'Unknown' },
              is_completed: item.status === 'Completed',
              rating: item.rating || 0,
              total_reads: item.views || 0,
              chapters_count: item.chapters_count || 0
            })),
            total: response.data.pageInfo.total || 0, // Infinite scroll relies on hasMore usually
            hasMore: response.data.pageInfo.hasNextPage
          };
      }
      return { data: [], total: 0, hasMore: false };
    } catch (error) {
      console.error("Backend API failed", error);
      return { data: [], total: 0, hasMore: false };
    }
  },

  getStoryById: async (_id: string): Promise<Story | undefined> => {
     // TODO: Implement getById endpoint in backend for details
     return undefined;
  },

  getChapters: async (storyId: string, title?: string): Promise<Chapter[]> => {
    try {
        const response = await axios.get(`${API_URL}/content/chapters/${storyId}`, {
            params: { title }
        });
        return response.data.map((ch: any) => ({
            id: ch.id,
            story_id: storyId,
            title: ch.title,
            chapter_number: ch.chapter_number,
            content: '', 
            word_count: 0,
            published_at: new Date().toISOString()
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
            id: response.data.id || chapterId,
            story_id: storyId,
            title: response.data.title,
            chapter_number: response.data.chapter_number,
            content: response.data.content,
            word_count: response.data.content.length / 5,
            published_at: new Date().toISOString()
        };
    } catch (error) {
        console.error("Failed to fetch chapter content", error);
        return undefined;
    }
  },

  getFeaturedStories: async (): Promise<Story[]> => {
    try {
        const response = await axios.get(`${API_URL}/metadata/trending`, { params: { type: 'novel' } });
        return response.data.map((item: any) => ({
            ...item,
            content_type: 'novel',
            author: { id: 'unknown', username: item.author || 'Unknown' },
            genres: item.genres || []
        }));
    } catch (error) {
        return [];
    }
  },

  getTrendingStories: async (): Promise<Story[]> => {
    return NovelService.getFeaturedStories();
  },
  
  getLatestUpdates: async (): Promise<Story[]> => {
    return NovelService.getFeaturedStories();
  },

  getRecentReviews: async (): Promise<Review[]> => {
    return []; // No review API yet
  }
};
