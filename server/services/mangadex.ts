import axios from 'axios';

const BASE_URL = 'https://api.mangadex.org';
const UPLOADS_URL = 'https://uploads.mangadex.org';

interface MangaDexManga {
  id: string;
  attributes: {
    title: Record<string, string>;
    description: Record<string, string>;
    status: string;
    year: number;
    tags: Array<{ attributes: { name: { en: string } } }>;
  };
  relationships: Array<{ type: string; id: string; attributes?: any }>;
}

export class MangaDexService {
  
  // Search for manga
  static async searchManga(query: string, limit: number = 20, offset: number = 0) {
    try {
      const response = await axios.get(`${BASE_URL}/manga`, {
        params: {
          title: query,
          limit,
          offset,
          includes: ['cover_art', 'author'], // Fetch relations in one go
          contentRating: ['safe', 'suggestive', 'erotica', 'pornographic'], // Include all for "no limits" if requested, filtering happens later
          order: { relevance: 'desc' }
        }
      });
      return response.data;
    } catch (error) {
      console.error('MangaDex Search Error:', error);
      throw error;
    }
  }

  // Get single manga details
  static async getMangaById(id: string) {
    try {
        const response = await axios.get(`${BASE_URL}/manga/${id}`, {
            params: { includes: ['cover_art', 'author'] }
        });
        return response.data;
    } catch (error) {
        console.error('MangaDex GetById Error:', error);
        throw error;
    }
  }

  // Get Chapters feed
  static async getChapters(mangaId: string, limit: number = 100, offset: number = 0) {
    try {
      const response = await axios.get(`${BASE_URL}/manga/${mangaId}/feed`, {
        params: {
          limit,
          offset,
          translatedLanguage: ['en'], // English only for now
          order: { chapter: 'asc' },
          includes: ['scanlation_group']
        }
      });
      return response.data;
    } catch (error) {
      console.error('MangaDex Chapters Error:', error);
      throw error;
    }
  }

  // Get Chapter Pages
  static async getChapterPages(chapterId: string) {
    try {
      // 1. Get At-Home Server URL
      const atHomeResponse = await axios.get(`${BASE_URL}/at-home/server/${chapterId}`);
      const baseUrl = atHomeResponse.data.baseUrl;
      const chapterHash = atHomeResponse.data.chapter.hash;
      const pageFilenames = atHomeResponse.data.chapter.data; // High quality

      // 2. Construct URLs
      return pageFilenames.map((filename: string) => 
        `${baseUrl}/data/${chapterHash}/${filename}`
      );
    } catch (error) {
      console.error('MangaDex Pages Error:', error);
      throw error;
    }
  }

  // Helper to construct cover URL
  static getCoverUrl(manga: MangaDexManga) {
    const coverRel = manga.relationships.find(r => r.type === 'cover_art');
    const fileName = coverRel?.attributes?.fileName;
    if (!fileName) return null;
    return `${UPLOADS_URL}/covers/${manga.id}/${fileName}`;
  }
}
