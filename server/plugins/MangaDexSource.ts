import { BaseScraper } from '../core/BaseScraper.js';
import { Novel, Chapter, SearchOptions } from '../core/types.js';

export class MangaDexSource extends BaseScraper {
  id = 'mangadex';
  name = 'MangaDex';
  version = '1.0.0';
  baseurl = 'https://api.mangadex.org';
  type = 'manga' as const;
  private uploadsUrl = 'https://uploads.mangadex.org';

  constructor() {
      super();
  }

  async search(options: SearchOptions): Promise<Novel[]> {
    const { query, limit = 20, page = 1 } = options;
    const offset = (page - 1) * limit;

    const { data } = await this.client.get(`${this.baseurl}/manga`, {
        params: {
            title: query,
            limit,
            offset,
            includes: ['cover_art', 'author'],
            contentRating: ['safe', 'suggestive', 'erotica', 'pornographic'],
            order: { relevance: 'desc' }
        }
    });

    return data.data.map((m: any) => this.mapToNovel(m));
  }

  async getNovelDetails(id: string): Promise<Novel> {
    const { data } = await this.client.get(`${this.baseurl}/manga/${id}`, {
        params: { includes: ['cover_art', 'author'] }
    });
    return this.mapToNovel(data.data);
  }

  async getChapters(id: string): Promise<Chapter[]> {
    const { data } = await this.client.get(`${this.baseurl}/manga/${id}/feed`, {
        params: {
            limit: 100, // TODO: Implement pagination for >100 chapters
            translatedLanguage: ['en'],
            order: { chapter: 'asc' },
            includes: ['scanlation_group']
        }
    });

    return data.data.map((ch: any) => ({
        id: ch.id,
        novelId: id,
        title: ch.attributes.title || `Chapter ${ch.attributes.chapter}`,
        chapterNumber: parseFloat(ch.attributes.chapter) || 0,
        releaseDate: ch.attributes.publishAt,
        url: `${this.baseurl}/chapter/${ch.id}`
    }));
  }

  async getChapterContent(novelId: string, chapterId: string): Promise<Chapter> {
    try {
        console.log(`[MangaDex] Fetching content for ${chapterId}`);
        // 1. Get At-Home Server URL
        const { data: atHome } = await this.client.get(`${this.baseurl}/at-home/server/${chapterId}`);
        const baseUrl = atHome.baseUrl;
        const chapterHash = atHome.chapter.hash;
        const pageFilenames = atHome.chapter.data; // High quality

        console.log(`[MangaDex] Found ${pageFilenames.length} pages for ${chapterId}`);

        // 2. Construct URLs
        const images = pageFilenames.map((filename: string) => 
            `${baseUrl}/data/${chapterHash}/${filename}`
        );

        return {
            id: chapterId,
            novelId,
            title: '', // Fetched in getChapters usually
            chapterNumber: 0,
            content: '', // Manga has images, not text content
            images
        };
    } catch (e) {
        console.error(`[MangaDex] Failed to fetch content for ${chapterId}`, e);
        throw e;
    }
  }

  private mapToNovel(m: any): Novel {
      const coverRel = m.relationships.find((r: any) => r.type === 'cover_art');
      const fileName = coverRel?.attributes?.fileName;
      const coverUrl = fileName ? `${this.uploadsUrl}/covers/${m.id}/${fileName}` : '';
      
      const authorRel = m.relationships.find((r: any) => r.type === 'author');
      const author = authorRel?.attributes?.name || 'Unknown';

      return {
          id: m.id,
          title: m.attributes.title.en || Object.values(m.attributes.title)[0] || 'Unknown Title',
          author,
          description: m.attributes.description.en || '',
          coverUrl,
          status: m.attributes.status === 'completed' ? 'Completed' : 'Ongoing',
          sourceId: this.id,
          url: `https://mangadex.org/title/${m.id}`,
          tags: m.attributes.tags.map((t: any) => t.attributes.name.en)
      };
  }
}
